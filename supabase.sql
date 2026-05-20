-- KURSOR IT Passport MVP schema
-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  child_name text not null,
  child_age int not null check (child_age between 5 and 17),
  parent_name text not null,
  parent_phone text not null,
  question_scores jsonb not null,
  memory_stats jsonb not null,
  top_profile text not null,
  top3_profiles jsonb not null,
  total_score int,
  accuracy numeric,
  lead_status text default 'new'
    check (lead_status in ('new', 'contacted', 'booked_trial', 'paid', 'lost'))
);

alter table public.results enable row level security;

-- MVP policy: allow inserts/select/updates using anon key
-- For production replace with Supabase Auth + role-based policies
drop policy if exists "anon insert results" on public.results;
create policy "anon insert results"
on public.results
for insert
to anon
with check (true);

drop policy if exists "anon select results" on public.results;
create policy "anon select results"
on public.results
for select
to anon
using (true);

drop policy if exists "anon update results" on public.results;
create policy "anon update results"
on public.results
for update
to anon
using (true)
with check (true);

