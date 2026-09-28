-- Marca oficial do Power BI, fornecida pela administradora e servida pelo
-- proprio portal. O dominio app.powerbi.com responde HTML em /favicon.ico
-- (e uma SPA), entao a deteccao automatica nao encontra a marca por la.
update public.systems
set logo_url = '/marcas/power-bi.png'
where name = 'Power BI' and (logo_url is null or logo_url = '');
