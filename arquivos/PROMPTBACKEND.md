# Prompt técnico — Fluxo · Fase 2 (Backend + Deploy na VPS)

> Copie tudo a partir da linha abaixo e entregue para a IA, **na mesma pasta onde o frontend já está**.

---

# TAREFA

O frontend do **Fluxo** já está pronto e funcionando com uma camada de dados simulada em `localStorage`. Sua tarefa agora é construir o **backend real** e colocar o app no ar em uma VPS.

O projeto é um workspace pessoal de usuário único para gerenciar projetos de trabalho: importa planilhas em PDF, gera tarefas, e controla o prazo de 10 dias corridos para receber o valor após finalizar cada projeto.

---

## 1. A REGRA DE OURO DESTA FASE

O frontend foi construído sobre um contrato: a interface `Repositorio` em `src/lib/dados/repositorio.ts`. Todos os componentes consomem dados por hooks do TanStack Query que chamam esse contrato — **nenhum componente sabe de onde os dados vêm**.

Por isso:

> **Não altere nenhuma assinatura da interface `Repositorio`. Não altere nenhum componente. Não altere nenhum hook.**
>
> Seu trabalho é criar uma segunda implementação desse mesmo contrato — agora com banco de dados de verdade — e trocar qual delas está ativa.

Se em algum momento você sentir vontade de mudar um componente para acomodar o backend, pare: o erro está no backend, não no componente. A única exceção autorizada está na seção 11 (migração de dados) e na seção 12 (autenticação de borda).

Leia `src/lib/dados/repositorio.ts` e `src/lib/dados/tipos.ts` **antes de escrever qualquer código**. Eles são a especificação da API.

---

## 2. ARQUITETURA ALVO

```
┌──────────────────────── Navegador ────────────────────────┐
│  Componentes React (inalterados)                           │
│      │                                                     │
│  Hooks TanStack Query (inalterados)                        │
│      │                                                     │
│  repositorioApi.ts   ← NOVO: mesma interface, via fetch    │
└────────────────────────────┬───────────────────────────────┘
                             │  HTTP/JSON
┌────────────────────────────▼───────────────────────────────┐
│  Next.js Route Handlers — src/app/api/**                   │
│      │                                                     │
│  Validação Zod → Regras de negócio (lib/prazo, lib/dinheiro)│
│      │                                                     │
│  Prisma Client                                             │
└────────────────────────────┬───────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────┐
│  PostgreSQL 16 — serviço `fluxo-db` na VPS                 │
└────────────────────────────────────────────────────────────┘
```

Continua sendo **um único projeto e um único deploy**. O Next.js serve a interface e a API.

**O que NÃO muda:** a extração de PDF continua rodando inteiramente no navegador. O arquivo PDF nunca sobe para o servidor. O que chega na API é o JSON já filtrado com as colunas que o usuário marcou.

---

## 3. STACK ADICIONAL

```
prisma            ^5.x   (devDependency)
@prisma/client    ^5.x
zod               já instalado — reutilizar
```

Não adicionar ORM alternativo, biblioteca de autenticação, GraphQL, tRPC ou framework de API. Route Handlers nativos do Next.js e nada mais.

---

## 4. ESQUEMA DO BANCO

Crie `prisma/schema.prisma` exatamente assim. Os campos espelham os tipos em `src/lib/dados/tipos.ts` — não invente nomes diferentes.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum StatusProjeto {
  planejado
  em_andamento
  finalizado
  arquivado
}

enum StatusTarefa {
  a_fazer
  em_andamento
  concluida
}

model Projeto {
  id                      String        @id @default(uuid())
  nome                    String
  cliente                 String?
  descricao               String?
  cor                     String        @default("violeta")
  status                  StatusProjeto @default(planejado)
  dataInicio              DateTime      @db.Date
  dataFimPrevista         DateTime      @db.Date
  concluidoEm             DateTime?
  valorCentavos           Int
  recebimentoPrevistoPara DateTime?     @db.Date
  recebidoEm              DateTime?     @db.Date
  valorRecebidoCentavos   Int?
  criadoEm                DateTime      @default(now())
  atualizadoEm            DateTime      @updatedAt

  tarefas     Tarefa[]
  importacoes Importacao[]
  linhas      LinhaImportada[]

  @@index([status])
  @@index([recebimentoPrevistoPara])
  @@map("projetos")
}

