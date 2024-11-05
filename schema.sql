-- Extension to handle updated_at column
create extension if not exists moddatetime schema extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deactivated boolean not null default false,
  primary key (id),
  constraint profiles_bio_check check ((length(bio) < 500))
);

-- Add a trigger to update the updated_at column
create trigger handle_updated_at before
  update on public.profiles for each row
  execute function moddatetime ('updated_at');

-- Enable row level security
alter table public.profiles enable row level security;

-- Note that some users may enable RLS with no policies intentionally to restrict access over APIs. In those cases we recommend making that intent explicit with a rejection policy.
create policy none_shall_pass on public.profiles
    for select
    using (false);

create table
  public.peers (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    room text null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp without time zone not null default now(),
    constraint peers_pkey primary key (id),
    constraint peers_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

create trigger handle_updated_at before
update on peers for each row
execute function extensions.moddatetime ('updated_at');

create trigger handle_updated_at before
  update on public.peers for each row
  execute function moddatetime ('updated_at');

alter table public.peers enable row level security;

create policy none_shall_pass on public.peers
    for select
    using (false);

SELECT cron.schedule(
 'delete_old_peers',   -- name of the job
 '*/5 * * * *',       -- cron schedule: every 5 minutes
 $$
 DELETE FROM peers
 WHERE updated_at < (NOW() - INTERVAL '5 minutes');
 $$ -- here document syntax for the SQL statement
);

-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, avatar_url, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(NULLIF(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();