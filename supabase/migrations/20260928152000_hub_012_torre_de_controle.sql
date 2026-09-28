-- Torre de Controle: diagnostico diario de faturamento x custo da malha.
-- Entra em Gestao, como indicador, ao lado do DRE Operacional.
insert into public.systems (name, description, url, logo_url, category_id, type, display_order, active)
select
  'Torre de Controle',
  'Diagnostico diario de faturamento x custo da malha, por competencia',
  'https://torre-de-controle-delta.vercel.app/',
  '/marcas/torre-de-controle.svg',
  c.id,
  'indicator',
  6,
  true
from public.categories c
where c.name = 'Gestão'
  and not exists (select 1 from public.systems s where s.name = 'Torre de Controle');

-- Mesma regra do DRE Operacional: dado de resultado fica com ADMIN e GESTOR.
-- O administrador pode alterar isso em /admin/permissions, sem codigo.
insert into public.role_system_permissions (role_id, system_id, can_view)
select r.id, s.id, true
from public.roles r
cross join public.systems s
where s.name = 'Torre de Controle'
  and r.name in ('ADMIN', 'GESTOR')
on conflict (role_id, system_id) do nothing;
