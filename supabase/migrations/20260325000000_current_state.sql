-- Migration: current_state
-- Complete database schema for the Contribiia app.
-- This is a single baseline migration representing the full current state.
-- Tables, indexes, triggers, RPC functions, and RLS policies are all included.


-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- TABLES
-- ============================================================

-- Stores user profile information (auto-populated on signup via trigger)
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  email      text,
  username   text unique,
  created_at timestamptz not null default now()
);

-- Each user has exactly one wallet
create table if not exists public.wallets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  balance    numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- Records every deposit, withdrawal, and transfer
create table if not exists public.transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  wallet_id  uuid not null references public.wallets (id) on delete cascade,
  amount     numeric not null check (amount > 0),
  type       text not null check (type in ('deposit', 'withdraw')),
  created_at timestamptz not null default now()
);

-- Payment cards linked to a user's account
-- Note: full card numbers and CVV are never stored here.
-- Only the last 4 digits are retained for display purposes.
-- Full card processing must go through a payment provider (e.g. Stripe).
create table if not exists public.cards (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  holder_name       text not null,
  last4             text not null,
  expiry            text not null,           -- stored as MM/YY
  type              text not null default 'personal' check (type in ('personal', 'business')),
  bank_name         text,
  is_frozen         boolean not null default false,
  is_default        boolean not null default false,
  billing_address_1 text,
  billing_address_2 text,
  billing_city      text,
  billing_province  text,
  billing_country   text,
  created_at        timestamptz not null default now()
);

-- External bank accounts linked by the user for deposits/withdrawals
create table if not exists public.bank_accounts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  account_number text not null,              -- store last digits only, never full account number
  bank_name      text not null,
  account_type   text not null default 'SAVINGS' check (account_type in ('SAVINGS', 'CURRENT')),
  is_default     boolean not null default false,
  created_at     timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_wallets_user_id       on public.wallets(user_id);
create index if not exists idx_transactions_user_id  on public.transactions(user_id);
create index if not exists idx_transactions_wallet_id on public.transactions(wallet_id);
create index if not exists idx_cards_user_id         on public.cards(user_id);
create index if not exists idx_bank_accounts_user_id on public.bank_accounts(user_id);


-- ============================================================
-- TRIGGER: Auto-create profile + wallet when a user signs up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );

  insert into public.wallets (user_id, balance)
  values (new.id, 0);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- RPC: wallet_deposit
-- Adds money to the logged-in user's wallet.
-- ============================================================

create or replace function public.wallet_deposit(p_amount numeric)
returns void
language plpgsql
security definer
as $$
declare
  v_uid       uuid := auth.uid();
  v_wallet_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;

  select id into v_wallet_id
  from public.wallets
  where user_id = v_uid;

  update public.wallets
  set balance = balance + p_amount
  where id = v_wallet_id;

  insert into public.transactions (user_id, wallet_id, amount, type)
  values (v_uid, v_wallet_id, p_amount, 'deposit');
end;
$$;


-- ============================================================
-- RPC: wallet_withdraw
-- Removes money from the logged-in user's wallet.
-- ============================================================

create or replace function public.wallet_withdraw(p_amount numeric)
returns void
language plpgsql
security definer
as $$
declare
  v_uid       uuid := auth.uid();
  v_wallet_id uuid;
  v_balance   numeric;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;

  select id, balance into v_wallet_id, v_balance
  from public.wallets
  where user_id = v_uid;

  if v_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  update public.wallets
  set balance = balance - p_amount
  where id = v_wallet_id;

  insert into public.transactions (user_id, wallet_id, amount, type)
  values (v_uid, v_wallet_id, p_amount, 'withdraw');
end;
$$;


-- ============================================================
-- RPC: wallet_send
-- Transfers money from the logged-in user to another user by email.
-- ============================================================

