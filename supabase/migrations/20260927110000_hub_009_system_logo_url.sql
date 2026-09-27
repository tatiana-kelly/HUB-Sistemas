-- Marca do sistema no card do portal.
-- Quando vazio, a interface cai para o favicon do proprio dominio do sistema e,
-- em ultimo caso, para um monograma gerado a partir do nome. Assim um sistema
-- novo nunca fica sem identidade, mesmo sem arte pronta.
alter table public.systems add column if not exists logo_url text;

comment on column public.systems.logo_url is
  'URL da marca exibida no card. Vazio = favicon do dominio, depois monograma.';

-- Marcas proprias dos sistemas internos da SAL (arquivos servidos pelo portal).
update public.systems set logo_url = '/marcas/agente-rastreamento.svg'
  where name = 'Agente Rastreamento de Cargas' and logo_url is null;

update public.systems set logo_url = '/marcas/dre-operacional.svg'
  where name = 'DRE Operacional' and logo_url is null;

update public.systems set logo_url = '/marcas/rota-people.svg'
  where name = 'Rota People' and logo_url is null;
