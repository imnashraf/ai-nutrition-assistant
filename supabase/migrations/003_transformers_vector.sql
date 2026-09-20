-- Drop the existing function
DROP FUNCTION IF EXISTS match_documents(vector(1536), int, float);
DROP FUNCTION IF EXISTS match_documents(vector, int, float);

-- Drop the existing documents table to recreate it with 384 dimensions
DROP TABLE IF EXISTS documents;

-- Recreate the table with 384 dimensions (for Transformers.js Xenova/all-MiniLM-L6-v2)
create table documents (
  id bigint primary key generated always as identity,
  content text not null,
  metadata jsonb,
  embedding vector(384)
);

-- Recreate the function
create or replace function match_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by (documents.embedding <=> query_embedding) asc
  limit match_count;
$$;
