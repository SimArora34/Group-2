-- Migration: add_circles
-- Adds circles (savings clubs) and circle_members tables with RLS policies.

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.circles (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  owner_id               uuid not null references public.profiles (id) on delete cascade,
  contribution_amount    numeric not null default 0,
  visibility             text not null default 'private' check (visibility in ('public', 'private')),
  total_members          integer not null default 1,
  savings_goal           numeric,
  duration_months        integer,
  cycle_start_date       text,
  contribution_frequency text,
  total_positions        integer,
  created_at             timestamptz not null default now()
);

create table if not exists public.circle_members (
  id             uuid primary key default gen_random_uuid(),
  circle_id      uuid not null references public.circles (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  order_position integer,
  status         text,
  joined_at      timestamptz not null default now(),
  unique (circle_id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_circles_owner_id       on public.circles (owner_id);
create index if not exists idx_circles_visibility     on public.circles (visibility);
create index if not exists idx_circle_members_user_id on public.circle_members (user_id);
create index if not exists idx_circle_members_circle  on public.circle_members (circle_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.circles        enable row level security;
alter table public.circle_members enable row level security;

-- circles: anyone authenticated can view public clubs
-- circles: members can view clubs they belong to
drop policy if exists "circles_select" on public.circles;
create policy "circles_select"
  on public.circles for select
  using (
    visibility = 'public'
    or owner_id = auth.uid()
    or exists (
      select 1 from public.circle_members
      where circle_members.circle_id = circles.id
        and circle_members.user_id = auth.uid()
    )
  );

-- circles: authenticated users can create circles they own
drop policy if exists "circles_insert" on public.circles;
create policy "circles_insert"
  on public.circles for insert
  with check (auth.uid() = owner_id);

-- circles: only the owner can update their circle
drop policy if exists "circles_update" on public.circles;
create policy "circles_update"
  on public.circles for update
  using (auth.uid() = owner_id);

-- circles: only the owner can delete their circle
drop policy if exists "circles_delete" on public.circles;
create policy "circles_delete"
  on public.circles for delete
  using (auth.uid() = owner_id);

-- circle_members: users can view memberships for circles they belong to or own
drop policy if exists "circle_members_select" on public.circle_members;
create policy "circle_members_select"
  on public.circle_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.circles
      where circles.id = circle_members.circle_id
        and (circles.owner_id = auth.uid() or circles.visibility = 'public')
    )
  );

-- circle_members: authenticated users can join circles
drop policy if exists "circle_members_insert" on public.circle_members;
create policy "circle_members_insert"
  on public.circle_members for insert
  with check (auth.uid() = user_id);

-- circle_members: users can remove themselves; owners can remove anyone
drop policy if exists "circle_members_delete" on public.circle_members;
create policy "circle_members_delete"
  on public.circle_members for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.circles
      where circles.id = circle_members.circle_id
        and circles.owner_id = auth.uid()
    )
  );
