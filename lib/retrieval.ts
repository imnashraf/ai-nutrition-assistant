import { pipeline, FeatureExtractionPipeline } from "@huggingface/transformers";
import { getSupabase } from "@/lib/db";

// Keep a global reference so we don't reload the model on every request
let extractor: FeatureExtractionPipeline | null = null;

export async function retrieveContext(query: string): Promise<string> {
  // 1. Get the embedding for the user's query
  try {
    if (!extractor) {
      console.log("Loading local AI embedding model...");
      extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }

    const output = await extractor(query, { pooling: "mean", normalize: true });
    const embedding = Array.from(output.data);

    // 2. Query Supabase vector store
    const supabase = getSupabase();
    
    // We use the same 'match_documents' RPC function
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 3,
    });

    if (error) {
      console.error("Error matching documents:", error);
      return "";
    }

    if (!data || data.length === 0) {
      return "";
    }

    // 3. Format the results into a string for the system prompt
    return data
      .map(
        (doc: any) =>
          `<document title="${doc.metadata?.title || "Unknown"}" url="${doc.metadata?.url || ""}" publisher="${doc.metadata?.publisher || ""}">\n${
            doc.content
          }\n</document>`
      )
      .join("\n\n");
  } catch (err) {
    console.error("Retrieval failed:", err);
    return "";
  }
}
