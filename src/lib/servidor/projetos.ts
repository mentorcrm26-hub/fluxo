import { Projeto as PrismaProjeto, Tarefa as PrismaTarefa } from '@prisma/client';
import { Projeto, ProjetoComResumo, CorProjeto, StatusProjeto } from '../dados/tipos';
import { derivarStatusRecebimento, diasAte } from '../prazo';

export function formatarDataDbParaIso(data: Date | null | undefined): string | null {
  if (!data) return null;
  // Para campos @db.Date no Postgres, data.toISOString().split('T')[0] preserva a data exata
  return data.toISOString().split('T')[0];
}

export function transformarProjetoPrisma(p: PrismaProjeto): Projeto {
  return {
    id: p.id,
    nome: p.nome,
    cliente: p.cliente,
    descricao: p.descricao,
    cor: p.cor as CorProjeto,
    status: p.status as StatusProjeto,
    dataInicio: formatarDataDbParaIso(p.dataInicio) || '',
    dataFimPrevista: formatarDataDbParaIso(p.dataFimPrevista) || '',
    concluidoEm: p.concluidoEm ? p.concluidoEm.toISOString() : null,
    valorCentavos: p.valorCentavos,
    porcentagem: p.porcentagem ?? 45,
    recebimentoPrevistoPara: formatarDataDbParaIso(p.recebimentoPrevistoPara),
    recebidoEm: formatarDataDbParaIso(p.recebidoEm),
    valorRecebidoCentavos: p.valorRecebidoCentavos,
    criadoEm: p.criadoEm.toISOString(),
    atualizadoEm: p.atualizadoEm.toISOString(),
  };
}

export function enriquecerProjetoComTarefas(
  projetoPrisma: PrismaProjeto,
  totalTarefas: number,
  tarefasConcluidas: number
): ProjetoComResumo {
  const projeto = transformarProjetoPrisma(projetoPrisma);
  const progresso = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;
  const statusRecebimento = derivarStatusRecebimento(projeto);
  const diasAteRecebimento =
    projeto.recebimentoPrevistoPara && statusRecebimento !== 'recebido'
      ? diasAte(projeto.recebimentoPrevistoPara)
      : null;

  return {
    ...projeto,
    totalTarefas,
    tarefasConcluidas,
    progresso,
    statusRecebimento,
    diasAteRecebimento,
  };
}

export function transformarTarefaPrisma(t: PrismaTarefa) {
  return {
    id: t.id,
    projetoId: t.projetoId,
    titulo: t.titulo,
    tituloTraduzido: t.tituloTraduzido,
    observacoes: t.observacoes,
    status: t.status,
    prazo: formatarDataDbParaIso(t.prazo),
    ordem: t.ordem,
    linhaOrigemId: t.linhaOrigemId,
    concluidaEm: t.concluidaEm ? t.concluidaEm.toISOString() : null,
    criadoEm: t.criadoEm.toISOString(),
  };
}
