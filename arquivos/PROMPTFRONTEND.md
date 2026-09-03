# Prompt técnico — Fluxo · Fase 1 (Frontend)

> Copie tudo a partir da linha abaixo e entregue para a IA que vai construir o projeto.

---

# TAREFA

Construa o **frontend completo e navegável** de um web app chamado **Fluxo**, usando Next.js 14 e TypeScript. Esta é a Fase 1 do projeto: **apenas frontend**, com camada de dados simulada. O backend será feito depois, em uma segunda fase, e a arquitetura desta fase precisa permitir a troca sem reescrita.

Ao final, eu preciso conseguir rodar `npm run dev`, abrir o navegador e **navegar por todas as telas com dados realistas**, criar projetos, importar um PDF de verdade, marcar tarefas e ver a regra financeira funcionando — tudo sem backend.

---

## 1. O QUE É O PRODUTO

O Fluxo é um workspace pessoal, de **usuário único**, para gerenciar projetos de trabalho. O ciclo é:

1. Crio um projeto com nome, cliente, data de início, data de fim prevista e valor
2. Importo um **PDF que contém uma planilha** (tabela com várias colunas). O app extrai a tabela, me mostra as colunas detectadas, e **eu marco quais colunas quero importar**
3. Cada linha importada vira uma **tarefa** do projeto
4. Executo as tarefas, marcando como concluídas
5. Marco o projeto como **finalizado** → o app calcula automaticamente que tenho **10 dias corridos para receber o valor** e passa a mostrar essa contagem regressiva
6. Quando o dinheiro entra, marco como **recebido**

**Não existe tela de login, cadastro ou autenticação.** É um app de uma pessoa só. Ao abrir a URL, a tela inicial aparece direto.

---

## 2. REGRAS INVIOLÁVEIS DESTA FASE

| ✅ Fazer | ❌ Não fazer |
|---|---|
| Camada de dados simulada com `localStorage` | Criar rotas de API, servidor, banco de dados ou Prisma |
| Interface 100% funcional e navegável | Deixar botão que não faz nada ou tela "em breve" |
| Extração de PDF **real**, no navegador | Simular a extração com dados falsos |
| Todo texto da interface em **português do Brasil** | Textos em inglês na interface |
| Dados de exemplo realistas brasileiros | Lorem ipsum, "Projeto 1", "Cliente A", "test@test.com" |
| Interface responsiva de 320 px a 2560 px | Layout que só funciona no desktop |
| Tema escuro como padrão, com alternância para claro | Só um tema |

**Importante:** não invente funcionalidades que não estão neste documento. Se algo estiver ambíguo, escolha a opção mais simples e siga em frente.

---

## 3. STACK OBRIGATÓRIA

```
Next.js 14.2.x        App Router (não usar Pages Router)
React 18.3
TypeScript 5.x        strict: true
Tailwind CSS 3.4      com tokens em CSS variables
shadcn/ui             componentes base (Radix por baixo)
lucide-react          ícones
@tanstack/react-query v5
react-hook-form + zod validação de formulários
date-fns 3.x          manipulação de datas
pdfjs-dist 4.x        extração de PDF no navegador
```

Não adicionar bibliotecas fora desta lista sem necessidade real. Nada de Redux, Zustand, Framer Motion, styled-components ou biblioteca de gráficos.

### Por que TanStack Query mesmo sem backend

Toda leitura e escrita de dados passa por `useQuery` / `useMutation` chamando funções do repositório simulado. Assim, na Fase 2, trocar `localStorage` por `fetch` acontece em **um arquivo só**, sem tocar em nenhum componente. Isso é obrigatório, não opcional.

---

## 4. ESTRUTURA DE PASTAS

