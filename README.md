# SAL HUB — Portal de Sistemas e Indicadores

Portal único de acesso aos sistemas, plataformas e indicadores da SAL Express.

O fluxo do produto é deliberadamente curto:

```
LOGIN → IDENTIFICAR PERFIL → MOSTRAR SOMENTE OS SISTEMAS PERMITIDOS → CLICAR → ABRIR SISTEMA
```

Esta V1 **não integra** os sistemas: ela é um launcher com controle de acesso,
favoritos, histórico e administração.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Design system e temas](#design-system-e-temas)
- [Stack](#stack)
- [Estrutura do banco](#estrutura-do-banco)
- [Segurança e RLS](#segurança-e-rls)
- [Configuração local](#configuração-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Migrations e seed](#migrations-e-seed)
- [Primeiro administrador](#primeiro-administrador)
- [Execução](#execução)
- [Testes](#testes)
- [Gerenciamento de permissões](#gerenciamento-de-permissões)
- [Deploy](#deploy)
- [Evolução planejada](#evolução-planejada)

---

## Arquitetura

A regra central é que **permissão é dado, não código**:

```
USER  →  ROLE  →  ROLE_SYSTEM_PERMISSIONS  →  SYSTEMS
```

Nenhum lugar do código diz "gestor vê 5 sistemas". A lista de cada perfil sai de
`role_system_permissions`, editável na tela de administração. Um gestor pode ter
5 sistemas e outro 8 sem uma linha de código nova.

A autorização é aplicada em três camadas, da mais interna para a mais externa:

| Camada | Onde | O que garante |
|---|---|---|
| Banco (RLS) | políticas em `systems`, `access_logs`, `favorites`, … | Ninguém lê nem grava o que não pode, nem chamando a API direto |
| Servidor | `requireSession()` / `requireAdmin()` + Server Actions | Rotas e ações administrativas barradas antes de renderizar |
| Proxy (edge) | `src/proxy.ts` | Sessão renovada a cada request; não autenticado vai para `/login` |

O frontend **nunca** é a fonte de verdade: esconder um card é conveniência, não
segurança.

### Mapa de pastas

```
src/
  proxy.ts                  sessão + proteção de rota em toda request
  app/
    login/                  autenticação por e-mail e senha
    forgot-password/        pedido de link de recuperação
    reset-password/         definição da nova senha
    auth/callback/          troca do código do e-mail por sessão
    home/                   portal: favoritos, busca, filtros, últimos acessos
    admin/                  usuários, sistemas, categorias, permissões, auditoria
    actions/                Server Actions (auth, portal, admin)
  components/               SystemCard, SystemsBrowser, AppHeader, ui compartilhada
  lib/
    auth.ts                 getSession / requireSession / requireAdmin
    queries.ts              leituras do portal (sempre sob RLS do usuário)
    access.ts               regras puras de apresentação (testadas)
    supabase/               clientes browser, server, proxy e admin
supabase/migrations/        schema, RLS e seed versionados
scripts/promote-admin.mjs   promoção de emergência a ADMIN
tests/                      testes unitários (Vitest)
```

---

## Design system e temas

A interface é montada sobre tokens semânticos, não sobre cores soltas. Cada
token descreve um papel (`surface`, `line`, `fg`, `muted`, `primary`, `danger`…)
e é redefinido por tema em `src/app/globals.css`. Os componentes referenciam só o
papel — por isso o dark mode é um tema desenhado, e não uma inversão do claro.

| Camada | Onde | Papel |
|---|---|---|
| Tokens | `src/app/globals.css` | superfícies, traços, texto, identidade, estados, sombras, raios |
| Primitivos | `src/components/ui.tsx` | `buttonClass`, `inputClass`, `Field`, `Panel`, `Badge`, `StatusDot`, `EmptyState`, `Skeleton`, tabela |
| Composições | `SystemCard`, `SystemsBrowser`, `FavoritesStrip`, `AppHeader`, `UserMenu`, `Menu` | telas do portal e da administração |

**Tema claro / escuro / automático.** A escolha fica no menu do usuário e no
ícone do cabeçalho, e é gravada em `localStorage` (`sal-hub-theme`). Um script
inline (`THEME_BOOTSTRAP_SCRIPT`) aplica o tema no `<html>` antes da primeira
pintura, então não existe flash claro ao recarregar nem ao navegar. No modo
automático a interface acompanha o sistema operacional em tempo real; uma escolha
explícita prevalece sobre ele. A preferência é por dispositivo e sobrevive a
logout e login.

**Acessibilidade.** Todos os pares de texto sobre fundo dos dois temas ficam em
4.5:1 ou acima; estado nunca depende só de cor (o status usa ponto + rótulo); o
foco tem a mesma assinatura em toda a aplicação; os menus fecham com `Esc`,
navegam por setas e devolvem o foco ao gatilho; e `prefers-reduced-motion`
desliga as transições.

---

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, Turbopack)
- **React 19** e **TypeScript** em modo estrito
- **Tailwind CSS 4** com tokens semânticos próprios e dark mode por atributo
- **Supabase**: Postgres, Auth e Row Level Security
- **lucide-react** para ícones (traço único em toda a interface)
- **Inter** via `next/font` (self-hosted, sem requisição externa)
- **Vitest** para os testes unitários
- **ESLint** (`next/core-web-vitals` + `next/typescript`)

---

## Estrutura do banco

| Tabela | Papel |
|---|---|
| `roles` | Perfis de acesso (`ADMIN`, `GESTOR`, `COLABORADOR`) |
| `profiles` | Usuário do portal, vinculado 1:1 a `auth.users` |
| `categories` | Agrupamento dos acessos (Operações, Gestão, RH / DP, …) |
| `systems` | Sistema ou indicador: nome, descrição, URL, ícone, tipo, ordem, status |
| `role_system_permissions` | Quais sistemas cada perfil enxerga (`unique(role_id, system_id)`) |
| `access_logs` | Um registro por abertura de sistema |
| `favorites` | Favoritos do usuário (`unique(user_id, system_id)`) |

Funções de apoio (todas com `search_path` fixo):

- `hub_is_admin()` — o usuário atual é ADMIN e está ativo?
- `hub_current_role_id()` — perfil do usuário atual
- `hub_can_view_system(uuid)` — a permissão em si, usada pelo RLS
- `hub_handle_new_user()` — cria o `profile` no cadastro (e faz o bootstrap do primeiro ADMIN)
- `hub_guard_profile_fields()` — impede que o usuário altere o próprio perfil, status ou e-mail

Índices criados para as consultas do portal: `systems(active, display_order)`,
`systems(category_id)`, `access_logs(user_id, accessed_at desc)`,
`access_logs(system_id, accessed_at desc)`, `favorites(user_id)`,
`favorites(system_id)`, `role_system_permissions(system_id)`,
`profiles(role_id)`, `profiles(lower(email))`.

---

## Segurança e RLS

RLS está **habilitado em todas as tabelas do HUB**. Resumo das políticas:

| Tabela | Usuário autenticado | ADMIN |
|---|---|---|
| `systems` | lê apenas o que `hub_can_view_system()` autoriza | lê tudo, cria, edita, exclui |
| `profiles` | lê e edita o próprio (sem trocar perfil/status/e-mail) | lê e gerencia todos |
| `roles` | lê | gerencia |
| `categories` | lê as ativas | lê e gerencia todas |
| `role_system_permissions` | lê apenas as do próprio perfil | gerencia |
| `access_logs` | lê os próprios; só grava em sistema permitido | lê todos |
| `favorites` | gerencia apenas os próprios, só de sistema permitido | — |

Regras adicionais:

- o papel `anon` não tem acesso a nenhuma tabela do HUB;
- a `service_role` é usada **somente no servidor**, apenas para convidar usuários;
- senha nunca passa pela aplicação: quem guarda é o Supabase Auth;
- links externos abrem com `rel="noopener noreferrer"`, sem repasse de credencial
  e sem tentativa de login automático;
- cabeçalhos `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e
  `Permissions-Policy` aplicados a todas as rotas.

O linter de segurança do Supabase ainda aponta que `hub_is_admin()`,
`hub_current_role_id()` e `hub_can_view_system()` são executáveis por usuários
autenticados. Isso é necessário: políticas de RLS são avaliadas no contexto do
próprio usuário, e essas funções só respondem sobre a permissão que ele já tem.

---

## Configuração local

```bash
git clone https://github.com/tatiana-kelly/HUB-Sistemas.git
cd HUB-Sistemas
npm install
```

Crie o arquivo de ambiente local a partir do exemplo:

```bash
cp env.example .env.local
```

No PowerShell:

```powershell
Copy-Item env.example .env.local
```

---

## Variáveis de ambiente

| Variável | Onde vive | Para que serve |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | público | endpoint do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | público | chave publicável; o acesso é limitado pelo RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **somente servidor** | convite de usuários pela tela de administração e `promote-admin` |
| `NEXT_PUBLIC_SITE_URL` | público | base dos links de convite e recuperação de senha |

Os valores ficam em `.env.local`, que o `.gitignore` já protege. A service role
key nunca deve ser prefixada com `NEXT_PUBLIC_`, nem commitada, nem colada em
canal compartilhado.

Sem `SUPABASE_SERVICE_ROLE_KEY` o portal funciona normalmente — apenas o convite
de usuários pela interface fica indisponível, e a tela avisa isso.

---

## Migrations e seed

As migrations versionadas ficam em `supabase/migrations/`, na ordem em que devem
ser aplicadas:

| Arquivo | Conteúdo |
|---|---|
| `…hub_001_core_schema` | tabelas, índices e `updated_at` |
| `…hub_002_authz_functions` | funções de autorização, guard de profile e bootstrap |
| `…hub_003_rls_policies` | RLS de todas as tabelas |
| `…hub_004_grants_and_seed` | grants, categorias, sistemas e permissões iniciais |
| `…hub_005_fk_user_to_profiles` | FK de `access_logs`/`favorites` para `profiles` |
| `…hub_006_fix_profile_guard_for_service_role` | guard não se aplica ao backend |
| `…hub_007_harden_functions` | `search_path` fixo e revogação de EXECUTE |
| `…hub_008_rls_performance` | `(select auth.uid())` e policies por ação |

Com a CLI do Supabase:

```bash
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

O seed cria as **categorias** (Operações, Gestão, RH / DP, Financeiro,
Indicadores, Outros), os **5 sistemas iniciais** e as **permissões de partida**:

| Perfil | Sistemas liberados no seed |
|---|---|
| ADMIN | SSW, Agente Rastreamento de Cargas, DRE Operacional, Rota People, Power BI |
| GESTOR | SSW, Agente Rastreamento de Cargas, DRE Operacional, Rota People, Power BI |
| COLABORADOR | SSW, Agente Rastreamento de Cargas, Power BI |

Isso é só a configuração inicial: tudo é editável em `/admin/permissions`.

---

## Primeiro administrador

Nenhum e-mail ou senha de administrador está no código. O primeiro acesso usa um
bootstrap no banco: **enquanto não existir nenhum ADMIN, o primeiro usuário
criado assume ADMIN**. A partir daí todo novo usuário entra como COLABORADOR.

Passo a passo:

1. No painel do Supabase, **Authentication → Users → Add user**, crie o usuário
   da administradora com o e-mail corporativo e uma senha escolhida por ela.
2. Faça login em `/login`. O portal já abre com a aba **Administração**.
3. Ainda no painel, em **Authentication → Providers → Email**, **desative o
   cadastro público** (`Allow new users to sign up`). Daqui em diante os usuários
   entram por convite do administrador.

Saída de emergência, se o único ADMIN perder o acesso:

```bash
npm run promote-admin -- pessoa@salexpress.com.br
```

O script exige `SUPABASE_SERVICE_ROLE_KEY` no ambiente local e promove um usuário
**já existente** — ele não cria conta nem define senha.

---

## Execução

```bash
npm run dev      # desenvolvimento em http://localhost:3000
npm run build    # build de produção
npm run start    # sobe o build
```

---

## Testes

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test        # Vitest
npm run build       # build de produção
npm run verify      # os quatro acima, em sequência
```

`tests/access.test.ts` cobre a lógica pura de apresentação: busca tolerante a
acento, filtro por categoria, agrupamento, saudação, formatação dos últimos
acessos, deduplicação do histórico e validação de URL externa.

`tests/theme.test.ts` cobre a resolução de tema e o script de bootstrap — a
escolha explícita prevalecendo sobre o sistema, o modo automático seguindo o
sistema e o comportamento com storage vazio ou corrompido.

As regras de acesso são verificadas no próprio banco, assumindo a identidade de
cada perfil e medindo o que ele consegue ler e escrever. Cenários cobertos:
COLABORADOR vê 3 sistemas e é bloqueado ao tentar registrar acesso ou favoritar
o DRE; GESTOR vê 5 e não consegue administrar; ADMIN administra tudo; usuário
desativado não vê nada; ninguém se autopromove a ADMIN; `anon` não lê nenhuma
tabela.

---

## Gerenciamento de permissões

Em `/admin/permissions` cada perfil tem a lista completa de sistemas com
checkbox. Marcar e salvar grava em `role_system_permissions` e o efeito é
imediato para todos os usuários daquele perfil — inclusive no RLS.

Outras telas de administração:

| Rota | O que faz |
|---|---|
| `/admin/users` | convida usuário, troca o perfil, ativa/desativa |
| `/admin/users/[id]` | ficha do usuário com os sistemas que ele enxerga |
| `/admin/systems` | cria, edita, exclui, ativa/desativa e reordena acessos |
| `/admin/categories` | cria, edita e ativa/desativa categorias |
| `/admin/access-logs` | auditoria com filtro por usuário, sistema e período |

---

## Deploy

O projeto é um app Next.js padrão e roda na Vercel sem configuração especial:

1. importe o repositório na Vercel;
2. cadastre as quatro variáveis de ambiente (a service role key apenas como
   variável de servidor, nunca `NEXT_PUBLIC_`);
3. aponte `NEXT_PUBLIC_SITE_URL` para o domínio final;
4. no Supabase, em **Authentication → URL Configuration**, inclua esse domínio e
   `https://SEU-DOMINIO/auth/callback` nas *Redirect URLs*, senão os links de
   convite e de recuperação de senha não voltam para o portal.

---

## Evolução planejada

| Versão | Escopo |
|---|---|
| **V1 (esta)** | Portal de links com RBAC, favoritos, histórico e administração |
| V2 | Cartões com informação viva de cada sistema (status, indicador-resumo) |
| V3 | Integrações reais com os sistemas |
| V4 | Agente atuando sobre os sistemas a partir do HUB |

A arquitetura não bloqueia nenhuma dessas etapas: `systems` já aceita metadados
novos, as Server Actions isolam o acesso a dados e o RLS continua sendo a
fronteira de segurança independentemente de quem chama.
