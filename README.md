# Fluxo · Workspace Pessoal (Fase 1 - Frontend)

Frontend do **Fluxo**, uma aplicação web pessoal para gerenciamento de projetos, extração de planilhas em PDF com seleção de colunas e controle financeiro de recebimentos com regra de 10 dias corridos.

---

## 🚀 Como Instalar e Rodar

### Pré-requisitos
- **Node.js**: v18+ ou v20+ (testado no Node.js v24)
- **NPM** ou **PNPM** / **Yarn**

### Passos
1. Instale as dependências:
   ```bash
   npm install
   ```
   *(O comando `postinstall` copia automaticamente o Web Worker do `pdfjs-dist` para a pasta `public/pdf.worker.min.mjs`)*

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o navegador em:
   ```
   http://localhost:3000
   ```

---

## 🏗️ Stack Tecnológica (Fase 1)

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript (Strict Mode)
- **Estilização**: Tailwind CSS com Tokens em CSS Variables (`:root` e `:root[data-tema="claro"]`)
- **Tipografia**: Bricolage Grotesque (display), Inter (corpo) e JetBrains Mono (dados e moeda) via `next/font/google`
- **Gerenciamento de Estado de Dados**: TanStack Query v5 (React Query)
- **Extração de PDF no Navegador**: `pdfjs-dist` v4 com processamento por Web Worker e coordenadas espaciais
- **Formulários e Validação**: React Hook Form + Zod
- **Datas e Fusos**: date-fns com formato pt-BR
- **Ícones**: Lucide React

---

## 📦 Camada de Dados Simulada vs Fase 2

### O que está simulado na Fase 1
- **Armazenamento**: Todos os dados são persistidos no navegador do usuário via `localStorage` (sob a chave `fluxo:v1`).
- **Latência de Rede**: O repositório simula artificialmente entre 200ms e 400ms de delay em cada operação para garantir estados de carregamento (Skeletons e Spinners) realistas e suaves.
- **Seed Inicial**: Caso o `localStorage` esteja vazio, o app carrega automaticamente 6 projetos brasileiros com estados visuais e financeiros completos (relativos à data de hoje).
- **Extração de PDF**: Roda 100% no navegador (Client-Side), sem envio de arquivos para servidor externo.

### Transição para a Fase 2 (Backend)
Toda a aplicação consome dados **exclusivamente** via interface `Repositorio` através dos hooks em `src/lib/dados/hooks.ts`.

Para conectar a API real com PostgreSQL e Prisma na Fase 2:
1. Basta implementar a interface `Repositorio` em um novo arquivo (ex: `repositorioApi.ts`) chamando os endpoints `fetch('/api/...')`.
2. Alterar a importação em `src/lib/dados/hooks.ts` de `repositorioLocal` para `repositorioApi`.
3. **Nenhum componente, tela ou hook precisará ser reescrito ou modificado.**

---

## 🧭 Estrutura de Pastas

```
/
├── public/
│   └── pdf.worker.min.mjs          # Worker copiado do pdfjs-dist
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Fontes Google, Provedores de Tema, Query e Toast
│   │   ├── globals.css             # Tokens CSS e variáveis
│   │   ├── page.tsx                # Dashboard Inicial / Métricas / Projetos
│   │   ├── not-found.tsx           # Página 404 em PT-BR
│   │   ├── projetos/
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Detalhes do Projeto (Tarefas, Dados Importados, Financeiro)
│   │   │       └── importar/
│   │   │           └── page.tsx    # Assistente de Importação em 4 Passos
│   │   ├── recebimentos/
│   │   │   └── page.tsx            # Visão de Pagamentos e Prazos
│   │   └── configuracoes/
│   │       └── page.tsx            # Tema, Janela de Recebimento e Reset
│   ├── componentes/
│   │   ├── ui/                     # Botao, Input, Dialog, Checkbox, Select, Tabs, etc.
│   │   ├── layout/                 # AppShell, BarraLateral, BarraInferior, AlternadorTema
│   │   ├── projeto/                # CardProjeto, GridProjetos, FormularioProjeto, etc.
│   │   ├── tarefa/                 # ListaTarefas, ItemTarefa, FormularioTarefa
│   │   ├── importacao/             # Assistente, PassoUpload, PassoTabela, PassoColunas, etc.
│   │   ├── financeiro/             # ResumoFinanceiro, ContagemRegressiva, LinhaRecebimento
│   │   └── comum/                  # EstadoVazio, EsqueletoCard, CabecalhoPagina
│   ├── lib/
│   │   ├── dados/
│   │   │   ├── tipos.ts            # Interfaces TypeScript
│   │   │   ├── repositorio.ts      # Contrato de Dados
│   │   │   ├── repositorioLocal.ts # Implementação com localStorage
│   │   │   ├── seed.ts             # Dados de Demonstração
│   │   │   └── hooks.ts            # Hooks do TanStack Query
│   │   ├── pdf/
│   │   │   ├── extrair.ts          # Extração de fragmentos e coordenadas
│   │   │   ├── linhas.ts           # Agrupamento no eixo Y
│   │   │   ├── colunas.ts          # Detecção de vãos no eixo X
│   │   │   ├── cabecalho.ts        # Heurística de cabeçalho
│   │   │   ├── limpeza.ts          # Descarte de rodapés e linhas vazias
│   │   │   └── processar.ts        # Orquestrador com progresso
│   │   ├── dinheiro.ts             # Formatação e parsing monetário em centavos
│   │   ├── prazo.ts                # Regra dos 10 dias corridos e cálculo de urgência
│   │   └── datas.ts                # Manipulação de calendário em PT-BR
│   └── tipos/
│       └── index.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```
