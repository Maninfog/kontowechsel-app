-- Run this in Supabase: SQL Editor → New query → Run
-- Creates tables expected by src/routes/pruefen.tsx (anon key from browser).

create table if not exists public.switching_cases (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  old_iban text not null default '',
  new_iban text not null default '',
  new_bank_name text not null default '',
  switch_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  session_owner_id uuid null
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.switching_cases (id) on delete cascade,
  payee_name text not null,
  payee_iban text not null default '',
  amount numeric(14, 2) not null,
  frequency text not null
    check (frequency in ('monthly', 'quarterly', 'yearly', 'weekly')),
  type text not null
    check (type in ('lastschrift', 'dauerauftrag')),
  selected boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists payments_case_id_idx on public.payments (case_id);

alter table public.switching_cases enable row level security;
alter table public.payments enable row level security;

-- Prototype: allow API access with the anon key (tighten RLS before production).
drop policy if exists "switching_cases_anon_rw" on public.switching_cases;
create policy "switching_cases_anon_rw" on public.switching_cases
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "payments_anon_rw" on public.payments;
create policy "payments_anon_rw" on public.payments
  for all
  to anon, authenticated
  using (true)
  with check (true);
