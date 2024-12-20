-- Extension to handle updated_at column
create extension if not exists moddatetime schema extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

/*
CREATE OR REPLACE FUNCTION increment(table_name TEXT, row_id INT, x INT, field_name TEXT) 
RETURNS INT AS
$func$
DECLARE
  updated_value INT;
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + $1 WHERE id = $2 RETURNING %I', 
         table_name, field_name, field_name, field_name)
  INTO updated_value
  USING x, row_id;

  RETURN updated_value;
END
$func$ LANGUAGE plpgsql;
*/

-- Profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  banner_url text,
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
    
-- Metadata table
create table public.metadata (
  id uuid not null references auth.users on delete cascade,
  notifications_enabled boolean not null default true,
  notifications_badge_enabled boolean not null default true,
  notifications_badge integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Add a trigger to update the updated_at column
create trigger handle_updated_at before
  update on public.metadata for each row
  execute function moddatetime ('updated_at');

-- Enable row level security
alter table public.metadata enable row level security;

-- Note that some users may enable RLS with no policies intentionally to restrict access over APIs. In those cases we recommend making that intent explicit with a rejection policy.
create policy none_shall_pass on public.metadata
    for select
    using (false);

-- inserts a row into public.profiles
drop function if exists public.handle_new_user () CASCADE;
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
  insert into public.metadata (id)
  values (
    new.id
  );
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Notifications table
create table
  public.notifications (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    sender_id uuid null,
    avatar_url text null,
    content jsonb not null,
    grouped_content jsonb null,
    image_url text null,
    primary_label jsonb null,
    primary_action jsonb null,
    secondary_label jsonb null,
    secondary_action jsonb null,
    entity_table text null,
    entity_id uuid null,
    source_table text null,
    source_id uuid null,
    is_read boolean not null default false,
    is_seen boolean not null default false,
    url text null,
    url_as text null,
    locale text not null default 'en'::text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint notifications_pkey primary key (id),
    constraint notifications_sender_id_fkey foreign key (sender_id) references profiles (id),
    constraint notifications_user_id_fkey foreign key (user_id) references profiles (id)
  );

create trigger handle_updated_at before
update on notifications for each row
execute function extensions.moddatetime ('updated_at');

-- Enable row level security
alter table public.notifications enable row level security;

-- Note that some users may enable RLS with no policies intentionally to restrict access over APIs. In those cases we recommend making that intent explicit with a rejection policy.
create policy none_shall_pass on public.notifications
    for select
    using (false);

-- Messages table
create table
  public.messages (
    id uuid not null default gen_random_uuid (),
    content text null,
    user_id uuid not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint messages_pkey primary key (id),
    constraint messages_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
  );

create trigger handle_updated_at before
  update on public.messages for each row
  execute function moddatetime ('updated_at');

alter table public.messages enable row level security;

create policy none_shall_pass on public.messages
    for select
    using (false);

-- Message Likes table
create table
  public.message_likes (
    id uuid not null default gen_random_uuid (),
    message_id uuid not null,
    user_id uuid not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint message_likes_pkey primary key (id)
  );

create trigger handle_updated_at before
  update on public.message_likes for each row
  execute function moddatetime ('updated_at');

alter table public.message_likes enable row level security;

create policy none_shall_pass on public.message_likes
    for select
    using (false);

-- Peers table
create table
  public.peers (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    room text null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp without time zone not null default now(),
    constraint peers_pkey primary key (id),
    constraint peers_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
  );

create trigger handle_updated_at before
  update on public.peers for each row
  execute function moddatetime ('updated_at');

alter table public.peers enable row level security;

create policy none_shall_pass on public.peers
    for select
    using (false);

-- Cron job to clean out peers every 5 minutes
SELECT cron.schedule(
 'delete_old_peers',
 '*/5 * * * *',
 $$
 DELETE FROM peers
 WHERE updated_at < (NOW() - INTERVAL '5 minutes');
 $$
);

-- Whispers table
create table
  public.whispers (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    recipient_id uuid not null,
    content jsonb not null default '{}'::jsonb,
    locale text not null default 'en'::text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint whispers_pkey primary key (id),
    constraint whispers_recipient_id_fkey foreign key (recipient_id) references profiles (id) on delete cascade,
    constraint whispers_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
  );

create trigger handle_updated_at before
update on whispers for each row
execute function extensions.moddatetime ('updated_at');

alter table public.whispers enable row level security;

create policy none_shall_pass on public.whispers
    for select
    using (false);

-- Articles table
create table
  public.articles (
    id uuid not null default gen_random_uuid (),
    user_id uuid null,
    title jsonb not null,
    slug jsonb not null,
    thumbnail_url text null,
    summary jsonb null,
    content jsonb not null,
    tags text[] null default '{}'::text[],
    locale text not null default 'en'::text,
    published boolean null default false,
    published_at timestamp with time zone null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    constraint articles_pkey primary key (id),
    constraint articles_slug_key unique (slug),
    constraint articles_user_id_fkey foreign key (user_id) references profiles (id) on delete set null
  );

create trigger handle_updated_at before
update on articles for each row
execute function extensions.moddatetime ('updated_at');

alter table public.articles enable row level security;

create policy none_shall_pass on public.articles
    for select
    using (false);

-- Article Comments table
create table
  public.article_comments (
    id uuid not null default gen_random_uuid (),
    article_id uuid not null,
    user_id uuid not null,
    content jsonb not null,
    locale text not null default 'en'::text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint article_comments_pkey primary key (id),
    constraint article_comments_article_id_fkey foreign key (article_id) references articles (id) on delete cascade,
    constraint article_comments_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
  );

create trigger handle_updated_at before
update on article_comments for each row
execute function extensions.moddatetime ('updated_at');

alter table public.article_comments enable row level security;

create policy none_shall_pass on public.article_comments
    for select
    using (false);

/* RLS Policies for storage buckets */
/**
((bucket_id = 'avatars'::text) AND (name = (auth.uid() || '.jpg'::text)))
((bucket_id = 'banners'::text) AND (name = (auth.uid() || '.jpg'::text)))
**/