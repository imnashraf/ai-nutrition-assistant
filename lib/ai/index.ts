// ─────────────────────────────────────────────────────────────────────────────
// AI Provider Index
//
// The application imports the provider from here — never from groq.ts directly.
// To swap providers: change the import and the exported instance below.
// ─────────────────────────────────────────────────────────────────────────────

import { GroqProvider } from "./groq";
import type { AIProvider } from "./provider";

// Singleton — constructed once when the module is first imported.
// Construction validates GROQ_API_KEY immediately.
export const aiProvider: AIProvider = new GroqProvider();

export type { AIProvider, ConversationMessage } from "./provider";
export { GroqProviderError } from "./groq";