model Tarefa {
  id            String       @id @default(uuid())
  projetoId     String
  titulo        String
  observacoes   String?
  status        StatusTarefa @default(a_fazer)
  prazo         DateTime?    @db.Date
  ordem         Int          @default(0)
  linhaOrigemId String?      @unique
  concluidaEm   DateTime?
  criadoEm      DateTime     @default(now())

  projeto     Projeto         @relation(fields: [projetoId], references: [id], onDelete: Cascade)
  linhaOrigem LinhaImportada? @relation(fields: [linhaOrigemId], references: [id], onDelete: SetNull)

  @@index([projetoId, status])
  @@index([projetoId, ordem])
  @@map("tarefas")
}

model Importacao {
  id                String   @id @default(uuid())
  projetoId         String
  nomeArquivo       String
  tamanhoBytes      Int
  totalPaginas      Int
  colunasDetectadas Json
  colunasEscolhidas Json
  mapeamento        Json
  linhaCabecalho    Int
  totalLinhas       Int
  criadoEm          DateTime @default(now())

  projeto Projeto          @relation(fields: [projetoId], references: [id], onDelete: Cascade)
  linhas  LinhaImportada[]

  @@index([projetoId])
  @@map("importacoes")
}

model LinhaImportada {
  id           String   @id @default(uuid())
  importacaoId String
  projetoId    String
  numeroLinha  Int
  dados        Json     // { "ENDEREÇO": "Rua das Palmeiras, 120", "BAIRRO": "Santo Amaro" }

  importacao Importacao @relation(fields: [importacaoId], references: [id], onDelete: Cascade)
  projeto    Projeto    @relation(fields: [projetoId], references: [id], onDelete: Cascade)
  tarefa     Tarefa?

  @@index([projetoId])
  @@index([importacaoId])
  @@map("linhas_importadas")
}