```
fluxo/
├── public/
│   └── pdf.worker.min.mjs          copiado de pdfjs-dist no postinstall
├── src/
│   ├── app/
│   │   ├── layout.tsx              html, fontes, providers, tema
│   │   ├── globals.css             tokens de design
│   │   ├── page.tsx                HOME
│   │   ├── not-found.tsx
│   │   ├── projetos/
│   │   │   └── [id]/
│   │   │       ├── page.tsx        detalhe com abas
│   │   │       └── importar/
│   │   │           └── page.tsx    assistente de importação
│   │   ├── recebimentos/
│   │   │   └── page.tsx
│   │   └── configuracoes/
│   │       └── page.tsx
│   ├── componentes/
│   │   ├── ui/                     shadcn: button, input, dialog, checkbox,
│   │   │                           select, tabs, badge, progress, sheet,
│   │   │                           dropdown-menu, toast, skeleton, tooltip
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        sidebar desktop + barra inferior mobile
│   │   │   ├── BarraLateral.tsx
│   │   │   ├── BarraInferior.tsx
│   │   │   └── AlternadorTema.tsx
│   │   ├── projeto/
│   │   │   ├── CardProjeto.tsx
│   │   │   ├── GridProjetos.tsx
│   │   │   ├── FormularioProjeto.tsx
│   │   │   ├── BadgeStatus.tsx
│   │   │   ├── PilulaPrazo.tsx
│   │   │   ├── BarraProgresso.tsx
│   │   │   └── DialogoExcluirProjeto.tsx
│   │   ├── tarefa/
│   │   │   ├── ListaTarefas.tsx
│   │   │   ├── ItemTarefa.tsx
│   │   │   ├── FiltrosTarefa.tsx
│   │   │   └── FormularioTarefa.tsx
│   │   ├── importacao/
│   │   │   ├── Assistente.tsx      orquestra os 4 passos
│   │   │   ├── PassoUpload.tsx
│   │   │   ├── PassoTabela.tsx
│   │   │   ├── PassoColunas.tsx    ← tela mais importante do app
│   │   │   ├── PassoConfirmar.tsx
│   │   │   ├── CartaoColuna.tsx
│   │   │   └── IndicadorPassos.tsx
│   │   ├── financeiro/
│   │   │   ├── ResumoFinanceiro.tsx
│   │   │   ├── ContagemRegressiva.tsx
│   │   │   └── LinhaRecebimento.tsx
│   │   └── comum/
│   │       ├── EstadoVazio.tsx
│   │       ├── EsqueletoCard.tsx
│   │       └── CabecalhoPagina.tsx
│   ├── lib/
│   │   ├── dados/
│   │   │   ├── tipos.ts            todos os tipos TypeScript
│   │   │   ├── repositorio.ts      INTERFACE — contrato de dados
│   │   │   ├── repositorioLocal.ts IMPLEMENTAÇÃO com localStorage
│   │   │   ├── seed.ts             dados iniciais de exemplo
│   │   │   └── hooks.ts            hooks TanStack Query
│   │   ├── pdf/
│   │   │   ├── extrair.ts          pdfjs → fragmentos com coordenadas
│   │   │   ├── linhas.ts           agrupamento vertical
│   │   │   ├── colunas.ts          detecção de colunas
│   │   │   ├── cabecalho.ts        heurística de cabeçalho
│   │   │   ├── limpeza.ts          remoção de ruído
│   │   │   └── processar.ts        orquestra tudo, expõe uma função só
│   │   ├── dinheiro.ts
│   │   ├── prazo.ts
│   │   ├── datas.ts
│   │   └── utils.ts                cn() do shadcn
│   └── tipos/
│       └── index.ts                re-export
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

Use nomes de arquivos e pastas **em português**, como acima. Componentes em PascalCase, funções e arquivos utilitários em camelCase.

---

## 5. DESIGN SYSTEM

### 5.1 Direção visual

**Painel de controle noturno.** Tema escuro por padrão. Superfícies neutras, cor só onde há significado. Números grandes e monoespaçados são o elemento visual dominante — a home começa com um valor em dinheiro, não com um título.

Não usar: gradientes decorativos em cards, sombras pesadas, ilustrações, ícones coloridos, emoji na interface, mais de uma cor de destaque competindo.

### 5.2 Tokens — cole exatamente isto em `globals.css`

```css
:root {
  --fundo: #0A0B0F;
  --superficie: #121419;
  --superficie-2: #181B22;
  --superficie-3: #1F232B;
  --borda: #23262F;
  --borda-forte: #2E323C;
  --texto: #F2F4F8;
  --texto-2: #A0A6B4;
  --texto-3: #6E7482;
  --acento: #6A5AF0;
  --acento-claro: #8B7CFF;
  --acento-suave: rgba(106, 90, 240, 0.12);
  --sucesso: #34D399;
  --sucesso-suave: rgba(52, 211, 153, 0.12);
  --alerta: #FBBF24;
  --alerta-suave: rgba(251, 191, 36, 0.12);
  --perigo: #FF6B6B;
  --perigo-suave: rgba(255, 107, 107, 0.12);
  --info: #4DA3FF;

  --raio-p: 8px;
  --raio-m: 12px;
  --raio-g: 16px;
  --raio-xg: 24px;

  --sombra-1: 0 1px 2px rgba(0,0,0,0.28);
  --sombra-2: 0 4px 16px rgba(0,0,0,0.32);
  --sombra-3: 0 16px 48px rgba(0,0,0,0.44);
}

:root[data-tema="claro"] {
  --fundo: #FAFAFB;
  --superficie: #FFFFFF;
  --superficie-2: #F4F5F7;
  --superficie-3: #EDEFF3;
  --borda: #E3E5EA;
  --borda-forte: #CBD0D8;
  --texto: #12141A;
  --texto-2: #525A69;
  --texto-3: #7C8492;
  --acento: #5A48E8;
  --acento-claro: #5A48E8;
  --acento-suave: rgba(90, 72, 232, 0.10);
  --sucesso: #11875A;
  --sucesso-suave: rgba(17, 135, 90, 0.10);
  --alerta: #B45309;
  --alerta-suave: rgba(180, 83, 9, 0.10);
  --perigo: #C8302F;
  --perigo-suave: rgba(200, 48, 47, 0.10);
  --info: #1D6FD4;
}
```

Mapeie todos esses tokens no `tailwind.config.ts` (`colors.fundo`, `colors.superficie.2`, `colors.acento.claro`, etc.) e **use apenas eles**. Nenhuma cor literal (`#fff`, `bg-slate-800`, `text-gray-400`) em componente algum.

### 5.3 Tipografia

| Papel | Fonte | Carregar via |
|---|---|---|
| Títulos e display | **Bricolage Grotesque** | `next/font/google` |
| Corpo e interface | **Inter** | `next/font/google` |
| Números e dados | **JetBrains Mono** | `next/font/google` |

Crie uma classe utilitária `.numero` com `font-family: var(--fonte-mono); font-variant-numeric: tabular-nums;` e **aplique em todo valor monetário, data, contador e célula de tabela**. Sem isso as colunas de números não alinham.

Escala:

