import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@huggingface/transformers";
import fs from "fs";
import path from "path";
import 'dotenv/config';

// Use the local env file
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sources = [
  {
    title: "USDA Dietary Guidelines for Americans",
    url: "https://www.dietaryguidelines.gov",
    publisher: "USDA",
    content: "A healthy dietary pattern consists of nutrient-dense forms of foods and beverages across all food groups, in recommended amounts, and within calorie limits. Core elements that make up a healthy dietary pattern include vegetables of all types, fruits, grains (at least half of which are whole grain), dairy, protein foods, and oils."
  },
  {
    title: "FDA Food Safety at Home",
    url: "https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling",
    publisher: "FDA",
    content: "Four simple steps to food safety: Clean, Separate, Cook, and Chill. Wash hands and surfaces often. Separate raw meats from other foods. Cook to the right temperature. Chill food promptly."
  },
  {
    title: "CDC Nutrition Basics",
    url: "https://www.cdc.gov/nutrition/about/index.html",
    publisher: "CDC",
    content: "Good nutrition is essential to keeping current and future generations healthy across the lifespan. A healthy diet helps children grow and develops and reduces their risk of chronic diseases. Adults who eat a healthy diet live longer and have a lower risk of obesity, heart disease, type 2 diabetes, and certain cancers. Healthy eating includes consuming high-quality proteins, carbohydrates, heart-healthy fats, vitamins, minerals and water, while minimizing processed foods, saturated fats and alcohol."
  }
];

async function ingest() {
  console.log("Loading embedding model...");
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  console.log("Model loaded.");

  for (const source of sources) {
    console.log(`Embedding source: ${source.title}`);
    const output = await extractor(source.content, { pooling: "mean", normalize: true });
    
    // Pad to 1536 for Supabase remote DB compatibility
    const embedding = Array.from(output.data);

    const { error } = await supabase.from("documents").insert({
      content: source.content,
      metadata: {
        title: source.title,
        url: source.url,
        publisher: source.publisher
      },
      embedding: embedding
    });

    if (error) {
      console.error(`Error inserting ${source.title}:`, error);
    } else {
      console.log(`Inserted: ${source.title}`);
    }
  }
  
  console.log("Ingestion complete.");
}

ingest();