model Configuracao {
  id                    Int      @id @default(1)
  janelaRecebimentoDias Int      @default(10)
  moeda                 String   @default("BRL")
  tema                  String   @default("sistema")
  atualizadoEm          DateTime @updatedAt

  @@map("configuracao")
}
```

Pontos que não são negociáveis:

- **`onDelete: Cascade`** nas relações de projeto. A exclusão em cascata é responsabilidade do banco, não do código
- **`valorCentavos Int`** — dinheiro é inteiro em centavos, nunca `Float` ou `Decimal`
- **`@db.Date`** nos campos que são data pura (sem hora). Isso evita o clássico erro de um dia a mais ou a menos por fuso
- **`Json`** em `dados`, `colunasDetectadas`, `colunasEscolhidas` e `mapeamento` — vira `JSONB` no Postgres, indexável
- O campo **`statusRecebimento` NÃO existe no banco**. Ele é sempre derivado na leitura (seção 6)

---

## 5. FORMATO DA API

### 5.1 Convenções

- Todas as rotas ficam sob `/api`
- Corpo e resposta sempre em JSON
- Datas puras trafegam como `'YYYY-MM-DD'`; datas com hora, como ISO 8601 completo
- A resposta de sucesso é **o recurso direto**, sem envelope
- A resposta de erro é sempre:

```json
{ "erro": { "codigo": "REGRA_VIOLADA", "mensagem": "Este projeto já foi recebido. Desfaça o recebimento antes de reabrir.", "campos": null } }
```

| Código HTTP | Quando |
|---|---|
| 200 | Leitura ou atualização bem-sucedida |
| 201 | Recurso criado |
| 204 | Exclusão bem-sucedida, sem corpo |
| 400 | Falha de validação Zod — `campos` traz o detalhe por campo |
| 404 | Recurso inexistente |
| 409 | Regra de negócio violada (ex.: reabrir projeto já recebido) |
| 500 | Erro inesperado — logar o stack no servidor, devolver mensagem genérica |

**As mensagens de erro vão aparecer na tela para o usuário. Escreva em português, específicas, sem "Algo deu errado".**

### 5.2 Armadilha do Next.js 14 que você precisa evitar

Route Handlers `GET` no App Router são **cacheados estaticamente por padrão**. Sem tratar isso, o app mostra dados velhos e você vai perder horas procurando um bug que não existe no seu código.

Em **todo** arquivo de rota que lê dados, adicione:

```ts
export const dynamic = 'force-dynamic';
```

### 5.3 As rotas

Cada rota corresponde a um método da interface `Repositorio`. Confira as assinaturas no arquivo antes de implementar.

| Método | Rota | Corresponde a |
|---|---|---|
| `GET` | `/api/projetos?status=&busca=&ordem=` | `listarProjetos` |
| `POST` | `/api/projetos` | `criarProjeto` → 201 |
| `GET` | `/api/projetos/[id]` | `obterProjeto` → 404 se não existir |
| `PATCH` | `/api/projetos/[id]` | `atualizarProjeto` |
| `DELETE` | `/api/projetos/[id]` | `excluirProjeto` → 204 |
| `POST` | `/api/projetos/[id]/finalizar` | `finalizarProjeto` |
| `POST` | `/api/projetos/[id]/reabrir` | `reabrirProjeto` → 409 se já recebido |
| `POST` | `/api/projetos/[id]/receber` | `receberProjeto` |
| `GET` | `/api/projetos/[id]/tarefas` | `listarTarefas` |
| `POST` | `/api/projetos/[id]/tarefas` | `criarTarefa` → 201 |
| `PATCH` | `/api/tarefas/[id]` | `atualizarTarefa` |
| `DELETE` | `/api/tarefas/[id]` | `excluirTarefa` → 204 |
| `POST` | `/api/tarefas/concluir` | `concluirTarefas` — recebe `{ ids: string[] }` |
| `GET` | `/api/projetos/[id]/importacoes` | `listarImportacoes` |
| `POST` | `/api/projetos/[id]/importacoes` | `criarImportacao` → 201 |
| `DELETE` | `/api/importacoes/[id]` | `excluirImportacao` → 204 |
| `GET` | `/api/projetos/[id]/linhas` | `listarLinhas` |
| `GET` | `/api/resumo-financeiro` | `obterResumoFinanceiro` |
| `GET` | `/api/recebimentos` | `listarRecebimentos` |
| `GET` | `/api/configuracoes` | `obterConfiguracao` |
| `PATCH` | `/api/configuracoes` | `salvarConfiguracao` |
| `GET` | `/api/saude` | Healthcheck: `{ ok: true, banco: true }` |

---

## 6. REGRAS DE NEGÓCIO NO SERVIDOR

### 6.1 Reaproveitar, não reescrever

`src/lib/prazo.ts` e `src/lib/dinheiro.ts` são TypeScript puro, sem dependência de navegador. **Os Route Handlers importam exatamente essas funções.** Não reimplemente a regra dos 10 dias no servidor — duplicar essa lógica é garantir que uma das cópias fique errada.

Se alguma função dessas usar API de navegador, extraia a parte pura em vez de copiar.

### 6.2 Derivação obrigatória na leitura

`statusRecebimento`, `diasAteRecebimento`, `totalTarefas`, `tarefasConcluidas` e `progresso` **nunca são gravados**. Toda rota que devolve projeto calcula esses campos antes de responder, montando o `ProjetoComResumo` exatamente como o frontend espera.

Para as contagens de tarefas, use agregação do Prisma (`_count` na relação), não um loop carregando todas as tarefas na memória.

### 6.3 Transições de estado

| Rota | Comportamento exato |
|---|---|
| `finalizar` | `status = 'finalizado'`, `concluidoEm = agora`, `recebimentoPrevistoPara = hoje + janelaRecebimentoDias` (lida da tabela `Configuracao`, padrão 10, **dias corridos**) |
| `reabrir` | Se `recebidoEm !== null` → **409** com a mensagem: `"Este projeto já foi recebido. Desfaça o recebimento antes de reabrir."` Senão: `status = 'em_andamento'`, limpa `concluidoEm` e `recebimentoPrevistoPara` |
| `receber` | `recebidoEm` = data enviada (padrão hoje), `valorRecebidoCentavos = valorCentavos` |
| `DELETE projeto` | Uma única operação — a cascata do banco cuida de tarefas, importações e linhas |

Fuso `America/Sao_Paulo`. Comparações de prazo usam o **início do dia local**. O container precisa de `TZ=America/Sao_Paulo`.

### 6.4 O resumo financeiro é uma consulta, não um laço

`GET /api/resumo-financeiro` devolve os quatro totais somando **no banco**, com `aggregate` ou `groupBy` do Prisma. Não carregue todos os projetos para somar em JavaScript.

| Campo | Regra |
|---|---|
| `aReceber` | `status = 'finalizado'` e `recebidoEm IS NULL` e `recebimentoPrevistoPara >= hoje` |
| `atrasado` | `status = 'finalizado'` e `recebidoEm IS NULL` e `recebimentoPrevistoPara < hoje` |
| `recebidoNoMes` | `recebidoEm` dentro do mês corrente |
| `emExecucao` | `status = 'em_andamento'` |

### 6.5 A importação precisa ser atômica

`POST /api/projetos/[id]/importacoes` recebe a importação inteira com todas as linhas. As três escritas — importação, linhas e tarefas — acontecem **em uma única transação**. Se qualquer parte falhar, nada é gravado.

Faça assim, não com inserções uma a uma:

```ts
// gerar os ids na aplicação permite ligar tarefa ↔ linha ANTES de inserir
const linhas = payload.linhas.map((dados, i) => ({
  id: crypto.randomUUID(),
  importacaoId,
  projetoId,
  numeroLinha: i + 1,
  dados,
}));

