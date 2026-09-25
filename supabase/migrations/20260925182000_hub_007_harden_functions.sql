-- Endurecimento apontado pelo linter de segurança do Supabase.

-- 1) search_path fixo também no trigger de updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Funções de trigger não devem ser chamáveis pela API REST
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.hub_guard_profile_fields() from public, anon, authenticated;
revoke all on function public.hub_handle_new_user() from public, anon, authenticated;

-- 3) Nenhuma função do HUB é chamável por usuário não autenticado.
-- O papel authenticated mantém EXECUTE porque as policies de RLS são avaliadas
-- no contexto do próprio usuário; as funções apenas informam a permissão que ele
-- já possui e não expõem dado de terceiros.
revoke all on function public.hub_is_admin() from anon;
revoke all on function public.hub_current_role_id() from anon;
revoke all on function public.hub_can_view_system(uuid) from anon;
