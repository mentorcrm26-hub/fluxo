import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositorio } from './index';
import {
  ColunaDetectada,
  Configuracao,
  MapeamentoColunas,
  Projeto,
  ProjetoComResumo,
  StatusProjeto,
  Tarefa,
} from './tipos';

// Chaves de cache
export const queryKeys = {
  projetos: (filtro?: any) => ['projetos', filtro] as const,
  projeto: (id: string) => ['projeto', id] as const,
  tarefas: (projetoId: string) => ['tarefas', projetoId] as const,
  importacoes: (projetoId: string) => ['importacoes', projetoId] as const,
  linhas: (projetoId: string) => ['linhas', projetoId] as const,
  resumoFinanceiro: ['resumo-financeiro'] as const,
  recebimentos: ['recebimentos'] as const,
  configuracao: ['configuracao'] as const,
};

// ==========================================
// Hooks de Projetos
// ==========================================

export function useProjetos(filtro?: {
  status?: StatusProjeto | 'todos';
  busca?: string;
  ordem?: 'recentes' | 'prazo' | 'valor' | 'progresso';
}) {
  return useQuery({
    queryKey: queryKeys.projetos(filtro),
    queryFn: () => repositorio.listarProjetos(filtro),
  });
}

export function useProjeto(id: string) {
  return useQuery({
    queryKey: queryKeys.projeto(id),
    queryFn: () => repositorio.obterProjeto(id),
    enabled: !!id,
  });
}

export function useCriarProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: Omit<Projeto, 'id' | 'status' | 'concluidoEm' |
      'recebimentoPrevistoPara' | 'recebidoEm' | 'valorRecebidoCentavos' |
      'criadoEm' | 'atualizadoEm'>) => repositorio.criarProjeto(dados),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projetos'] });
      qc.invalidateQueries({ queryKey: queryKeys.resumoFinanceiro });
    },
  });
}

export function useAtualizarProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<Projeto> }) =>
      repositorio.atualizarProjeto(id, dados),
    onSuccess: (_, variaveis) => {
      qc.invalidateQueries({ queryKey: ['projetos'] });
      qc.invalidateQueries({ queryKey: queryKeys.projeto(variaveis.id) });
      qc.invalidateQueries({ queryKey: queryKeys.resumoFinanceiro });
      qc.invalidateQueries({ queryKey: queryKeys.recebimentos });
    },
  });
}

export function useExcluirProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositorio.excluirProjeto(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['projetos'] });
      qc.removeQueries({ queryKey: queryKeys.projeto(id) });
      qc.removeQueries({ queryKey: queryKeys.tarefas(id) });
      qc.invalidateQueries({ queryKey: queryKeys.resumoFinanceiro });
      qc.invalidateQueries({ queryKey: queryKeys.recebimentos });
    },
  });
}

export function useFinalizarProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositorio.finalizarProjeto(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['projetos'] });
      qc.invalidateQueries({ queryKey: queryKeys.projeto(id) });
      qc.invalidateQueries({ queryKey: queryKeys.resumoFinanceiro });
      qc.invalidateQueries({ queryKey: queryKeys.recebimentos });
    },
  });
}

export function useReabrirProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositorio.reabrirProjeto(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['projetos'] });
      qc.invalidateQueries({ queryKey: queryKeys.projeto(id) });
      qc.invalidateQueries({ queryKey: queryKeys.resumoFinanceiro });
      qc.invalidateQueries({ queryKey: queryKeys.recebimentos });
    },
  });
}

export function useReceberProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, recebidoEm }: { id: string; recebidoEm: string }) =>
      repositorio.receberProjeto(id, recebidoEm),
    onSuccess: (_, variaveis) => {
      qc.invalidateQueries({ queryKey: ['projetos'] });
      qc.invalidateQueries({ queryKey: queryKeys.projeto(variaveis.id) });
      qc.invalidateQueries({ queryKey: queryKeys.resumoFinanceiro });
      qc.invalidateQueries({ queryKey: queryKeys.recebimentos });
    },
  });
}

// ==========================================
// Hooks de Tarefas
// ==========================================

export function useTarefas(projetoId: string) {
  return useQuery({
    queryKey: queryKeys.tarefas(projetoId),
    queryFn: () => repositorio.listarTarefas(projetoId),
    enabled: !!projetoId,
  });
}

