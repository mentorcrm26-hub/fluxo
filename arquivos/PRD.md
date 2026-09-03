# PRD — Fluxo

> **Da planilha ao recebimento.**
> Workspace pessoal de usuário único para transformar planilhas em PDF em projetos executáveis, com checklist de tarefas, controle de prazo e acompanhamento do recebimento.

| | |
|---|---|
| **Documento** | Product Requirements Document |
| **Versão** | 1.0 |
| **Data** | 2026-09-03 |
| **Autor** | Paulo Daian |
| **Status** | Aprovado para MVP |
| **Documentos irmãos** | [MVP.md](MVP.md) · [DESIGN.md](DESIGN.md) |

---

## 1. Visão do produto

O Fluxo é um centro de comando pessoal para trabalho por projeto. O usuário recebe planilhas em PDF (listas de itens, serviços, endereços, lotes), importa esse conteúdo para dentro de um projeto escolhendo **quais colunas realmente interessam**, e a partir daí executa o trabalho como uma lista de tarefas. Quando o projeto é marcado como finalizado, o app abre automaticamente uma **janela de recebimento de 10 dias** e passa a cobrar visualmente esse prazo até o dinheiro entrar.

O produto resolve três dores em um único fluxo contínuo:

1. **Extração manual.** Copiar dados de PDF para planilha é lento e gera erro.
2. **Execução dispersa.** Cada projeto vira uma planilha solta sem noção de progresso.
3. **Recebimento esquecido.** Projeto entregue não é projeto pago — o prazo de 10 dias passa sem cobrança.

### 1.1 Princípios de produto

- **Um usuário, zero fricção.** Sem cadastro, sem login, sem convite, sem permissão. Abriu, está dentro.
- **O dinheiro é primeiro-classe.** Valor, prazo e status de recebimento aparecem nas telas principais, não escondidos numa aba financeira.
- **A importação nunca é cega.** O usuário sempre vê o que foi extraído antes de confirmar, e sempre pode corrigir.
- **Nada trava por causa do PDF.** Se a extração automática falhar, existe um caminho manual para seguir em frente.

---

## 2. Usuário e contexto de uso

**Usuário único.** Um operador que gerencia seus próprios projetos, entre 5 e 40 projetos ativos ou arquivados por ano.

| Aspecto | Descrição |
|---|---|
| Dispositivo principal | Desktop (planejamento, importação de PDF) |
| Dispositivo secundário | Celular (consulta de status, marcar tarefas em campo) |
| Frequência de uso | Diária — consulta rápida; semanal — importação e fechamento |
| Ambiente | Conexão instável em campo; conexão boa no escritório |
| Nível técnico | Alto o suficiente para operar ferramentas de produtividade, sem paciência para configuração |

### 2.1 Cenários de uso

**C1 — Novo trabalho chega.** Recebe um PDF com 120 linhas e 9 colunas. Cria o projeto com nome, cliente, datas e valor. Importa o PDF, marca as 4 colunas úteis, confirma. Em menos de dois minutos tem 120 tarefas prontas para executar.

**C2 — Execução no dia a dia.** Abre o projeto no celular, filtra as tarefas pendentes, marca as concluídas. A barra de progresso do projeto sobe.

**C3 — Fechamento.** Todas as tarefas concluídas. Marca o projeto como finalizado. O app registra a data e cria a cobrança interna com vencimento em 10 dias.

**C4 — Cobrança.** Abre a home e vê o painel de recebimentos: dois projetos vencem em 3 dias, um está atrasado há 2 dias. Cobra o cliente. Ao receber, marca como recebido e o valor migra para o realizado do mês.

---

## 3. Objetivos e métricas de sucesso

| # | Objetivo | Métrica | Meta |
|---|---|---|---|
| O1 | Eliminar digitação manual de planilhas | Tempo do upload até tarefas criadas | < 2 minutos para 150 linhas |
| O2 | Extração confiável | Colunas detectadas corretamente em PDFs com camada de texto | ≥ 90% das colunas |
| O3 | Nunca perder um recebimento | Projetos finalizados que passam do prazo sem sinalização | 0 |
| O4 | Visão financeira imediata | Cliques da home até saber quanto há a receber | 0 (visível ao abrir) |
| O5 | Uso real no celular | Fluxo de marcar tarefa concluída no mobile | ≤ 2 toques |

