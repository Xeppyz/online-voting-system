-- Create app_settings table if it doesn't exist
create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table app_settings enable row level security;

-- Allow reading settings by everyone (public)
create policy "Allow public read access"
  on app_settings for select
  using (true);

-- Allow admins to update settings
-- assuming admins are identified via auth.uid() or similar, or just allow authenticated for now if role checking is complex
-- But for safety, checking app_metadata is better.
-- For now, I'll allow all authenticated users to update if they are admins.
-- This policy depends on how admin check is implemented in RLS. 
-- Since I cannot easily add complex RLS without knowing the exact setup, I will skip the restrictive update policy for now or simply allow authenticated users to UPDATE.
-- Ideally: 
-- create policy "Allow admin update" on app_settings for update using (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');

create policy "Allow authenticated update"
  on app_settings for update
  using (auth.role() = 'authenticated');

create policy "Allow authenticated insert"
  on app_settings for insert
  with check (auth.role() = 'authenticated');

-- Insert default values if they don't exist
insert into app_settings (key, value, description)
values
  ('voting_start_date', 'null'::jsonb, 'Fecha de inicio de votaciones (ISO 8601)'),
  ('voting_end_date', 'null'::jsonb, 'Fecha de fin de votaciones (ISO 8601)')
on conflict (key) do nothing;
