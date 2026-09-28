-- O campo de marca do PENDENCIAS guardava o endereco do site, nao de uma
-- imagem: a tentativa sempre falhava e o card so acertava porque a cascata
-- caia para o favicon do proprio dominio. Vazio, o portal vai direto ao
-- favicon e o resultado visual e o mesmo, sem a requisicao perdida.
update public.systems
set logo_url = null
where name = 'PENDÊNCIAS' and logo_url = 'https://pendencias.salexpress.log.br/';
