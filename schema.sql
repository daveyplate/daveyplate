/** 
* PROFILES
*/
create table profiles (
    id uuid references auth.users not null primary key on delete cascade,
    bio text null,
    deactivated boolean not null default false,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint users_bio_check check ((length(bio) < 500))
)

alter table profiles enable row level security;
create policy "Can view own user data." on profiles for select using (auth.uid() = id);
create policy "Can update own user data." on profiles for update using (auth.uid() = id);

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before
update on profiles for each row
execute function moddatetime ('updated_at');


/**
* This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
* We also set the full_name in the user's raw_user_meta_data to the email's username if it's empty.
*/ 
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);

  UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      raw_user_meta_data,
      '{full_name}',
      to_jsonb(COALESCE(NULLIF(raw_user_meta_data->>'full_name', ''), split_part(email, '@', 1)))
    )
   WHERE id = new.id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


/** 
* ADMIN USERS
*/
create view
  public.admin_users as
select
  a.id,
  a.email,
  a.raw_user_meta_data ->> 'full_name'::text as full_name,
  a.raw_app_meta_data -> 'claims'::text as claims,
  a.raw_user_meta_data ->> 'avatar_url'::text as avatar_url,
  p.bio,
  p.deactivated,
  a.raw_app_meta_data as app_meta_data,
  a.raw_user_meta_data as user_meta_data,
  a.created_at,
  a.updated_at
from
  auth.users a
  join profiles p on a.id = p.id;

revoke all on public.admin_users from anon, authenticated;


/**



-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

UPDATE auth.users
SET
  raw_user_meta_data = jsonb('{}');

-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

UPDATE auth.users
SET
  raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{full_name}',
    to_jsonb(COALESCE(NULLIF(raw_user_meta_data->>'full_name', ''), split_part(email, '@', 1)))
  );


claims = jsonb(COALESCE(NULLIF(new.raw_app_meta_data->>'claims', ''), '{}'))


UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'full_name'
where email = 'david@swiftapk.com'


UPDATE auth.users
SET
  raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{full_name}',
    '"Davey"'
  ),
  raw_app_meta_data = jsonb_set(
    raw_app_meta_data,
    '{claims}',
    '{}'::jsonb
  )
WHERE email = 'leakeddave@me.com'

UPDATE auth.users
SET
  raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{full_name}',
    '"wavey"'
  ),
  raw_app_meta_data = jsonb_set(
    raw_app_meta_data,
    '{claims,admin}',
    'true'::jsonb
  )
WHERE email = 'leakeddave@me.com'




-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

create or replace view
  users_view as
select
  a.id,
  a.raw_user_meta_data ->> 'full_name' as full_name,
  a.raw_app_meta_data -> 'claims' as claims,
  a.raw_user_meta_data ->> 'avatar_url' as avatar_url,
  p.bio
from
  auth.users a
  join public.users p on a.id = p.id
where
  p.deleted = false;


create table
  public.users (
    id uuid not null,
    email character varying(255) null,
    full_name text null,
    claims jsonb not null default '{}'::jsonb,
    avatar_url text null,
    bio text null,
    deleted boolean not null default false,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint users_pkey primary key (id),
    constraint users_id_fkey foreign key (id) references auth.users (id),
    constraint users_bio_check check ((length(bio) < 500))
  ) tablespace pg_default;


create trigger handle_updated_at before update on profiles 
  for each row execute procedure moddatetime (updated_at);

  create trigger handle_updated_at before update on messages 
  for each row execute procedure moddatetime (updated_at);



CREATE VIEWS NORMALLY THEN REVOKE ANON & AUTHENTICATED:

revoke all on public.users from anon, authenticated;




CREATE VIEW premium_status AS
SELECT
    id,
    (
        app_metadata->'claims'->>'premium' = 'true' AND
        (
            app_metadata->'claims'->>'premium_expiration' IS NULL OR
            (app_metadata->'claims'->>'premium_expiration')::timestamp > NOW()
        )
    ) AS is_premium
FROM
    users;
    
  */