const tarefas = linhas.map((linha, i) => ({
  id: crypto.randomUUID(),
  projetoId,
  titulo: String(linha.dados[nomeColunaTitulo] ?? '').trim() || `Linha ${i + 1}`,
  prazo: /* coluna mapeada como prazo, se houver e se parsear */ null,
  observacoes: /* coluna mapeada como observações, se houver */ null,
  ordem: i,
  linhaOrigemId: linha.id,
}));

await prisma.$transaction([
  prisma.importacao.create({ data: { ...meta } }),
  prisma.linhaImportada.createMany({ data: linhas }),
  prisma.tarefa.createMany({ data: tarefas }),
]);
```

Três `createMany` em uma transação, não 142 `create` sequenciais — a diferença é entre 200 ms e 30 segundos.

**Limpeza obrigatória antes de gravar:** descartar linhas totalmente vazias e linhas idênticas ao cabeçalho. Se a coluna de título vier vazia numa linha, usar `Linha N` como título em vez de criar tarefa sem nome.

Se `linhas.length > 5000`, responda **400** com: `"Importação muito grande. Divida o arquivo em partes de até 5.000 linhas."`

### 6.6 Validação

Um schema Zod por rota, em `src/lib/validadores.ts`, **derivado dos tipos que o frontend já usa**. Validar tudo que entra: corpo, parâmetros de rota e query string. Nada de `as any` para escapar da validação.

Regras mínimas: `nome` entre 1 e 120 caracteres · `valorCentavos` inteiro ≥ 0 · datas no formato `YYYY-MM-DD` · `dataFimPrevista >= dataInicio` · `cor` dentro do enum `CorProjeto`.

---

## 7. A TROCA DE IMPLEMENTAÇÃO

### 7.1 `src/lib/dados/repositorioApi.ts`

Implementa a interface `Repositorio` inteira usando `fetch`. Cada método chama sua rota e devolve o mesmo tipo que o `repositorioLocal` devolvia.

Requisitos:

- Um helper único de `fetch` que monta a URL, envia JSON, e **converte resposta de erro em `Error` com a mensagem que veio do servidor** — é essa mensagem que os componentes já sabem exibir
- Nenhum atraso artificial (aquele do repositório local existia só para exercitar os estados de carregamento)
- Nenhuma lógica de negócio aqui — este arquivo só transporta dados

### 7.2 O ponto único de troca

Crie `src/lib/dados/index.ts`:

```ts
import { repositorioApi } from './repositorioApi';
import { repositorioLocal } from './repositorioLocal';
import type { Repositorio } from './repositorio';

export const repositorio: Repositorio =
  process.env.NEXT_PUBLIC_FONTE_DADOS === 'local' ? repositorioLocal : repositorioApi;
