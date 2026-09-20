import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Response Schema — Single Source of Truth
//
// This is the contract for every response from POST /api/chat.
// All TypeScript types are derived from here via z.infer<>.
// The Anthropic tool JSON Schema in lib/anthropic.ts must stay in sync.
//
// Milestone 2 change: source z.null() → z.string().nullable()
// ─────────────────────────────────────────────────────────────────────────────

export const ClaimSchema = z.object({
  claim_text: z.string(),
  source: z.string().url().nullable().describe("The URL of the source documenting this claim, if provided in context."),
});

export const ChatResponseSchema = z.object({
  answer: z.string(),
  claims: z.array(ClaimSchema),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
