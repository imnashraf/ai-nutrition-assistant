import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.from('documents').select('id').limit(1);
  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
  console.log("Documents table exists! Rows returned:", data.length);
}
test();
