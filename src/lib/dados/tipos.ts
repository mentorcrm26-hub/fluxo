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
  valorCentavos: number;               // 1240000 = $ 12,400.00
  porcentagem: number;                 // Padrão 45 (45%)
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
  tituloTraduzido?: string | null;     // Tradução PT-BR
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
  moeda: 'USD' | 'BRL';
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
