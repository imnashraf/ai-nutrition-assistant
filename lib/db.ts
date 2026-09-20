import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { ChatResponse } from "@/lib/schema";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        "Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
      );
    }
    supabaseInstance = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseInstance;
}

// ─── Conversations ────────────────────────────────────────────────────────────

/**
 * Creates a new conversation row and returns its UUID.
 */
export async function createConversation(): Promise<string> {
  const { data, error } = await getSupabase()
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Returns true if the conversation exists, false otherwise.
 * Used to validate a client-supplied conversation_id.
 */
export async function conversationExists(id: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("conversations")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface SaveMessageParams {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  rawResponse?: ChatResponse;
  declined?: boolean;
}

/**
 * Persists a single message (user or assistant) to the database.
 */
export async function saveMessage(params: SaveMessageParams): Promise<void> {
  const { error } = await getSupabase().from("messages").insert({
    conversation_id: params.conversationId,
    role: params.role,
    content: params.content,
    raw_response: params.rawResponse ?? null,
    declined: params.declined ?? false,
  });

  if (error) throw error;
}

/**
 * Returns all messages for a conversation ordered oldest-first.
 * Used to build the history array passed to the model.
 */
export async function getConversationHistory(
  conversationId: string
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  const { data, error } = await getSupabase()
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Array<{ role: "user" | "assistant"; content: string }>;
}
