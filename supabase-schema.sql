-- Optional Supabase schema for cloud progress.
-- Supabase Auth owns users. This table stores completed level IDs per track.
create table if not exists public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.learning_progress enable row level security;
create policy "users can read own progress" on public.learning_progress for select using (auth.uid()=user_id);
create policy "users can insert own progress" on public.learning_progress for insert with check (auth.uid()=user_id);
create policy "users can update own progress" on public.learning_progress for update using (auth.uid()=user_id);
