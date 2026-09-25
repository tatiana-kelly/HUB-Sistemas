-- Ajustes de performance apontados pelo linter, sem afrouxar nenhuma regra:
--  a) auth.uid() envolvido em subselect para ser avaliado uma vez por consulta;
--  b) policies de ADMIN divididas por ação, para não sobrepor as de leitura;
--  c) índice na FK favorites.system_id.

create index if not exists favorites_system_id_idx on public.favorites (system_id);

-- ─── profiles ────────────────────────────────────────────────────────────────
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated using (id = (select auth.uid()) or public.hub_is_admin());

drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_update on public.profiles
for update to authenticated
using (id = (select auth.uid()) or public.hub_is_admin())
with check (id = (select auth.uid()) or public.hub_is_admin());

-- ─── access_logs ─────────────────────────────────────────────────────────────
drop policy if exists access_logs_select on public.access_logs;
create policy access_logs_select on public.access_logs
for select to authenticated using (user_id = (select auth.uid()) or public.hub_is_admin());

drop policy if exists access_logs_insert on public.access_logs;
create policy access_logs_insert on public.access_logs
for insert to authenticated
with check (user_id = (select auth.uid()) and public.hub_can_view_system(system_id));

-- ─── favorites ───────────────────────────────────────────────────────────────
drop policy if exists favorites_select on public.favorites;
create policy favorites_select on public.favorites
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists favorites_insert on public.favorites;
create policy favorites_insert on public.favorites
for insert to authenticated
with check (user_id = (select auth.uid()) and public.hub_can_view_system(system_id));

drop policy if exists favorites_delete on public.favorites;
create policy favorites_delete on public.favorites
for delete to authenticated using (user_id = (select auth.uid()));

-- ─── policies de ADMIN divididas por ação ────────────────────────────────────
drop policy if exists roles_admin_write on public.roles;
create policy roles_admin_insert on public.roles
for insert to authenticated with check (public.hub_is_admin());
create policy roles_admin_update on public.roles
for update to authenticated using (public.hub_is_admin()) with check (public.hub_is_admin());
create policy roles_admin_delete on public.roles
for delete to authenticated using (public.hub_is_admin());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_insert on public.categories
for insert to authenticated with check (public.hub_is_admin());
create policy categories_admin_update on public.categories
for update to authenticated using (public.hub_is_admin()) with check (public.hub_is_admin());
create policy categories_admin_delete on public.categories
for delete to authenticated using (public.hub_is_admin());

drop policy if exists systems_admin_write on public.systems;
create policy systems_admin_insert on public.systems
for insert to authenticated with check (public.hub_is_admin());
create policy systems_admin_update on public.systems
for update to authenticated using (public.hub_is_admin()) with check (public.hub_is_admin());
create policy systems_admin_delete on public.systems
for delete to authenticated using (public.hub_is_admin());

drop policy if exists rsp_admin_write on public.role_system_permissions;
create policy rsp_admin_insert on public.role_system_permissions
for insert to authenticated with check (public.hub_is_admin());
create policy rsp_admin_update on public.role_system_permissions
for update to authenticated using (public.hub_is_admin()) with check (public.hub_is_admin());
create policy rsp_admin_delete on public.role_system_permissions
for delete to authenticated using (public.hub_is_admin());