```

Ajuste `hooks.ts` para importar de `./index` — **esta é a única alteração permitida em arquivo existente do frontend**. O `repositorioLocal` fica no projeto, funcionando, como modo de desenvolvimento offline.

### 7.3 Como provar que a troca está correta

Com `NEXT_PUBLIC_FONTE_DADOS=local` e sem essa variável, **o app precisa se comportar de forma idêntica**. Qualquer diferença de comportamento é bug no backend.

---

## 8. INFRAESTRUTURA — O QUE JÁ EXISTE

| Item | Valor |
|---|---|
| VPS | `187.124.242.118` — Ubuntu 24.04, 8 GB RAM, 2 vCPU |
| Painel | Easypanel v2.33 — **licença gratuita, limite de 3 projetos** |
| Projetos existentes | `evolutio`, `mentorcrm`, `prospero360` |

**Restrição importante:** não é possível criar um quarto projeto no Easypanel. O limite da licença gratuita é de projetos, **não de serviços**. Então o Fluxo entra como serviço **dentro de um projeto já existente** — use o `mentorcrm`.

Os dois serviços novos precisam ficar **no mesmo projeto**, para se enxergarem pelo nome na rede interna do Docker.

```
mentorcrm
├── crm          (app)       já existe
├── fluxo        (app)       NOVO — o Next.js
└── fluxo-db     (postgres)  NOVO — o banco
```

---

## 9. DOCKERFILE

Use `output: 'standalone'` no `next.config.mjs` e este Dockerfile multi-estágio:

```dockerfile
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

Três armadilhas que esse arquivo já evita, e que você não deve reintroduzir:

1. **`node:20-slim`, não `alpine`.** O Prisma em Alpine exige configurar `binaryTargets` para musl/OpenSSL e falha em runtime com erro obscuro. Debian slim com `openssl` instalado simplesmente funciona
2. **`prisma generate` roda antes do build.** Sem isso o build quebra ao importar o client
3. **As pastas do Prisma são copiadas para o runner.** O output `standalone` do Next não leva os engines do Prisma sozinho

O `migrate deploy` no `CMD` aplica as migrações pendentes a cada subida do container. É idempotente: se não há migração nova, não faz nada.

---

## 10. DEPLOY NO EASYPANEL — PASSO A PASSO

### 10.1 Criar o banco

No projeto `mentorcrm`, criar serviço do tipo **Postgres**:

- Nome: `fluxo-db`
- Versão: 16
- Anotar usuário, senha e nome do banco gerados pelo painel

O host interno do banco é o próprio nome do serviço. A string de conexão fica:

```
postgresql://<usuario>:<senha>@fluxo-db:5432/<banco>?schema=public
```

### 10.2 Criar o app

No mesmo projeto, criar serviço do tipo **App**:

- Nome: `fluxo`
- Origem: repositório Git do projeto, ou build por Dockerfile
- Build: Dockerfile
- Porta interna: `3000`

### 10.3 Variáveis de ambiente do app

```
DATABASE_URL=postgresql://<usuario>:<senha>@fluxo-db:5432/<banco>?schema=public
TZ=America/Sao_Paulo
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Fluxo
AUTH_USUARIO=<escolher>
AUTH_SENHA=<senha forte>
```

Não commitar nenhum desses valores no repositório. Manter um `.env.example` sem segredos.

### 10.4 Domínio

Apontar um subdomínio para o serviço `fluxo`, com HTTPS ativado pelo painel.

### 10.5 Primeira subida

O `CMD` do container roda `prisma migrate deploy` automaticamente. Confirme nos logs que as migrações foram aplicadas e que `GET /api/saude` responde `{ ok: true, banco: true }`.

---

## 11. MIGRAR OS DADOS QUE ESTÃO NO NAVEGADOR

Se você já usou o app na fase anterior, existem projetos reais salvos no `localStorage` que precisam ir para o banco.

Implemente:

- `POST /api/migracao` — recebe o objeto completo do `localStorage` (`fluxo:v1`), valida com Zod, e insere tudo **em uma transação única**, preservando os ids originais. Se o banco já tiver qualquer projeto, responder **409** com `"O banco já contém dados. A migração só pode ser feita uma vez."`
- Na tela de configurações, um botão **"Enviar dados locais para o servidor"** que lê o `localStorage`, chama a rota, e mostra o resultado: `"18 projetos, 340 tarefas e 2 importações enviados."`

Depois de migrar, o botão some. Esta é a segunda e última alteração autorizada em tela existente.

---

## 12. PROTEÇÃO DE ACESSO

O app não tem tela de login, por decisão de produto — e vai ficar exposto na internet com dados financeiros. Sem uma porta na frente, qualquer pessoa que descobrir a URL vê e edita tudo.

Implemente **Basic Auth em `src/middleware.ts`**, cobrindo todas as rotas exceto `/api/saude`:

