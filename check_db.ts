import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data, error } = await supabase.from('documents').select('id').limit(1);
  if (error) {
    console.log("Error querying documents:", error);
  } else {
    console.log("Documents table exists. Data:", data);
  }
}

check();
