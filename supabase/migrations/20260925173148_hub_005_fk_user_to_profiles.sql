-- Aponta user_id para public.profiles em vez de auth.users.
-- profiles.id já referencia auth.users com ON DELETE CASCADE, então a exclusão do
-- usuário continua propagando. A vantagem é permitir o join user -> profile na
-- API (auditoria de acessos), sem expor o schema auth.
alter table public.access_logs
  drop constraint if exists access_logs_user_id_fkey;
alter table public.access_logs
  add constraint access_logs_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.favorites
  drop constraint if exists favorites_user_id_fkey;
alter table public.favorites
  add constraint favorites_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