| Nome | Tamanho / Altura | Peso |
|---|---|---|
| display | `clamp(32px, 6vw, 48px)` / 1.05 | 600 |
| h1 | 32 / 38 | 600 |
| h2 | 24 / 30 | 600 |
| h3 | 18 / 26 | 600 |
| corpo | 15 / 24 | 400 |
| corpo-p | 13 / 20 | 400 |
| rotulo | 12 / 16, caixa alta, `letter-spacing: 0.04em` | 500 |
| numero-g | 28 / 32, mono | 600 |
| numero-m | 15 / 20, mono | 500 |

Títulos usam `letter-spacing: -0.02em`.

### 5.4 Espaçamento, raio e movimento

- Escala de 4 px: `4 8 12 16 20 24 32 40 56 72 96`. Nenhum valor fora dela.
- Padding de card: 20 px no mobile, 24 px no desktop
- Margem lateral da página: 16 / 24 / 40 px conforme a largura
- Raio: badges 8 px · botões e inputs 12 px · cards 16 px · modais 24 px · pílulas total
- Transições: 120 ms hover e foco · 200 ms abas e painéis · 320 ms modais
- Easing padrão: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Respeitar `prefers-reduced-motion: reduce` zerando durações

### 5.5 Cores por estado

| Estado | Cor | Aparência |
|---|---|---|
| Projeto planejado | `--texto-3` | Badge neutro com contorno |
| Projeto em andamento | `--acento-claro` | Badge com fundo `--acento-suave` |
| Projeto finalizado | `--info` | Badge azul |
| Projeto arquivado | `--texto-3` | Card com `opacity: 0.6` |
| Recebimento > 3 dias | `--texto-2` | Pílula neutra |
| Recebimento ≤ 3 dias | `--alerta` | Pílula âmbar com ícone de relógio |
| Recebimento atrasado | `--perigo` | Pílula vermelha + borda esquerda vermelha no card |
| Recebido | `--sucesso` | Pílula verde com ícone de confirmação |

**Nenhum estado pode ser comunicado só por cor** — sempre acompanhado de texto ou ícone.

---

## 6. TIPOS TYPESCRIPT

Crie exatamente estes tipos em `src/lib/dados/tipos.ts`:

```ts
export type StatusProjeto = 'planejado' | 'em_andamento' | 'finalizado' | 'arquivado';
export type StatusRecebimento = 'pendente' | 'a_receber' | 'recebido' | 'atrasado';
export type StatusTarefa = 'a_fazer' | 'em_andamento' | 'concluida';
export type CorProjeto = 'violeta' | 'azul' | 'verde' | 'ambar' | 'rosa' | 'ciano';

export interface Projeto {
  id: string;
  nome: string;
  cliente: string | null;
  descricao: string | null;
  cor: CorProjeto;
  status: StatusProjeto;
  dataInicio: string;                  // 'YYYY-MM-DD'
  dataFimPrevista: string;             // 'YYYY-MM-DD'
  concluidoEm: string | null;          // ISO 8601 completo
  valorCentavos: number;               // 1240000 = R$ 12.400,00
  recebimentoPrevistoPara: string | null; // 'YYYY-MM-DD'
  recebidoEm: string | null;           // 'YYYY-MM-DD'
  valorRecebidoCentavos: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProjetoComResumo extends Projeto {
  totalTarefas: number;
  tarefasConcluidas: number;
  progresso: number;                   // 0 a 100, inteiro
  statusRecebimento: StatusRecebimento; // DERIVADO, nunca armazenado
  diasAteRecebimento: number | null;    // negativo = atrasado
}

export interface Tarefa {
  id: string;
  projetoId: string;
  titulo: string;
  observacoes: string | null;
  status: StatusTarefa;
  prazo: string | null;                // 'YYYY-MM-DD'
  ordem: number;
  linhaOrigemId: string | null;
  concluidaEm: string | null;
  criadoEm: string;
}

export interface ColunaDetectada {
  indice: number;
  nome: string;
  xInicio: number;
  xFim: number;
  confianca: number;                   // 0 a 1
  amostras: string[];                  // 3 primeiros valores não vazios
}

export interface MapeamentoColunas {
  titulo: number;                      // índice obrigatório
  prazo: number | null;
  observacoes: number | null;
}

export interface Importacao {
  id: string;
  projetoId: string;
  nomeArquivo: string;
  tamanhoBytes: number;
  totalPaginas: number;
  colunasDetectadas: ColunaDetectada[];
  colunasEscolhidas: number[];
  mapeamento: MapeamentoColunas;
  linhaCabecalho: number;
  totalLinhas: number;
  criadoEm: string;
}

export interface LinhaImportada {
  id: string;
  importacaoId: string;
  projetoId: string;
  numeroLinha: number;
  dados: Record<string, string>;       // { "ENDEREÇO": "Rua das Palmeiras, 120" }
  tarefaId: string | null;
}

export interface Configuracao {
  janelaRecebimentoDias: number;       // padrão 10
  moeda: 'BRL';
  tema: 'sistema' | 'claro' | 'escuro';
}

export interface ResumoFinanceiro {
  aReceberCentavos: number;
  aReceberQuantidade: number;
  recebidoNoMesCentavos: number;
  recebidoNoMesQuantidade: number;
  atrasadoCentavos: number;
  atrasadoQuantidade: number;
  emExecucaoCentavos: number;
  emExecucaoQuantidade: number;
}
```

---

## 7. CAMADA DE DADOS SIMULADA

### 7.1 A interface do repositório

`src/lib/dados/repositorio.ts` define o **contrato**. Ele é idêntico ao que a API real vai expor na Fase 2 — por isso os nomes e assinaturas importam:

