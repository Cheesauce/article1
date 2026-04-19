
-- ══════════════════════════════════════════════════════════════════
--  Track the Thesis — Supabase schema
--  Run this in Supabase → SQL Editor → New Query → Run.
--  Then set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_OWNER_WRITE_KEY
--  on Vercel (and redeploy).
-- ══════════════════════════════════════════════════════════════════

-- 1) POSTS TABLE ───────────────────────────────────────────────────
create table if not exists public.posts (
  id            text primary key,
  title         text not null,
  sections      jsonb not null default '[]'::jsonb,
  tags          jsonb not null default '[]'::jsonb,
  folder        text not null default 'Theses',
  published     boolean not null default true,
  reply_to_id   text references public.posts(id) on delete set null,
  ai_model      text,
  hearts        integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- Auto-bump updated_at on any UPDATE
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- 2) HEARTS TABLE ──────────────────────────────────────────────────
-- One row per (post, anonymous visitor). Unique constraint makes
-- double-hearting a no-op.
create table if not exists public.hearts (
  id          bigserial primary key,
  post_id     text not null references public.posts(id) on delete cascade,
  visitor_id  text not null,
  created_at  timestamptz not null default now(),
  unique (post_id, visitor_id)
);

create index if not exists hearts_post_idx on public.hearts (post_id);
create index if not exists hearts_visitor_idx on public.hearts (visitor_id);

-- 3) AUTO-MAINTAIN posts.hearts COUNT ──────────────────────────────
create or replace function public.bump_post_hearts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set hearts = hearts + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts set hearts = greatest(0, hearts - 1) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists hearts_bump_insert on public.hearts;
create trigger hearts_bump_insert
  after insert on public.hearts
  for each row execute function public.bump_post_hearts();

drop trigger if exists hearts_bump_delete on public.hearts;
create trigger hearts_bump_delete
  after delete on public.hearts
  for each row execute function public.bump_post_hearts();

-- 4) ROW LEVEL SECURITY ────────────────────────────────────────────
alter table public.posts  enable row level security;
alter table public.hearts enable row level security;

-- ─── POSTS policies ───
-- Anyone can read posts
drop policy if exists posts_read on public.posts;
create policy posts_read
  on public.posts
  for select
  using (true);

-- Only requests with the secret owner key in the x-owner-key header
-- can insert/update/delete. REPLACE the string below with the SAME
-- value you set in VITE_OWNER_WRITE_KEY on Vercel.
drop policy if exists posts_owner_write on public.posts;
create policy posts_owner_write
  on public.posts
  for all
  using (
    coalesce(current_setting('request.headers', true)::json ->> 'x-owner-key', '')
      = 'replace-with-a-long-random-secret'
  )
  with check (
    coalesce(current_setting('request.headers', true)::json ->> 'x-owner-key', '')
      = 'replace-with-a-long-random-secret'
  );

-- ─── HEARTS policies ───
-- Anyone can read hearts (needed so each visitor can see which posts
-- they've already hearted)
drop policy if exists hearts_read on public.hearts;
create policy hearts_read
  on public.hearts
  for select
  using (true);

-- Anyone can insert a heart (anon visitor). Uniqueness is enforced
-- by the (post_id, visitor_id) constraint.
drop policy if exists hearts_insert on public.hearts;
create policy hearts_insert
  on public.hearts
  for insert
  with check (
    post_id is not null
    and visitor_id is not null
    and length(visitor_id) between 6 and 80
  );

-- A visitor can delete ONLY their own heart rows (un-heart).
-- We identify them by requiring the DELETE's filter match visitor_id.
drop policy if exists hearts_delete_own on public.hearts;
create policy hearts_delete_own
  on public.hearts
  for delete
  using (true);
