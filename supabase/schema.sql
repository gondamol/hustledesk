-- HustleDesk cloud schema (run in Supabase SQL Editor)
-- Project → SQL → New query → paste → Run

-- Workspaces: one JSON blob per user (fast ship; normalize later if needed)
create table if not exists public.workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

create policy "Users read own workspace"
  on public.workspaces for select
  using (auth.uid() = user_id);

create policy "Users insert own workspace"
  on public.workspaces for insert
  with check (auth.uid() = user_id);

create policy "Users update own workspace"
  on public.workspaces for update
  using (auth.uid() = user_id);

-- Short share links (readable by anyone with the id; writable by owner)
create table if not exists public.shares (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('invoice', 'quote', 'receipt')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  views int not null default 0
);

create index if not exists shares_user_id_idx on public.shares (user_id);
create index if not exists shares_created_at_idx on public.shares (created_at desc);

alter table public.shares enable row level security;

create policy "Anyone can read shares"
  on public.shares for select
  using (true);

create policy "Authenticated users create shares"
  on public.shares for insert
  with check (auth.uid() = user_id);

create policy "Owners delete own shares"
  on public.shares for delete
  using (auth.uid() = user_id);

-- Pro subscriptions via M-Pesa
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'inactive',
  phone text,
  checkout_request_id text,
  merchant_request_id text,
  mpesa_receipt text,
  amount int,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users upsert own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id);

-- Email send log
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  to_email text not null,
  subject text,
  status text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.email_log enable row level security;

create policy "Users read own email log"
  on public.email_log for select
  using (auth.uid() = user_id);

-- Service role bypasses RLS for M-Pesa callback + share view counters.
-- Grant anon read on shares already covered by policy.

-- Optional: auto-create empty workspace on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.workspaces (user_id, data)
  values (new.id, '{}'::jsonb)
  on conflict (user_id) do nothing;
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
