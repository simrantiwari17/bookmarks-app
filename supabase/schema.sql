-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. PROFILES TABLE
-- =========================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  handle text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint handle_length check (char_length(handle) >= 3)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Profiles RLS Policies
-- Anyone can view profiles
create policy "Allow public read access to profiles" 
  on public.profiles 
  for select 
  using (true);

-- Users can only insert their own profile
create policy "Allow individual insert access to own profile" 
  on public.profiles 
  for insert 
  with check (auth.uid() = id);

-- Users can only update their own profile
create policy "Allow individual update access to own profile" 
  on public.profiles 
  for update 
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can only delete their own profile
create policy "Allow individual delete access to own profile" 
  on public.profiles 
  for delete 
  using (auth.uid() = id);


-- =========================================================================
-- 2. BOOKMARKS TABLE
-- =========================================================================
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.bookmarks enable row level security;

-- Bookmarks RLS Policies
-- Users can only read their own bookmarks (unless they are marked public)
create policy "Allow users to read their own bookmarks" 
  on public.bookmarks 
  for select 
  using (auth.uid() = user_id or is_public = true);

-- Users can only insert their own bookmarks
create policy "Allow users to insert their own bookmarks" 
  on public.bookmarks 
  for insert 
  with check (auth.uid() = user_id);

-- Users can only update their own bookmarks
create policy "Allow users to update their own bookmarks" 
  on public.bookmarks 
  for update 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only delete their own bookmarks
create policy "Allow users to delete their own bookmarks" 
  on public.bookmarks 
  for delete 
  using (auth.uid() = user_id);


-- =========================================================================
-- 3. AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- =========================================================================
-- Trigger function that automatically creates a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_handle text;
begin
  -- Generate a default handle from email or random suffix if email prefix is too short/taken
  default_handle := split_part(new.email, '@', 1);
  if char_length(default_handle) < 3 then
    default_handle := default_handle || floor(random() * 1000)::text;
  end if;

  insert into public.profiles (id, handle)
  values (new.id, default_handle);
  return new;
exception
  when unique_violation then
    -- If handle already exists, append a unique string
    insert into public.profiles (id, handle)
    values (new.id, default_handle || '_' || substr(new.id::text, 1, 8));
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
