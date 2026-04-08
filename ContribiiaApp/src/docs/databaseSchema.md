# Contribiia MVP – Database Schema

This document describes the database architecture for the **Contribiia MVP mobile application**.

The backend uses **Supabase (PostgreSQL)** for authentication, database storage, and secure wallet operations.

---

# System Overview

The database consists of three main tables:

- profiles
- wallets
- transactions

Supabase authentication (`auth.users`) manages user identity.

Each user automatically receives a wallet when they sign up.

---

# Database Relationship Diagram

auth.users  
│  
▼  
profiles  
│  
▼  
wallets  
│  
▼  
transactions

Relationship summary:

- `profiles.id` references `auth.users.id`
- Each user has **one wallet**
- Each wallet has **many transactions**

---

# Table: profiles

Stores user profile information.

| Column            | Type        | Description                              |
| ----------------- | ----------- | ---------------------------------------- |
| id                | uuid        | Primary key, references auth.users.id    |
| full_name         | text        | User full name                           |
| email             | text        | User email                               |
| username          | text        | Chosen username                          |
| phone             | text        | Phone number                             |
| created_at        | timestamptz | Account creation timestamp               |
| legal_name        | text        | Legal name (if different from full_name) |
| date_of_birth     | text        | DOB in YYYY-MM-DD format                 |
| gender            | text        | Gender identity                          |
| address_line1     | text        | Home / verification address line 1       |
| address_line2     | text        | Home address line 2 (optional)           |
| city              | text        | City                                     |
| province          | text        | Province or territory                    |
| postal_code       | text        | Postal code                              |
| personal_addr1    | text        | Personal billing address line 1          |
| personal_addr2    | text        | Personal billing address line 2          |
| personal_city     | text        | Personal billing city                    |
| personal_province | text        | Personal billing province                |
| personal_postal   | text        | Personal billing postal code             |
| business_addr1    | text        | Business billing address line 1          |
| business_addr2    | text        | Business billing address line 2          |
| business_city     | text        | Business billing city                    |
| business_province | text        | Business billing province                |
| business_postal   | text        | Business billing postal code             |

---

# Table: wallets

Each user has exactly **one wallet**.

| Column     | Type        | Description               |
| ---------- | ----------- | ------------------------- |
| id         | uuid        | Wallet ID                 |
| user_id    | uuid        | References profiles.id    |
| balance    | numeric     | Wallet balance            |
| created_at | timestamptz | Wallet creation timestamp |

Constraint:

unique(user_id)

Ensures each user only has one wallet.

---

# Table: transactions

Stores wallet activity.

| Column     | Type        | Description            |
| ---------- | ----------- | ---------------------- |
| id         | uuid        | Transaction ID         |
| user_id    | uuid        | References profiles.id |
| wallet_id  | uuid        | References wallets.id  |
| amount     | numeric     | Transaction amount     |
| type       | text        | deposit or withdraw    |
| created_at | timestamptz | Transaction timestamp  |

---

# Database SQL Schema

```sql
create extension if not exists "pgcrypto";

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- Migration: add extended profile columns (run once on existing databases)
alter table public.profiles
  add column if not exists username text,
  add column if not exists phone text,
  add column if not exists legal_name text,
  add column if not exists date_of_birth text,
  add column if not exists gender text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists province text,
  add column if not exists postal_code text,
  add column if not exists personal_addr1 text,
  add column if not exists personal_addr2 text,
  add column if not exists personal_city text,
  add column if not exists personal_province text,
  add column if not exists personal_postal text,
  add column if not exists business_addr1 text,
  add column if not exists business_addr2 text,
  add column if not exists business_city text,
  add column if not exists business_province text,
  add column if not exists business_postal text;

-- WALLETS (1 per user)
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  balance numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  wallet_id uuid not null references public.wallets (id) on delete cascade,
  amount numeric not null check (amount > 0),
  type text not null check (type in ('deposit', 'withdraw')),
  created_at timestamptz not null default now()
);

create index if not exists idx_wallets_user_id on public.wallets(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);

--Automatic Wallet Creation

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));

  insert into public.wallets (user_id, balance)
  values (new.id, 0);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


--Wallet Operations (RPC Functions)
--Wallet operations are handled using secure PostgreSQL functions.
--Deposit Function

create or replace function public.wallet_deposit(p_amount numeric)
returns void
language plpgsql
security definer
as $$
declare
  v_uid uuid := auth.uid();
  v_wallet_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'Amount must be > 0';
  end if;

  select id into v_wallet_id
  from public.wallets
  where user_id = v_uid;

  update public.wallets
  set balance = balance + p_amount
  where id = v_wallet_id;

  insert into public.transactions(user_id, wallet_id, amount, type)
  values (v_uid, v_wallet_id, p_amount, 'deposit');
end;
$$;

--Withdraw Function

create or replace function public.wallet_withdraw(p_amount numeric)
returns void
language plpgsql
security definer
as $$
declare
  v_uid uuid := auth.uid();
  v_wallet_id uuid;
  v_balance numeric;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'Amount must be > 0';
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

  insert into public.transactions(user_id, wallet_id, amount, type)
  values (v_uid, v_wallet_id, p_amount, 'withdraw');
end;
$$;

--Row Level Security

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;

--Security Policies

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "wallets_select_own"
on public.wallets for select
using (auth.uid() = user_id);

create policy "transactions_select_own"
on public.transactions for select
using (auth.uid() = user_id);


Summary
The Contribiia backend supports:
•	Supabase authentication
•	Automatic wallet creation
•	Secure deposit and withdrawal operations
•	Transaction history
•	Row-level data security
This architecture supports a secure wallet MVP mobile application.

```
