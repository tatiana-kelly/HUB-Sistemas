-- O guard de campos privilegiados de profiles precisa valer para o usuário
-- autenticado, não para o backend. Sem esta exceção, nem a service role (Server
-- Action de administração) nem o painel do Supabase conseguem definir o perfil de
-- um usuário — inclusive na criação do primeiro administrador.
create or replace function public.hub_guard_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Contexto confiável de servidor: sem usuário autenticado no request
  -- (service role, superuser, migrations) o guard não se aplica.
  if auth.uid() is null or coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

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
