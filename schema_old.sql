/** 
* USERS
*/
create table users (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,
  email character varying(255),
  full_name text,
  claims jsonb not null default '{}'::jsonb,
  avatar_url text,
  bio text,
  deleted boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint users_bio_check check ((length(bio) < 500))
);
alter table users enable row level security;
create policy "Can view own user data." on users for select using (auth.uid() = id);
create policy "Can update own user data." on users for update using (auth.uid() = id);

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on users 
  for each row execute procedure moddatetime (updated_at);

/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/ 
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

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


-- Function to handle user updates
create function public.handle_update_user()
returns trigger as $$
begin
  update public.users
  set email = new.email,
      full_name = new.raw_user_meta_data->>'full_name',
      avatar_url = new.raw_user_meta_data->>'avatar_url'
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to activate the handle_update_user function after an update on auth.users
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_update_user();

/**
 * REALTIME SUBSCRIPTIONS
 * Only allow realtime listening on public tables.
 * drop publication if exists supabase_realtime;
 * create publication supabase_realtime for table products, prices;
 */
`