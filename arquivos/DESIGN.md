# DESIGN — Fluxo

> Sistema visual, tokens, componentes e telas.
> Referências: [PRD.md](PRD.md) (o que e por quê) · [MVP.md](MVP.md) (como construir)

| | |
|---|---|
| **Versão** | 1.0 |
| **Data** | 2026-09-03 |
| **Tema padrão** | Escuro (claro disponível) |
| **Base técnica** | Tailwind CSS + shadcn/ui, tokens em CSS variables |

---

## 1. Direção visual

**Painel de controle noturno.** Não é um app de tarefas alegre, é um posto de comando financeiro de uma pessoa só. A tela escura recua, o conteúdo avança, e o dinheiro é a informação mais luminosa da página.

Três decisões que definem a identidade:

1. **Números como protagonistas.** Valores e prazos são tipografados grandes, em fonte monoespaçada com dígitos tabulares. A home começa com um número, não com um título.
2. **Cor com parcimônia.** Superfícies são neutras. Cor só aparece com significado: violeta para ação, verde para dinheiro que entrou, âmbar para prazo apertado, vermelho para atraso. Se algo está colorido, é porque exige atenção.
3. **Tipografia com personalidade.** Títulos em Bricolage Grotesque — grotesca contemporânea, levemente condensada — contra corpo em Inter. Isso separa o app do visual genérico de dashboard.

**O que evitar:** gradientes decorativos em cards, sombras pesadas, ilustrações de estoque, ícones coloridos, animação por animação, mais de um accent competindo por atenção.

---

## 2. Tokens

### 2.1 Cor — tema escuro (padrão)

| Token | Valor | Uso |
|---|---|---|
| `--fundo` | `#0A0B0F` | Fundo da aplicação |
| `--superficie` | `#121419` | Cards, painéis, barra lateral |
| `--superficie-2` | `#181B22` | Camada elevada: modais, dropdowns, hover de card |
| `--superficie-3` | `#1F232B` | Campos de formulário, linhas alternadas de tabela |
| `--borda` | `#23262F` | Divisórias e contornos padrão |
| `--borda-forte` | `#2E323C` | Contorno de elemento em foco ou selecionado |
| `--texto` | `#F2F4F8` | Texto primário |
| `--texto-2` | `#A0A6B4` | Texto secundário, rótulos |
| `--texto-3` | `#6E7482` | Texto de apoio, placeholders, metadados |
| `--acento` | `#6A5AF0` | Ação primária, fundo de botão (contraste 4.9:1 com branco) |
| `--acento-claro` | `#8B7CFF` | Ícones, links e texto de acento sobre fundo escuro |
| `--acento-suave` | `rgba(106,90,240,0.12)` | Fundo de estado selecionado |
| `--sucesso` | `#34D399` | Recebido, tarefa concluída |
| `--sucesso-suave` | `rgba(52,211,153,0.12)` | Fundo de badge de sucesso |
| `--alerta` | `#FBBF24` | Prazo em 3 dias ou menos |
| `--alerta-suave` | `rgba(251,191,36,0.12)` | Fundo de badge de alerta |
| `--perigo` | `#FF6B6B` | Atrasado, exclusão |
| `--perigo-suave` | `rgba(255,107,107,0.12)` | Fundo de badge de perigo |
| `--info` | `#4DA3FF` | Projeto finalizado, informação neutra |

### 2.2 Cor — tema claro

| Token | Valor |
|---|---|
| `--fundo` | `#FAFAFB` |
| `--superficie` | `#FFFFFF` |
| `--superficie-2` | `#F4F5F7` |
| `--superficie-3` | `#EDEFF3` |
| `--borda` | `#E3E5EA` |
| `--borda-forte` | `#CBD0D8` |
| `--texto` | `#12141A` |
| `--texto-2` | `#525A69` |
| `--texto-3` | `#7C8492` |
| `--acento` | `#5A48E8` |
| `--acento-claro` | `#5A48E8` |
| `--sucesso` | `#11875A` |
| `--alerta` | `#B45309` |
| `--perigo` | `#C8302F` |
| `--info` | `#1D6FD4` |

