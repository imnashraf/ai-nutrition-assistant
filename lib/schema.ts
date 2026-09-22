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

export const SourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string().optional()
});

export const ClaimSchema = z.object({
  claim_text: z.string(),
  source: z.null().describe("The source documenting this claim. Must remain exactly null."),
});

export const ChatResponseSchema = z.object({
  answer: z.string(),
  claims: z.array(ClaimSchema),
  sources: z.array(SourceSchema).optional(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type Source = z.infer<typeof SourceSchema>;