create or replace function public.wallet_send(p_recipient_email text, p_amount numeric)
returns void
language plpgsql
security definer
as $$
declare
  v_sender           uuid := auth.uid();
  v_recipient        uuid;
  v_sender_wallet    uuid;
  v_recipient_wallet uuid;
  v_bal              numeric;
begin
  if v_sender is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;

  -- Look up recipient by email
  select id into v_recipient
  from auth.users
  where email = p_recipient_email;

  if v_recipient is null then
    raise exception 'Recipient not found';
  end if;

  if v_sender = v_recipient then
    raise exception 'Cannot send money to yourself';
  end if;

  -- Get sender wallet and current balance
  select id, balance into v_sender_wallet, v_bal
  from public.wallets
  where user_id = v_sender;

  if v_bal < p_amount then
    raise exception 'Insufficient balance';
  end if;

  -- Get recipient wallet
  select id into v_recipient_wallet
  from public.wallets
  where user_id = v_recipient;

  if v_recipient_wallet is null then
    raise exception 'Recipient does not have a wallet';
  end if;

  -- Deduct from sender
  update public.wallets
  set balance = balance - p_amount
  where id = v_sender_wallet;

  insert into public.transactions (user_id, wallet_id, amount, type)
  values (v_sender, v_sender_wallet, p_amount, 'withdraw');

  -- Add to recipient
  update public.wallets
  set balance = balance + p_amount
  where id = v_recipient_wallet;

  insert into public.transactions (user_id, wallet_id, amount, type)
  values (v_recipient, v_recipient_wallet, p_amount, 'deposit');
end;
$$;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles     enable row level security;
alter table public.wallets      enable row level security;
alter table public.transactions  enable row level security;
alter table public.cards         enable row level security;
alter table public.bank_accounts enable row level security;

-- Profiles: any logged-in user can read any profile.
-- Required for Send Money (looking up a recipient by email) and invoice user search.
drop policy if exists "profiles_select_own"           on public.profiles;
drop policy if exists "profiles_select_authenticated"  on public.profiles;

create policy "profiles_select_authenticated"
  on public.profiles for select
  using (auth.uid() is not null);

-- Wallets: users can only read their own wallet
drop policy if exists "wallets_select_own" on public.wallets;

create policy "wallets_select_own"
  on public.wallets for select
  using (auth.uid() = user_id);

-- Transactions: users can only read their own transactions
drop policy if exists "transactions_select_own" on public.transactions;

create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

-- Cards: users can only read, insert, update, and delete their own cards
drop policy if exists "cards_select_own" on public.cards;
drop policy if exists "cards_insert_own" on public.cards;
drop policy if exists "cards_update_own" on public.cards;
drop policy if exists "cards_delete_own" on public.cards;

create policy "cards_select_own"
  on public.cards for select
  using (auth.uid() = user_id);

create policy "cards_insert_own"
  on public.cards for insert
  with check (auth.uid() = user_id);

create policy "cards_update_own"
  on public.cards for update
  using (auth.uid() = user_id);

create policy "cards_delete_own"
  on public.cards for delete
  using (auth.uid() = user_id);

-- Bank accounts: users can only read, insert, update, and delete their own accounts
drop policy if exists "bank_accounts_select_own" on public.bank_accounts;
drop policy if exists "bank_accounts_insert_own" on public.bank_accounts;
drop policy if exists "bank_accounts_update_own" on public.bank_accounts;
drop policy if exists "bank_accounts_delete_own" on public.bank_accounts;

create policy "bank_accounts_select_own"
  on public.bank_accounts for select
  using (auth.uid() = user_id);

create policy "bank_accounts_insert_own"
  on public.bank_accounts for insert
  with check (auth.uid() = user_id);

create policy "bank_accounts_update_own"
  on public.bank_accounts for update
  using (auth.uid() = user_id);

create policy "bank_accounts_delete_own"
  on public.bank_accounts for delete
  using (auth.uid() = user_id);