**Anti-metas** (o que o produto explicitamente não persegue): número de usuários, colaboração, engajamento, retenção. É uma ferramenta de trabalho de uma pessoa só.

---

## 4. Escopo funcional

### 4.1 Módulo: Home / Dashboard

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Exibir tela inicial sem qualquer etapa de autenticação | Must |
| RF-02 | Exibir barra de resumo financeiro: total a receber, recebido no mês corrente, total atrasado, valor em execução | Must |
| RF-03 | Listar todos os projetos em grid de cards com nome, cliente, status, data de início, data de fim, valor e progresso | Must |
| RF-04 | Destacar visualmente projetos com recebimento próximo (≤ 3 dias) e atrasado | Must |
| RF-05 | Filtrar projetos por status (todos, em andamento, finalizados, arquivados) | Must |
| RF-06 | Buscar projetos por nome ou cliente | Must |
| RF-07 | Ordenar projetos por data de fim, valor, progresso ou criação | Should |
| RF-08 | Alternar entre visualização em grid e em tabela | Should |
| RF-09 | Exibir empty state instrutivo quando não houver projeto algum | Must |
| RF-10 | Ação primária "Novo projeto" sempre acessível | Must |

### 4.2 Módulo: Projetos

| ID | Requisito | Prioridade |
|---|---|---|
| RF-11 | Criar projeto com nome (obrigatório), cliente, descrição, data de início (obrigatória), data de fim prevista (obrigatória), valor (obrigatório) e cor identificadora | Must |
| RF-12 | Editar todos os campos de um projeto existente | Must |
| RF-13 | Excluir projeto com confirmação explícita, removendo tarefas e dados importados em cascata | Must |
| RF-14 | Arquivar projeto (some da listagem padrão, permanece acessível pelo filtro) | Should |
| RF-15 | Duplicar projeto sem as tarefas (apenas a estrutura) | Could |
| RF-16 | Página de detalhe do projeto com abas: Tarefas, Dados importados, Financeiro | Must |
| RF-17 | Exibir progresso do projeto como percentual de tarefas concluídas | Must |
| RF-18 | Ciclo de status: `planejado` → `em_andamento` → `finalizado` → `arquivado` | Must |

### 4.3 Módulo: Importação de PDF

Fluxo em assistente de 4 passos. É o coração do produto.

| ID | Requisito | Prioridade |
|---|---|---|
| RF-19 | Aceitar upload de PDF por seleção de arquivo ou arrastar-e-soltar, até 20 MB e 200 páginas | Must |
| RF-20 | Extrair o texto do PDF com posicionamento (coordenadas X/Y de cada fragmento) | Must |
| RF-21 | Reconstruir linhas agrupando fragmentos por proximidade vertical | Must |
| RF-22 | Detectar colunas por análise de agrupamento das posições horizontais | Must |
| RF-23 | Detectar automaticamente a linha de cabeçalho e usá-la como nome das colunas | Must |
| RF-24 | Permitir ao usuário indicar manualmente qual linha é o cabeçalho, caso a detecção erre | Must |
| RF-25 | Exibir preview da tabela reconstruída com as primeiras 20 linhas antes de qualquer decisão | Must |
| RF-26 | **Perguntar quais colunas importar, com seleção por marcação (checkbox) em cada coluna** | Must |
| RF-27 | Permitir marcar/desmarcar todas as colunas de uma vez | Should |
| RF-28 | Permitir renomear qualquer coluna selecionada antes de importar | Should |
| RF-29 | Mapear uma coluna selecionada para o campo "título da tarefa" (obrigatório para gerar tarefas) | Must |
| RF-30 | Mapear opcionalmente colunas para "prazo da tarefa" e "observações" | Should |
| RF-31 | Exibir indicador de confiança por coluna detectada (alta/média/baixa) | Could |
| RF-32 | Preview final com contagem de linhas e amostra do resultado antes de confirmar | Must |
| RF-33 | Ao confirmar, criar uma tarefa por linha importada dentro do projeto | Must |
| RF-34 | Preservar todas as colunas selecionadas como dados brutos consultáveis na aba "Dados importados" | Must |
| RF-35 | Detectar PDF sem camada de texto (digitalizado) e informar claramente, com caminho alternativo | Must |
| RF-36 | Permitir descartar uma importação inteira, removendo as tarefas geradas por ela | Should |
| RF-37 | Ignorar automaticamente linhas totalmente vazias e cabeçalhos repetidos entre páginas | Should |
| RF-38 | Registrar histórico de importações do projeto (arquivo, data, nº de linhas, colunas escolhidas) | Should |

