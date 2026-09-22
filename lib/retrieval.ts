import { pipeline, FeatureExtractionPipeline, env } from "@huggingface/transformers";
import { getSupabase } from "@/lib/db";

// Configure transformers cache for Vercel serverless (read-only filesystem)
env.cacheDir = '/tmp/.cache';

// Keep a global reference so we don't reload the model on every request
let extractor: FeatureExtractionPipeline | null = null;

export async function retrieveContext(query: string): Promise<{ contextStr: string; sources: any[] }> {
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
      return { contextStr: "", sources: [] };
    }

    if (!data || data.length === 0) {
      return { contextStr: "", sources: [] };
    }

    // 3. Format the results into a string for the system prompt
    const contextStr = data
      .map(
        (doc: any) =>
          `<document title="${doc.metadata?.title || "Unknown"}" url="${doc.metadata?.url || doc.metadata?.source || ""}" publisher="${doc.metadata?.publisher || ""}">\n${
            doc.content
          }\n</document>`
      )
    const rawSources = data.map((doc: any) => ({
      title: doc.metadata?.title || "Unknown",
      url: doc.metadata?.url || doc.metadata?.source || "",
      publisher: doc.metadata?.publisher || "",
    }));

    // Deduplicate by URL
    const sources = rawSources.filter(
      (source: any, index: number, self: any[]) =>
        index === self.findIndex((s) => s.url === source.url)
    );

    return { contextStr, sources };
  } catch (err) {
    console.error("Retrieval failed:", err);
    return { contextStr: "", sources: [] };
  }
}
