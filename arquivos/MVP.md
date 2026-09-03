# MVP — Fluxo

> Escopo mínimo, stack, arquitetura e plano de execução da V1.
> Referências: [PRD.md](PRD.md) (o que e por quê) · [DESIGN.md](DESIGN.md) (como se parece)

| | |
|---|---|
| **Versão** | 1.1 |
| **Data** | 2026-09-03 |
| **Duração estimada** | 5 sprints de ~1 semana |
| **Stack decidida** | TypeScript · Next.js 14 · PostgreSQL + Prisma |
| **Critério de pronto** | Um projeto real percorre PDF → tarefas → finalização → recebimento sem sair do app |

---

## 1. A frase do MVP

> Consigo criar um projeto, importar um PDF de planilha escolhendo as colunas que quero, executar as tarefas geradas, marcar o projeto como finalizado e acompanhar os 10 dias até receber — tudo isso do celular ou do desktop, sem login.

Se qualquer parte dessa frase não funcionar, o MVP não está pronto. Se algo fora dessa frase foi construído, o MVP passou do escopo.

---

## 2. Dentro e fora do MVP

### 2.1 Dentro

| Área | Entrega |
|---|---|
| Home | Resumo financeiro, grid de projetos, busca, filtro por status, empty state |
| Projeto | Criar, editar, excluir, finalizar, reabrir; página de detalhe com abas |
| Importação | Assistente de 4 passos com seleção de colunas por marcação e mapeamento de campos |
| Tarefas | Listar, criar, editar, concluir, excluir, filtrar |
| Financeiro | Regra dos 10 dias, contagem regressiva, marcar como recebido, painel de recebimentos |
| Sistema | Tema claro/escuro, responsividade completa, estados de carregamento/erro/vazio |

### 2.2 Fora — explicitamente adiado

OCR · CSV/XLSX · exportação · backup automático · notificações · recebimento parcelado · anexos · drag-and-drop de tarefas · gráficos · PWA · multiusuário.

Cada item acima tem fase definida no roadmap do PRD (seção 10). Nenhum deles entra na V1 sem renegociar prazo.

---

## 3. Stack

| Camada | Escolha | Justificativa |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | Front e back no mesmo projeto, um único deploy, Server Components para a home carregar rápido |
| Estilo | **Tailwind CSS + shadcn/ui** | Componentes acessíveis sobre Radix, tokens de tema controlados por CSS variables |
| Estado de servidor | **TanStack Query** | Atualização otimista para marcar tarefas, cache e revalidação |
| Formulários | **react-hook-form + Zod** | Validação compartilhada entre cliente e rotas de API |
| Banco | **PostgreSQL + Prisma** | Já rodando na VPS. Cascata nativa (RN-11), somas financeiras em uma consulta, e `JSONB` para as colunas dinâmicas do PDF |
| Extração de PDF | **pdfjs-dist** rodando em Web Worker no navegador | Processamento local, preview instantâneo, sem limite de upload no servidor, sem custo de CPU na VPS |
| Ícones | **lucide-react** | Já usado nos outros projetos, consistente |
| Datas | **date-fns** + `date-fns-tz` | Cálculo do prazo dos 10 dias com fuso `America/Sao_Paulo` |
| Deploy | **Docker + Nginx** na VPS existente | Mesmo padrão dos projetos atuais |

### 3.1 Por que a extração roda no navegador

O PDF nunca chega ao servidor. O `pdfjs-dist` extrai o texto com coordenadas dentro de um Web Worker, o algoritmo de colunas roda no cliente, o usuário vê o preview e faz as marcações — e só o **JSON já filtrado** das colunas escolhidas é enviado para a API. Isso elimina o limite de body do servidor, deixa o preview instantâneo e mantém o arquivo original fora do disco.

Consequência aceita: o arquivo original não fica guardado. O histórico de importação registra nome, tamanho e data, mas não permite reprocessar o mesmo PDF sem subi-lo de novo.

### 3.2 Por que PostgreSQL

Decisão fechada. Três motivos concretos, nesta ordem:

