-- Um sistema criado pela administracao nascia sem nenhuma linha em
-- role_system_permissions. O ADMIN via o card (a politica de SELECT em systems
-- libera o administrador), mas hub_can_view_system() continuava falso: o insert
-- em access_logs era recusado e o portal respondia "Voce nao tem permissao para
-- acessar este sistema" para quem acabara de cadastra-lo.
--
-- A permissao continua sendo dado, visivel e editavel em /admin/permissions. O
-- que muda e que o perfil ADMIN ja nasce com acesso ao sistema recem-criado,
-- alinhando o que o card mostra com o que o banco autoriza.
create or replace function public.hub_grant_admin_on_new_system()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.role_system_permissions (role_id, system_id, can_view)
  select r.id, new.id, true
  from public.roles r
  where r.name = 'ADMIN'
  on conflict (role_id, system_id) do nothing;

  return new;
end;
$$;

revoke all on function public.hub_grant_admin_on_new_system() from public;

drop trigger if exists systems_grant_admin on public.systems;
create trigger systems_grant_admin after insert on public.systems
for each row execute function public.hub_grant_admin_on_new_system();

-- Backfill dos sistemas ja cadastrados sem acesso do ADMIN. O "do nothing"
-- preserva uma revogacao deliberada (linha existente com can_view = false).
insert into public.role_system_permissions (role_id, system_id, can_view)
select r.id, s.id, true
from public.systems s
cross join public.roles r
where r.name = 'ADMIN'
on conflict (role_id, system_id) do nothing;
