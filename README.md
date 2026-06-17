# 📰 Newsletter Inteligente

> Sistema de curadoria automatizada de notícias de tecnologia com IA — Desafio Técnico Singulari

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)](https://nestjs.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Decisões Técnicas](#decisões-técnicas)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar](#como-rodar)
- [API — Endpoints](#api--endpoints)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Padrões de Commit](#padrões-de-commit)

---

## Visão Geral

O **Newsletter Inteligente** é um sistema completo de curadoria automatizada de notícias de tecnologia. Um **Agente Curador** autônomo gera notícias continuamente usando múltiplas estratégias (templates dinâmicos e análise de dados CSV), classifica-as por categoria automaticamente e as envia para uma **fila de processamento** (BullMQ + Redis). Um **Serviço Consumidor** consome essa fila, usa a **IA Gemini** para gerar resumos inteligentes e persiste as notícias no banco. O **Frontend** em React exibe as notícias com filtros por período e categoria.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│              SPA com filtros de período e categoria              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼────────────────────────────────────┐
│                      BACKEND (NestJS)                            │
│    API REST com autenticação JWT, paginação e filtros            │
└──────────────────┬──────────────────────────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼──────────────────────────────────────────────┐
│                    PostgreSQL 16                                  │
│         news | categories | users | user_preferences             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              PROCESSAMENTO ASSÍNCRONO                            │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Agente Curador  │───▶│  BullMQ/Redis│───▶│   Consumer    │  │
│  │  (cron 10 min)   │    │   (Fila)     │    │   (Worker)    │  │
│  │                  │    └──────────────┘    └──────┬────────┘  │
│  │ • Template Gen.  │                               │           │
│  │ • CSV Analyzer   │                        ┌──────▼────────┐  │
│  │ • Classifier     │                        │  Gemini API   │  │
│  └──────────────────┘                        │  (Resumos)    │  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Decisões Técnicas

### 🗄️ Banco de Dados — PostgreSQL

O modelo de dados é naturalmente relacional: notícias pertencem a categorias e usuários possuem preferências que referenciam essas mesmas categorias. O PostgreSQL atende a esses requisitos com garantias ACID, suporte a JOINs eficientes e índices B-tree nativos — ideais para as queries de listagem com filtros de período e paginação (`WHERE published_at >= X ORDER BY published_at DESC LIMIT N OFFSET N`).

A atomicidade é especialmente importante no fluxo do consumidor: a chamada à IA e a persistência da notícia ocorrem dentro de uma mesma transação, garantindo que nenhum registro fique em estado inconsistente em caso de falha.

---

### 🔄 Processamento Assíncrono — BullMQ + Redis

O Agente Curador publica jobs em uma fila gerenciada pelo **BullMQ** (backed por Redis). O Consumidor processa esses jobs de forma independente, o que traz três benefícios arquiteturais:

- **Desacoplamento:** o agente não tem dependência direta do consumidor nem da IA — cada serviço evolui e escala independentemente.
- **Resiliência:** jobs com falha são reenfileirados automaticamente (até 3 tentativas configuradas).
- **Escalabilidade horizontal:** é possível rodar múltiplos workers consumidores em paralelo sem alteração no código do agente.

O Redis foi escolhido por ser in-memory (latência de microssegundos), simples de operar via Docker e suficiente para o volume de mensagens deste sistema. O BullMQ é a biblioteca de filas mais madura do ecossistema Node.js.

---

### 🤖 Framework — NestJS

O **NestJS** estrutura a API com padrões de arquitetura enterprise sobre o Node.js:

- **Injeção de Dependência (DI):** o framework gerencia o ciclo de vida dos services, o que simplifica a escrita de testes unitários (ex.: mock do `PrismaService` sem subir o banco).
- **Modularidade:** cada domínio (`news`, `auth`, `preferences`) é encapsulado em um módulo isolado, facilitando eventual extração para microserviços.
- **Decorators declarativos:** `@Get()`, `@UseGuards()`, `@ApiTags()` tornam a intenção do código explícita e reduzem boilerplate.

---

### 🔐 Autenticação: JWT + bcrypt

**bcrypt** para senhas: algoritmo de hash unidirecional. A senha nunca é armazenada em texto puro. No login, o bcrypt compara a senha digitada com o hash salvo.

**JWT** para sessões: token stateless em 3 partes (`header.payload.signature`). O backend verifica a assinatura sem consultar o banco a cada requisição.

---

### 🧠 Agente Curador — Padrão Strategy

O agente implementa o **padrão Strategy**: cada estratégia de geração implementa a mesma interface (`NewsGenerator`), permitindo adicionar novas estratégias sem modificar o código existente (**princípio Open/Closed do SOLID**).

**Estratégias implementadas:**
- `TemplateGenerator`: Combina templates narrativos com dados dinâmicos (empresas, ações, benefícios)
- `CsvAnalyzer`: Lê um CSV com tendências de tecnologia e transforma em notícias narrativas

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Backend API | NestJS + TypeScript | 11 |
| ORM | Prisma | 6 |
| Banco de dados | PostgreSQL | 16 |
| Frontend | React + Vite + TypeScript | 18 |
| Message Broker | BullMQ + Redis | 7 |
| Autenticação | JWT + bcrypt | — |
| IA | Google Gemini API | 1.5 Flash |
| Containerização | Docker + Compose | — |

---

## Estrutura do Projeto

```
newsletter-inteligente/
├── docker-compose.yml       # Orquestra todos os 5 serviços
├── .env.example             # Template de variáveis de ambiente
├── README.md
│
├── backend/                 # API REST (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma    # Modelagem do banco
│   │   └── seed.ts          # Categorias iniciais
│   └── src/
│       ├── modules/
│       │   ├── news/        # GET /news, GET /news/:id
│       │   ├── auth/        # POST /users, POST /login
│       │   ├── categories/  # GET /preferences
│       │   └── preferences/ # GET|PUT /users/me/preferences
│       └── prisma/          # PrismaService (singleton global)
│
├── frontend/                # SPA React
│   └── src/
│       ├── components/      # NewsCard, PeriodFilter, Pagination...
│       ├── pages/           # Home, Login, Register, Preferences
│       ├── hooks/           # useNews, useAuth
│       └── contexts/        # AuthContext
│
├── agent/                   # Agente Curador (Worker autônomo)
│   └── src/
│       ├── generators/      # TemplateGenerator, CsvAnalyzer
│       ├── processors/      # KeywordClassifier, SentimentAnalyzer
│       └── queue/           # BullMQ Producer
│
└── consumer/                # Serviço Consumidor (BullMQ Worker)
    └── src/
        ├── worker.ts        # BullMQ Worker
        ├── ai-summarizer.ts # Integração Gemini
        └── news-saver.ts    # Persistência no banco
```

---

## Como Rodar

### Pré-requisitos

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://docker.com/products/docker-desktop)

### Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/jancarlosz/newsletter-inteligente.git
cd newsletter-inteligente

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com sua GEMINI_API_KEY

# 3. Suba o banco e o Redis
docker-compose up postgres redis -d

# 4. Backend
cd backend
npm install
npm run db:migrate   # Cria as tabelas
npm run db:seed      # Popula as categorias
npm run start:dev    # http://localhost:3000
                     # Swagger: http://localhost:3000/api

# 5. Agente Curador (em outro terminal)
cd agent
npm install
npm run start:dev

# 6. Consumer (em outro terminal)
cd consumer
npm install
npm run start:dev

# 7. Frontend (em outro terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Produção com Docker

```bash
cp .env.example .env
# Configure o .env com sua GEMINI_API_KEY real

docker-compose up -d
# Frontend:  http://localhost
# Backend:   http://localhost:3000
# Swagger:   http://localhost:3000/api
```

---

## API — Endpoints

### Notícias (público)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/news` | Lista notícias paginadas |
| `GET` | `/news?period=day` | Filtra notícias de hoje |
| `GET` | `/news?period=week` | Filtra notícias da semana |
| `GET` | `/news?period=month` | Filtra notícias do mês |
| `GET` | `/news?category=cloud-computing` | Filtra por categoria |
| `GET` | `/news?page=2&limit=10` | Paginação |
| `GET` | `/news/:id` | Busca notícia por ID |

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/users` | Cadastro de usuário |
| `POST` | `/login` | Login (retorna JWT) |

### Preferências (requer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/preferences` | Lista todas as categorias |
| `GET` | `/users/me/preferences` | Preferências do usuário logado |
| `PUT` | `/users/me/preferences` | Atualiza preferências |

> 📚 Documentação interativa completa disponível em `http://localhost:3000/api` (Swagger)

---

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string do PostgreSQL | `postgresql://postgres:postgres@localhost:5432/newsletter_db` |
| `REDIS_URL` | URL do Redis | `redis://localhost:6379` |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | string aleatória longa |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` |
| `GEMINI_API_KEY` | Chave da API Google Gemini | `AQ.Ab8...` |
| `PORT` | Porta do backend | `3000` |

---

## Padrões de Commit

Utilizamos [Conventional Commits](https://conventionalcommits.org) com mensagens em português:

```
feat(news): implementar rota GET /news com paginação e filtros
feat(auth): adicionar registro de usuário com hash bcrypt
chore(db): configurar prisma schema com modelagem relacional
fix(agent): corrigir classificação de categoria por keywords
docs: adicionar README com decisões técnicas e arquitetura
test(news): adicionar testes unitários do NewsService
```

---

## 👤 Autor

**Jancarlos** — [@jancarlosz](https://github.com/jancarlosz)
