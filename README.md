# LicitFlow

Sistema de gestão de **Atas de Registro de Preços** para licitações públicas (foco em playgrounds, equipamentos esportivos e de recreação), com fluxo completo de representantes comerciais, ofícios de adesão, autorizações, vendas e integrações de marketing/comunicação.

Multi-tenant: uma mesma instalação atende duas marcas — **Esporte Valle** e **Play Valle** — com dados 100% isolados por marca no banco.

> Este README documenta o estado real do projeto após a migração completa de um protótipo (dados mockados em `localStorage`) para uma aplicação com backend real (Postgres + Prisma + autenticação + integrações). Mantenha-o atualizado conforme o projeto evoluir — é a principal fonte de contexto para quem chegar depois.

---

## Stack

- **Frontend/Backend**: Next.js 16 (App Router, Turbopack/webpack), React 19, TypeScript
- **Banco de dados**: PostgreSQL 16 via Prisma ORM 7 (driver adapter `@prisma/adapter-pg`)
- **Cache/infra reservada**: Redis 7 (provisionado, ainda sem uso ativo no código)
- **Autenticação**: NextAuth v5 (Credentials provider, senha com `scrypt`)
- **E-mail**: Nodemailer (SMTP genérico — Gmail, SendGrid, SES, etc.)
- **Estilo**: Tailwind CSS v4
- **Containers locais**: Docker Compose (Postgres + Redis)

---

## Como rodar localmente

```bash
# 1. Subir Postgres + Redis
docker compose up -d

# 2. Instalar dependências
cd frontend
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# edite .env e gere valores reais para AUTH_SECRET, CRYPTO_SECRET_KEY e CRON_SECRET:
openssl rand -base64 32

# 4. Rodar as migrations
npx prisma migrate dev

# 5. Popular o banco (cria as marcas + usuário admin)
npm run prisma:seed

# 6. (Opcional) Carregar dados fictícios de contratos e empenhos para demonstração
npm run prisma:seed-demo

# 7. Subir o servidor
npm run dev
```

O seed de demonstração cria atas, contratos e notas de empenho/ordens de compra com o prefixo `DEMO` no número, para o painel de saldo poder ser avaliado. É idempotente e não deve ser usado em produção.

A aplicação sobe em **http://localhost:3001** (porta customizada — ver `package.json`).

Login inicial criado pelo seed: **admin@licitflow.com.br** / **admin123** (acesso `admin` em ambas as marcas — troque a senha em produção).

### Variáveis de ambiente (`frontend/.env`)

| Variável | Para quê serve |
|---|---|
| `DATABASE_URL` | Conexão Postgres |
| `REDIS_URL` | Conexão Redis (reservado, sem uso ativo ainda) |
| `AUTH_SECRET` / `AUTH_URL` | NextAuth |
| `CRYPTO_SECRET_KEY` | Criptografa (AES-256-GCM) tokens/senhas de integração salvos no banco (Instagram, WhatsApp, SMTP) |
| `CRON_SECRET` | Autentica chamadas aos endpoints `/api/cron/*` (chamados por um agendador externo) |

Nunca reutilize os valores de exemplo em produção — gere novos com `openssl rand -base64 32`.

---

## Domínio e fluxo principal

```
Ata (valorAta fixo)
  └─ Representante (vendedor vinculado a uma cidade)
       └─ Oficio (upload de PDF, status pending/approved/rejected)
            ├─ aprovado → AutorizacaoAdesao (número sequencial, ex: AUT-2026-0001)
            └─ aprovado → Venda (valor = valorAta, status pendente → pago/cancelado)
```

- Um **Representante** só pode ter um **Ofício** aprovado por vez; aprovar um ofício ativa o representante e, na mesma transação, gera a **Autorização de Adesão** e a **Venda**.
- Regra de cota: `Configuracao.limiteRepresentantesPorRegiao` (global) limita quantos representantes podem disputar a mesma cidade+ata; acima do limite, novos cadastros entram em `waitlist`.
- **Vendas** alimentam o Dashboard (faturamento pago vs. a receber, ranking de vendedores/atas, receita mensal).

## Multi-tenant (marcas)

- Cada usuário (`Usuario`) tem um papel por marca via `UsuarioMarca` (`vendedor | gestor_atas | financeiro | admin`) — o mesmo usuário pode ser `admin` numa marca e `vendedor` em outra.
- A **marca ativa** de uma sessão é resolvida por um cookie httpOnly (`licitflow_marca_ativa`), sempre revalidado no servidor contra as marcas do usuário (nunca confia no cliente) — ver `src/lib/active-marca.ts`.
- **Trocar de marca** no seletor da sidebar chama `POST /api/marca-ativa` e recarrega a página — todo o resto do app lê a marca ativa via `GET /api/marca-ativa` no mount de cada tela.

## Autorização