```ts
export interface Repositorio {
  // projetos
  listarProjetos(filtro?: {
    status?: StatusProjeto | 'todos';
    busca?: string;
    ordem?: 'recentes' | 'prazo' | 'valor' | 'progresso';
  }): Promise<ProjetoComResumo[]>;
  obterProjeto(id: string): Promise<ProjetoComResumo | null>;
  criarProjeto(dados: Omit<Projeto, 'id' | 'status' | 'concluidoEm' |
    'recebimentoPrevistoPara' | 'recebidoEm' | 'valorRecebidoCentavos' |
    'criadoEm' | 'atualizadoEm'>): Promise<Projeto>;
  atualizarProjeto(id: string, dados: Partial<Projeto>): Promise<Projeto>;
  excluirProjeto(id: string): Promise<void>;
  finalizarProjeto(id: string): Promise<Projeto>;
  reabrirProjeto(id: string): Promise<Projeto>;
  receberProjeto(id: string, recebidoEm: string): Promise<Projeto>;

  // tarefas
  listarTarefas(projetoId: string): Promise<Tarefa[]>;
  criarTarefa(projetoId: string, dados: { titulo: string; observacoes?: string; prazo?: string }): Promise<Tarefa>;
  atualizarTarefa(id: string, dados: Partial<Tarefa>): Promise<Tarefa>;
  excluirTarefa(id: string): Promise<void>;
  concluirTarefas(ids: string[]): Promise<void>;

  // importações
  listarImportacoes(projetoId: string): Promise<Importacao[]>;
  listarLinhas(projetoId: string): Promise<LinhaImportada[]>;
  criarImportacao(projetoId: string, payload: {
    nomeArquivo: string;
    tamanhoBytes: number;
    totalPaginas: number;
    colunasDetectadas: ColunaDetectada[];
    colunasEscolhidas: number[];
    mapeamento: MapeamentoColunas;
    linhaCabecalho: number;
    linhas: Record<string, string>[];
  }): Promise<{ importacao: Importacao; tarefasCriadas: number }>;
  excluirImportacao(id: string): Promise<void>;

  // financeiro e configuração
  obterResumoFinanceiro(): Promise<ResumoFinanceiro>;
  listarRecebimentos(): Promise<ProjetoComResumo[]>;
  obterConfiguracao(): Promise<Configuracao>;
  salvarConfiguracao(dados: Partial<Configuracao>): Promise<Configuracao>;
}
```

### 7.2 A implementação simulada

`repositorioLocal.ts` implementa essa interface guardando tudo em `localStorage`, sob a chave `fluxo:v1`.

Requisitos obrigatórios:

- **Atraso artificial de 200 ms a 400 ms em cada método**, para que os estados de carregamento sejam reais e visíveis
- Se `localStorage` estiver vazio, popular com o seed da seção 12
- `statusRecebimento` e `diasAteRecebimento` são **sempre calculados na leitura**, nunca gravados
- `criarImportacao` cria a importação, as linhas e as tarefas de forma consistente, e devolve quantas tarefas nasceram
- `excluirProjeto` remove em cascata: tarefas, importações e linhas do projeto
- Toda função devolve dados novos (imutabilidade), nunca referência ao estado interno

### 7.3 Os hooks

`hooks.ts` expõe hooks TanStack Query sobre o repositório:

```ts
useProjetos(filtro)         useProjeto(id)
useCriarProjeto()           useAtualizarProjeto()      useExcluirProjeto()
useFinalizarProjeto()       useReabrirProjeto()        useReceberProjeto()
useTarefas(projetoId)       useCriarTarefa()           useAtualizarTarefa()
useExcluirTarefa()          useConcluirTarefas()
useImportacoes(projetoId)   useLinhas(projetoId)       useCriarImportacao()
useResumoFinanceiro()       useRecebimentos()
useConfiguracao()           useSalvarConfiguracao()
```

**Nenhum componente importa `repositorioLocal` diretamente.** Todos usam esses hooks. Essa é a regra que permite trocar para a API real sem tocar na interface.

`useAtualizarTarefa` deve usar **atualização otimista**: a marca aparece instantaneamente e reverte se der erro.

---

## 8. REGRAS DE NEGÓCIO

### 8.1 `lib/dinheiro.ts`

```ts
formatarBRL(centavos: number): string      // 1240000 → "R$ 12.400,00"
formatarBRLCurto(centavos: number): string // 1240000 → "R$ 12,4 mil"
parsearBRL(texto: string): number          // "12.400,00" → 1240000
```

Valores são **sempre inteiros em centavos**. Nunca usar float para dinheiro em nenhum ponto do código.

### 8.2 `lib/prazo.ts` — a regra central do app

```ts
// concluidoEm + janelaDias (padrão 10) em DIAS CORRIDOS
calcularRecebimentoPrevisto(concluidoEm: Date, janelaDias: number): string

// negativo = atrasado, 0 = vence hoje
diasAte(dataISO: string): number

derivarStatusRecebimento(projeto: Projeto): StatusRecebimento
// 'recebido'  se recebidoEm !== null
// 'pendente'  se status !== 'finalizado'
// 'atrasado'  se hoje > recebimentoPrevistoPara
// 'a_receber' nos demais casos

nivelUrgencia(dias: number | null): 'neutro' | 'alerta' | 'critico'
// null ou > 3  → neutro
// 0 a 3        → alerta
// negativo     → critico
```

Comparações usam o **início do dia** no fuso `America/Sao_Paulo`. Duas datas do mesmo dia nunca podem dar diferença de 1 por causa de hora.

### 8.3 Transições de status