Os tons semânticos do tema claro são escurecidos para manter 4.5:1 sobre fundo branco. Nunca reutilizar os valores do tema escuro no claro.

### 2.3 Semântica de status

| Estado | Cor | Aparência |
|---|---|---|
| Projeto `planejado` | `--texto-3` | Badge neutro, contorno sutil |
| Projeto `em_andamento` | `--acento-claro` | Badge com fundo `--acento-suave` |
| Projeto `finalizado` | `--info` | Badge azul |
| Projeto `arquivado` | `--texto-3` | Card com 60% de opacidade |
| Recebimento `a_receber` (> 3 dias) | `--texto-2` | Pílula neutra com contagem |
| Recebimento `a_receber` (≤ 3 dias) | `--alerta` | Pílula âmbar, ícone de relógio |
| Recebimento `atrasado` | `--perigo` | Pílula vermelha, borda esquerda vermelha no card |
| Recebimento `recebido` | `--sucesso` | Pílula verde, ícone de confirmação |

### 2.4 Tipografia

| Papel | Fonte | Fallback |
|---|---|---|
| Display e títulos | **Bricolage Grotesque** (variável) | `"Inter Tight", system-ui, sans-serif` |
| Corpo e interface | **Inter** (variável) | `system-ui, -apple-system, "Segoe UI", sans-serif` |
| Números e dados | **JetBrains Mono** | `ui-monospace, "SF Mono", Consolas, monospace` |

Todo número financeiro, data, contador e célula de tabela usa `font-variant-numeric: tabular-nums` para que as colunas alinhem.

| Escala | Tamanho / Altura | Peso | Aplicação |
|---|---|---|---|
| `display` | 48 / 52 px | 600 | Valor principal da home (`clamp(32px, 6vw, 48px)`) |
| `h1` | 32 / 38 px | 600 | Nome do projeto na página de detalhe |
| `h2` | 24 / 30 px | 600 | Títulos de seção |
| `h3` | 18 / 26 px | 600 | Nome do projeto no card, título do passo do assistente |
| `corpo` | 15 / 24 px | 400 | Texto padrão |
| `corpo-p` | 13 / 20 px | 400 | Descrições, metadados |
| `rotulo` | 12 / 16 px | 500, `+0.04em` | Rótulos de campo e de coluna, em caixa alta |
| `numero-g` | 28 / 32 px | 600, mono | Valor do projeto |
| `numero-m` | 15 / 20 px | 500, mono | Valores em listas e tabelas |

Títulos usam `letter-spacing: -0.02em`. Rótulos em caixa alta usam `+0.04em`.

### 2.5 Espaçamento

Base de 4 px: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 72 · 96`

| Contexto | Valor |
|---|---|
| Padding interno de card | 20 px (mobile) / 24 px (desktop) |
| Espaço entre cards no grid | 16 px (mobile) / 20 px (desktop) |
| Espaço entre seções | 32 px (mobile) / 48 px (desktop) |
| Margem lateral da página | 16 px (mobile) / 24 px (tablet) / 40 px (desktop) |
| Altura de linha de tabela | 44 px |

### 2.6 Raio e elevação

| Token | Valor | Uso |
|---|---|---|
| `--raio-p` | 8 px | Badges, checkbox, campos pequenos |
| `--raio-m` | 12 px | Botões, inputs, itens de lista |
| `--raio-g` | 16 px | Cards, painéis |
| `--raio-xg` | 24 px | Modais, containers do assistente |
| `--raio-total` | 999 px | Pílulas e avatares |

```
--sombra-1: 0 1px 2px rgba(0,0,0,0.28)
--sombra-2: 0 4px 16px rgba(0,0,0,0.32)
--sombra-3: 0 16px 48px rgba(0,0,0,0.44)
--brilho-acento: 0 0 0 1px rgba(106,90,240,0.35), 0 8px 24px rgba(106,90,240,0.18)
```

No tema escuro a hierarquia vem principalmente do **contraste entre superfícies**, não da sombra. Sombra pesada só em modal.

### 2.7 Movimento

| Duração | Aplicação | Easing |
|---|---|---|
| 120 ms | Hover, foco, marcação de checkbox | `cubic-bezier(0.2, 0, 0.4, 1)` |
| 200 ms | Troca de aba, expansão de painel, toast | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| 320 ms | Abertura de modal, transição entre passos do assistente | `cubic-bezier(0.16, 1, 0.3, 1)` |
| 600 ms | Preenchimento da barra de progresso ao carregar | `ease-out` |

Sob `prefers-reduced-motion: reduce`, tudo cai para 0 ms exceto o esmaecimento de opacidade.

### 2.8 CSS de referência

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
  --alerta: #FBBF24;
  --perigo: #FF6B6B;
  --info: #4DA3FF;

  --raio-p: 8px;
  --raio-m: 12px;
  --raio-g: 16px;
  --raio-xg: 24px;

  --fonte-display: "Bricolage Grotesque", "Inter Tight", system-ui, sans-serif;
  --fonte-corpo: "Inter", system-ui, sans-serif;
  --fonte-mono: "JetBrains Mono", ui-monospace, monospace;
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
  --alerta: #B45309;
  --perigo: #C8302F;
  --info: #1D6FD4;
}

body {
  background: var(--fundo);
  color: var(--texto);
  font-family: var(--fonte-corpo);
  font-feature-settings: "cv11", "ss01";
}

.numero { font-family: var(--fonte-mono); font-variant-numeric: tabular-nums; }
```

