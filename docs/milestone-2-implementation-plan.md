# Milestone 2 Implementation Plan: Retrieval-Augmented Generation

## 1. Current Architecture
- **API Orchestration**: `app/api/chat/route.ts` manages the entire lifecycle of a chat request.
- **Safety**: `app/lib/scopeGuard.ts` intercepts requests before LLM execution via a RegExp blocklist.
- **LLM Provider**: `app/lib/ai/groq.ts` generates structured output via Groq's tool calling. Currently, the tool schema strictly enforces `source: null` for all claims.
- **Retrieval Shell**: `app/lib/retrieval.ts` exists and initializes a local `@huggingface/transformers` pipeline (`all-MiniLM-L6-v2`, generating 384-dimensional embeddings), but the Supabase database migration (`002_vector_store.sql`) is configured for 1536-dimensional vectors (OpenAI style).
- **Database**: Supabase stores conversations and raw JSONB messages.

## 2. Proposed Architecture
- **Controlled Knowledge Ingestion**: A new server-side script will fetch, chunk, and embed a curated list of trusted nutrition/food-safety guidelines (e.g., USDA, FDA) and store them in Supabase.
- **Vector Storage**: Supabase `pgvector` will be re-configured to use 384 dimensions matching the local MiniLM embeddings.
- **Semantic Retrieval**: The Chat API will embed the user's query locally, perform an RPC similarity search against Supabase, and inject the matching document chunks into the LLM system prompt using explicit `<document>` XML tags.
- **Cited Claims**: The Groq tool schema and Zod validation schemas will be updated to allow `source` to be a rich metadata object (title, url, publisher) rather than `null`. The LLM will be instructed to populate this only using the provided `<document>` tags.
- **Sources UI**: The frontend Sources panel will parse the returned `source` objects from the claims array and display them distinctly.

## 3. Components to Add
- **Ingestion Pipeline**: A standalone TypeScript script to parse markdown/text documents, chunk them, embed them, and upsert them to Supabase.
- **Source Citation UI**: React components to render the source cards in the UI side-panel.
- **Evaluation Dataset (M2)**: A new suite of eval tests specifically targeting retrieval accuracy, citation hallucination, and no-evidence graceful degradation.

---

### Proposed Architecture
See section 2 above. The RAG loop will execute completely server-side (Next.js Edge/Node) utilizing local Transformers.js for embeddings to avoid external embedding API costs and latency, and Groq for fast LLM inference.

### Files to Change
- `app/supabase/migrations/002_vector_store.sql` -> Update `vector(1536)` to `vector(384)`.
- `app/lib/schema.ts` -> Update `ClaimSchema` to support a `source` object.
- `app/lib/ai/groq.ts` -> Update `FORMAT_RESPONSE_TOOL` to expect a source object containing title/url/publisher.
- `app/lib/systemPrompt.ts` -> Add strict instructions on how to use `<document>` tags and properly cite them.
- `app/lib/retrieval.ts` -> Refine the embedding and RPC call if necessary.
- `app/api/chat/route.ts` -> Minor updates if prompt injection logic needs refinement.
- Frontend components -> Update the UI to render the source panel.

### New Files
- `scripts/ingest.ts` (or similar) -> The ingestion script.
- `docs/sources.md` -> A curated list of approved sources (USDA, FDA, etc.).
- New M2 evaluation scripts (e.g., `scripts/run_m2_eval.mjs`).

### Database Changes
- Drop the existing `documents` table and `match_documents` RPC.
- Recreate `documents` with `embedding vector(384)`.
- Ensure the `metadata` JSONB column enforces or expects keys like `title`, `url`, and `publisher`.

### Environment Variables
- `SUPABASE_SERVICE_ROLE_KEY` -> Required by the ingestion script to bypass Row-Level Security (RLS) when inserting embeddings. (Already exists in many Supabase projects, but must be documented for the ingestion pipeline).

### Testing Strategy
- **Regression**: Run the existing 52 M1 tests to ensure safety guards, structured output, and general chat behavior are perfectly intact.
- **Retrieval Precision**: Test queries against known ingested facts.
- **Hallucination Checks**: Test queries that have no corresponding knowledge in the DB to ensure the LLM does *not* fabricate a citation.
- **Citation Accuracy**: Ensure the URL and Title returned by the LLM exactly match the `metadata` of the retrieved chunk.

### Security/Privacy
- **API Keys**: No new external APIs are introduced (embeddings are local). Groq and Supabase keys remain server-side.
- **Data Sharing**: User queries are NOT sent to an external embedding provider. They are only sent to Groq for generation.
- **Database Security**: RLS policies will ensure the `documents` table is read-only for the application role, and writeable only by the service role.

### Risks
- **Hallucinated Citations**: The LLM might invent a URL or attribute a claim to a document that doesn't actually support it.
- **Vercel Serverless Limits**: `onnxruntime-node` cold starts can be heavy. M1 proved it works, but adding concurrent embedding loads might spike memory usage.
- **Context Window Limits**: Injecting too many retrieved chunks might exceed the strict token limits if not chunked appropriately.

### Rollback Plan
If retrieval significantly degrades answer quality or causes high hallucination rates:
1. Revert `ChatResponseSchema` and Groq Tool Schema back to `source: null`.
2. Disable the `retrieveContext()` call in `route.ts`.
3. The app will gracefully fall back to M1 behavior (answering from pre-trained weights without citations).

### Questions Requiring Approval
1. **Source Schema**: Is the proposed source object `{ title: string, url: string, publisher: string }` acceptable, or do we need additional fields (e.g., chunk excerpt)?
2. **Backward Compatibility**: Changing `source: null` to a structured object is an API change. Do we need to support legacy clients expecting strictly `null`, or is it acceptable for `source` to now be an object/null?
3. **Approved Sources**: I propose starting with a small baseline (e.g., CDC Food Safety Guidelines, USDA Dietary Guidelines). Do you have a specific list of sources to be ingested first?
