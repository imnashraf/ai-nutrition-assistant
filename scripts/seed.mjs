import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@huggingface/transformers";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Please check .env.local");
  process.exit(1);
}

let isAnon = false;
if (supabaseKey.startsWith("sb_publishable")) {
  isAnon = true;
} else if (supabaseKey.startsWith("eyJ")) {
  try {
    const payloadBase64 = supabaseKey.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
    if (payload.role !== "service_role") {
      isAnon = true;
    }
  } catch (e) {
    // Ignore parsing errors
  }
}

if (isAnon) {
  console.error("Error: The SUPABASE_SERVICE_ROLE_KEY in .env.local contains your public/anon key instead of the secret service_role key.");
  console.error("Please update .env.local with the 'service_role' (secret) key found in your Supabase dashboard under Settings -> API.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CORPUS = [
  {
    content: "The U.S. Institute of Medicine sets the Recommended Dietary Allowance (RDA) for iron at 18 mg per day for adult women aged 19–50. After menopause (age 51 and older), the RDA drops to 8 mg per day because menstrual losses cease. During pregnancy, the RDA rises to 27 mg per day.",
    metadata: { source: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/", title: "NIH Iron Fact Sheet" }
  },
  {
    content: "Flaxseeds (ground or oil) and chia seeds are among the richest plant sources of omega-3 alpha-linolenic acid (ALA). One tablespoon of flaxseed oil provides about 7g of ALA, and two tablespoons of chia seeds provide roughly 5g of ALA. Walnuts provide about 2.5g ALA per ounce.",
    metadata: { source: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/", title: "NIH Omega-3 Fact Sheet" }
  },
  {
    content: "The USDA advises that cooked chicken can be kept safely in the refrigerator for 3–4 days, provided the fridge is at or below 40 °F (4 °C). Cooked chicken should be placed in a shallow, airtight container and cooled to refrigerator temperature within two hours after cooking.",
    metadata: { source: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/chicken-farm-table", title: "USDA Chicken Safety" }
  },
  {
    content: "The USDA recommends cooking whole cuts of pork to an internal temperature of 145 °F (63 °C) and allowing the meat to rest for at least three minutes before eating. Ground pork should be cooked to an internal temperature of 160 °F (71 °C). Reaching these temperatures destroys harmful bacteria and parasites such as Trichinella.",
    metadata: { source: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat/fresh-pork-farm-table", title: "USDA Pork Safety" }
  },
  {
    content: "Boiling vegetables can cause loss of water-soluble vitamins such as vitamin C and B-vitamins due to heat degradation and leaching into cooking water. If the water is drained, up to 30–50% of vitamin C may be lost. Fat-soluble vitamins (A, D, E, K) are more stable to heat. Cooking can increase the bioavailability of some nutrients, like lycopene.",
    metadata: { source: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6049644/", title: "Effect of cooking methods on nutrients" }
  },
  {
    content: "Air fryers cook food by rapidly circulating hot air and typically need little or no added oil. Air-fried items often have 70-80% less fat than the same foods deep-fried. Both air frying and deep frying use high temperatures that can generate acrylamide in starchy foods.",
    metadata: { source: "https://www.healthline.com/nutrition/air-fryer", title: "Air Fryer Health Facts" }
  },
  {
    content: "Moderate coffee consumption (about 3–4 cups per day) has been linked in large observational studies to lower risks of type 2 diabetes and Parkinson's disease. Coffee provides antioxidants like chlorogenic acids. High caffeine intake can cause insomnia, anxiety, and increased heart rate. The WHO advises pregnant individuals to limit caffeine to about 200 mg per day.",
    metadata: { source: "https://www.hsph.harvard.edu/nutritionsource/food-features/coffee/", title: "Harvard Nutrition Source: Coffee" }
  },
  {
    content: "Replacing saturated fat with polyunsaturated fats consistently lowers cardiovascular risk. Swapping saturated fat for refined carbohydrates does not show a clear benefit for heart disease risk. The WHO and USDA recommend limiting saturated fat to less than 10% of total daily calories.",
    metadata: { source: "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/saturated-fats", title: "AHA Saturated Fats" }
  }
];

async function seed() {
  console.log("Loading local AI embedding model (this may take a few seconds on the first run)...");
  
  // Use a small, efficient embedding model (384 dimensions)
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  console.log("Seeding documents...");

  for (const doc of CORPUS) {
    // Generate embeddings locally
    const output = await extractor(doc.content, { pooling: "mean", normalize: true });
    // Convert Float32Array to standard array
    const embedding = Array.from(output.data);

    const { error } = await supabase.from("documents").insert({
      content: doc.content,
      metadata: doc.metadata,
      embedding: embedding,
    });

    if (error) {
      console.error("Error inserting document:", error);
    } else {
      console.log(`Successfully inserted: ${doc.metadata.title}`);
    }
  }
  
  console.log("Seeding complete.");
}

seed();
