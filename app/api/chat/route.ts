import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isScopeViolation, DECLINE_RESPONSE } from "@/lib/scopeGuard";
import { ChatResponseSchema } from "@/lib/schema";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { aiProvider, GroqProviderError } from "@/lib/ai";
import {
  createConversation,
  conversationExists,
  saveMessage,
  getConversationHistory,
} from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────────────
// Request Validation Schema
// ─────────────────────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  message: z
    .string()
    .refine((s) => s.trim().length > 0, { message: "Message cannot be blank." })
    .refine((s) => s.trim().length <= 2000, {
      message: "Message must be 2000 characters or fewer.",
    }),
  conversation_id: z.string().uuid().nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat
//
// Step order (must not be reordered):
//   1. Validate request body
//   2. Resolve or create conversation
//   3. Validate conversation exists (if client-supplied)
//   4. Persist user message
//   5. Scope guard — short-circuits before model call if blocked
//   6. Load conversation history
//   7. Call AI provider
//   8. Validate response against schema
//   9. Persist assistant response
//  10. Return to client
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Validate request body ───────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { message, conversation_id } = parsed.data;
  const trimmedMessage = message.trim();

  // ── 2 & 3. Resolve or create conversation ─────────────────────────────────
  let conversationId: string;

  if (conversation_id === null) {
    try {
      conversationId = await createConversation();
    } catch (err) {
      console.error("[/api/chat] Failed to create conversation:", err);
      return NextResponse.json(
        { error: "Failed to create conversation." },
        { status: 500 }
      );
    }
  } else {
    // Validate the client-supplied UUID actually exists
    let exists: boolean;
    try {
      exists = await conversationExists(conversation_id);
    } catch (err) {
      console.error("[/api/chat] DB error checking conversation:", err);
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    if (!exists) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 400 }
      );
    }

    conversationId = conversation_id;
  }

  // ── 4. Persist user message ────────────────────────────────────────────────
  try {
    await saveMessage({
      conversationId,
      role: "user",
      content: trimmedMessage,
    });
  } catch (err) {
    console.error("[/api/chat] Failed to save user message:", err);
    return NextResponse.json(
      { error: "Failed to persist message." },
      { status: 500 }
    );
  }

  // ── 5. Scope guard ─────────────────────────────────────────────────────────
  if (isScopeViolation(trimmedMessage)) {
    try {
      await saveMessage({
        conversationId,
        role: "assistant",
        content: DECLINE_RESPONSE.answer,
        rawResponse: DECLINE_RESPONSE,
        declined: true,
      });
    } catch (err) {
      console.error("[/api/chat] Failed to save decline response:", err);
      // Still return the decline — DB failure here is not user-facing
    }

    return NextResponse.json({
      conversation_id: conversationId,
      response: DECLINE_RESPONSE,
      declined: true,
    });
  }

  // ── 6. Load conversation history ───────────────────────────────────────────
  let history: Array<{ role: "user" | "assistant"; content: string }>;
  try {
    const fullHistory = await getConversationHistory(conversationId);
    // Exclude the message we just inserted (last row) — it will be passed
    // as userMessage to the provider instead
    history = fullHistory.slice(0, -1);
  } catch (err) {
    console.error("[/api/chat] Failed to load conversation history:", err);
    return NextResponse.json(
      { error: "Failed to load conversation history." },
      { status: 500 }
    );
  }

  // ── 7. Call AI provider ────────────────────────────────────────────────────
  let rawModelOutput: unknown;
  try {
    rawModelOutput = await aiProvider.generateResponse(
      history,
      trimmedMessage,
      SYSTEM_PROMPT
    );
  } catch (err) {
    if (err instanceof GroqProviderError) {
      // Log full context server-side; never expose to client
      console.error("[/api/chat] AI provider error:", err.message, err.context);
    } else {
      console.error("[/api/chat] Unexpected error calling AI provider:", err);
    }
    return NextResponse.json(
      { error: "AI provider call failed. Please try again." },
      { status: 502 }
    );
  }

  // ── 8. Validate response against schema ───────────────────────────────────
  const schemaResult = ChatResponseSchema.safeParse(rawModelOutput);
  if (!schemaResult.success) {
    console.error(
      "[/api/chat] Schema parse failed:",
      schemaResult.error.flatten(),
      "Raw output:",
      rawModelOutput
    );
    return NextResponse.json(
      {
        error: "Model response did not match the expected schema.",
        // Raw output logged server-side only — not returned to client in production
        ...(process.env.NODE_ENV === "development" && { raw: rawModelOutput }),
      },
      { status: 422 }
    );
  }

  const structuredResponse = schemaResult.data;

  // ── 9. Persist assistant response ─────────────────────────────────────────
  try {
    await saveMessage({
      conversationId,
      role: "assistant",
      content: structuredResponse.answer,
      rawResponse: structuredResponse,
      declined: false,
    });
  } catch (err) {
    console.error("[/api/chat] Failed to save assistant response:", err);
    // Do not fail the request — the model already answered; log and continue
  }

  // ── 10. Return to client ───────────────────────────────────────────────────
  return NextResponse.json({
    conversation_id: conversationId,
    response: structuredResponse,
    declined: false,
  });
}
