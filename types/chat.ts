import type { ChatResponse, Claim, Source } from "@/lib/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Types
//
// All TypeScript types the frontend and API route exchange are defined here.
// Types are derived from lib/schema.ts where possible — not duplicated.
// ─────────────────────────────────────────────────────────────────────────────

/** A message as it exists in the frontend's React state. */
export interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  claims: Claim[];
  sources?: Source[];
  declined: boolean;
  createdAt: string;
}

/** Shape of the request body sent to POST /api/chat. */
export interface ChatApiRequest {
  message: string;
  conversation_id: string | null;
}

/** Shape of a successful response from POST /api/chat. */
export interface ChatApiResponse {
  conversation_id: string;
  response: {
    answer: string;
    claims: Claim[];
    sources?: Source[];
  };
  declined: boolean;
}

export type { ChatResponse, Claim, Source };