| Ação | Efeito |
|---|---|
| Finalizar projeto | `status = 'finalizado'`, `concluidoEm = agora`, `recebimentoPrevistoPara = hoje + 10 dias` |
| Finalizar com tarefas em aberto | Permitido, mas o diálogo avisa: "38 tarefas continuam em aberto. Finalizar mesmo assim?" |
| Reabrir projeto | Volta para `em_andamento`, limpa `concluidoEm` e `recebimentoPrevistoPara`. Exige confirmação |
| Reabrir projeto já recebido | **Bloqueado.** Mensagem: "Este projeto já foi recebido. Desfaça o recebimento antes de reabrir." |
| Marcar como recebido | `recebidoEm` = data escolhida (padrão hoje), `valorRecebidoCentavos = valorCentavos` |
| Excluir projeto | Confirmação exigindo **digitar o nome exato do projeto**. Remove tarefas, importações e linhas |

---

## 9. EXTRAÇÃO DE PDF — implementar de verdade

Esta é a parte mais importante e a mais difícil. Ela roda **inteiramente no navegador**, sem servidor.

### 9.1 Configuração do pdfjs no Next.js

Ponto que costuma quebrar. Faça exatamente assim:

1. Instalar `pdfjs-dist@^4`
2. Copiar o worker para `public/` num script de `postinstall`:
   `cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/`
3. Importar de `pdfjs-dist/legacy/build/pdf.mjs`
4. Definir `GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'`
5. Importar o módulo **dinamicamente** (`await import(...)`) dentro do componente cliente, nunca no topo do arquivo, e nunca em Server Component

### 9.2 Algoritmo

**Passo 1 — fragmentos.** Para cada página, `getTextContent()` devolve itens. Extraia de cada um: `texto` (`item.str`), `x` (`item.transform[4]`), `y` (`item.transform[5]`), `largura` (`item.width`), `altura` (`item.height`), e o número da página.

**Passo 2 — agrupar em linhas (eixo Y).**

```
ordenar fragmentos por página, depois por y decrescente
tolerancia = mediana(altura dos fragmentos) * 0.5
para cada fragmento:
    se |y - y_da_linha_atual| <= tolerancia → mesma linha
    senão → fecha a linha e abre outra
ordenar os fragmentos de cada linha por x crescente
```

**Passo 3 — detectar colunas (eixo X).**

```
coletar o x inicial de todos os fragmentos de todas as linhas
ordenar crescente
percorrer procurando "vãos": diferenças maiores que
    limiar = max(8, largura_media_do_caractere * 2)
cada vão é a fronteira entre duas colunas
para cada coluna:
    xInicio   = menor x do grupo
    xFim      = maior (x + largura) do grupo
    confianca = linhas com conteúdo nessa coluna / total de linhas
descartar colunas com confianca < 0.15   (ruído)
```

Um fragmento pertence à coluna cujo intervalo `[xInicio, xFim]` contém o **centro** do fragmento. Se cair em duas, vence a de maior sobreposição.

**Passo 4 — encontrar o cabeçalho.** Primeira linha que, nesta ordem:

1. preenche ao menos 70% das colunas detectadas, **e**
2. tem células majoritariamente não numéricas, **e**
3. não se repete idêntica em nenhuma linha posterior

Se nenhuma linha atender, usar a linha 1 e marcar confiança baixa. **O usuário sempre pode clicar em outra linha do preview para defini-la como cabeçalho** — isso é obrigatório, é a rede de segurança do recurso.

**Passo 5 — limpeza.**

- Descartar linhas totalmente vazias
- Descartar linhas idênticas ao cabeçalho (repetição entre páginas)
- Descartar rodapés: linhas que aparecem na mesma faixa de Y em mais de 60% das páginas
- Aparar espaços de cada célula

**Passo 6 — PDF sem texto.** Se o total de fragmentos for menor que 10, tratar como PDF digitalizado: parar o assistente com a mensagem *"Este PDF é uma imagem digitalizada e não tem texto para extrair."* e oferecer o botão "Criar tarefas manualmente".

### 9.3 Interface do módulo

```ts
export interface ResultadoProcessamento {
  linhas: string[][];              // matriz bruta, incluindo o cabeçalho
  colunas: ColunaDetectada[];
  linhaCabecalho: number;
  totalPaginas: number;
  temCamadaTexto: boolean;
}

export async function processarPdf(
  arquivo: File,
  aoProgredir: (pagina: number, total: number) => void
): Promise<ResultadoProcessamento>;
```

O callback de progresso é obrigatório: a interface mostra "Lendo página 12 de 84", nunca um spinner indefinido.

**Limites:** 20 MB e 200 páginas. Acima disso, bloquear com mensagem informando o tamanho do arquivo e o limite.

---

## 10. AS TELAS

### 10.1 Home — `/`

Layout desktop:

```
┌────────────┬──────────────────────────────────────────────────────────────┐
│            │  Boa tarde                            [ buscar projeto...  ] │
│  FLUXO     │  quarta, 3 de setembro                                       │
│            │                                                              │
│  ▸ Início  │  ┌──────────────────────┬─────────────┬─────────────┐        │
│  ▸ Receb.  │  │ A RECEBER            │ RECEBIDO    │ ATRASADO    │        │
│  ▸ Config. │  │ R$ 48.900,00         │ EM SETEMBRO │             │        │
│            │  │ 4 projetos           │ R$ 22.100   │ R$ 6.400    │        │
│            │  └──────────────────────┴─────────────┴─────────────┘        │
│            │                                                              │
│            │  Projetos                                                    │
│            │  [ todos ][ em andamento ][ finalizados ][ arquivados ]  ⊞ ☰ │
│            │                                                              │
│            │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│            │  │  card       │ │  card       │ │  card       │             │
│  [+ Novo]  │  └─────────────┘ └─────────────┘ └─────────────┘             │
│  ☾ tema    │                                                              │
└────────────┴──────────────────────────────────────────────────────────────┘
```