### 4.4 Módulo: Tarefas

| ID | Requisito | Prioridade |
|---|---|---|
| RF-39 | Listar tarefas do projeto com status `a_fazer` / `em_andamento` / `concluida` | Must |
| RF-40 | Marcar tarefa como concluída em um toque, com registro da data de conclusão | Must |
| RF-41 | Criar tarefa manualmente, fora da importação | Must |
| RF-42 | Editar título, observações e prazo da tarefa | Must |
| RF-43 | Excluir tarefa | Must |
| RF-44 | Filtrar tarefas por status e buscar por texto | Must |
| RF-45 | Exibir os dados originais da linha importada ao abrir a tarefa | Should |
| RF-46 | Reordenar tarefas por arrastar | Could |
| RF-47 | Ações em lote (concluir/excluir várias tarefas selecionadas) | Should |

### 4.5 Módulo: Financeiro e recebimento

Este módulo implementa a regra central do produto.

| ID | Requisito | Prioridade |
|---|---|---|
| RF-48 | Ao marcar um projeto como finalizado, registrar a data de conclusão | Must |
| RF-49 | Ao finalizar, calcular a data-limite de recebimento = data de conclusão + 10 dias corridos | Must |
| RF-50 | Exibir contagem regressiva em dias até a data-limite de recebimento | Must |
| RF-51 | Classificar o recebimento como `pendente`, `a_receber`, `recebido` ou `atrasado` | Must |
| RF-52 | Marcar recebimento como recebido, registrando a data efetiva | Must |
| RF-53 | Permitir configurar a janela de recebimento (padrão 10 dias) nas configurações | Should |
| RF-54 | Painel de recebimentos com os projetos finalizados não pagos, ordenados por urgência | Must |
| RF-55 | Registrar recebimento parcial (valor recebido menor que o valor do projeto) | Could |
| RF-56 | Totalizar recebido por mês e comparar com o mês anterior | Could |
| RF-57 | Ao reabrir um projeto finalizado ainda não pago, limpar data de conclusão e prazo, mediante confirmação | Must |

### 4.6 Módulo: Configurações

| ID | Requisito | Prioridade |
|---|---|---|
| RF-58 | Alternar tema claro/escuro, respeitando a preferência do sistema | Must |
| RF-59 | Configurar a janela de recebimento em dias | Should |
| RF-60 | Exportar todos os dados em JSON (backup) | Should |
| RF-61 | Importar backup em JSON (restauração) | Could |
| RF-62 | Exportar projeto ou lista de tarefas em CSV | Could |

---

## 5. Regras de negócio

