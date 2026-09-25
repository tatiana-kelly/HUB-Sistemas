-- SAL HUB — grants explícitos (o acesso real continua governado pelo RLS)
grant select on public.roles, public.categories, public.systems to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.roles, public.categories, public.systems,
  public.role_system_permissions to authenticated;
grant select, insert, delete on public.access_logs to authenticated;
grant select, insert, delete on public.favorites to authenticated;

-- Perfis iniciais
insert into public.roles (name, description) values
  ('ADMIN', 'Administrador do portal: gerencia usuarios, sistemas, categorias e permissoes'),
  ('GESTOR', 'Gestor: acessa os sistemas e indicadores liberados para a gestao'),
  ('COLABORADOR', 'Colaborador: acessa os sistemas operacionais liberados')
on conflict (name) do nothing;

-- Categorias iniciais
insert into public.categories (name, description, icon, display_order) values
  ('Operacoes', 'Sistemas operacionais de coleta, transferencia e entrega', 'truck', 1),
  ('Gestao', 'Painteis e sistemas de gestao e resultado', 'briefcase', 2),
  ('RH / DP', 'Recursos humanos e departamento pessoal', 'users', 3),
  ('Financeiro', 'Sistemas e indicadores financeiros', 'wallet', 4),
  ('Indicadores', 'Indicadores e inteligencia de negocio', 'bar-chart-3', 5),
  ('Outros', 'Demais acessos', 'layout-grid', 6)
on conflict (name) do nothing;

-- Corrige o nome da categoria de operações para a grafia com acento
update public.categories set name = 'Operações' where name = 'Operacoes';
update public.categories set name = 'Gestão', description = 'Paineis e sistemas de gestao e resultado' where name = 'Gestao';

-- Sistemas iniciais (URLs fornecidos pelo negocio — nao alterar)
insert into public.systems (name, description, url, icon, category_id, type, display_order)
select v.name, v.description, v.url, v.icon, c.id, v.type, v.display_order
from (values
  ('SSW',
   'Sistema operacional de transporte: coletas, CTRCs, ocorrencias e faturamento',
   'https://sistema.ssw.inf.br/bin/ssw0422', 'truck', 'Operações', 'system', 1),
  ('Agente Rastreamento de Cargas',
   'Rastreamento de cargas e acompanhamento de ocorrencias em tempo real',
   'https://agente-rastreamento-cargas.vercel.app/', 'radar', 'Operações', 'system', 2),
  ('DRE Operacional',
   'Demonstrativo de resultado operacional por filial, rota e cliente',
   'https://dre-operacional.vercel.app/', 'line-chart', 'Gestão', 'indicator', 3),
  ('Rota People',
   'Portal de gente e gestao: jornada, ponto, escala e indicadores de RH',
   'https://rota-people.vercel.app/', 'users', 'RH / DP', 'system', 4),
  ('Power BI',
   'Relatorios e paineis analiticos corporativos',
   'https://app.powerbi.com/home?experience=power-bi', 'bar-chart-3', 'Indicadores', 'indicator', 5)
) as v(name, description, url, icon, category_name, type, display_order)
join public.categories c on c.name = v.category_name
where not exists (select 1 from public.systems s where s.name = v.name);

-- Permissoes iniciais (configuracao de partida, editavel pela tela de administracao)
-- ADMIN e GESTOR: todos os sistemas
insert into public.role_system_permissions (role_id, system_id, can_view)
select r.id, s.id, true
from public.roles r
cross join public.systems s
where r.name in ('ADMIN', 'GESTOR')
on conflict (role_id, system_id) do nothing;

-- COLABORADOR: SSW, Agente Rastreamento de Cargas e Power BI
insert into public.role_system_permissions (role_id, system_id, can_view)
select r.id, s.id, true
from public.roles r
join public.systems s on s.name in ('SSW', 'Agente Rastreamento de Cargas', 'Power BI')
where r.name = 'COLABORADOR'
on conflict (role_id, system_id) do nothing;
