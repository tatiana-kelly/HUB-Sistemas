-- Bucket das marcas enviadas pela administracao.
--
-- Leitura publica: o card carrega a imagem direto no <img>, sem sessao, como ja
-- faz com o favicon do dominio do sistema. Escrita so para ADMIN.
--
-- SVG fica de fora de proposito: um SVG e um documento executavel, e a URL
-- publica do Storage abriria esse documento na origem do proprio Supabase. As
-- marcas em SVG continuam vindo de /marcas, versionadas no repositorio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marcas',
  'marcas',
  true,
  1048576,
  array['image/png', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists marcas_public_read on storage.objects;
create policy marcas_public_read on storage.objects
for select to public using (bucket_id = 'marcas');

drop policy if exists marcas_admin_write on storage.objects;
create policy marcas_admin_write on storage.objects
for all to authenticated
using (bucket_id = 'marcas' and public.hub_is_admin())
with check (bucket_id = 'marcas' and public.hub_is_admin());
