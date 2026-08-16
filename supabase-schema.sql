-- My Learning OS - Supabase Database
-- Jalankan seluruh script ini di Supabase > SQL Editor.

create table if not exists public.learning_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  track text not null check (track in ('network','analyst','scientist')),
  item_index integer not null check (item_index >= 0),
  completed boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, track, item_index)
);

alter table public.learning_progress enable row level security;

drop policy if exists "Users can view own progress" on public.learning_progress;
create policy "Users can view own progress"
on public.learning_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own progress" on public.learning_progress;
create policy "Users can insert own progress"
on public.learning_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own progress" on public.learning_progress;
create policy "Users can update own progress"
on public.learning_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own progress" on public.learning_progress;
create policy "Users can delete own progress"
on public.learning_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.learning_progress to authenticated;

create index if not exists learning_progress_user_id_idx
on public.learning_progress(user_id);