| ID | Regra |
|---|---|
| RN-01 | Ao transicionar o status do projeto para `finalizado`: `concluido_em` = data/hora atual; `recebimento_previsto_para` = `concluido_em` + N dias (N = 10 por padrão, configurável); `status_recebimento` = `a_receber`. |
| RN-02 | O prazo é contado em **dias corridos**, não úteis. Se a data-limite cair em fim de semana ou feriado, ela permanece. |
| RN-03 | Um recebimento é `atrasado` quando a data atual ultrapassa `recebimento_previsto_para` e `status_recebimento` ≠ `recebido`. Essa transição é calculada em tempo de leitura — não depende de tarefa agendada. |
| RN-04 | Ao marcar como recebido: `recebido_em` = data informada (padrão hoje); `status_recebimento` = `recebido`. O registro fica congelado e não volta a ser `atrasado`. |
| RN-05 | Reabrir um projeto `finalizado` ainda não recebido limpa `concluido_em` e `recebimento_previsto_para`, e devolve `status_recebimento` para `pendente`. Exige confirmação explícita. |
| RN-06 | Um projeto já **recebido** não pode ser reaberto sem antes desfazer o recebimento. |
| RN-07 | Progresso do projeto = tarefas concluídas ÷ total de tarefas. Projeto sem tarefas exibe 0% e não bloqueia a finalização. |
| RN-08 | Finalizar um projeto com tarefas pendentes é permitido, mas o app avisa quantas ficaram em aberto e pede confirmação. |
| RN-09 | Valores monetários são armazenados como inteiro em centavos (BRL) e formatados apenas na exibição. Nenhuma operação financeira usa ponto flutuante. |
| RN-10 | Todas as datas são gravadas em UTC (ISO 8601) e exibidas no fuso `America/Sao_Paulo`. Comparações de prazo usam o início do dia local. |
| RN-11 | Excluir um projeto remove em cascata suas tarefas, importações e linhas importadas. A ação é irreversível e exige digitar o nome do projeto para confirmar. |
| RN-12 | Uma importação gera exatamente uma tarefa por linha de dados válida. Linhas em branco e repetições do cabeçalho entre páginas são descartadas. |
| RN-13 | Descartar uma importação remove as tarefas geradas por ela que ainda não foram concluídas. Tarefas já concluídas são preservadas e ficam desvinculadas. |
| RN-14 | O valor do projeto é independente do conteúdo importado. O app não soma colunas do PDF para compor o valor no MVP. |

---

## 6. Modelo de dados

```
Projeto
  id                        uuid
  nome                      texto      obrigatório
  cliente                   texto      opcional
  descricao                 texto      opcional
  cor                       texto      token de cor do identificador visual
  status                    enum       planejado | em_andamento | finalizado | arquivado
  data_inicio               data       obrigatório
  data_fim_prevista         data       obrigatório
  concluido_em              timestamp  preenchido pela RN-01
  valor_centavos            inteiro    obrigatório
  status_recebimento        enum       pendente | a_receber | recebido | atrasado (derivado)
  recebimento_previsto_para data       calculado pela RN-01
  recebido_em               data       opcional
  valor_recebido_centavos   inteiro    opcional, recebimento parcial
  criado_em / atualizado_em timestamp

Tarefa
  id                uuid
  projeto_id        uuid → Projeto
  titulo            texto      obrigatório
  observacoes       texto      opcional
  status            enum       a_fazer | em_andamento | concluida
  prazo             data       opcional
  ordem             inteiro
  linha_origem_id   uuid       opcional → LinhaImportada
  concluida_em      timestamp  opcional
  criado_em / atualizado_em

Importacao
  id                  uuid
  projeto_id          uuid → Projeto
  nome_arquivo        texto
  tamanho_bytes       inteiro
  total_paginas       inteiro
  colunas_detectadas  json   [{ indice, nome, x_inicio, x_fim, confianca }]
  colunas_escolhidas  json   [indices marcados pelo usuário]
  mapeamento          json   { titulo: indice, prazo: indice|null, observacoes: indice|null }
  linha_cabecalho     inteiro
  total_linhas        inteiro
  criado_em

LinhaImportada
  id              uuid
  importacao_id   uuid → Importacao
  projeto_id      uuid → Projeto
  numero_linha    inteiro
  dados           json   { "<nome_coluna>": "<valor>" } apenas colunas escolhidas
  tarefa_id       uuid   opcional → Tarefa

Configuracao          (registro único)
  id                        inteiro fixo = 1
  janela_recebimento_dias   inteiro   padrão 10
  moeda                     texto     padrão BRL
  tema                      enum      sistema | claro | escuro
```