- `src/lib/authorize.ts`: `requireRole(marcaId, papeisPermitidos[])` — usado em praticamente toda rota de API; valida sessão + vínculo com a marca + papel.
- `requireGlobalAdmin()` — para recursos globais (ex: Configurações), exige ser `admin` em pelo menos uma marca.
- `src/proxy.ts` — nesta versão do Next.js, `middleware.ts` foi renomeado para `proxy.ts`. Faz só a checagem de "está logado" para redirecionar às páginas; a autorização de verdade é sempre revalidada em cada Route Handler.

## Integrações plugáveis (Instagram, WhatsApp, E-mail)

Todas seguem o mesmo padrão: credenciais criptografadas por marca, 3 estados de UI (não configurada / configurada mas sem dados / com dados reais), e um endpoint de cron autenticado por `CRON_SECRET` para sincronização periódica.

| Integração | Tabela de credenciais | Endpoint de cron | Envio/sync real? |
|---|---|---|---|
| Instagram Graph API | `IntegracaoMeta` | `POST /api/cron/sync-instagram` | Métricas via Graph API (curtidas/comentários agregados ainda não implementados — só estrutura pronta) |
| WhatsApp Business Cloud API | `IntegracaoWhatsapp` | `POST /api/cron/sync-whatsapp` | Conversas + templates reais. Mensagens enviadas/entregues/lidas exigem receptor de webhook (não implementado) |
| E-mail (SMTP genérico) | `IntegracaoEmail` | `POST /api/cron/enviar-alertas-email` | **Envio real** via Nodemailer, testado ponta a ponta |

Configurar: logado como `admin`, vá na respectiva tela (`/instagram`, `/whatsapp`, `/emails`) → "Configurar Integração".

Cron externo: aponte um agendador (GitHub Actions, cron da hospedagem, etc.) para os endpoints acima com header `Authorization: Bearer <CRON_SECRET>`.

## Alertas automáticos por e-mail

`Configuracao.alertasEmailAtivo` + `alertasEmailDestinatarios` (globais, em **Configurações**) — quando ativos, `POST /api/cron/enviar-alertas-email` calcula os prazos vencidos/aguardando ofício de cada marca e envia um resumo real por e-mail usando o SMTP daquela marca.

---

## O que ainda é mockado / não implementado

Pra não se perder no futuro — isto **não** está conectado a dados/serviços reais ainda:

- **`/anuncios`** (dashboard de Google Ads) — 100% mock, sem integração com a Google Ads API.
- Botão **"Enviar via WhatsApp"** dentro do detalhe de uma Ata — é um deep-link manual (`wa.me`) + download de PDF, não usa a WhatsApp Cloud API real (que já existe, mas separada, em `/whatsapp`).
- Contadores de **mensagens enviadas/entregues/lidas** do WhatsApp e **curtidas/comentários** do Instagram — a estrutura (schema + sync) está pronta, mas os valores ficam em `0` porque exigem chamadas adicionais (paginação de mídia / receptor de webhook) fora do escopo já implementado.
- **Redis** — container de pé, sem nenhum código consumindo ainda (candidato natural a cache ou rate limiting no futuro).
- Badge fixo "4 Vencidos" no item "Alertas" da sidebar/nav mobile — ainda hardcoded, não reflete a contagem real (o dropdown de notificações do sino, esse sim, já é real).

## Estrutura do repositório

```
play-valle-2/
├── docker-compose.yml        # Postgres + Redis para desenvolvimento local
└── frontend/                 # App Next.js (frontend + backend via Route Handlers)
    ├── prisma/
    │   ├── schema.prisma      # Fonte da verdade do modelo de dados
    │   ├── migrations/
    │   └── seed.ts
    └── src/
        ├── app/
        │   ├── (dashboard)/   # Páginas autenticadas (dashboard, atas, representantes, etc.)
        │   └── api/           # Route Handlers (toda a API real)
        ├── auth.ts            # Config do NextAuth
        ├── proxy.ts           # "middleware" desta versão do Next.js
        └── lib/               # crypto, authorize, email-sender, instagram-sync, whatsapp-sync, etc.
```

## Testando o backend manualmente

Não há suíte de testes automatizados ainda. Todo o trabalho até aqui foi validado via `curl` simulando o fluxo real (login → sessão → CRUD → transações). Para reproduzir:

```bash
# CSRF + login
CSRF=$(curl -s -c cookies.txt http://localhost:3001/api/auth/csrf | python3 -c "import sys,json;print(json.load(sys.stdin)['csrfToken'])")
curl -s -b cookies.txt -c cookies.txt -X POST http://localhost:3001/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "email=admin@licitflow.com.br" \
  --data-urlencode "password=admin123" \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "json=true"

# usar cookies.txt nas chamadas seguintes
curl -s -b cookies.txt http://localhost:3001/api/marca-ativa
```