export function useCriarTarefa(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: { titulo: string; observacoes?: string; prazo?: string }) =>
      repositorio.criarTarefa(projetoId, dados),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tarefas(projetoId) });
      qc.invalidateQueries({ queryKey: queryKeys.projeto(projetoId) });
      qc.invalidateQueries({ queryKey: ['projetos'] });
    },
  });
}

export function useAtualizarTarefa(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<Tarefa> }) =>
      repositorio.atualizarTarefa(id, dados),
    onMutate: async ({ id, dados }) => {
      // Cancelar refetches concorrentes para não sobrescrever a UI otimista
      await qc.cancelQueries({ queryKey: queryKeys.tarefas(projetoId) });
      const anterior = qc.getQueryData<Tarefa[]>(queryKeys.tarefas(projetoId));

      if (anterior) {
        qc.setQueryData<Tarefa[]>(
          queryKeys.tarefas(projetoId),
          anterior.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...dados,
                  concluidaEm:
                    dados.status === 'concluida'
                      ? new Date().toISOString()
                      : dados.status === 'a_fazer' || dados.status === 'em_andamento'
                      ? null
                      : t.concluidaEm,
                }
              : t
          )
        );
      }

      return { anterior };
    },
    onError: (_err, _vars, context) => {
      if (context?.anterior) {
        qc.setQueryData(queryKeys.tarefas(projetoId), context.anterior);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tarefas(projetoId) });
      qc.invalidateQueries({ queryKey: queryKeys.projeto(projetoId) });
      qc.invalidateQueries({ queryKey: ['projetos'] });
    },
  });
}

export function useExcluirTarefa(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositorio.excluirTarefa(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tarefas(projetoId) });
      qc.invalidateQueries({ queryKey: queryKeys.projeto(projetoId) });
      qc.invalidateQueries({ queryKey: ['projetos'] });
    },
  });
}

export function useConcluirTarefas(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => repositorio.concluirTarefas(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tarefas(projetoId) });
      qc.invalidateQueries({ queryKey: queryKeys.projeto(projetoId) });
      qc.invalidateQueries({ queryKey: ['projetos'] });
    },
  });
}

// ==========================================
// Hooks de Importações e Linhas
// ==========================================

export function useImportacoes(projetoId: string) {
  return useQuery({
    queryKey: queryKeys.importacoes(projetoId),
    queryFn: () => repositorio.listarImportacoes(projetoId),
    enabled: !!projetoId,
  });
}

export function useLinhas(projetoId: string) {
  return useQuery({
    queryKey: queryKeys.linhas(projetoId),
    queryFn: () => repositorio.listarLinhas(projetoId),
    enabled: !!projetoId,
  });
}

export function useCriarImportacao(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      nomeArquivo: string;
      tamanhoBytes: number;
      totalPaginas: number;
      colunasDetectadas: ColunaDetectada[];
      colunasEscolhidas: number[];
      mapeamento: MapeamentoColunas;
      linhaCabecalho: number;
      linhas: Record<string, string>[];
    }) => repositorio.criarImportacao(projetoId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.importacoes(projetoId) });
      qc.invalidateQueries({ queryKey: queryKeys.linhas(projetoId) });
      qc.invalidateQueries({ queryKey: queryKeys.tarefas(projetoId) });
      qc.invalidateQueries({ queryKey: queryKeys.projeto(projetoId) });
      qc.invalidateQueries({ queryKey: ['projetos'] });
    },
  });
}

export function useExcluirImportacao(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositorio.excluirImportacao(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.importacoes(projetoId) });
      qc.invalidateQueries({ queryKey: queryKeys.linhas(projetoId) });
    },
  });
}

// ==========================================
// Hooks Financeiros e de Configuração
// ==========================================

export function useResumoFinanceiro() {
  return useQuery({
    queryKey: queryKeys.resumoFinanceiro,
    queryFn: () => repositorio.obterResumoFinanceiro(),
  });
}

export function useRecebimentos() {
  return useQuery({
    queryKey: queryKeys.recebimentos,
    queryFn: () => repositorio.listarRecebimentos(),
  });
}

export function useConfiguracao() {
  return useQuery({
    queryKey: queryKeys.configuracao,
    queryFn: () => repositorio.obterConfiguracao(),
  });
}

export function useSalvarConfiguracao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: Partial<Configuracao>) => repositorio.salvarConfiguracao(dados),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.configuracao });
    },
  });
}

export function useRestaurarDadosIniciais() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => repositorio.restaurarDadosIniciais(),
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}
