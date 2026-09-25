-- SAL HUB — funções de autorização (SECURITY DEFINER para não recursar em RLS)

create or replace function public.hub_current_role_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.role_id
  from public.profiles p
  where p.id = auth.uid() and p.active
$$;

create or replace function public.hub_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = auth.uid() and p.active and r.name = 'ADMIN'
  )
$$;

-- Fonte única de verdade da permissão: USER -> ROLE -> PERMISSIONS -> SYSTEM
create or replace function public.hub_can_view_system(p_system_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_system_permissions rsp on rsp.role_id = p.role_id
    join public.systems s on s.id = rsp.system_id
    where p.id = auth.uid()
      and p.active
      and rsp.can_view
      and s.active
      and s.id = p_system_id
  )
$$;

revoke all on function public.hub_current_role_id() from public;
revoke all on function public.hub_is_admin() from public;
revoke all on function public.hub_can_view_system(uuid) from public;
grant execute on function public.hub_current_role_id() to authenticated;
grant execute on function public.hub_is_admin() to authenticated;
grant execute on function public.hub_can_view_system(uuid) to authenticated;

-- Impede que um usuário comum altere campos privilegiados do próprio profile
create or replace function public.hub_guard_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.hub_is_admin() then
    return new;
  end if;

  if new.role_id is distinct from old.role_id
     or new.active is distinct from old.active
     or new.id is distinct from old.id
     or new.email is distinct from old.email then
    raise exception 'Alteracao de perfil, status, id ou email exige permissao de administrador';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_fields on public.profiles;
create trigger profiles_guard_fields before update on public.profiles
for each row execute function public.hub_guard_profile_fields();

-- Provisionamento do profile no cadastro do usuário.
-- Bootstrap seguro: enquanto não existir nenhum ADMIN, o primeiro usuário criado
-- assume ADMIN. Depois disso, todo novo usuário entra como COLABORADOR e só um
-- administrador pode promovê-lo.
create or replace function public.hub_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role_id uuid;
  v_has_admin boolean;
begin
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where r.name = 'ADMIN'
  ) into v_has_admin;

  if v_has_admin then
    select id into v_role_id from public.roles where name = 'COLABORADOR';
  else
    select id into v_role_id from public.roles where name = 'ADMIN';
  end if;

  insert into public.profiles (id, name, email, role_id)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1)),
    new.email,
    v_role_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.hub_handle_new_user();
