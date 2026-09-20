-- ─────────────────────────────────────────────────────────────────────────────
-- Milestone 1 Schema
-- Run this in Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Stores one row per chat session
create table conversations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

-- Stores every user and assistant message in order
create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  raw_response    jsonb,      -- full structured response (answer + claims); null for user messages
  declined        boolean default false,
  created_at      timestamptz default now()
);

-- Index used by getConversationHistory to load messages in order
create index on messages (conversation_id, created_at);

-- Allow the server-side service_role to manage conversations and messages
grant select, insert on table public.conversations to service_role;
grant select, insert on table public.messages to service_role;
