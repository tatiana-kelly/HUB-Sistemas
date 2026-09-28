-- Marca oficial do SSW, fornecida pela administradora. O site do SSW so publica
-- um favicon de 32px, que ampliado ate a caixa de 88px do card ficava sem
-- nitidez; este arquivo entra no lugar.
update public.systems
set logo_url = '/marcas/ssw.png'
where name = 'SSW' and (logo_url is null or logo_url = '');
