# Livraria Digital - Plataforma E-commerce de E-books

Plataforma completa de e-commerce para venda de e-books digitais, construida com Next.js 16, React 19, e PostgreSQL. Inclui painel administrativo, multiplos metodos de pagamento, sistema de permissoes RBAC, e infraestrutura pronta para producao.

---

## Indice

- [Stack Tecnologico](#stack-tecnologico)
- [Pre-requisitos](#pre-requisitos)
- [Instalacao](#instalacao)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Scripts Disponiveis](#scripts-disponiveis)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [API Reference](#api-reference)
- [Modelos de Dados](#modelos-de-dados)
- [Sistema de Permissoes](#sistema-de-permissoes)
- [Integracoes Externas](#integracoes-externas)
- [Seguranca](#seguranca)
- [Testes](#testes)
- [CI/CD](#cicd)
- [Deploy](#deploy)

---

## Stack Tecnologico

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19.2.3, Tailwind CSS 4, Radix UI, Framer Motion |
| Linguagem | TypeScript 5 |
| Banco de Dados | PostgreSQL + Prisma 7.3.0 |
| Autenticacao | NextAuth v5 (JWT) + Google OAuth |
| Pagamentos | MercadoPago (PIX, Cartao, Boleto) + Coinbase Commerce (Crypto) |
| Email | Resend + React Email |
| Storage | AWS S3 + CloudFront (URLs assinadas) |
| Cache/Rate Limit | Upstash Redis |
| State Management | Zustand |
| Validacao | Zod 4 + React Hook Form |
| PDF | pdf-lib |
| Testes | Vitest + Testing Library |
| CI/CD | GitHub Actions |

---

## Pre-requisitos

- Node.js 18+
- PostgreSQL 14+
- Conta MercadoPago (para pagamentos)
- Conta AWS (S3 + CloudFront)
- Conta Resend (para emails)
- Conta Upstash (Redis)
- (Opcional) Conta Coinbase Commerce (pagamentos crypto)
- (Opcional) Conta Google Cloud (OAuth)

---

## Instalacao

```bash
# 1. Clonar o repositorio
git clone <url-do-repositorio>
cd ebook_cloud_code

# 2. Instalar dependencias
npm install

# 3. Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais (ver secao abaixo)

# 4. Gerar o client Prisma
npm run db:generate

# 5. Sincronizar schema com o banco
npm run db:push

# 6. (Opcional) Popular banco com dados iniciais
npm run db:seed

# 7. Iniciar servidor de desenvolvimento
npm run dev
```

A aplicacao estara disponivel em `http://localhost:3000`.

---

## Variaveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# ── Banco de Dados ──
DATABASE_URL="postgresql://user:password@localhost:5432/livraria_digital"

# ── NextAuth ──
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
AUTH_GOOGLE_ID="google-client-id"
AUTH_GOOGLE_SECRET="google-client-secret"

# ── MercadoPago ──
MERCADOPAGO_ACCESS_TOKEN="seu-access-token"
MERCADOPAGO_PUBLIC_KEY="sua-public-key"
MERCADOPAGO_WEBHOOK_SECRET="seu-webhook-secret"

# ── Coinbase Commerce (opcional) ──
COINBASE_COMMERCE_API_KEY="sua-api-key"
COINBASE_COMMERCE_WEBHOOK_SECRET="seu-webhook-secret"

# ── AWS S3 & CloudFront ──
AWS_ACCESS_KEY_ID="sua-access-key"
AWS_SECRET_ACCESS_KEY="sua-secret-key"
AWS_REGION="sa-east-1"
AWS_S3_BUCKET="nome-do-bucket"
AWS_CLOUDFRONT_DOMAIN="dxxxxxx.cloudfront.net"
AWS_CLOUDFRONT_KEY_PAIR_ID="KXXXXXXXXX"
AWS_CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# ── Resend (Email) ──
RESEND_API_KEY="re_xxxxxxxxxx"
EMAIL_FROM="noreply@seudominio.com"
CONTACT_EMAIL="contato@seudominio.com"

# ── Upstash Redis ──
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="seu-token"

# ── Seguranca ──
DOWNLOAD_TOKEN_SECRET="chave-para-tokens-de-download"
CRON_SECRET="chave-para-cron-jobs"

# ── Publicas ──
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

---

## Scripts Disponiveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de producao
npm run start        # Iniciar servidor de producao
npm run lint         # Executar ESLint
npm run db:generate  # Gerar Prisma Client
npm run db:migrate   # Executar migrations
npm run db:push      # Sincronizar schema (dev)
npm run db:seed      # Popular banco com dados iniciais
npm run db:studio    # Abrir Prisma Studio (GUI)
npm run test         # Executar testes (watch mode)
npm run test:run     # Executar testes uma vez
```

---

## Arquitetura do Projeto

```
src/
├── app/                        # App Router (Next.js)
│   ├── (shop)/                 # Rotas publicas da loja
│   │   ├── page.tsx            # Homepage
│   │   ├── ebooks/             # Catalogo e detalhe de ebooks
│   │   ├── autores/            # Listagem e perfil de autores
│   │   ├── bundles/            # Pacotes de ebooks
│   │   ├── carrinho/           # Carrinho de compras
│   │   ├── checkout/           # Pagamento
│   │   ├── contato/            # Formulario de contato
│   │   └── pedido/             # Status do pedido
│   ├── (auth)/                 # Rotas de autenticacao
│   │   ├── login/              # Login
│   │   ├── cadastro/           # Registro
│   │   ├── recuperar-senha/    # Solicitar reset de senha
│   │   └── redefinir-senha/    # Redefinir senha
│   ├── (cliente)/              # Area do cliente (autenticado)
│   │   ├── biblioteca/         # Ebooks comprados + historico downloads
│   │   ├── pedidos/            # Historico de pedidos
│   │   ├── favoritos/          # Lista de desejos
│   │   └── configuracoes/      # Perfil + indicacoes
│   ├── (admin)/admin/          # Painel administrativo
│   │   ├── page.tsx            # Dashboard
│   │   ├── ebooks/             # CRUD de ebooks
│   │   ├── pedidos/            # Gestao de pedidos
│   │   ├── cupons/             # Gestao de cupons
│   │   ├── clientes/           # Gestao de clientes
│   │   ├── categorias/         # CRUD de categorias
│   │   ├── autores/            # CRUD de autores
│   │   ├── bundles/            # CRUD de bundles
│   │   ├── avaliacoes/         # Moderacao de reviews
│   │   ├── equipe/             # Gestao de funcionarios
│   │   ├── hotmart/            # Anuncios Hotmart
│   │   ├── midias/             # Upload de arquivos
│   │   ├── logs/               # Logs de auditoria
│   │   ├── financeiro/         # Relatorios financeiros
│   │   └── configuracoes/      # Configuracoes admin
│   └── api/                    # API Routes
├── components/                 # Componentes React
│   ├── ui/                     # Componentes base (shadcn/ui)
│   ├── layout/                 # Header, Footer, Sidebar, etc.
│   ├── ebooks/                 # Cards, Detail, Filters
│   ├── checkout/               # Steps de pagamento
│   ├── admin/                  # Componentes do admin
│   ├── cart/                   # Carrinho e botoes
│   └── cliente/                # Componentes da area do cliente
├── lib/                        # Utilitarios e configuracoes
│   ├── auth.ts                 # Configuracao NextAuth
│   ├── prisma.ts               # Cliente Prisma
│   ├── mercadopago.ts          # Cliente MercadoPago
│   ├── s3.ts                   # Cliente AWS S3
│   ├── redis.ts                # Cliente Redis + rate limiters
│   ├── email.ts                # Funcao de envio de email
│   ├── permissions.ts          # Sistema de permissoes RBAC
│   ├── audit.ts                # Sistema de logging
│   ├── notifications.ts        # Notificacoes in-app
│   ├── installments.ts         # Calculo de parcelamento
│   ├── error-tracking.ts       # Rastreamento de erros
│   ├── payment-actions.ts      # Acoes pos-pagamento
│   └── payments/
│       └── boleto.ts           # Integracao boleto
├── emails/                     # Templates de email (React Email)
├── stores/                     # Zustand stores
│   └── cart.ts                 # Estado do carrinho
├── validations/                # Schemas Zod
├── tests/                      # Testes unitarios
└── generated/prisma/           # Prisma Client gerado
```

---

## Funcionalidades

### Loja Publica

| Feature | Descricao |
|---------|-----------|
| Catalogo de E-books | Listagem com filtros por categoria, preco, ordenacao e busca textual |
| Detalhe do E-book | Pagina com descricao, preco, parcelamento, avaliacoes e preview |
| Autores | Listagem e perfil de autores com seus e-books |
| Bundles | Pacotes de e-books com desconto e economia exibida |
| Carrinho | Adicionar/remover itens, aplicar cupom, calculo automatico |
| Checkout | 4 metodos de pagamento: PIX, Cartao, Boleto, Crypto |
| Parcelamento | Exibicao de parcelas (ate 12x) nos cards e detalhes |
| Newsletter | Inscricao por email |
| Contato | Formulario com envio de email |
| FAQ, Termos, Privacidade | Paginas institucionais |
| PWA | Manifest + Service Worker para instalacao como app |

### Area do Cliente

| Feature | Descricao |
|---------|-----------|
| Biblioteca | E-books comprados com download (PDF, EPUB, MOBI) |
| Historico de Downloads | Registro de todos os downloads com formato, data e IP |
| Pedidos | Historico completo com status e download de recibo PDF |
| Favoritos | Lista de desejos com toggle |
| Configuracoes | Editar perfil, avatar, telefone |
| Notificacoes | Sino com badge, lista de notificacoes com mark-as-read |
| Programa de Indicacao | Link de indicacao, cupom de recompensa apos 1a compra do indicado |
| Cupom de Boas-vindas | Cupom de 10% gerado automaticamente no registro |

### Painel Administrativo

| Feature | Descricao |
|---------|-----------|
| Dashboard | Metricas: receita, pedidos, clientes, taxa de conversao |
| E-books | CRUD completo com upload S3, preview, formatos multiplos |
| Pedidos | Listagem, detalhe, alteracao de status, reembolso |
| Cupons | Criar/editar cupons (% ou fixo), limite de uso, validade |
| Clientes | Listagem, detalhe, suspender/banir conta |
| Categorias | CRUD com slug, ordenacao, ativar/desativar |
| Autores | CRUD com perfil, bio, contagem de e-books |
| Bundles | CRUD com selecao multipla de e-books, preco especial |
| Avaliacoes | Moderar (aprovar/rejeitar/excluir) reviews |
| Equipe | CRUD de funcionarios com hierarquia, cargo, permissoes |
| Hotmart | Gerenciar anuncios de parceiros Hotmart |
| Midias | Upload e gerenciamento de arquivos no S3 |
| Logs | Auditoria completa com filtros e export CSV/JSON |
| Financeiro | Dashboard financeiro com export CSV |
| Configuracoes | Configuracoes da plataforma |

### Pagamentos

| Metodo | Gateway | Detalhes |
|--------|---------|----------|
| PIX | MercadoPago | QR Code + codigo copia-e-cola, confirmacao via webhook |
| Cartao de Credito | MercadoPago | Parcelamento ate 12x, tokenizacao client-side |
| Boleto | MercadoPago | Codigo de barras copiavel, link para boleto |
| Criptomoeda | Coinbase Commerce | BTC, ETH, USDC via checkout hosted |
| Cupom 100% | Interno | Pedidos gratuitos com cupom de desconto total |

### Emails Transacionais

| Template | Trigger |
|----------|---------|
| Boas-vindas | Registro de novo usuario (com cupom) |
| Confirmacao de Pedido | Pagamento aprovado |
| Reset de Senha | Solicitacao de recuperacao |
| Carrinho Abandonado | Cron 24h apos abandono |
| Contato | Formulario de contato enviado |

---

## API Reference

### Autenticacao

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `POST` | `/api/auth/register` | Registrar novo usuario | Nao |
| `POST` | `/api/auth/forgot-password` | Solicitar reset de senha | Nao |
| `POST` | `/api/auth/reset-password` | Redefinir senha com token | Nao |
| `*` | `/api/auth/[...nextauth]` | NextAuth handlers (login, logout, session) | - |

#### POST /api/auth/register
```json
// Request
{
  "name": "Joao Silva",
  "email": "joao@email.com",
  "password": "senhasegura123",
  "ref": "abc123de"           // opcional: codigo de indicacao
}

// Response 201
{
  "message": "Conta criada com sucesso"
}
```

#### POST /api/auth/forgot-password
```json
// Request
{ "email": "joao@email.com" }

// Response 200 (sempre retorna sucesso - anti-enumeracao)
{ "message": "Se o email existir, enviaremos um link de recuperacao" }
```

#### POST /api/auth/reset-password
```json
// Request
{
  "email": "joao@email.com",
  "token": "uuid-recebido-por-email",
  "password": "novasenha123",
  "confirmPassword": "novasenha123"
}

// Response 200
{ "message": "Senha redefinida com sucesso" }
```

---

### Usuario

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `PUT` | `/api/user/profile` | Atualizar perfil | Sim |
| `POST` | `/api/user/avatar` | Upload de avatar | Sim |
| `GET/POST` | `/api/user/data-export` | Exportar dados (LGPD) | Sim |
| `POST` | `/api/user/data-deletion` | Solicitar exclusao de conta | Sim |

---

### Catalogo

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `GET` | `/api/categories` | Listar categorias ativas | Nao |
| `GET` | `/api/ebooks/[id]/reviews` | Listar reviews de um e-book | Nao |
| `POST` | `/api/ebooks/[id]/reviews` | Enviar review | Sim |

---

### Checkout e Pedidos

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `POST` | `/api/checkout` | Criar pedido e iniciar pagamento | Sim |
| `GET` | `/api/checkout/status/[orderId]` | Verificar status do pagamento | Sim |
| `POST` | `/api/checkout/validate-coupon` | Validar cupom de desconto | Sim |
| `GET` | `/api/orders/[id]/receipt` | Baixar recibo em PDF | Sim |

#### POST /api/checkout
```json
// Request
{
  "items": [
    { "ebookId": "clxxx...", "price": 49.90 }
  ],
  "paymentMethod": "PIX",      // PIX | CREDIT_CARD | BOLETO | CRYPTO
  "couponCode": "WELCOME10",   // opcional
  "customerCpf": "12345678900", // obrigatorio para BOLETO
  "cardToken": "tok_xxx",      // obrigatorio para CREDIT_CARD
  "installments": 3            // opcional para CREDIT_CARD
}

// Response 200 (PIX)
{
  "orderId": "clxxx...",
  "qrCode": "00020126...",
  "qrCodeBase64": "data:image/png;base64,..."
}

// Response 200 (BOLETO)
{
  "orderId": "clxxx...",
  "boletoUrl": "https://www.mercadopago.com/...",
  "barcode": "23793.38128..."
}
```

---

### Downloads

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `GET` | `/api/download/[token]` | Download de e-book (token JWT com expiracao 48h) | Token |

---

### Favoritos

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `GET` | `/api/favorites` | Listar favoritos | Sim |
| `POST` | `/api/favorites` | Adicionar favorito | Sim |
| `DELETE` | `/api/favorites/[ebookId]` | Remover favorito | Sim |

---

### Notificacoes

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `GET` | `/api/notifications` | Listar notificacoes + contagem nao lidas | Sim |
| `PATCH` | `/api/notifications/[id]` | Marcar como lida | Sim |
| `POST` | `/api/notifications/mark-all-read` | Marcar todas como lidas | Sim |

#### GET /api/notifications
```json
// Response 200
{
  "notifications": [
    {
      "id": "clxxx...",
      "title": "Pedido confirmado!",
      "message": "Seus e-books estao disponiveis na biblioteca.",
      "type": "info",
      "read": false,
      "link": "/biblioteca",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

---

### Hotmart

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `POST` | `/api/hotmart` | Criar anuncio | Nao |
| `GET` | `/api/hotmart/click` | Registrar clique em anuncio | Nao |

---

### Newsletter e Contato

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `POST` | `/api/newsletter` | Inscrever no newsletter | Nao |
| `POST` | `/api/contact` | Enviar formulario de contato | Nao |

---

### Webhooks

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `POST` | `/api/webhooks/mercadopago` | Webhook de pagamentos MercadoPago |
| `POST` | `/api/webhooks/coinbase` | Webhook de pagamentos Coinbase Commerce |

---

### Cron Jobs

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `GET` | `/api/cron/abandoned-cart` | Enviar emails de carrinho abandonado (24h) | CRON_SECRET |
| `GET` | `/api/cron/cancel-stale-orders` | Cancelar pedidos pendentes > 48h | CRON_SECRET |
| `GET` | `/api/cron/log-cleanup` | Limpar logs antigos | CRON_SECRET |

---

### Admin: E-books

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/ebooks` | Listar e-books | ebook:view |
| `POST` | `/api/admin/ebooks` | Criar e-book | ebook:create |
| `GET` | `/api/admin/ebooks/[id]` | Detalhe do e-book | ebook:view |
| `PUT` | `/api/admin/ebooks/[id]` | Atualizar e-book | ebook:update |
| `DELETE` | `/api/admin/ebooks/[id]` | Excluir e-book | ebook:delete |

---

### Admin: Pedidos

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/orders` | Listar pedidos | order:view |
| `GET` | `/api/admin/orders/[id]` | Detalhe do pedido | order:view |
| `PUT` | `/api/admin/orders/[id]` | Atualizar status | order:update |
| `DELETE` | `/api/admin/orders/[id]` | Excluir pedido | order:delete |
| `POST` | `/api/admin/orders/[id]/refund` | Processar reembolso | order:update |

---

### Admin: Cupons

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/coupons` | Listar cupons | coupon:view |
| `POST` | `/api/admin/coupons` | Criar cupom | coupon:create |
| `GET` | `/api/admin/coupons/[id]` | Detalhe do cupom | coupon:view |
| `PUT` | `/api/admin/coupons/[id]` | Atualizar cupom | coupon:update |
| `DELETE` | `/api/admin/coupons/[id]` | Excluir cupom | coupon:delete |

---

### Admin: Clientes

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/customers` | Listar clientes | user:view |
| `GET` | `/api/admin/users/[id]/status` | Ver status do usuario | user:view |
| `PUT` | `/api/admin/users/[id]/status` | Alterar status (ACTIVE/SUSPENDED/BANNED) | user:update |

---

### Admin: Avaliacoes

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/reviews` | Listar reviews | review:view |
| `PUT` | `/api/admin/reviews/[id]` | Aprovar review | review:update |
| `DELETE` | `/api/admin/reviews/[id]` | Excluir review | review:delete |

---

### Admin: Categorias

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/categories` | Listar categorias | category:view |
| `POST` | `/api/admin/categories` | Criar categoria | category:create |
| `PUT` | `/api/admin/categories/[id]` | Atualizar categoria | category:update |
| `DELETE` | `/api/admin/categories/[id]` | Excluir categoria | category:delete |

---

### Admin: Autores

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/authors` | Listar autores | author:view |
| `POST` | `/api/admin/authors` | Criar autor | author:create |
| `PUT` | `/api/admin/authors/[id]` | Atualizar autor | author:update |
| `DELETE` | `/api/admin/authors/[id]` | Excluir autor | author:delete |

---

### Admin: Bundles

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/bundles` | Listar bundles | bundle:view |
| `POST` | `/api/admin/bundles` | Criar bundle | bundle:create |
| `PUT` | `/api/admin/bundles/[id]` | Atualizar bundle | bundle:update |
| `DELETE` | `/api/admin/bundles/[id]` | Excluir bundle | bundle:delete |

---

### Admin: Funcionarios

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/employees` | Listar funcionarios | employee:view |
| `POST` | `/api/admin/employees` | Criar funcionario | employee:create |
| `GET` | `/api/admin/employees/[id]` | Detalhe do funcionario | employee:view |
| `PUT` | `/api/admin/employees/[id]` | Atualizar funcionario | employee:update |
| `DELETE` | `/api/admin/employees/[id]` | Remover funcionario | employee:delete |

---

### Admin: Logs e Financeiro

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/logs` | Listar logs com filtros | log:view |
| `GET` | `/api/admin/logs/stats` | Metricas diarias | log:view |
| `POST` | `/api/admin/logs/export` | Exportar logs (CSV/JSON) | log:export |
| `GET` | `/api/admin/analytics` | Dashboard de analytics | analytics:view |
| `GET` | `/api/admin/financeiro/export` | Exportar relatorio financeiro (CSV) | analytics:export |

---

### Admin: Hotmart e Upload

| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| `GET` | `/api/admin/hotmart` | Listar anuncios | hotmart:view |
| `POST` | `/api/admin/hotmart` | Criar anuncio | hotmart:create |
| `GET` | `/api/admin/hotmart/[id]` | Detalhe do anuncio | hotmart:view |
| `PUT` | `/api/admin/hotmart/[id]` | Atualizar anuncio | hotmart:update |
| `DELETE` | `/api/admin/hotmart/[id]` | Excluir anuncio | hotmart:delete |
| `POST` | `/api/admin/upload` | Upload de arquivo para S3 | ebook:create |

---

## Modelos de Dados

### Diagrama de Entidades Principais

```
User ──────┬── Order ──── OrderItem ──── Ebook
           ├── Review                     ├── Author
           ├── Favorite                   ├── Category
           ├── Download                   └── BundleItem ── Bundle
           ├── Notification
           ├── ActivityLog
           └── Referral ── Coupon ── CouponUsage

HotmartAd ── HotmartClick
VerificationToken (password reset)
DailyMetrics (analytics)
```

### Enums

**UserRole** (hierarquia de 0 a 100):
```
USER (0) → INTERN (10) → ANALYST (20) → SUPPORT (30) → LOGISTICS (40) →
MARKETING (50) → FINANCE (60) → MODERATOR (70) → EDITOR (80) →
MANAGER (90) → ADMIN (95) → SUPER_ADMIN (100)
```

**OrderStatus**: `PENDING` | `PROCESSING` | `PAID` | `FAILED` | `REFUNDED` | `CANCELLED`

**PaymentMethod**: `PIX` | `CREDIT_CARD` | `CRYPTO` | `BOLETO` | `FREE_COUPON`

**EbookStatus**: `DRAFT` | `PUBLISHED` | `ARCHIVED`

**UserStatus**: `ACTIVE` | `SUSPENDED` | `BANNED`

**DiscountType**: `PERCENTAGE` | `FIXED`

---

## Sistema de Permissoes

### Recursos e Acoes

Cada rota admin verifica permissoes no formato `recurso:acao`.

**Recursos**: `ebook`, `order`, `coupon`, `review`, `hotmart`, `user`, `log`, `analytics`, `employee`, `settings`, `category`, `author`, `bundle`

**Acoes**: `view`, `create`, `update`, `delete`, `export`

### Permissoes por Cargo

| Cargo | Permissoes |
|-------|-----------|
| SUPER_ADMIN | Todas as permissoes em todos os recursos |
| ADMIN | Todas as permissoes em todos os recursos |
| MANAGER | CRUD completo em ebook, order, coupon, review, hotmart, user, category, author, bundle + view/export de log e analytics + view de employee |
| EDITOR | CRUD em ebook, category, author, bundle + view de order, coupon, review, analytics |
| MODERATOR | CRUD em review + view de ebook, order, user |
| FINANCE | View/export de order, analytics, log |
| MARKETING | View de ebook, analytics + CRUD de hotmart, coupon |
| SUPPORT | View de order, user, ebook |
| LOGISTICS | View de order |
| ANALYST | View de analytics, log |
| INTERN | View de ebook |
| USER | Sem acesso ao admin |

### Funcoes Utilitarias

```typescript
import { hasPermission, isStaff, canManageRole, requirePermission } from "@/lib/permissions"

// Verificar se usuario eh staff (qualquer cargo acima de USER)
isStaff("EDITOR") // true

// Verificar permissao especifica
hasPermission("EDITOR", "ebook", "create") // true
hasPermission("EDITOR", "user", "delete")  // false

// Verificar hierarquia (pode gerenciar cargo inferior)
canManageRole("ADMIN", "EDITOR")    // true
canManageRole("EDITOR", "ADMIN")    // false

// Em API routes - retorna NextResponse 401/403 se nao autorizado
const denied = requirePermission(session, "ebook", "create")
if (denied) return denied
```

---

## Integracoes Externas

### MercadoPago

- **PIX**: Gera QR Code via API, confirma via webhook `payment.updated`
- **Cartao de Credito**: Tokenizacao client-side com `MercadoPago.js`, parcelamento ate 12x
- **Boleto**: Gera boleto via `bolbradesco`, retorna URL e codigo de barras
- **Reembolso**: API de refund para pedidos pagos
- **Webhook**: `/api/webhooks/mercadopago` com verificacao de assinatura

### Coinbase Commerce

- **Crypto**: Cria charge via API, redirect para checkout Coinbase
- **Webhook**: `/api/webhooks/coinbase` com verificacao HMAC SHA-256
- **Eventos**: `charge:confirmed`, `charge:resolved`, `charge:failed`

### AWS S3 + CloudFront

- **Upload**: Admin faz upload de e-books (PDF, EPUB, MOBI) e covers para S3
- **Download**: URLs assinadas via CloudFront com expiracao de 48h
- **Watermark**: PDFs recebem marca d'agua com email do comprador

### Resend (Email)

- Templates em React Email (`src/emails/`)
- Envio assincrono fire-and-forget para nao bloquear requests
- 5 templates: Welcome, OrderConfirmation, PasswordReset, AbandonedCart, Contact

### Upstash Redis

- **Rate Limiting geral**: 10 requests/hora por usuario
- **Rate Limiting checkout**: 5 requests/10min por usuario
- **Rate Limiting download**: Configuravel por token

---

## Seguranca

| Medida | Implementacao |
|--------|--------------|
| Autenticacao | JWT via NextAuth v5, sessoes stateless |
| OAuth | Google como provedor externo |
| Senhas | bcrypt com salt rounds |
| RBAC | 12 niveis de cargo com permissoes granulares |
| Rate Limiting | Redis-backed (Upstash) por IP/usuario |
| CSRF | Protecao nativa do NextAuth |
| XSS | React escaping + CSP headers |
| Headers | HSTS, X-Frame-Options DENY, nosniff, XSS-Protection |
| Anti-enumeracao | Reset de senha sempre retorna 200 |
| Tokens de download | JWT com expiracao de 48h, single-use |
| Webhook verification | HMAC SHA-256 (MercadoPago + Coinbase) |
| Upload | Validacao de tipo MIME e tamanho |
| Watermark | Email do comprador no PDF baixado |
| LGPD | Export e exclusao de dados do usuario |
| Audit Trail | Log de todas as acoes administrativas |
| Cron Auth | Header `Authorization: Bearer CRON_SECRET` |

---

## Testes

### Executar Testes

```bash
# Watch mode (re-executa ao salvar)
npm run test

# Execucao unica
npm run test:run
```

### Cobertura Atual

- **27 testes** unitarios
- `src/tests/lib/utils.test.ts` - formatPrice, slugify (7 testes)
- `src/tests/lib/installments.test.ts` - calculateInstallments, getInstallmentLabel (7 testes)
- `src/tests/lib/permissions.test.ts` - isStaff, hasPermission, canManageRole (13 testes)

### Configuracao

- Framework: Vitest com jsdom
- Setup: `@testing-library/jest-dom` para matchers DOM
- Alias: `@/` mapeado para `src/`

---

## CI/CD

Pipeline GitHub Actions (`.github/workflows/ci.yml`):

```
Push/PR para main
  ├── Install dependencies
  ├── Generate Prisma Client
  ├── Lint (next lint)
  ├── Type Check (tsc --noEmit)
  ├── Tests (vitest run)
  └── Build (next build)
```

Todos os jobs rodam em `ubuntu-latest` com Node.js 18.

---

## Deploy

### Vercel (Recomendado)

1. Conectar repositorio no Vercel
2. Configurar variaveis de ambiente no dashboard
3. Framework preset: Next.js (detectado automaticamente)
4. Build command: `prisma generate && next build`
5. Configurar webhooks MercadoPago/Coinbase com URL de producao
6. Configurar cron jobs via Vercel Cron ou servico externo

### Docker (Alternativo)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Checklist de Deploy

- [ ] Todas as variaveis de ambiente configuradas
- [ ] `DATABASE_URL` apontando para banco de producao
- [ ] `NEXTAUTH_URL` com dominio de producao
- [ ] Webhooks MercadoPago configurados com URL de producao
- [ ] Webhooks Coinbase configurados com URL de producao
- [ ] CloudFront configurado com dominio correto
- [ ] DNS configurado
- [ ] SSL/TLS ativo
- [ ] Cron jobs agendados (abandoned-cart, cancel-stale, log-cleanup)
- [ ] Seed de dados iniciais executado (`npm run db:seed`)
- [ ] Primeiro usuario SUPER_ADMIN criado

---

## Licenca

Projeto privado. Todos os direitos reservados.