Detalhes obrigatórios:

- A saudação muda com a hora: "Bom dia" até 12h, "Boa tarde" até 18h, "Boa noite" depois
- A data por extenso em português: "quarta, 3 de setembro"
- **"A RECEBER" é o maior elemento da tela**: valor em `display`, mono tabular. Os outros dois são visualmente secundários
- Se não houver nada atrasado, o bloco "ATRASADO" fica com `opacity: 0.5`; se houver, ganha borda em `--perigo`
- Fundo da área de resumo: gradiente radial de `--acento` a 6% de opacidade saindo do canto superior esquerdo. **É o único ornamento do app inteiro**
- Busca filtra por nome e por cliente, com debounce de 250 ms
- Filtros de status e alternância grid/tabela
- Ordenação: recentes, prazo, valor, progresso

Layout mobile (< 768 px): cabeçalho compacto, resumo em coluna única com só "A RECEBER" em destaque, filtros em rolagem horizontal, cards empilhados, barra de navegação inferior fixa com 3 destinos e botão circular central de "Novo projeto" elevado.

### 10.2 Card de projeto

```
┌─────────────────────────────────────────────┐
│ ▌ Levantamento Zona Sul        [em andamento]│
│   Construtora Vega                           │
│                                              │
│   R$ 12.400,00                               │
│                                              │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  68%   82/120 tarefas │
│                                              │
│   12/08 → 30/09          ◐ recebe em 2 dias  │
└─────────────────────────────────────────────┘
```

- Faixa vertical de 3 px na esquerda, na cor do projeto
- Hover: fundo sobe para `--superficie-2`, translação de −2 px, 120 ms
- Atrasado: borda esquerda inteira em `--perigo`
- Recebido: valor em `--sucesso` com ícone de confirmação
- O card inteiro é um link para `/projetos/[id]`

### 10.3 Detalhe do projeto — `/projetos/[id]`

Cabeçalho com nome, cliente, badge de status, valor em `numero-g`, datas, barra de progresso, e as ações principais: **"Importar planilha PDF"** e **"Finalizar projeto"**. Menu `⋯` com editar, arquivar e excluir.

Três abas, controladas por query param (`?aba=tarefas`) para que o link seja compartilhável:

**Aba Tarefas** — busca, filtros (todas / a fazer / concluídas), contador `82/120`, lista de tarefas com checkbox grande. Marcar concluída: a marca desenha em 120 ms, o texto ganha risco e cai para `--texto-3`, e o item desliza para o fim da lista após 400 ms se o filtro for "a fazer". Seleção múltipla com ações em lote. Botão de nova tarefa manual. Virtualizar acima de 200 itens.

**Aba Dados importados** — tabela com as colunas escolhidas na importação, cabeçalho fixo, linhas de 44 px, listras sutis. Abaixo de 768 px vira lista de cards empilhados. Mostra o histórico de importações com opção de descartar.

**Aba Financeiro** — valor do projeto, datas, e o bloco de recebimento. Se finalizado: contagem regressiva grande, data-limite, e botão "Marcar como recebido". Se recebido: data e valor em verde.

Depois de finalizado, o cabeçalho troca os dois botões de ação pelo bloco de recebimento com a contagem já visível.

### 10.4 Assistente de importação — `/projetos/[id]/importar`

Rota própria, tela cheia no mobile. Indicador de 4 passos no topo, clicável para voltar mas nunca para pular adiante.

**Passo 1 — Upload**

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│              ┌─────────┐              │
                │  PDF  │
│              └─────────┘              │
│      Arraste a planilha em PDF aqui   │
          ou clique para escolher
│    até 20 MB · até 200 páginas        │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

Borda tracejada de 2 px, mínimo de 220 px de altura. Ao arrastar por cima: borda e ícone em `--acento`, fundo `--acento-suave`, escala 1.01. Arquivo inválido: borda em `--perigo` com mensagem inline por 3 segundos. Durante o processamento, barra de progresso real com "Lendo página X de Y".

**Passo 2 — Conferir a tabela**

Preview das 20 primeiras linhas em tabela com rolagem horizontal. A linha detectada como cabeçalho fica destacada em `--acento-suave`. Acima da tabela: *"Se a linha destacada não for o cabeçalho, clique na linha correta."* Toda linha é clicável, com hover visível.

**Passo 3 — Escolher as colunas** ← a tela mais importante

```
│  Quais colunas você quer importar?                               │
│  Marque as que interessam. As demais serão ignoradas.            │
│                                        [ marcar todas ]          │
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐           │
│  │ ☑ ENDEREÇO ✎  │ │ ☑ BAIRRO   ✎  │ │ ☐ CEP         │           │
│  │ Rua das Pal…  │ │ Santo Amaro   │ │ 04742-000     │           │
│  │ Av. Brasil,…  │ │ Campo Belo    │ │ 04609-002     │           │
│  │ Travessa do…  │ │ Brooklin      │ │ 04571-010     │           │
│  │ ●●● [TÍTULO]  │ │ ●●●           │ │ ●●●           │           │
│  └───────────────┘ └───────────────┘ └───────────────┘           │
│                                                                  │
│  O título da tarefa virá de:  [ ENDEREÇO ▾ ]                     │
│  Prazo (opcional):            [ PRAZO ▾ ]                        │
│  Observações (opcional):      [ nenhuma ▾ ]                      │
│                                                                  │
│  3 de 9 colunas marcadas · 142 linhas                            │
│                            [ Voltar ]  [ Continuar → ]           │
```

