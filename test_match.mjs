import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const dummyEmbedding = new Array(384).fill(0.1);
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: dummyEmbedding,
    match_threshold: 0.5,
    match_count: 1
  });
  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
  console.log("match_documents exists! Result:", data);
}
test();
