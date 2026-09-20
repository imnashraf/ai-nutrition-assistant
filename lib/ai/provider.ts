// ─────────────────────────────────────────────────────────────────────────────
// AI Provider Interface
//
// All model calls in the application go through this interface.
// Swap providers by changing which implementation is exported from index.ts.
// The route handler never imports a provider SDK directly.
// ─────────────────────────────────────────────────────────────────────────────

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * An AIProvider takes the current conversation history, the new user message,
 * and the system prompt, then returns raw model output as `unknown`.
 *
 * The caller is responsible for validating the output against the Zod schema.
 */
export interface AIProvider {
  generateResponse(
    history: ConversationMessage[],
    userMessage: string,
    systemPrompt: string
  ): Promise<unknown>;
}