- Ler `AUTH_USUARIO` e `AUTH_SENHA` do ambiente
- Sem cabeçalho `Authorization` válido → **401** com `WWW-Authenticate: Basic realm="Fluxo"`
- Comparação de senha em **tempo constante**, não com `===`
- Se as variáveis não estiverem definidas em produção, **derrubar a aplicação no boot** com mensagem clara. Um app financeiro sem proteção não deve conseguir subir por acidente

Isso não é uma tela de login: o navegador exibe o prompt nativo uma vez e guarda a credencial na sessão. A experiência combinada com o que o PRD define.

---

## 13. BACKUP

Configurar cron diário na VPS, às 03:00:

```bash
docker exec <container_fluxo-db> pg_dump -U <usuario> -d <banco> | gzip > /var/backups/fluxo-$(date +%F).sql.gz
```

Manter os últimos 14 arquivos. Documentar no README o comando de restauração. Volume não é backup — o dump protege contra erro de operação, não só contra perda de disco.

---

## 14. ORDEM DE EXECUÇÃO

1. Ler `repositorio.ts` e `tipos.ts` por inteiro
2. `schema.prisma`, primeira migração, `lib/prisma.ts` com singleton do client
3. Adaptar `lib/prazo.ts` e `lib/dinheiro.ts` para uso compartilhado, se necessário
4. `lib/validadores.ts` com os schemas Zod
5. Helper de resposta e de erro (`lib/api.ts`)
6. Rotas de projetos — CRUD completo
7. Rotas de tarefas
8. Rotas de importação, com a transação
9. Resumo financeiro e recebimentos
10. Configurações e healthcheck
11. `repositorioApi.ts` e o `index.ts` de troca
12. Testar **tudo** localmente contra Postgres em Docker, comparando com o modo `local`
13. Middleware de Basic Auth
14. Rota e botão de migração
15. Dockerfile e build local da imagem
16. Deploy no Easypanel
17. Cron de backup

Não pule o passo 12. Descobrir um erro de contrato em produção custa dez vezes mais.

---

## 15. CHECKLIST DE ENTREGA

**Contrato**
- [ ] Nenhuma assinatura de `repositorio.ts` foi alterada
- [ ] Nenhum componente foi alterado, exceto o botão de migração em configurações
- [ ] `hooks.ts` mudou apenas o caminho do import
- [ ] Alternando `NEXT_PUBLIC_FONTE_DADOS` entre `local` e API, o app se comporta igual

**Backend**
- [ ] Todas as rotas da seção 5.3 existem e respondem
- [ ] Todo arquivo de rota com `GET` tem `export const dynamic = 'force-dynamic'`
- [ ] Erros trazem mensagem em português, específica, com o código HTTP correto
- [ ] Reabrir projeto recebido devolve 409 e a tela mostra a mensagem certa
- [ ] Excluir projeto remove tarefas, importações e linhas — verificado com consulta direta no banco
- [ ] Importar 142 linhas leva menos de 2 segundos e é atômico
- [ ] Falha simulada no meio da importação não deixa nada gravado
- [ ] Resumo financeiro bate com a conta feita à mão sobre os dados do banco
- [ ] Finalizar hoje gera prazo exatamente 10 dias à frente, sem erro de fuso
- [ ] Projeto que vence hoje aparece como alerta, não como atrasado

**Deploy**
- [ ] Imagem Docker sobe sem erro de engine do Prisma
- [ ] `prisma migrate deploy` roda na subida do container
- [ ] `GET /api/saude` responde `{ ok: true, banco: true }`
- [ ] Sem credencial, qualquer rota devolve 401
- [ ] Com credencial, o app funciona por HTTPS no domínio configurado
- [ ] Dados persistem após reiniciar o container
- [ ] `pg_dump` roda e gera arquivo restaurável
- [ ] README atualizado: variáveis, deploy, backup, restauração

---

## 16. O QUE NÃO FAZER

- Não criar autenticação com usuários, sessões, JWT ou tela de login
- Não criar rotas que o `repositorio.ts` não pede
- Não mudar o design, o layout ou os textos da interface
- Não mover a extração de PDF para o servidor
- Não usar `Float` ou `Decimal` para dinheiro
- Não gravar `statusRecebimento` no banco
- Não apagar o `repositorioLocal.ts` — ele é o modo offline de desenvolvimento
- Não subir `.env` para o repositório
