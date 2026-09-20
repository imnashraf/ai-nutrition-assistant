import Groq from "groq-sdk";
import type { AIProvider, ConversationMessage } from "./provider";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates that GROQ_API_KEY is present at module load time.
 * Fails loudly with a developer-friendly message — never exposes the key value.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[GroqProvider] Missing required environment variable: ${name}. ` +
        `Set it in .env.local (local) or your deployment environment (production).`
    );
  }
  return value;
}

const DEFAULT_MODEL = "openai/gpt-oss-120b";

// ─────────────────────────────────────────────────────────────────────────────
// Tool Schema
//
// Defines the structured output contract using OpenAI-compatible function
// calling. Mirrors the Zod schema in lib/schema.ts — both must stay in sync.
// source is always null in Milestone 1.
// ─────────────────────────────────────────────────────────────────────────────

const FORMAT_RESPONSE_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "format_response",
    description:
      "Format the nutrition answer with a list of individual supporting claims. " +
      "Always call this function — never respond with plain text.",
    parameters: {
      type: "object",
      properties: {
        answer: {
          type: "string",
          description: "The main answer to the user's food or nutrition question.",
        },
        claims: {
          type: "array",
          description:
            "List of individual factual claims contained in the answer. " +
            "Each claim must be a single, checkable statement. " +
            "Return an empty array [] if there are no discrete claims — never null.",
          items: {
            type: "object",
            properties: {
              claim_text: {
                type: "string",
                description: "A single, checkable factual statement from the answer.",
              },
              source: {
                type: "null",
                description:
                  "Always null in this version. Do not set this to a string.",
              },
            },
            required: ["claim_text", "source"],
          },
        },
      },
      required: ["answer", "claims"],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GroqProvider
// ─────────────────────────────────────────────────────────────────────────────

export class GroqProvider implements AIProvider {
  private client: Groq | null = null;
  private readonly model: string;

  constructor() {
    // model is read at construction; client is lazy-initialized on first use
    // so scope-guarded requests can decline without requiring GROQ_API_KEY.
    this.model = process.env.GROQ_MODEL ?? DEFAULT_MODEL;
  }

  private getClient(): Groq {
    if (!this.client) {
      this.client = new Groq({ apiKey: requireEnv("GROQ_API_KEY") });
    }
    return this.client;
  }

  async generateResponse(
    history: ConversationMessage[],
    userMessage: string,
    systemPrompt: string
  ): Promise<unknown> {
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content } as const)),
      { role: "user", content: userMessage },
    ];

    const client = this.getClient();
    let response: Groq.Chat.ChatCompletion;

    try {
      response = await client.chat.completions.create({
        model: this.model,
        messages,
        tools: [FORMAT_RESPONSE_TOOL],
        tool_choice: "required", // Forces the model to always call the tool
        max_tokens: 1024,
        temperature: 0.2, // Low temperature for factual consistency
      });
    } catch (err) {
      // Re-throw with context but without leaking the API key
      throw new GroqProviderError("Groq API call failed", err);
    }

    const choice = response.choices?.[0];
    if (!choice) {
      throw new GroqProviderError("Groq returned an empty choices array.");
    }

    const toolCall = choice.message?.tool_calls?.[0];
    if (!toolCall || toolCall.type !== "function") {
      throw new GroqProviderError(
        "Groq did not return a tool_calls block. " +
          `Finish reason: ${choice.finish_reason ?? "unknown"}.`
      );
    }

    if (toolCall.function.name !== "format_response") {
      throw new GroqProviderError(
        `Groq called unexpected tool: "${toolCall.function.name}".`
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new GroqProviderError(
        "Groq returned malformed JSON in tool_call arguments.",
        toolCall.function.arguments
      );
    }

    return parsed;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Type
// ─────────────────────────────────────────────────────────────────────────────

export class GroqProviderError extends Error {
  public readonly context?: unknown;

  constructor(message: string, context?: unknown) {
    // Never include API keys or secret values in the message
    super(`[GroqProvider] ${message}`);
    this.name = "GroqProviderError";
    this.context = context;
  }
}