1. **Já está de pé na VPS.** O Postgres do Whats Master roda em Docker no mesmo servidor. O Fluxo só precisa de um banco novo dentro dele — nenhum container adicional, nenhuma RAM a mais num box de 8 GB que já roda Redis, Evolution API e workers.
2. **A cascata da RN-11 é do banco, não do código.** Apagar um projeto leva junto tarefas, importações e linhas por `ON DELETE CASCADE`. Sem isso, cada exclusão vira código manual e um esquecimento deixa lixo órfão.
3. **As somas financeiras são uma consulta.** "A receber", "recebido no mês" e "atrasado" saem de um `SUM` com `GROUP BY`, calculados no banco em vez de carregados na memória do Node.

O único ponto onde um banco de documentos ganharia — as colunas do PDF, que mudam a cada arquivo — está resolvido pelo tipo `Json` do Prisma sobre `JSONB`:

```prisma
model LinhaImportada {
  id           String      @id @default(uuid())
  projetoId    String
  importacaoId String
  numeroLinha  Int
  dados        Json        // { "ENDEREÇO": "Rua das Palmeiras, 120", "CEP": "04742-000" }
  tarefaId     String?     @unique
  projeto      Projeto     @relation(fields: [projetoId], references: [id], onDelete: Cascade)
  importacao   Importacao  @relation(fields: [importacaoId], references: [id], onDelete: Cascade)

  @@index([projetoId])
}
```

`JSONB` é indexável e consultável — a flexibilidade de documento fica disponível exatamente onde ela importa, sem abrir mão de integridade referencial no resto do modelo.

**Custo: zero.** PostgreSQL é open source e não tem versão paga. O que se paga é hospedagem, e a hospedagem já existe.

---

## 4. Arquitetura

```
┌──────────────────────── Navegador ────────────────────────┐
│                                                            │
│  UI (React Server + Client Components)                     │
│      │                                                     │
│      ├── Assistente de importação                          │
│      │        │                                            │
│      │        └── Web Worker ── pdfjs-dist                 │
│      │                 ├── extrair texto + coordenadas     │
│      │                 ├── agrupar em linhas (eixo Y)      │
│      │                 ├── detectar colunas (eixo X)       │
│      │                 └── devolver matriz + metadados     │
│      │                                                     │
│      └── TanStack Query ──► fetch /api/*                   │
└────────────────────────────┬───────────────────────────────┘
                             │  JSON (apenas colunas escolhidas)
┌────────────────────────────▼───────────────────────────────┐
│                  Next.js — Route Handlers                  │
│   /api/projetos · /api/tarefas · /api/importacoes          │
│   /api/recebimentos · /api/configuracoes                   │
│                          │                                 │
│                       Prisma                               │
└────────────────────────────┬───────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────┐
│         PostgreSQL — VPS 187.124.242.118 (Docker)          │
│         banco `fluxo`, volume persistente + pg_dump        │
└────────────────────────────────────────────────────────────┘
```

### 4.1 Estrutura de pastas

```
fluxo/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 tema, fontes, providers
│   │   ├── page.tsx                   HOME — resumo + grid de projetos
│   │   ├── projetos/[id]/page.tsx     detalhe com abas
│   │   ├── recebimentos/page.tsx      painel financeiro
│   │   ├── configuracoes/page.tsx
│   │   └── api/
│   │       ├── projetos/route.ts              GET, POST
│   │       ├── projetos/[id]/route.ts         GET, PATCH, DELETE
│   │       ├── projetos/[id]/finalizar/route.ts   POST — aplica RN-01
│   │       ├── projetos/[id]/receber/route.ts     POST — aplica RN-04
│   │       ├── projetos/[id]/reabrir/route.ts     POST — aplica RN-05
│   │       ├── projetos/[id]/importacoes/route.ts POST — grava importação
│   │       ├── tarefas/[id]/route.ts          PATCH, DELETE
│   │       └── configuracoes/route.ts         GET, PATCH
│   ├── components/
│   │   ├── ui/                        shadcn (button, dialog, checkbox, ...)
│   │   ├── projeto/                   card, formulário, badge de status
│   │   ├── importacao/                wizard e seus 4 passos
│   │   ├── tarefa/                    item, lista, filtros
│   │   └── financeiro/                resumo, contagem regressiva
│   ├── lib/
│   │   ├── pdf/
│   │   │   ├── worker.ts              entrada do Web Worker
│   │   │   ├── extrair.ts             pdfjs → fragmentos com x, y, texto
│   │   │   ├── linhas.ts              agrupamento vertical
│   │   │   ├── colunas.ts             detecção de colunas
│   │   │   └── cabecalho.ts           heurística de cabeçalho
│   │   ├── dinheiro.ts                centavos ↔ BRL
│   │   ├── prazo.ts                   regra dos 10 dias, status derivado
│   │   ├── prisma.ts
│   │   └── validadores.ts             schemas Zod
│   └── styles/globals.css             tokens de tema
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 5. O algoritmo de extração — a parte que pode dar errado

Este é o maior risco técnico do projeto. Detalhado aqui para não ser improvisado na implementação.

### Passo 1 — Fragmentos

`pdfjs-dist` devolve, por página, itens com `str`, `transform` (matriz de posição), `width` e `height`. Extrai-se de cada item: `texto`, `x` (transform[4]), `y` (transform[5]), `largura`, `altura`.

### Passo 2 — Agrupar em linhas (eixo Y)

```
ordenar fragmentos por y decrescente
tolerancia = mediana(altura dos fragmentos) * 0.5
para cada fragmento:
    se |y - y_da_linha_atual| <= tolerancia:
        adicionar à linha atual
    senão:
        fechar linha atual, abrir nova
