import { z } from 'zod';

export const corProjetoSchema = z.enum(['violeta', 'azul', 'verde', 'ambar', 'rosa', 'ciano']);
export const statusProjetoSchema = z.enum(['planejado', 'em_andamento', 'finalizado', 'arquivado']);
export const statusTarefaSchema = z.enum(['a_fazer', 'em_andamento', 'concluida']);

const regexData = /^\d{4}-\d{2}-\d{2}$/;

export const criarProjetoSchema = z
  .object({
    nome: z.string().trim().min(1, 'O nome do projeto é obrigatório').max(120, 'O nome deve ter até 120 caracteres'),
    cliente: z.string().trim().nullable().optional(),
    descricao: z.string().trim().nullable().optional(),
    cor: corProjetoSchema.default('violeta'),
    dataInicio: z.string().regex(regexData, 'A data de início deve estar no formato AAAA-MM-DD'),
    dataFimPrevista: z.string().regex(regexData, 'A data final prevista deve estar no formato AAAA-MM-DD'),
    valorCentavos: z.number().int('O valor deve ser um número inteiro em centavos').nonnegative('O valor não pode ser negativo'),
    porcentagem: z.number().int().min(0, 'A porcentagem não pode ser menor que 0%').max(100, 'A porcentagem não pode ultrapassar 100%').default(45),
  })
  .refine((data) => data.dataFimPrevista >= data.dataInicio, {
    message: 'A data final prevista não pode ser anterior à data de início',
    path: ['dataFimPrevista'],
  });

export const atualizarProjetoSchema = z.object({
  nome: z.string().trim().min(1, 'O nome do projeto é obrigatório').max(120).optional(),
  cliente: z.string().trim().nullable().optional(),
  descricao: z.string().trim().nullable().optional(),
  cor: corProjetoSchema.optional(),
  status: statusProjetoSchema.optional(),
  dataInicio: z.string().regex(regexData, 'Formato inválido').optional(),
  dataFimPrevista: z.string().regex(regexData, 'Formato inválido').optional(),
  valorCentavos: z.number().int().nonnegative().optional(),
  porcentagem: z.number().int().min(0).max(100).optional(),
  recebimentoPrevistoPara: z.string().regex(regexData).nullable().optional(),
  recebidoEm: z.string().regex(regexData).nullable().optional(),
  valorRecebidoCentavos: z.number().int().nonnegative().nullable().optional(),
});

export const criarTarefaSchema = z.object({
  titulo: z.string().trim().min(1, 'O título da tarefa é obrigatório'),
  tituloTraduzido: z.string().trim().nullable().optional(),
  observacoes: z.string().trim().nullable().optional(),
  prazo: z.string().regex(regexData, 'Formato de data inválido').nullable().optional(),
});

export const atualizarTarefaSchema = z.object({
  titulo: z.string().trim().min(1).optional(),
  tituloTraduzido: z.string().trim().nullable().optional(),
  observacoes: z.string().trim().nullable().optional(),
  status: statusTarefaSchema.optional(),
  prazo: z.string().regex(regexData, 'Formato de data inválido').nullable().optional(),
  ordem: z.number().int().optional(),
});

export const concluirTarefasSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Informe ao menos um ID de tarefa'),
});

export const criarImportacaoSchema = z.object({
  nomeArquivo: z.string().min(1, 'Nome do arquivo é obrigatório'),
  tamanhoBytes: z.number().int().nonnegative(),
  totalPaginas: z.number().int().min(1),
  colunasDetectadas: z.array(
    z.object({
      indice: z.number().int(),
      nome: z.string(),
      xInicio: z.number(),
      xFim: z.number(),
      confianca: z.number(),
      amostras: z.array(z.string()),
    })
  ),
  colunasEscolhidas: z.array(z.number().int()),
  mapeamento: z.object({
    titulo: z.number().int(),
    prazo: z.number().int().nullable(),
    observacoes: z.number().int().nullable(),
  }),
  linhaCabecalho: z.number().int(),
  linhas: z
    .array(z.record(z.string()))
    .max(5000, 'Importação muito grande. Divida o arquivo em partes de até 5.000 linhas.'),
});

export const salvarConfiguracaoSchema = z.object({
  janelaRecebimentoDias: z.number().int().min(1, 'A janela deve ser de no mínimo 1 dia').optional(),
  moeda: z.enum(['USD', 'BRL']).optional(),
  tema: z.enum(['sistema', 'claro', 'escuro']).optional(),
});

export const migracaoLocalStorageSchema = z.object({
  projetos: z.array(z.any()),
  tarefas: z.array(z.any()),
  importacoes: z.array(z.any()),
  linhas: z.array(z.any()),
  configuracao: z.any().optional(),
});