**Índices necessários:** `Projeto(status)`, `Projeto(recebimento_previsto_para)`, `Tarefa(projeto_id, status)`, `LinhaImportada(projeto_id)`.

---

## 7. Fluxos principais

### 7.1 Fluxo de importação

```
[Home] → Novo projeto → nome / cliente / datas / valor → Criar
                                 ↓
                     [Detalhe do projeto — vazio]
                                 ↓
                      "Importar planilha PDF"
                                 ↓
 Passo 1 — Upload         arrasta o PDF · validação de tipo e tamanho
                                 ↓
 Passo 2 — Reconhecimento app extrai texto, reconstrói linhas e colunas
                          exibe preview de 20 linhas
                          usuário confirma ou corrige a linha de cabeçalho
                                 ↓
 Passo 3 — Seleção        cada coluna aparece com checkbox + amostra de 3 valores
                          usuário MARCA as colunas que quer importar
                          escolhe qual coluna vira o título da tarefa
                          opcional: prazo, observações, renomear colunas
                                 ↓
 Passo 4 — Confirmação    "142 linhas · 4 colunas · 142 tarefas serão criadas"
                                 ↓
                     [Detalhe do projeto — 142 tarefas]
```

**Caminhos de exceção:**

| Situação | Comportamento |
|---|---|
| PDF sem camada de texto | Mensagem clara: "Este PDF é uma imagem digitalizada, não há texto para extrair." Oferece criar tarefas manualmente. |
| Nenhuma estrutura de tabela detectada | Exibe o texto bruto por linha e permite importar como lista simples de uma coluna. |
| Cabeçalho detectado errado | Usuário clica em qualquer linha do preview e a define como cabeçalho. |
| Arquivo acima do limite | Bloqueia informando o tamanho do arquivo e o limite. |
| Coluna de título não escolhida | Botão de confirmar fica desabilitado com explicação inline. |

### 7.2 Fluxo de recebimento

```
Projeto em_andamento
        ↓ usuário marca "Finalizar projeto"
   [aviso se há tarefas pendentes] → confirma
        ↓
concluido_em = hoje
recebimento_previsto_para = hoje + 10 dias
status_recebimento = a_receber
        ↓
Home e painel de recebimentos exibem contagem regressiva
        ↓
   ┌─────────────────────┬──────────────────────┬────────────────────┐
   ↓                     ↓                      ↓                    
faltam > 3 dias     faltam ≤ 3 dias        prazo vencido
 (estado neutro)     (estado de alerta)     (estado crítico)
        ↓ usuário marca "Recebido" (informa a data)
status_recebimento = recebido · valor entra no realizado do mês
```

---

## 8. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF-01 | **Responsividade total.** Layout funcional e confortável de 320 px a 2560 px. Nenhuma funcionalidade exclusiva de desktop. |
| RNF-02 | **Performance.** Home carrega em menos de 1,5 s com 100 projetos. Lista de 1.000 tarefas rola sem travar (virtualização acima de 200 itens). |
| RNF-03 | **Extração de PDF.** Arquivo de 150 linhas processado em menos de 5 s, com indicador de progresso. |
| RNF-04 | **Sem autenticação no app.** Nenhuma tela de login. A proteção fica na camada de infraestrutura. |
| RNF-04a | **Proteção de acesso.** Se publicado na internet, o acesso deve ser restringido no proxy reverso — Basic Auth ou allowlist de IP. Sem isso, qualquer pessoa com a URL vê e edita os dados financeiros. |
| RNF-05 | **Persistência confiável.** Nenhuma perda de dados em recarregamento ou fechamento do navegador. Exportação JSON como backup manual. |
| RNF-06 | **Acessibilidade.** Contraste mínimo AA (4.5:1) em texto, navegação por teclado completa no assistente de importação, alvos de toque de no mínimo 44×44 px. |
| RNF-07 | **Estados sempre visíveis.** Toda operação assíncrona tem estado de carregamento, de erro e de vazio. |
| RNF-08 | **Tolerância a rede ruim.** Marcar tarefa aplica atualização otimista e reconcilia depois. |
| RNF-09 | **Privacidade.** Dados ficam na infraestrutura do próprio usuário. Nenhum envio a serviço de terceiros para processar o PDF. |
| RNF-10 | **Idioma.** Interface em português do Brasil. Moeda BRL. Datas em dd/mm/aaaa. |