---

## 3. Layout e responsividade

### 3.1 Breakpoints

| Nome | Largura | Comportamento |
|---|---|---|
| `base` | 320–479 px | Coluna única, barra de navegação inferior |
| `sm` | 480–767 px | Coluna única com respiro maior |
| `md` | 768–1023 px | 2 colunas no grid, navegação em trilho lateral de 72 px |
| `lg` | 1024–1279 px | 3 colunas, barra lateral completa de 260 px |
| `xl` | ≥ 1280 px | 4 colunas, conteúdo com largura máxima de 1440 px centralizado |

### 3.2 Navegação

**Desktop (≥ 1024 px)** — barra lateral fixa de 260 px: marca no topo, itens Início / Recebimentos / Configurações, botão "Novo projeto" fixo na base, alternador de tema no rodapé.

**Tablet (768–1023 px)** — trilho de 72 px com apenas ícones e tooltip no hover.

**Mobile (< 768 px)** — barra inferior fixa com 3 destinos e um botão circular central de "Novo projeto" elevado sobre a barra. Altura de 64 px mais área segura inferior. Cabeçalho da página fica fixo no topo e encolhe ao rolar.

### 3.3 Regras invioláveis

- Nenhuma rolagem horizontal em nenhuma largura. Tabelas largas rolam dentro do próprio container.
- Alvos de toque com no mínimo 44 × 44 px.
- Modal vira folha de baixo para cima (bottom sheet) abaixo de 768 px.
- O assistente de importação ocupa a tela inteira no mobile, um passo por vez.
- Tabela de dados importados vira lista de cards empilhados abaixo de 768 px.

---

## 4. Componentes

### 4.1 Botão

| Variante | Fundo | Texto | Uso |
|---|---|---|---|
| Primário | `--acento` | branco | Uma por tela: criar, confirmar, importar |
| Secundário | `--superficie-3` | `--texto` | Ações de apoio |
| Fantasma | transparente | `--texto-2` | Ações terciárias, ícones |
| Perigo | `--perigo-suave` | `--perigo` | Excluir, descartar |

Altura 40 px (44 px no mobile), raio `--raio-m`, padding lateral 16 px, peso 500. Hover clareia 6%. Foco recebe anel de 2 px em `--acento` com deslocamento de 2 px. Estado carregando troca o rótulo por spinner e mantém a largura.

### 4.2 Checkbox de coluna — componente-chave

É o elemento central do produto e merece tratamento próprio. Não é o checkbox padrão em miniatura: é um **cartão de coluna inteiro clicável**.

```
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│ ☐  ENDEREÇO                      │   │ ☑  ENDEREÇO                      │
│    Rua das Palmeiras, 120        │   │    Rua das Palmeiras, 120        │
│    Av. Brasil, 4410              │   │    Av. Brasil, 4410              │
│    Travessa do Porto, 88         │   │    Travessa do Porto, 88         │
│                     confiança ●●●│   │                     confiança ●●●│
└──────────────────────────────────┘   └──────────────────────────────────┘
   não marcada                            marcada
   borda --borda                          borda --acento
   fundo --superficie                     fundo --acento-suave
                                          marca aparece em 120 ms
```

