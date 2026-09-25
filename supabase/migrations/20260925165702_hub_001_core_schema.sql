-- SAL HUB — estrutura central do portal de sistemas
create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.systems (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  url text not null,
  icon text,
  category_id uuid references public.categories(id) on delete set null,
  type text not null default 'system' check (type in ('system', 'indicator')),
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role_id uuid references public.roles(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_system_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  system_id uuid not null references public.systems(id) on delete cascade,
  can_view boolean not null default true,
  created_at timestamptz not null default now(),
  constraint role_system_permissions_role_system_key unique (role_id, system_id)
);

create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  system_id uuid not null references public.systems(id) on delete cascade,
  accessed_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  system_id uuid not null references public.systems(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_system_key unique (user_id, system_id)
);

-- Índices para as consultas frequentes do portal
create index if not exists systems_category_id_idx on public.systems (category_id);
create index if not exists systems_active_order_idx on public.systems (active, display_order);
create index if not exists categories_active_order_idx on public.categories (active, display_order);
create index if not exists profiles_role_id_idx on public.profiles (role_id);
create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists rsp_system_id_idx on public.role_system_permissions (system_id);
create index if not exists access_logs_user_accessed_idx on public.access_logs (user_id, accessed_at desc);
create index if not exists access_logs_system_idx on public.access_logs (system_id, accessed_at desc);
create index if not exists favorites_user_idx on public.favorites (user_id);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists systems_set_updated_at on public.systems;
create trigger systems_set_updated_at before update on public.systems
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
