-- AWWAB v2 schema. Every table is private to its owner via RLS.

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  kind text not null check (kind in ('check', 'qty')),
  period text not null check (period in ('daily', 'weekly', 'monthly')),
  unit text check (unit is null or char_length(unit) <= 20),
  day_target numeric check (day_target > 0),
  step numeric check (step > 0),
  period_target numeric check (period_target > 0),
  routine_days smallint[] not null default '{}'
    check (routine_days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  sort int not null default 0,
  start_on date not null,
  archived_on date,
  created_at timestamptz not null default now(),
  constraint qty_needs_target check (kind = 'check' or (day_target is not null and step is not null)),
  constraint period_needs_target check (period = 'daily' or period_target is not null),
  constraint routine_only_non_daily check (period <> 'daily' or cardinality(routine_days) = 0),
  unique (id, user_id)
);
create index habits_user_idx on public.habits (user_id);

create table public.habit_logs (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  habit_id uuid not null,
  date date not null,
  done boolean not null default false,
  value numeric check (value >= 0),
  updated_at timestamptz not null default now(),
  primary key (habit_id, date),
  -- the habit must belong to the same user
  foreign key (habit_id, user_id) references public.habits (id, user_id) on delete cascade
);
create index habit_logs_user_date_idx on public.habit_logs (user_id, date);

create table public.plan_entries (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  habit_id uuid not null,
  date date not null,
  primary key (habit_id, date),
  foreign key (habit_id, user_id) references public.habits (id, user_id) on delete cascade
);
create index plan_entries_user_date_idx on public.plan_entries (user_id, date);

create table public.month_notes (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  month date not null check (extract(day from month) = 1),
  body text not null default '' check (char_length(body) <= 5000),
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  show_quote boolean not null default true,
  last_quote_on date,
  display_name text check (display_name is null or char_length(display_name) <= 40)
);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.plan_entries enable row level security;
alter table public.month_notes enable row level security;
alter table public.settings enable row level security;

create policy "own habits" on public.habits for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own logs" on public.habit_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own plans" on public.plan_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own notes" on public.month_notes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own settings" on public.settings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- keep updated_at honest on upserts
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger habit_logs_touch before update on public.habit_logs
  for each row execute function public.touch_updated_at();
create trigger month_notes_touch before update on public.month_notes
  for each row execute function public.touch_updated_at();
