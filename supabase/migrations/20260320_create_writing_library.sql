create extension if not exists pgcrypto;
create extension if not exists vector;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  country text not null default 'UK',
  website_url text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_sites (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  base_url text not null,
  source_type text not null check (source_type in ('dissertation_examples', 'rubric', 'annotated_writing', 'feedback_guide', 'sample_essay', 'mixed')),
  parser_type text not null check (parser_type in ('html', 'pdf', 'docx', 'mixed')),
  is_active boolean not null default true,
  crawl_frequency text not null default 'weekly' check (crawl_frequency in ('daily', 'weekly', 'monthly', 'manual')),
  last_crawled_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_pages (
  id uuid primary key default gen_random_uuid(),
  source_site_id uuid not null references public.source_sites(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  page_url text not null,
  page_title text,
  page_type text not null default 'unknown' check (page_type in ('example', 'rubric', 'feedback', 'library_index', 'pdf', 'doc', 'unknown')),
  content_hash text,
  raw_html text,
  raw_text text,
  content_length integer,
  http_status integer,
  access_level text not null default 'public' check (access_level in ('public', 'restricted', 'unknown')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_changed_at timestamptz,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_site_id, page_url)
);

create table if not exists public.crawl_runs (
  id uuid primary key default gen_random_uuid(),
  trigger_type text not null check (trigger_type in ('scheduled', 'manual', 'api')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'partial', 'failed')),
  started_at timestamptz,
  finished_at timestamptz,
  pages_checked integer not null default 0,
  pages_new integer not null default 0,
  pages_updated integer not null default 0,
  pages_failed integer not null default 0,
  error_log text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.normalization_runs (
  id uuid primary key default gen_random_uuid(),
  crawl_run_id uuid references public.crawl_runs(id) on delete set null,
  source_page_id uuid not null references public.source_pages(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  model_name text,
  prompt_version text,
  input_tokens integer,
  output_tokens integer,
  raw_model_response jsonb,
  error_log text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.high_scoring_examples (
  id uuid primary key default gen_random_uuid(),
  source_page_id uuid not null references public.source_pages(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  department text,
  programme_level text not null default 'unknown' check (programme_level in ('undergraduate', 'masters', 'phd', 'unknown')),
  assignment_type text not null default 'unknown' check (assignment_type in ('essay', 'dissertation', 'report', 'reflection', 'proposal', 'unknown')),
  title text,
  year_label text,
  exact_score numeric,
  score_band text,
  public_excerpt text,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  marker_comments_summary jsonb not null default '[]'::jsonb,
  ai_summary text,
  source_url text not null,
  access_level text not null default 'public' check (access_level in ('public', 'restricted', 'unknown')),
  is_verified boolean not null default false,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_page_id)
);

create table if not exists public.rubrics (
  id uuid primary key default gen_random_uuid(),
  source_page_id uuid not null references public.source_pages(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  department text,
  programme_level text,
  rubric_name text,
  rubric_text text,
  rubric_json jsonb,
  score_ranges jsonb,
  source_url text not null,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_page_id)
);

create table if not exists public.marker_feedback_patterns (
  id uuid primary key default gen_random_uuid(),
  source_page_id uuid not null references public.source_pages(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  programme_level text,
  feedback_type text not null check (feedback_type in ('strength', 'weakness', 'suggestion')),
  feedback_text text not null,
  category text not null check (category in ('structure', 'critical_thinking', 'literature', 'referencing', 'language', 'general')),
  source_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.library_embeddings (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('example', 'rubric', 'feedback')),
  entity_id uuid not null,
  chunk_text text not null,
  chunk_index integer not null,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, chunk_index)
);

create index if not exists universities_is_active_idx
  on public.universities (is_active);

create index if not exists source_sites_university_id_idx
  on public.source_sites (university_id);

create index if not exists source_sites_is_active_idx
  on public.source_sites (is_active);

create index if not exists source_pages_source_site_id_idx
  on public.source_pages (source_site_id);

create index if not exists source_pages_university_id_idx
  on public.source_pages (university_id);

create index if not exists source_pages_access_level_idx
  on public.source_pages (access_level);

create index if not exists normalization_runs_status_idx
  on public.normalization_runs (status, created_at desc);

create index if not exists high_scoring_examples_university_id_idx
  on public.high_scoring_examples (university_id);

create index if not exists high_scoring_examples_verified_idx
  on public.high_scoring_examples (is_verified, updated_at desc);

create index if not exists rubrics_university_id_idx
  on public.rubrics (university_id);

create index if not exists rubrics_verified_idx
  on public.rubrics (is_verified, updated_at desc);

create index if not exists marker_feedback_patterns_university_id_idx
  on public.marker_feedback_patterns (university_id);

create index if not exists library_embeddings_entity_idx
  on public.library_embeddings (entity_type, entity_id, chunk_index);

create index if not exists library_embeddings_embedding_idx
  on public.library_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

drop trigger if exists universities_set_updated_at on public.universities;
create trigger universities_set_updated_at
before update on public.universities
for each row execute function public.set_updated_at();

drop trigger if exists source_sites_set_updated_at on public.source_sites;
create trigger source_sites_set_updated_at
before update on public.source_sites
for each row execute function public.set_updated_at();

drop trigger if exists source_pages_set_updated_at on public.source_pages;
create trigger source_pages_set_updated_at
before update on public.source_pages
for each row execute function public.set_updated_at();

drop trigger if exists high_scoring_examples_set_updated_at on public.high_scoring_examples;
create trigger high_scoring_examples_set_updated_at
before update on public.high_scoring_examples
for each row execute function public.set_updated_at();

drop trigger if exists rubrics_set_updated_at on public.rubrics;
create trigger rubrics_set_updated_at
before update on public.rubrics
for each row execute function public.set_updated_at();

create or replace function public.match_library_embeddings(
  query_embedding vector(1536),
  match_count integer default 8,
  match_entity_type text default null,
  filter_university_id uuid default null,
  filter_programme_level text default null,
  filter_assignment_type text default null
)
returns table (
  entity_type text,
  entity_id uuid,
  chunk_text text,
  similarity double precision,
  title text,
  source_url text,
  university_name text,
  summary text
)
language sql
stable
as $$
  with ranked as (
    select
      le.entity_type,
      le.entity_id,
      le.chunk_text,
      1 - (le.embedding <=> query_embedding) as similarity
    from public.library_embeddings le
    where le.embedding is not null
      and (match_entity_type is null or le.entity_type = match_entity_type)
  ),
  enriched as (
    select
      ranked.entity_type,
      ranked.entity_id,
      ranked.chunk_text,
      ranked.similarity,
      case
        when ranked.entity_type = 'example' then coalesce(ex.title, 'Untitled example')
        when ranked.entity_type = 'rubric' then coalesce(ru.rubric_name, 'Untitled rubric')
        else coalesce(mf.feedback_type || ' / ' || mf.category, 'Feedback pattern')
      end as title,
      coalesce(ex.source_url, ru.source_url, mf.source_url) as source_url,
      coalesce(uex.name, uru.name, umf.name) as university_name,
      case
        when ranked.entity_type = 'example' then coalesce(ex.ai_summary, ex.public_excerpt, '')
        when ranked.entity_type = 'rubric' then coalesce(ru.rubric_text, '')
        else coalesce(mf.feedback_text, '')
      end as summary,
      coalesce(ex.university_id, ru.university_id, mf.university_id) as university_id,
      coalesce(ex.programme_level, ru.programme_level, mf.programme_level) as programme_level,
      ex.assignment_type as assignment_type
    from ranked
    left join public.high_scoring_examples ex
      on ranked.entity_type = 'example' and ranked.entity_id = ex.id
    left join public.rubrics ru
      on ranked.entity_type = 'rubric' and ranked.entity_id = ru.id
    left join public.marker_feedback_patterns mf
      on ranked.entity_type = 'feedback' and ranked.entity_id = mf.id
    left join public.universities uex
      on ex.university_id = uex.id
    left join public.universities uru
      on ru.university_id = uru.id
    left join public.universities umf
      on mf.university_id = umf.id
  )
  select
    enriched.entity_type,
    enriched.entity_id,
    enriched.chunk_text,
    enriched.similarity,
    enriched.title,
    enriched.source_url,
    enriched.university_name,
    enriched.summary
  from enriched
  where (filter_university_id is null or enriched.university_id = filter_university_id)
    and (filter_programme_level is null or enriched.programme_level = filter_programme_level)
    and (
      filter_assignment_type is null
      or enriched.entity_type <> 'example'
      or enriched.assignment_type = filter_assignment_type
    )
  order by enriched.similarity desc
  limit greatest(match_count, 1);
$$;