Regras do `CartaoColuna`:

- **O cartão inteiro é clicável** para marcar e desmarcar, não só o checkbox
- Não marcado: borda `--borda`, fundo `--superficie`. Marcado: borda `--acento`, fundo `--acento-suave`, preenchendo em 120 ms
- Mostra 3 valores reais da coluna, truncados com reticências
- Confiança em 3 pontos: `●●●` alta (> 0.8), `●●○` média (0.5–0.8), `●○○` baixa (< 0.5)
- Ícone de lápis torna o nome da coluna editável
- A coluna mapeada como título recebe a pílula `[TÍTULO]` e **não pode ser desmarcada**
- Grid: 3 colunas no desktop, 2 no tablet, 1 no mobile
- Rodapé com o contador é fixo e sempre visível
- "Continuar" desabilitado enquanto não houver coluna de título, **com o motivo escrito ao lado do botão**
- No mobile, o bloco de mapeamento vira uma folha inferior acionada por "Definir campos"

**Passo 4 — Confirmar**

Resumo: `142 linhas · 4 colunas · 142 tarefas serão criadas`, com amostra das 5 primeiras tarefas como vão ficar. Botão "Importar". Ao confirmar, redireciona para `/projetos/[id]?aba=tarefas` com toast de confirmação.

### 10.5 Recebimentos — `/recebimentos`

Totais no topo. Abaixo, grupos nesta ordem: **Atrasado** · **Vence esta semana** · **Próximos** · **Recebidos em [mês]**. Cada linha traz projeto, cliente, valor e o prazo. Ação "Marcar como recebido" no hover no desktop, e por deslize para a esquerda no mobile.

### 10.6 Configurações — `/configuracoes`

Tema (sistema / claro / escuro), janela de recebimento em dias (padrão 10, com explicação do efeito), e um botão para restaurar os dados de exemplo — útil durante o desenvolvimento.

---

## 11. ESTADOS OBRIGATÓRIOS

Toda tela precisa dos três. Nada de tela em branco.

**Carregando** — skeleton com a forma do conteúdo real (cards viram retângulos do mesmo tamanho), brilho deslizante de 1,4 s. Nunca um spinner centralizado na página inteira.

**Vazio:**

| Contexto | Título | Apoio | Ação |
|---|---|---|---|
| Sem projetos | Nenhum projeto ainda | Crie o primeiro projeto para começar a organizar prazos e recebimentos. | Novo projeto |
| Projeto sem tarefas | Este projeto está vazio | Importe uma planilha em PDF ou adicione tarefas manualmente. | Importar planilha PDF |
| Busca sem resultado | Nada encontrado para "vega" | Tente outro termo ou limpe os filtros. | Limpar filtros |
| Sem recebimentos | Nada a receber no momento | Quando você finalizar um projeto, ele aparece aqui com o prazo de 10 dias. | — |
| PDF sem texto | Este PDF é uma imagem | O arquivo foi digitalizado e não tem texto para extrair. | Criar tarefas manualmente |

**Erro** — mensagem específica do que falhou e o que fazer, com botão de tentar de novo. Nunca "Algo deu errado".

---

## 12. DADOS DE EXEMPLO

Popule o seed com **6 projetos**, cada um cobrindo um estado visual diferente. As datas devem ser **calculadas em relação a `new Date()`** no momento do seed, para que os estados continuem válidos em qualquer dia que o app for aberto.

| # | Nome | Cliente | Valor | Estado a demonstrar |
|---|---|---|---|---|
| 1 | Levantamento Zona Sul | Construtora Vega | R$ 12.400,00 | Em andamento, 82 de 120 tarefas concluídas, com dados importados |
| 2 | Cadastro Industrial | Construtora Vega | R$ 6.400,00 | Finalizado há 14 dias, **atrasado há 4 dias** |
| 3 | Mapeamento Litoral Norte | Prefeitura de Caraguá | R$ 9.800,00 | Finalizado há 8 dias, **vence em 2 dias (alerta)** |
| 4 | Vistoria Centro | Alfa Engenharia | R$ 20.300,00 | Finalizado há 1 dia, vence em 9 dias (neutro) |
| 5 | Auditoria Norte | Norte Participações | R$ 22.100,00 | **Recebido** há 5 dias |
| 6 | Regularização Fundiária | Prefeitura de Caraguá | R$ 15.000,00 | **Planejado**, ainda sem tarefas |

O projeto 1 precisa de 120 tarefas geradas a partir de uma importação simulada com as colunas `ENDEREÇO`, `BAIRRO`, `PRAZO` e `RESPONSÁVEL`, e endereços brasileiros plausíveis e variados (não repetir "Rua A, 1", "Rua A, 2"). Os projetos 2 a 5 precisam de 15 a 40 tarefas cada, todas concluídas.

Com esse seed, a home deve abrir mostrando os três blocos financeiros preenchidos e todos os estados visuais de card visíveis de uma vez.

---

## 13. RESPONSIVIDADE

| Faixa | Comportamento |
|---|---|
| 320–479 px | Coluna única, barra de navegação inferior, modais viram folhas de baixo |
| 480–767 px | Igual, com mais respiro |
| 768–1023 px | Grid de 2 colunas, navegação em trilho lateral de 72 px só com ícones |
| 1024–1279 px | Grid de 3 colunas, barra lateral completa de 260 px |
| ≥ 1280 px | Grid de 4 colunas, conteúdo com `max-width: 1440px` centralizado |