- Toda a área do cartão alterna a marcação
- Amostra de 3 valores reais da coluna, truncados
- Indicador de confiança em três pontos (alta 3, média 2, baixa 1)
- O nome da coluna vira campo editável ao clique no ícone de lápis
- Coluna mapeada como título da tarefa recebe pílula "TÍTULO" e não pode ser desmarcada

### 4.3 Card de projeto

```
┌─────────────────────────────────────────────┐
│ ▌ Levantamento Zona Sul        [em andamento]│   ▌ = faixa de 3px na cor do projeto
│   Construtora Vega                           │
│                                              │
│   R$ 12.400,00                               │   numero-g, mono, tabular
│                                              │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  68%   82/120 tarefas │
│                                              │
│   12/08 → 30/09                              │   corpo-p, --texto-3
└─────────────────────────────────────────────┘
```

Estados adicionais:

- **Recebimento próximo:** pílula âmbar "recebe em 3 dias" abaixo das datas
- **Atrasado:** borda esquerda em `--perigo` e pílula "atrasado há 2 dias"
- **Recebido:** valor em `--sucesso` com ícone de confirmação
- **Hover:** fundo sobe para `--superficie-2`, elevação 1, translação de −2 px em 120 ms

### 4.4 Pílula de prazo

```
 ○ recebe em 8 dias      neutra   --texto-2 sobre --superficie-3
 ◐ recebe em 2 dias      alerta   --alerta sobre --alerta-suave
 ● atrasado há 4 dias    crítica  --perigo sobre --perigo-suave
 ✓ recebido em 21/09     ok       --sucesso sobre --sucesso-suave
```

Altura 24 px, raio total, texto de 12 px com o número em mono.

### 4.5 Barra de progresso

Trilho de 6 px em `--superficie-3`, preenchimento em `--acento`, raio total. Ao atingir 100% o preenchimento muda para `--sucesso`. Anima de 0 até o valor em 600 ms no primeiro carregamento e em 200 ms nas atualizações.

### 4.6 Área de upload

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
                                              
│              ┌─────────┐                    │
                │  PDF  │
│              └─────────┘                    │
                                              
│      Arraste a planilha em PDF aqui         │
              ou clique para escolher          
│                                             │
          até 20 MB · até 200 páginas          
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

Borda tracejada de 2 px em `--borda-forte`, raio `--raio-xg`, altura mínima de 220 px. Ao arrastar sobre a área: borda e ícone em `--acento`, fundo `--acento-suave`, escala 1.01. Arquivo inválido: borda em `--perigo` com mensagem inline por 3 s.

### 4.7 Demais componentes

| Componente | Especificação |
|---|---|
| Campo de texto | Altura 40 px, fundo `--superficie-3`, borda `--borda`, foco com borda `--acento` e anel suave. Rótulo acima em `rotulo`. Erro em `--perigo` abaixo, nunca só cor — sempre com texto |
| Campo de valor | Prefixo "R$" fixo, alinhado à direita, mono tabular, máscara de milhar |
| Abas | Sublinhado de 2 px em `--acento` sob a aba ativa, deslizando em 200 ms |
| Modal | Máximo de 560 px, raio `--raio-xg`, fundo `--superficie-2`, sombra 3, backdrop com desfoque de 8 px e preto a 60% |
| Toast | Canto inferior direito no desktop, topo no mobile. 4 s. Barra lateral de 3 px na cor semântica |
| Skeleton | Blocos em `--superficie-3` com brilho deslizante de 1,4 s. Sempre com a forma do conteúdo real |
| Empty state | Ícone de traço fino em `--texto-3`, título em `h3`, uma linha de explicação e um botão primário |
| Tabela | Cabeçalho fixo, linhas de 44 px, listra em `--superficie-3` a 40%, colunas numéricas alinhadas à direita em mono |

---

## 5. Telas

### 5.1 Home — desktop

