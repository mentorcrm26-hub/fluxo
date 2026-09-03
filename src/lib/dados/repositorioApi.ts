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
import { Repositorio } from './repositorio';

async function executarRequisicao<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (resposta.status === 204) {
    return undefined as unknown as T;
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem =
      dados?.erro?.mensagem ||
      dados?.message ||
      `Erro na requisição (${resposta.status}): ${resposta.statusText}`;
    throw new Error(mensagem);
  }

  return dados as T;
}

export const repositorioApi: Repositorio = {
  async listarProjetos(filtro?: {
    status?: StatusProjeto | 'todos';
    busca?: string;
    ordem?: 'recentes' | 'prazo' | 'valor' | 'progresso';
  }): Promise<ProjetoComResumo[]> {
    const params = new URLSearchParams();
    if (filtro?.status && filtro.status !== 'todos') params.set('status', filtro.status);
    if (filtro?.busca) params.set('busca', filtro.busca);
    if (filtro?.ordem) params.set('ordem', filtro.ordem);

    const query = params.toString() ? `?${params.toString()}` : '';
    return executarRequisicao<ProjetoComResumo[]>(`/api/projetos${query}`);
  },

  async obterProjeto(id: string): Promise<ProjetoComResumo | null> {
    try {
      return await executarRequisicao<ProjetoComResumo>(`/api/projetos/${id}`);
    } catch (err: any) {
      if (err.message?.includes('não encontrado')) return null;
      throw err;
    }
  },

  async criarProjeto(dadosEntrada: Omit<Projeto, 'id' | 'status' | 'concluidoEm' |
    'recebimentoPrevistoPara' | 'recebidoEm' | 'valorRecebidoCentavos' |
    'criadoEm' | 'atualizadoEm'>): Promise<Projeto> {
    return executarRequisicao<Projeto>('/api/projetos', {
      method: 'POST',
      body: JSON.stringify(dadosEntrada),
    });
  },

  async atualizarProjeto(id: string, dadosAtualizacao: Partial<Projeto>): Promise<Projeto> {
    return executarRequisicao<Projeto>(`/api/projetos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dadosAtualizacao),
    });
  },

  async excluirProjeto(id: string): Promise<void> {
    await executarRequisicao<void>(`/api/projetos/${id}`, {
      method: 'DELETE',
    });
  },

  async finalizarProjeto(id: string): Promise<ProjetoComResumo> {
    return executarRequisicao<ProjetoComResumo>(`/api/projetos/${id}/finalizar`, {
      method: 'POST',
    });
  },

  async reabrirProjeto(id: string): Promise<ProjetoComResumo> {
    return executarRequisicao<ProjetoComResumo>(`/api/projetos/${id}/reabrir`, {
      method: 'POST',
    });
  },

  async receberProjeto(id: string, dataRecebimento?: string): Promise<ProjetoComResumo> {
    return executarRequisicao<ProjetoComResumo>(`/api/projetos/${id}/receber`, {
      method: 'POST',
      body: JSON.stringify({ data: dataRecebimento }),
    });
  },

  async listarTarefas(projetoId: string): Promise<Tarefa[]> {
    return executarRequisicao<Tarefa[]>(`/api/projetos/${projetoId}/tarefas`);
  },

  async criarTarefa(
    projetoId: string,
    dadosEntrada: { titulo: string; tituloTraduzido?: string | null; observacoes?: string; prazo?: string }
  ): Promise<Tarefa> {
    return executarRequisicao<Tarefa>(`/api/projetos/${projetoId}/tarefas`, {
      method: 'POST',
      body: JSON.stringify(dadosEntrada),
    });
  },

  async atualizarTarefa(id: string, dadosAtualizacao: Partial<Tarefa>): Promise<Tarefa> {
    return executarRequisicao<Tarefa>(`/api/tarefas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dadosAtualizacao),
    });
  },

  async excluirTarefa(id: string): Promise<void> {
    await executarRequisicao<void>(`/api/tarefas/${id}`, {
      method: 'DELETE',
    });
  },

  async concluirTarefas(ids: string[]): Promise<void> {
    await executarRequisicao<void>('/api/tarefas/concluir', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  async listarImportacoes(projetoId: string): Promise<Importacao[]> {
    return executarRequisicao<Importacao[]>(`/api/projetos/${projetoId}/importacoes`);
  },

  async listarLinhas(projetoId: string): Promise<LinhaImportada[]> {
    return executarRequisicao<LinhaImportada[]>(`/api/projetos/${projetoId}/linhas`);
  },

  async criarImportacao(
    projetoId: string,
    payload: {
      nomeArquivo: string;
      tamanhoBytes: number;
      totalPaginas: number;
      colunasDetectadas: ColunaDetectada[];
      colunasEscolhidas: number[];
      mapeamento: MapeamentoColunas;
      linhaCabecalho: number;
      linhas: Record<string, string>[];
    }
  ): Promise<{ importacao: Importacao; tarefasCriadas: number }> {
    return executarRequisicao<{ importacao: Importacao; tarefasCriadas: number }>(
      `/api/projetos/${projetoId}/importacoes`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async excluirImportacao(id: string): Promise<void> {
    await executarRequisicao<void>(`/api/importacoes/${id}`, {
      method: 'DELETE',
    });
  },

  async obterResumoFinanceiro(): Promise<ResumoFinanceiro> {
    return executarRequisicao<ResumoFinanceiro>('/api/resumo-financeiro');
  },

  async listarRecebimentos(): Promise<ProjetoComResumo[]> {
    return executarRequisicao<ProjetoComResumo[]>('/api/recebimentos');
  },

  async obterConfiguracao(): Promise<Configuracao> {
    return executarRequisicao<Configuracao>('/api/configuracoes');
  },

  async salvarConfiguracao(dados: Partial<Configuracao>): Promise<Configuracao> {
    return executarRequisicao<Configuracao>('/api/configuracoes', {
      method: 'PATCH',
      body: JSON.stringify(dados),
    });
  },

  async restaurarDadosIniciais(): Promise<void> {
    // Modo API: sem operação de restauração de seed
  },
};
