-- SAL HUB — Row Level Security
alter table public.roles enable row level security;
alter table public.categories enable row level security;
alter table public.systems enable row level security;
alter table public.profiles enable row level security;
alter table public.role_system_permissions enable row level security;
alter table public.access_logs enable row level security;
alter table public.favorites enable row level security;

-- ROLES: leitura para autenticados (necessária para a UI), escrita só ADMIN
drop policy if exists roles_select on public.roles;
create policy roles_select on public.roles
for select to authenticated using (true);

drop policy if exists roles_admin_write on public.roles;
create policy roles_admin_write on public.roles
for all to authenticated using (public.hub_is_admin()) with check (public.hub_is_admin());

-- CATEGORIES: autenticados leem as ativas, ADMIN lê e escreve todas
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
for select to authenticated using (active or public.hub_is_admin());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
for all to authenticated using (public.hub_is_admin()) with check (public.hub_is_admin());

-- SYSTEMS: o usuário só enxerga o que a permissão do seu perfil autoriza
drop policy if exists systems_select on public.systems;
create policy systems_select on public.systems
for select to authenticated using (public.hub_can_view_system(id) or public.hub_is_admin());

drop policy if exists systems_admin_write on public.systems;
create policy systems_admin_write on public.systems
for all to authenticated using (public.hub_is_admin()) with check (public.hub_is_admin());

-- PROFILES: cada um vê o seu; ADMIN vê e gerencia todos
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated using (id = auth.uid() or public.hub_is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
for update to authenticated using (public.hub_is_admin()) with check (public.hub_is_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
for insert to authenticated with check (public.hub_is_admin());

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
for delete to authenticated using (public.hub_is_admin());

-- ROLE_SYSTEM_PERMISSIONS: o usuário só lê as permissões do próprio perfil
drop policy if exists rsp_select on public.role_system_permissions;
create policy rsp_select on public.role_system_permissions
for select to authenticated using (public.hub_is_admin() or role_id = public.hub_current_role_id());

drop policy if exists rsp_admin_write on public.role_system_permissions;
create policy rsp_admin_write on public.role_system_permissions
for all to authenticated using (public.hub_is_admin()) with check (public.hub_is_admin());

-- ACCESS_LOGS: cada um lê os seus e só registra acesso a sistema permitido
drop policy if exists access_logs_select on public.access_logs;
create policy access_logs_select on public.access_logs
for select to authenticated using (user_id = auth.uid() or public.hub_is_admin());

drop policy if exists access_logs_insert on public.access_logs;
create policy access_logs_insert on public.access_logs
for insert to authenticated
with check (user_id = auth.uid() and public.hub_can_view_system(system_id));

drop policy if exists access_logs_admin_delete on public.access_logs;
create policy access_logs_admin_delete on public.access_logs
for delete to authenticated using (public.hub_is_admin());

-- FAVORITES: estritamente do próprio usuário e só de sistema permitido
drop policy if exists favorites_select on public.favorites;
create policy favorites_select on public.favorites
for select to authenticated using (user_id = auth.uid());

drop policy if exists favorites_insert on public.favorites;
create policy favorites_insert on public.favorites
for insert to authenticated
with check (user_id = auth.uid() and public.hub_can_view_system(system_id));

drop policy if exists favorites_delete on public.favorites;
create policy favorites_delete on public.favorites
for delete to authenticated using (user_id = auth.uid());

-- Nenhum acesso anônimo a nada do HUB
revoke all on public.roles, public.categories, public.systems, public.profiles,
  public.role_system_permissions, public.access_logs, public.favorites from anon;