```
┌────────────┬──────────────────────────────────────────────────────────────┐
│            │  Boa tarde                            [ buscar projeto...  ] │
│  FLUXO     │  quarta, 3 de setembro                                       │
│            │                                                              │
│  ▸ Início  │  ┌──────────────────────┬─────────────┬─────────────┐        │
│  ▸ Receb.  │  │ A RECEBER            │ RECEBIDO    │ ATRASADO    │        │
│  ▸ Config. │  │                      │ EM SETEMBRO │             │        │
│            │  │ R$ 48.900,00         │ R$ 22.100   │ R$ 6.400    │        │
│            │  │ 4 projetos           │ 3 projetos  │ 1 projeto   │        │
│            │  └──────────────────────┴─────────────┴─────────────┘        │
│            │                                                              │
│            │  Projetos                                                    │
│            │  [ todos ][ em andamento ][ finalizados ][ arquivados ]  ⊞ ☰ │
│            │                                                              │
│            │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│            │  │  card       │ │  card       │ │  card       │             │
│            │  └─────────────┘ └─────────────┘ └─────────────┘             │
│            │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  [+ Novo]  │  │  card       │ │  card       │ │  card       │             │
│  ☾ tema    │  └─────────────┘ └─────────────┘ └─────────────┘             │
└────────────┴──────────────────────────────────────────────────────────────┘
```

O bloco "A RECEBER" é o maior elemento da tela: valor em `display`, mono tabular, cor `--texto`. Os outros dois são secundários. Se houver atraso, o bloco "ATRASADO" ganha borda em `--perigo`; se não houver, ele fica esmaecido a 50%.

Fundo da área de resumo: gradiente radial muito sutil em `--acento` a 6% de opacidade, saindo do canto superior esquerdo. É o único ornamento do app.

### 5.2 Home — mobile

```
┌─────────────────────────┐
│ Boa tarde        ⌕  ☾   │
│ quarta, 3 de setembro   │
│                         │
│ A RECEBER               │
│ R$ 48.900,00            │
│ 4 projetos · 1 atrasado │
│                         │
│ [todos][andam.][final.] │  ← rolagem horizontal só dos filtros
│                         │
│ ┌─────────────────────┐ │
│ │ card                │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ card                │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│  ⌂        ⊕        ◷    │  ← barra inferior, ⊕ elevado
└─────────────────────────┘
```

### 5.3 Detalhe do projeto

