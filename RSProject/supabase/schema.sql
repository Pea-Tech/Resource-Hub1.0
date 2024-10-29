-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist
drop table if exists public.reviews;
drop table if exists public.resources;
drop table if exists public.profiles;

-- Create enhanced profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text default 'user',
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create resources table with enhanced fields
create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  url text not null,
  category text not null,
  status text default 'pending',
  user_id uuid references public.profiles(id) on delete cascade not null,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reviews table with enhanced fields
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  resource_id uuid references public.resources(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure one review per user per resource
  unique(resource_id, user_id)
);

-- Create storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Create storage policy to make avatars bucket public
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ))
  with check (auth.uid() = id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

-- Resources policies
create policy "Resources are viewable by everyone"
  on public.resources for select
  using (true);

create policy "Authenticated users can insert resources"
  on public.resources for insert
  with check (auth.uid() = user_id);

create policy "Resource owners and admins can update resources"
  on public.resources for update
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ))
  with check (auth.uid() = user_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create policy "Resource owners and admins can delete resources"
  on public.resources for delete
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

-- Reviews policies
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Authenticated users can insert reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage policies
create policy "Anyone can view avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated'
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Functions
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    case 
      when new.email = 'peatechltd@gmail.com' then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$;

-- Triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update timestamps trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers to all tables
create trigger handle_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.resources
  for each row execute procedure public.handle_updated_at();

-- Indexes
create index if not exists resources_user_id_idx on public.resources(user_id);
create index if not exists resources_status_idx on public.resources(status);
create index if not exists resources_category_idx on public.resources(category);
create index if not exists reviews_resource_id_idx on public.reviews(resource_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);