ordenar os fragmentos de cada linha por x crescente
```

### Passo 3 — Detectar colunas (eixo X)

```
coletar todos os x de início de fragmento de todas as linhas
ordenar
percorrer a lista procurando "vãos": diferenças maiores que
    limiar = max(8pt, largura_media_do_caractere * 2)
cada vão marca a fronteira entre duas colunas
para cada coluna resultante:
    x_inicio = menor x do agrupamento
    x_fim    = maior (x + largura) do agrupamento
    confianca = (linhas que têm conteúdo nessa coluna) / (total de linhas)
descartar colunas com confianca < 0.15   → provável ruído
```

Um fragmento pertence à coluna cujo intervalo `[x_inicio, x_fim]` contém o centro do fragmento. Fragmentos que caem em duas colunas vão para a de maior sobreposição.

### Passo 4 — Encontrar o cabeçalho

Heurística, nesta ordem:

1. Primeira linha que preenche ao menos 70% das colunas detectadas
2. E cujas células não são majoritariamente numéricas
3. E cujo conteúdo não se repete em nenhuma linha posterior

Se nenhuma linha atender, usa a linha 1 e sinaliza confiança baixa. **O usuário sempre pode clicar em outra linha do preview e defini-la como cabeçalho** — este é o escape hatch obrigatório.

### Passo 5 — Limpeza

- Descartar linhas totalmente vazias
- Descartar linhas idênticas ao cabeçalho (repetição entre páginas)
- Descartar rodapés: linhas que aparecem na mesma posição Y em mais de 60% das páginas
- Aparar espaços em branco de cada célula

### Passo 6 — Detecção de PDF sem texto

Se o total de fragmentos de texto for menor que 10 em um documento com uma ou mais páginas, o PDF é tratado como digitalizado: o assistente para no passo 2 com mensagem explícita e oferece criar tarefas manualmente.

### Casos de teste obrigatórios

| # | Cenário | Resultado esperado |
|---|---|---|
| T1 | PDF com tabela limpa, cabeçalho na primeira linha, 1 página | Todas as colunas detectadas, cabeçalho correto |
| T2 | Tabela com 5+ páginas e cabeçalho repetido | Cabeçalho aparece uma vez, repetições descartadas |
| T3 | Coluna com células vazias em metade das linhas | Coluna detectada, células vazias preservadas como string vazia |
| T4 | Célula com texto que quebra em duas linhas | Não gera linha extra, ou o usuário consegue remover no preview |
| T5 | PDF digitalizado (imagem) | Mensagem clara, sem tela de erro genérica |
| T6 | PDF sem tabela (texto corrido) | Fallback para lista de coluna única |
| T7 | Documento com 200 páginas | Processa em menos de 30 s com barra de progresso |
| T8 | Valores monetários com R$, ponto e vírgula | Texto preservado literalmente, sem conversão automática |

---

## 6. Contratos de API

| Método | Rota | Corpo / Retorno |
|---|---|---|
| `GET` | `/api/projetos?status=&busca=&ordem=` | Lista de projetos com contagem de tarefas e status de recebimento derivado |
| `POST` | `/api/projetos` | `{ nome, cliente?, descricao?, cor?, dataInicio, dataFimPrevista, valorCentavos }` |
| `GET` | `/api/projetos/:id` | Projeto + tarefas + importações |
| `PATCH` | `/api/projetos/:id` | Campos parciais |
| `DELETE` | `/api/projetos/:id` | Cascata (RN-11) |
| `POST` | `/api/projetos/:id/finalizar` | `{ concluidoEm? }` → aplica RN-01, devolve `recebimentoPrevistoPara` |
| `POST` | `/api/projetos/:id/receber` | `{ recebidoEm?, valorRecebidoCentavos? }` → aplica RN-04 |
| `POST` | `/api/projetos/:id/reabrir` | Aplica RN-05, recusa se já recebido (RN-06) |
| `POST` | `/api/projetos/:id/importacoes` | `{ nomeArquivo, tamanhoBytes, totalPaginas, colunasDetectadas, colunasEscolhidas, mapeamento, linhaCabecalho, linhas: [...] }` → cria importação, linhas e tarefas em uma transação |
| `DELETE` | `/api/importacoes/:id` | Aplica RN-13 |
| `POST` | `/api/projetos/:id/tarefas` | `{ titulo, observacoes?, prazo? }` |
| `PATCH` | `/api/tarefas/:id` | `{ titulo?, status?, prazo?, observacoes? }` |
| `DELETE` | `/api/tarefas/:id` | — |
| `GET` | `/api/recebimentos` | Projetos finalizados não recebidos, ordenados por urgência, com totais |
| `GET/PATCH` | `/api/configuracoes` | `{ janelaRecebimentoDias, moeda, tema }` |

**Regra transversal:** o `statusRecebimento` nunca é gravado como `atrasado`. Ele é derivado na leitura comparando `recebimentoPrevistoPara` com o dia atual (RN-03), o que dispensa cron e evita estado defasado.

---

## 7. Plano de execução

### Sprint 1 — Fundação

- [ ] Criar projeto Next.js 14 com TypeScript, Tailwind, ESLint
- [ ] Instalar e configurar shadcn/ui
- [ ] Aplicar os tokens de tema do DESIGN.md em `globals.css`
- [ ] Configurar fontes (Bricolage Grotesque, Inter, JetBrains Mono)
- [ ] Subir Postgres local em Docker e configurar `DATABASE_URL`
- [ ] Modelar `schema.prisma` conforme a seção 6 do PRD, com `provider = "postgresql"`, `onDelete: Cascade` nas relações e `Json` em `LinhaImportada.dados`
- [ ] Rodar primeira migração e criar seed com 3 projetos de exemplo
- [ ] Criar banco e usuário `fluxo` no Postgres da VPS
- [ ] Montar shell da aplicação: sidebar no desktop, barra inferior no mobile
- [ ] Implementar alternância de tema com persistência
- [ ] Dockerfile e docker-compose funcionando localmente

**Pronto quando:** o app sobe, tem navegação, tema funcional e banco migrado.

### Sprint 2 — Projetos e home

- [ ] `lib/dinheiro.ts` — conversão centavos ↔ BRL com testes
- [ ] `lib/prazo.ts` — cálculo dos 10 dias e derivação de status, com testes
- [ ] Rotas de API de projetos (CRUD completo)
- [ ] Componente `CardProjeto` com progresso, valor, datas e badge de status
- [ ] Home: grid responsivo, busca, filtro por status, ordenação
- [ ] Barra de resumo financeiro
- [ ] Modal de novo projeto com validação Zod
- [ ] Edição e exclusão com confirmação por digitação do nome
- [ ] Empty state da home
- [ ] Skeletons de carregamento

**Pronto quando:** dá para criar, listar, filtrar, editar e excluir projetos pelo navegador e pelo celular.

### Sprint 3 — Importação de PDF

- [ ] Web Worker com `pdfjs-dist` configurado no Next.js
- [ ] `extrair.ts` — fragmentos com coordenadas
- [ ] `linhas.ts` — agrupamento vertical
- [ ] `colunas.ts` — detecção por vãos horizontais + confiança
- [ ] `cabecalho.ts` — heurística e ajuste manual
- [ ] Limpeza: linhas vazias, cabeçalhos repetidos, rodapés
- [ ] Detecção de PDF sem camada de texto
- [ ] Passo 1 — dropzone com validação e barra de progresso
- [ ] Passo 2 — preview da tabela com seleção manual da linha de cabeçalho
- [ ] Passo 3 — **seleção de colunas por marcação**, com amostra de valores, renomear e marcar/desmarcar tudo
- [ ] Passo 3 — mapeamento: título (obrigatório), prazo, observações
- [ ] Passo 4 — resumo e confirmação
- [ ] Rota `POST /api/projetos/:id/importacoes` em transação
- [ ] Aba "Dados importados" com tabela consultável
- [ ] Todos os 8 casos de teste da seção 5

**Pronto quando:** um PDF real vira tarefas com apenas as colunas marcadas.

### Sprint 4 — Tarefas e detalhe do projeto

- [ ] Página de detalhe com abas Tarefas / Dados importados / Financeiro
- [ ] Lista de tarefas com filtro por status e busca
- [ ] Concluir tarefa com atualização otimista
- [ ] Criar, editar e excluir tarefa
- [ ] Ver dados da linha de origem dentro da tarefa
- [ ] Ações em lote (concluir e excluir selecionadas)
- [ ] Virtualização acima de 200 tarefas
- [ ] Progresso do projeto recalculado ao vivo

**Pronto quando:** dá para executar um projeto inteiro pelo celular.

### Sprint 5 — Financeiro e acabamento

- [ ] Ação "Finalizar projeto" com aviso de tarefas pendentes (RN-08)
- [ ] Cálculo e exibição da data-limite de recebimento
- [ ] Contagem regressiva com os três estados visuais (neutro, alerta, crítico)
- [ ] Marcar como recebido, com data
- [ ] Reabrir projeto com confirmação (RN-05, RN-06)
- [ ] Página de recebimentos ordenada por urgência
- [ ] Tela de configurações com janela de recebimento configurável
- [ ] Revisão de responsividade em 320 / 768 / 1024 / 1440 px
- [ ] Revisão de acessibilidade: foco visível, teclado no wizard, contraste
- [ ] Deploy na VPS com Nginx e Basic Auth

**Pronto quando:** a frase da seção 1 é verdadeira de ponta a ponta em produção.

---

## 8. Critérios de aceite

| # | Dado | Quando | Então |
|---|---|---|---|
| CA-01 | O app está publicado | Eu abro a URL | Vejo a home direto, sem nenhuma tela de login |
| CA-02 | Não existe nenhum projeto | Eu abro a home | Vejo um empty state que me convida a criar o primeiro projeto |
| CA-03 | Preencho nome, datas e valor | Clico em criar | O projeto aparece na home com status `planejado` e progresso 0% |
| CA-04 | Tenho um PDF de planilha com 9 colunas | Subo no assistente | Vejo o preview da tabela com as 9 colunas e o cabeçalho identificado |
| CA-05 | O cabeçalho foi identificado errado | Clico na linha correta do preview | As colunas passam a usar os nomes daquela linha |
| CA-06 | Estou no passo de seleção | Marco 4 das 9 colunas | O resumo indica 4 colunas e as outras 5 não serão importadas |
| CA-07 | Não escolhi a coluna de título | Tento avançar | O botão fica desabilitado com a explicação do que falta |
| CA-08 | Confirmo a importação de 142 linhas | A operação termina | O projeto tem 142 tarefas e a aba de dados mostra 142 linhas com 4 colunas |
| CA-09 | Subo um PDF digitalizado | O processamento termina | Recebo a mensagem de que o PDF é imagem, com a opção de criar tarefas manualmente |
| CA-10 | Tenho tarefas pendentes | Marco o projeto como finalizado | Sou avisado de quantas ficaram em aberto e preciso confirmar |
| CA-11 | Finalizo um projeto hoje | Volto à home | Vejo a data-limite de recebimento em 10 dias e a contagem regressiva |
| CA-12 | Faltam 2 dias para o limite | Abro a home | O projeto aparece em estado de alerta |
| CA-13 | O limite passou e não recebi | Abro a home | O projeto aparece em estado crítico com os dias de atraso |
| CA-14 | Marco um projeto como recebido | Volto à home | O valor sai de "a receber" e entra em "recebido no mês" |
| CA-15 | Tento reabrir um projeto já recebido | Clico em reabrir | A ação é recusada com explicação |
| CA-16 | Estou num celular de 375 px | Navego por todas as telas | Todas as funções estão acessíveis, sem rolagem horizontal |
| CA-17 | Marco uma tarefa como concluída | A rede está lenta | A interface responde imediatamente e reconcilia depois |
| CA-18 | Recarrego o navegador | Volto ao app | Nenhum dado foi perdido |

---

## 9. Setup e deploy

### Desenvolvimento

Subir um Postgres local para desenvolver (não usar o banco de produção):

```bash
docker run -d --name fluxo-db -e POSTGRES_PASSWORD=fluxo -e POSTGRES_DB=fluxo -p 5433:5432 -v fluxo_pgdata:/var/lib/postgresql/data postgres:16-alpine
```

```bash
npm install
```

```bash
npx prisma migrate dev --name inicial
```

```bash
npm run dev
```

### Variáveis de ambiente

```
DATABASE_URL="postgresql://fluxo:fluxo@localhost:5433/fluxo?schema=public"
TZ="America/Sao_Paulo"
NEXT_PUBLIC_APP_NAME="Fluxo"
```

Em produção, a mesma variável aponta para o Postgres da VPS:

```
DATABASE_URL="postgresql://fluxo:<senha>@postgres:5432/fluxo?schema=public"
```

### Preparar o banco na VPS

O Postgres já roda em Docker no servidor. Basta criar o banco e o usuário do Fluxo dentro dele:

```bash
docker exec -it <container_postgres> psql -U postgres -c "CREATE USER fluxo WITH PASSWORD '<senha>'; CREATE DATABASE fluxo OWNER fluxo;"
```

Aplicar as migrações na primeira subida:

```bash
npx prisma migrate deploy
```

### Deploy na VPS

Build da imagem, o container do app na mesma rede Docker do Postgres existente, Nginx como proxy reverso na porta 3002.

**Pré-requisito de segurança (RNF-04a):** como o app não tem login, o acesso precisa ser fechado na entrada. Recomendação mínima no Nginx:

```nginx
location / {
    auth_basic "Fluxo";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://127.0.0.1:3002;
}
```

Sem isso, qualquer pessoa que descobrir a URL vê e edita valores, clientes e prazos de recebimento.

### Backup

Dump diário do banco, via cron às 03:00:

```bash
docker exec <container_postgres> pg_dump -U fluxo -d fluxo | gzip > /var/backups/fluxo-$(date +%F).sql.gz
```

Restauração:

```bash
gunzip -c /var/backups/fluxo-2026-09-03.sql.gz | docker exec -i <container_postgres> psql -U fluxo -d fluxo
```

Manter os últimos 14 dumps. O volume do Postgres já é persistente, mas volume não é backup — o dump protege contra erro de operação, não só contra perda de disco.

---

## 10. Riscos técnicos e planos B

| Risco | Sinal de alerta | Plano B |
|---|---|---|
| Detecção de colunas erra em PDFs reais | Taxa de acerto abaixo de 70% nos testes com arquivos verdadeiros | Adicionar ajuste manual das fronteiras de coluna arrastando divisores sobre o preview |
| `pdfjs-dist` pesado no bundle | Home carrega lento | Carregamento dinâmico apenas na rota de importação |
| Web Worker travando com 200 páginas | Interface congela | Processar por lotes de páginas com relatório de progresso |
| Postgres compartilhado com o Whats Master competindo por recursos | Lentidão nos dois apps, memória da VPS no limite | Banco e usuário separados desde o início; se apertar, subir uma instância dedicada do Postgres em outra porta |
| Migração do Prisma falhar em produção | `migrate deploy` interrompido no deploy | Dump antes de todo deploy, migração aplicada antes de trocar o container do app |
| Escopo crescer durante os sprints | Tarefas fora da seção 2.1 entrando no sprint | Toda adição vira item de roadmap, não item de sprint |

---

## 11. Definição de pronto (por entrega)

Uma tarefa só é considerada concluída quando:

1. Funciona em 375 px e em 1440 px
2. Tem estado de carregamento, de erro e de vazio
3. Respeita os tokens do DESIGN.md — nenhuma cor ou espaçamento improvisado
4. É navegável por teclado, com foco visível
5. As regras de negócio envolvidas estão cobertas por teste unitário (`prazo.ts`, `dinheiro.ts`, extração de PDF)
6. Nenhum erro ou aviso novo no console
