-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text not null, -- the actual text of the chunk
  metadata jsonb, -- stores url, title, etc.
  embedding vector(384) -- all-MiniLM-L6-v2 uses 384 dimensions
);
-- Allow the server-side service_role to seed documents
grant insert on table public.documents to service_role;

-- Create a function to similarity search for documents
create or replace function match_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
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
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
