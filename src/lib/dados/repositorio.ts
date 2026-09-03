import {
  ColunaDetectada,
  Configuracao,
  Importacao,
  LinhaImportada,
  MapeamentoColunas,
  Projeto,
  ProjetoComResumo,
  ResumoFinanceiro,
  StatusProjeto,
  Tarefa,
} from './tipos';

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
  criarTarefa(projetoId: string, dados: { titulo: string; tituloTraduzido?: string | null; observacoes?: string; prazo?: string }): Promise<Tarefa>;
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
  restaurarDadosIniciais(): Promise<void>;
}