Invioláveis:

- **Zero rolagem horizontal na página**, em qualquer largura. Tabelas largas rolam dentro do próprio container
- Alvos de toque com no mínimo 44 × 44 px no mobile
- O assistente de importação ocupa a tela inteira no mobile, um passo por vez
- Testar em 320, 375, 768, 1024 e 1440 px antes de considerar pronto

---

## 14. ACESSIBILIDADE

- Contraste mínimo de 4.5:1 em texto e 3:1 em contornos, verificado **nos dois temas**
- Foco visível em tudo que é interativo: anel de 2 px em `--acento` com deslocamento de 2 px
- O assistente é operável só pelo teclado: `Tab` entre cartões de coluna, `Espaço` marca, `Enter` avança, `Esc` sai com confirmação
- Modais prendem o foco e o devolvem ao elemento de origem ao fechar
- Resultado de ação assíncrona anunciado em região `aria-live`
- Rótulo de formulário sempre visível, nunca só placeholder
- Nenhum estado comunicado apenas por cor

---

## 15. TOM DOS TEXTOS

Direto, adulto, sem entusiasmo artificial. Sem exclamação, sem emoji na interface.

| Situação | Escrever | Não escrever |
|---|---|---|
| Confirmação | "Projeto finalizado. Recebimento previsto para 13/09." | "Parabéns! Você arrasou!" |
| Erro | "Este PDF é uma imagem digitalizada e não tem texto para extrair." | "Ops! Algo deu errado :(" |
| Vazio | "Nenhum projeto ainda." | "Que solidão por aqui..." |
| Aviso | "38 tarefas continuam em aberto. Finalizar mesmo assim?" | "Tem certeza que quer fazer isso?" |
| Carregando | "Lendo página 12 de 84" | "Aguarde um momentinho..." |

Datas em `dd/mm`, valores sempre com `R$` e duas casas decimais.

---

## 16. ORDEM DE EXECUÇÃO

Construa nesta sequência, e **deixe cada etapa funcionando antes de passar para a próxima**:

1. Projeto Next.js, Tailwind com os tokens, fontes, shadcn/ui
2. `tipos.ts`, `dinheiro.ts`, `prazo.ts`, `datas.ts`
3. `repositorio.ts`, `repositorioLocal.ts`, `seed.ts`, `hooks.ts`
4. `AppShell` — sidebar desktop, barra inferior mobile, alternador de tema
5. Home com resumo financeiro, grid de cards, busca, filtros, estados
6. Criar / editar / excluir projeto
7. Detalhe do projeto com as três abas e a lista de tarefas
8. Módulo de PDF (`lib/pdf/*`) — teste com um PDF real antes de montar a interface
9. Assistente de importação, os 4 passos
10. Finalizar / reabrir / receber, com a regra dos 10 dias
11. Página de recebimentos
12. Configurações
13. Passada final: responsividade, acessibilidade, estados vazios, textos

---

## 17. CHECKLIST DE ENTREGA

O trabalho só está pronto quando **todos** estes itens forem verdadeiros:

- [ ] `npm install && npm run dev` sobe sem erro nem aviso no console
- [ ] Abro `/` e vejo a home direto, sem nenhuma tela de login
- [ ] Os 6 projetos de exemplo aparecem, cada um com seu estado visual distinto
- [ ] O bloco "A RECEBER" mostra a soma correta dos projetos finalizados não pagos
- [ ] Crio um projeto novo pelo formulário e ele aparece na home
- [ ] Excluo um projeto e a confirmação exige digitar o nome exato
- [ ] Subo um PDF real com tabela e vejo as colunas detectadas corretamente
- [ ] Clico em outra linha do preview e ela vira o cabeçalho
- [ ] Marco 4 de 9 colunas e o contador acompanha
- [ ] Sem coluna de título escolhida, "Continuar" fica desabilitado com o motivo visível
- [ ] Confirmo a importação e as tarefas aparecem no projeto
- [ ] Subo um PDF digitalizado e recebo a mensagem correta, não um erro genérico
- [ ] Marco tarefas como concluídas e o progresso do projeto sobe
- [ ] Finalizo um projeto com tarefas em aberto e sou avisado do número exato
- [ ] Depois de finalizar, a contagem regressiva de 10 dias aparece
- [ ] Um projeto que vence em 2 dias aparece em âmbar; um vencido, em vermelho
- [ ] Marco como recebido e o valor migra de "a receber" para "recebido no mês"
- [ ] Tento reabrir um projeto recebido e a ação é recusada com explicação
- [ ] Recarrego a página e nada foi perdido (`localStorage`)
- [ ] Navego por tudo em 375 px sem nenhuma rolagem horizontal
- [ ] Alterno entre tema claro e escuro e as duas versões estão legíveis
- [ ] Navego pelo assistente inteiro só com o teclado
- [ ] Nenhuma cor literal fora dos tokens em componente algum
- [ ] Nenhum texto em inglês na interface

---

## 18. O QUE ENTREGAR

1. O projeto completo, rodando
2. Um `README.md` com: como instalar, como rodar, o que está simulado e o que virá na Fase 2
3. Um comentário no topo de `repositorioLocal.ts` explicando que este arquivo é o único ponto a substituir quando o backend existir

Não faça deploy. Não crie testes automatizados nesta fase. Não gere documentação além do README.
