-- ==============================================================================
-- FetoAI SaaS Production Database Migration Script (Supabase)
-- Multi-Tenant Auth, Chat Persistence, Hybrid RAG (pgvector 384-dim + FTS RRF),
-- User Memory, and Credit Rate-Limiting.
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";
create extension if not exists "pg_trgm";

-- ==============================================================================
-- 2. User Profiles Table (Linked to auth.users)
-- ==============================================================================
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'enterprise')),
  daily_credits_used int not null default 0,
  daily_credits_limit int not null default 15,
  last_reset_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index on email and tier for fast lookup
create index if not exists idx_user_profiles_email on public.user_profiles(email);
create index if not exists idx_user_profiles_plan on public.user_profiles(plan_tier);

-- Automatic Profile Creation Trigger on Supabase Auth Sign Up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (
    id,
    email,
    full_name,
    avatar_url,
    plan_tier,
    daily_credits_used,
    daily_credits_limit,
    last_reset_date
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'free',
    0,
    15,
    current_date
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, user_profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, user_profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-touch updated_at trigger helper
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.set_current_timestamp_updated_at();

-- ==============================================================================
-- 3. Conversations & Messages (Chat Persistence)
-- ==============================================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  title text not null default 'New Research Session',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_user_updated on public.conversations(user_id, updated_at desc);

create trigger trigger_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_current_timestamp_updated_at();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  attachments_json jsonb default '[]'::jsonb,
  tool_traces_json jsonb default '{}'::jsonb,
  citations_json jsonb default '[]'::jsonb,
  telemetry_json jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at asc);

-- ==============================================================================
-- 4. Documents & Document Chunks (Hybrid RAG Vector Store)
-- ==============================================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  chunk_count int not null default 0,
  status text not null default 'ready' check (status in ('pending', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_user on public.documents(user_id, created_at desc);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  metadata_json jsonb default '{}'::jsonb,
  embedding vector(384),
  fts tsvector generated always as (to_tsvector('english', content)) stored
);

-- Indexes for Vector Search and Full-Text Search
create index if not exists idx_chunks_document_id on public.document_chunks(document_id);
create index if not exists idx_chunks_fts on public.document_chunks using gin(fts);
-- HNSW index on 384-dim embeddings using cosine distance
create index if not exists idx_chunks_embedding_hnsw on public.document_chunks 
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- ==============================================================================
-- 5. Hybrid Search RPC Function (Reciprocal Rank Fusion - RRF)
-- Combines dense vector cosine similarity with sparse full-text search ranking
-- ==============================================================================
create or replace function public.hybrid_search_chunks(
  query_text text,
  query_embedding vector(384),
  match_count int default 5,
  filter_document_id uuid default null,
  filter_user_id uuid default null,
  rrf_k int default 60
)
returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  metadata_json jsonb,
  cosine_distance float,
  fts_rank float,
  rrf_score float
)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  with vector_search as (
    select
      dc.id as chunk_id,
      dc.document_id,
      dc.content,
      dc.metadata_json,
      (dc.embedding <=> query_embedding)::float as distance,
      row_number() over (order by dc.embedding <=> query_embedding asc) as v_rank
    from public.document_chunks dc
    join public.documents d on d.id = dc.document_id
    where
      (filter_document_id is null or dc.document_id = filter_document_id)
      and (
        (filter_user_id is not null and d.user_id = filter_user_id)
        or (filter_user_id is null and (auth.uid() is null or d.user_id = auth.uid()))
      )
    order by dc.embedding <=> query_embedding asc
    limit match_count * 2
  ),
  text_search as (
    select
      dc.id as chunk_id,
      dc.document_id,
      dc.content,
      dc.metadata_json,
      ts_rank_cd(dc.fts, websearch_to_tsquery('english', query_text))::float as rank,
      row_number() over (order by ts_rank_cd(dc.fts, websearch_to_tsquery('english', query_text)) desc) as t_rank
    from public.document_chunks dc
    join public.documents d on d.id = dc.document_id
    where
      (filter_document_id is null or dc.document_id = filter_document_id)
      and (
        (filter_user_id is not null and d.user_id = filter_user_id)
        or (filter_user_id is null and (auth.uid() is null or d.user_id = auth.uid()))
      )
      and (dc.fts @@ websearch_to_tsquery('english', query_text))
    order by rank desc
    limit match_count * 2
  ),
  fused as (
    select
      coalesce(vs.chunk_id, ts.chunk_id) as chunk_id,
      coalesce(vs.document_id, ts.document_id) as document_id,
      coalesce(vs.content, ts.content) as content,
      coalesce(vs.metadata_json, ts.metadata_json) as metadata_json,
      coalesce(vs.distance, 1.0) as cosine_distance,
      coalesce(ts.rank, 0.0) as fts_rank,
      (
        coalesce(1.0 / (rrf_k + vs.v_rank), 0.0) +
        coalesce(1.0 / (rrf_k + ts.t_rank), 0.0)
      )::float as rrf_score
    from vector_search vs
    full outer join text_search ts on vs.chunk_id = ts.chunk_id
  )
  select
    fused.chunk_id,
    fused.document_id,
    fused.content,
    fused.metadata_json,
    fused.cosine_distance,
    fused.fts_rank,
    fused.rrf_score
  from fused
  order by fused.rrf_score desc
  limit match_count;