---

## 9. Fora de escopo (V1)

Registrado explicitamente para evitar expansão silenciosa:

- Login, contas, múltiplos usuários, permissões, compartilhamento
- OCR de PDFs digitalizados
- Importação de CSV, XLSX ou fotos de planilha
- Emissão de nota fiscal, boleto, integração bancária ou conciliação
- Notificações por e-mail, push ou WhatsApp
- Aplicativo nativo iOS/Android
- Relatórios avançados, gráficos históricos, previsão de fluxo de caixa
- Subtarefas, dependências entre tarefas, gráfico de Gantt
- Anexos de arquivos nas tarefas
- Modo offline completo com sincronização

---

## 10. Roadmap

| Fase | Conteúdo | Critério de saída |
|---|---|---|
| **V1 — MVP** | Projetos, importação de PDF com seleção de colunas, tarefas, regra dos 10 dias, home responsiva | Um projeto real vai do PDF ao recebimento inteiramente no app |
| **V1.1** | Importação de CSV/XLSX, exportação CSV, backup e restauração JSON, ações em lote | Nenhuma planilha exige digitação manual |
| **V1.2** | Painel financeiro por mês, recebimento parcial, arquivamento, filtros salvos | Fechamento mensal feito sem planilha externa |
| **V2** | OCR para PDFs digitalizados, PWA instalável, notificação de vencimento, anexos | Funciona no celular como app instalado |
| **V3** | Templates de projeto, recorrência, relatórios comparativos | Projetos repetitivos criados em um clique |

---

## 11. Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| PDFs com layout irregular quebram a detecção de colunas | Alto | Alta | Preview sempre visível, cabeçalho ajustável manualmente, fallback para lista de coluna única |
| PDFs digitalizados sem camada de texto | Alto | Média | Detecção explícita com mensagem clara; OCR fica para V2 |
| Células com quebra de linha viram linhas separadas | Médio | Média | Heurística de mesclagem por altura de linha; usuário pode excluir linhas no preview |
| App exposto sem autenticação | Alto | Média | Basic Auth no proxy reverso, documentado como pré-requisito de deploy |
| Perda de dados por falta de backup | Alto | Baixa | Exportação JSON na V1.1; backup do banco no deploy |
| Escopo crescer para ferramenta multiusuário | Médio | Média | A seção 9 deste PRD é vinculante |

---

## 12. Decisões assumidas

Registradas por ausência de definição explícita. Podem ser revistas sem retrabalho estrutural.

| # | Assunção |
|---|---|
| A1 | Cada linha da planilha importada vira **uma tarefa** do projeto. |
| A2 | Os 10 dias são **dias corridos** contados a partir da finalização, e o valor é configurável. |
| A3 | Moeda única: **BRL**. |
| A4 | O valor do projeto é informado manualmente, não calculado a partir do PDF. |
| A5 | O app é de instância única, rodando na VPS do usuário, com banco próprio. |
| A6 | Um projeto tem um único valor total, não múltiplas parcelas. |

## 13. Questões em aberto

| # | Questão | Impacto se mudar |
|---|---|---|
| Q1 | Cada linha do PDF deve virar uma tarefa, ou os dados importados são apenas uma tabela de referência consultável? | Muda a aba principal do detalhe do projeto |
| Q2 | Os 10 dias contam a partir da finalização ou da emissão da nota fiscal? | Adiciona campo e etapa ao fluxo de fechamento |
| Q3 | Um projeto pode ter recebimento parcelado? | Exige tabela de parcelas e muda o painel financeiro |
| Q4 | Os PDFs recebidos têm sempre camada de texto, ou há digitalizações? | Se houver digitalização, OCR sobe para o MVP |
| Q5 | O app ficará exposto na internet ou apenas em rede local/VPN? | Define a estratégia de proteção de acesso |