```
┌──────────────────────────────────────────────────────────────┐
│ ← Projetos                                        [ ⋯ ]      │
│                                                              │
│ ▌ Levantamento Zona Sul                    [em andamento]    │
│   Construtora Vega                                           │
│                                                              │
│   R$ 12.400,00      12/08 → 30/09      ▓▓▓▓▓▓░░░ 68%         │
│                                                              │
│   [ Importar planilha PDF ]      [ Finalizar projeto ]       │
│                                                              │
│ ┌─ Tarefas ─┬─ Dados importados ─┬─ Financeiro ─────────────┐│
│ │                                                           ││
│ │ [ buscar ]  [todas][a fazer][concluídas]      82/120       ││
│ │                                                           ││
│ │ ☐  Rua das Palmeiras, 120 — vistoria                      ││
│ │ ☐  Av. Brasil, 4410 — vistoria                            ││
│ │ ☑  Travessa do Porto, 88 — vistoria        concluída ontem ││
│ │ ...                                                       ││
│ └───────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

Ao finalizar, o cabeçalho troca os dois botões por um bloco de recebimento com a contagem regressiva e o botão "Marcar como recebido".

### 5.4 Assistente de importação — passo 3 (seleção de colunas)

A tela mais importante do produto.

```
┌──────────────────────────────────────────────────────────────────┐
│  Importar planilha                                        ✕      │
│  ●───────●───────●───────○                                       │
│  Arquivo  Tabela  Colunas  Confirmar                             │
│                                                                  │
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
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐           │
│  │ ☑ PRAZO    ✎  │ │ ☐ RESPONSÁVEL │ │ ☐ OBS.        │           │
│  │ 15/09/2026    │ │ Marcos        │ │ —             │           │
│  │ 18/09/2026    │ │ Ana           │ │ conferir chave│           │
│  │ 20/09/2026    │ │ Marcos        │ │ —             │           │
│  │ ●●○ [PRAZO]   │ │ ●●●           │ │ ●○○           │           │
│  └───────────────┘ └───────────────┘ └───────────────┘           │
│                                                                  │
│  ─────────────────────────────────────────────────────────────   │
│  O título da tarefa virá de:  [ ENDEREÇO ▾ ]                     │
│  Prazo (opcional):            [ PRAZO ▾ ]                        │
│  Observações (opcional):      [ nenhuma ▾ ]                      │
│                                                                  │
│  3 de 9 colunas marcadas · 142 linhas                            │
│                            [ Voltar ]  [ Continuar → ]           │
└──────────────────────────────────────────────────────────────────┘
```

Comportamento:

- Grid de 3 colunas no desktop, 2 no tablet, 1 no mobile
- O rodapé com o contador é fixo e sempre visível
- "Continuar" fica desabilitado enquanto não houver coluna de título, com o motivo escrito ao lado
- Barra de passos é clicável para voltar, nunca para pular adiante
- No mobile o bloco de mapeamento vira uma folha inferior acionada pelo botão "Definir campos"

### 5.5 Passo 2 — preview da tabela

Tabela com rolagem horizontal, cabeçalho detectado destacado em `--acento-suave`, e a instrução: "Se a linha destacada não for o cabeçalho, clique na linha correta." Cada linha ganha um alvo de clique com hover em `--superficie-2`.

### 5.6 Recebimentos

```
┌──────────────────────────────────────────────────────────┐
│ Recebimentos                                             │
│                                                          │
│ A RECEBER  R$ 48.900,00        RECEBIDO EM SETEMBRO  R$ 22.100,00 │
│                                                          │
│ ● ATRASADO                                               │
│   ▌ Cadastro Industrial   Vega     R$ 6.400   há 4 dias  │
│                                                          │
│ ◐ VENCE ESTA SEMANA                                      │
│   ▌ Levantamento Zona Sul  Vega    R$ 12.400  em 2 dias  │
│   ▌ Mapeamento Litoral     Norte   R$ 9.800   em 5 dias  │
│                                                          │
│ ○ PRÓXIMOS                                               │
│   ▌ Vistoria Centro        Alfa    R$ 20.300  em 9 dias  │
│                                                          │
│ ✓ RECEBIDOS EM SETEMBRO                                  │
│   ▌ Auditoria Norte        Norte   R$ 22.100  em 21/09   │
└──────────────────────────────────────────────────────────┘
```

Cada linha tem ação direta "Marcar como recebido" no hover (desktop) ou por deslize para a esquerda (mobile).

### 5.7 Empty states

| Contexto | Título | Apoio | Ação |
|---|---|---|---|
| Sem projetos | Nenhum projeto ainda | Crie o primeiro projeto para começar a organizar prazos e recebimentos. | Novo projeto |
| Projeto sem tarefas | Este projeto está vazio | Importe uma planilha em PDF ou adicione tarefas manualmente. | Importar planilha PDF |
| Busca sem resultado | Nada encontrado para "vega" | Tente outro termo ou limpe os filtros. | Limpar filtros |
| Sem recebimentos pendentes | Nada a receber no momento | Quando você finalizar um projeto, ele aparece aqui com o prazo de 10 dias. | — |
| PDF sem texto | Este PDF é uma imagem | O arquivo foi digitalizado e não tem texto para extrair. Você pode criar as tarefas manualmente. | Criar tarefas manualmente |

---

## 6. Microinterações

| Interação | Comportamento |
|---|---|
| Marcar tarefa como concluída | Marca desenha em 120 ms, texto ganha risco e cai para `--texto-3`, item desliza para o fim da lista após 400 ms se o filtro for "a fazer" |
| Marcar coluna no assistente | Fundo do cartão preenche a partir do canto do checkbox em 120 ms |
| Progresso do projeto | Ao completar 100%, a barra pulsa uma vez e muda para `--sucesso` |
| Finalizar projeto | Após confirmar, o bloco de recebimento surge de cima para baixo em 320 ms com a contagem já visível |
| Marcar como recebido | Valor faz transição de cor para `--sucesso`, toast confirma e o item sai do painel de pendentes |
| Processando PDF | Barra de progresso real por página, com a contagem "página 12 de 84" — nunca um spinner indefinido |
| Erro de validação | Campo treme 2 px horizontalmente uma única vez, mensagem aparece abaixo |
| Rolagem da home | Cabeçalho encolhe de 96 px para 56 px, valor principal reduz para `h2` |

---

## 7. Acessibilidade

- Contraste mínimo de 4.5:1 em texto e 3:1 em contornos de componente, verificado nos dois temas
- Nenhuma informação transmitida apenas por cor: todo estado tem ícone ou texto
- Foco visível em todos os elementos interativos: anel de 2 px em `--acento` com deslocamento de 2 px
- O assistente de importação é operável inteiramente por teclado: `Tab` entre cartões de coluna, `Espaço` para marcar, `Enter` para avançar, `Esc` para sair com confirmação
- Modais prendem o foco e devolvem ao elemento de origem ao fechar
- Toda ação assíncrona anuncia o resultado em região `aria-live`
- Rótulos de formulário sempre visíveis, nunca apenas placeholder
- Alvos de toque de no mínimo 44 × 44 px no mobile
- `prefers-reduced-motion` respeitado em todas as transições

---

## 8. Tom de voz

Direto, adulto e sem entusiasmo artificial. O app fala como uma ferramenta de trabalho, não como um assistente animado.

| Situação | Escrever | Não escrever |
|---|---|---|
| Confirmação | "Projeto finalizado. Recebimento previsto para 13/09." | "Parabéns! 🎉 Você arrasou!" |
| Erro | "Este PDF é uma imagem digitalizada e não tem texto para extrair." | "Ops! Algo deu errado :(" |
| Vazio | "Nenhum projeto ainda." | "Que solidão por aqui..." |
| Aviso | "38 tarefas continuam em aberto. Finalizar mesmo assim?" | "Tem certeza que quer fazer isso?" |
| Carregando | "Lendo página 12 de 84" | "Aguarde um momentinho..." |

Regras: sem exclamação, sem emoji na interface, números sempre por extenso em algarismos, datas em dd/mm, valores sempre com "R$" e duas casas decimais.

---

## 9. Configuração do Tailwind

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        fundo: "var(--fundo)",
        superficie: {
          DEFAULT: "var(--superficie)",
          2: "var(--superficie-2)",
          3: "var(--superficie-3)",
        },
        borda: { DEFAULT: "var(--borda)", forte: "var(--borda-forte)" },
        texto: {
          DEFAULT: "var(--texto)",
          2: "var(--texto-2)",
          3: "var(--texto-3)",
        },
        acento: {
          DEFAULT: "var(--acento)",
          claro: "var(--acento-claro)",
          suave: "var(--acento-suave)",
        },
        sucesso: "var(--sucesso)",
        alerta: "var(--alerta)",
        perigo: "var(--perigo)",
        info: "var(--info)",
      },
      fontFamily: {
        display: ["var(--fonte-display)"],
        sans: ["var(--fonte-corpo)"],
        mono: ["var(--fonte-mono)"],
      },
      borderRadius: {
        p: "var(--raio-p)",
        m: "var(--raio-m)",
        g: "var(--raio-g)",
        xg: "var(--raio-xg)",
      },
      transitionTimingFunction: {
        saida: "cubic-bezier(0.16, 1, 0.3, 1)",
        padrao: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
};
```

---

## 10. Checklist de revisão visual

Antes de considerar qualquer tela pronta:

- [ ] Funciona em 320, 375, 768, 1024 e 1440 px sem rolagem horizontal
- [ ] Tema claro e escuro verificados lado a lado
- [ ] Nenhuma cor fora dos tokens
- [ ] Nenhum espaçamento fora da escala de 4 px
- [ ] Todo número financeiro em mono tabular
- [ ] Estados de carregamento, erro e vazio implementados
- [ ] Foco de teclado visível em toda a tela
- [ ] Nenhum estado comunicado apenas por cor
- [ ] Textos revisados contra a seção 8
- [ ] Uma única ação primária por tela