end;
$$;

-- ==============================================================================
-- 6. User Memory Table (Custom System Prompts / Context)
-- ==============================================================================
create table if not exists public.user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade unique,
  custom_instructions text default '',
  updated_at timestamptz not null default now()
);

create trigger trigger_user_memory_updated_at
  before update on public.user_memory
  for each row execute function public.set_current_timestamp_updated_at();

-- ==============================================================================
-- 7. Credit Rate-Limiting & Auto-Reset RPC Functions
-- ==============================================================================
create or replace function public.deduct_user_credit(
  user_uuid uuid,
  cost int default 1
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_profile public.user_profiles%rowtype;
  v_new_used int;
begin
  select * into v_profile
  from public.user_profiles
  where id = user_uuid
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'User profile not found');
  end if;

  -- Reset if date changed
  if v_profile.last_reset_date < current_date then
    v_profile.daily_credits_used := 0;
    v_profile.last_reset_date := current_date;
  end if;

  -- Pro and Enterprise have unlimited access
  if v_profile.plan_tier in ('pro', 'enterprise') then
    update public.user_profiles
    set
      daily_credits_used = v_profile.daily_credits_used + cost,
      last_reset_date = v_profile.last_reset_date
    where id = user_uuid;

    return jsonb_build_object(
      'success', true,
      'plan_tier', v_profile.plan_tier,
      'daily_credits_used', v_profile.daily_credits_used + cost,
      'daily_credits_limit', -1,
      'remaining', 999999
    );
  end if;

  -- Free tier quota check
  v_new_used := v_profile.daily_credits_used + cost;
  if v_new_used > v_profile.daily_credits_limit then
    return jsonb_build_object(
      'success', false,
      'error', 'Daily credit limit reached. Upgrade to FetoAI Pro for unlimited access.',
      'plan_tier', v_profile.plan_tier,
      'daily_credits_used', v_profile.daily_credits_used,
      'daily_credits_limit', v_profile.daily_credits_limit,
      'remaining', 0
    );
  end if;

  update public.user_profiles
  set
    daily_credits_used = v_new_used,
    last_reset_date = v_profile.last_reset_date
  where id = user_uuid;

  return jsonb_build_object(
    'success', true,
    'plan_tier', v_profile.plan_tier,
    'daily_credits_used', v_new_used,
    'daily_credits_limit', v_profile.daily_credits_limit,
    'remaining', v_profile.daily_credits_limit - v_new_used
  );
end;
$$;

-- ==============================================================================
-- 8. Row Level Security (RLS) Policies
-- Strict multi-tenant isolation: users only access their own records
-- ==============================================================================
alter table public.user_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.user_memory enable row level security;

-- user_profiles policies
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- conversations policies
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can create own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- messages policies
create policy "Users can view messages from own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can create messages in own conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can delete messages in own conversations"
  on public.messages for delete
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- documents policies
create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- document_chunks policies
create policy "Users can view own document chunks"
  on public.document_chunks for select
  using (
    exists (
      select 1 from public.documents
      where documents.id = document_chunks.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can insert chunks into own documents"
  on public.document_chunks for insert
  with check (
    exists (
      select 1 from public.documents
      where documents.id = document_chunks.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can delete chunks from own documents"
  on public.document_chunks for delete
  using (
    exists (
      select 1 from public.documents
      where documents.id = document_chunks.document_id
      and documents.user_id = auth.uid()
    )
  );

-- user_memory policies
create policy "Users can view own memory"
  on public.user_memory for select
  using (auth.uid() = user_id);

create policy "Users can insert/update own memory"
  on public.user_memory for all
  using (auth.uid() = user_id);
