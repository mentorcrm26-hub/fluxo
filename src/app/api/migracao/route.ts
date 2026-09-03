import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, respostaErro, tratarErroApi } from '@/lib/api';
import { migracaoLocalStorageSchema } from '@/lib/validadores';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contagemProjetos = await prisma.projeto.count();
    if (contagemProjetos > 0) {
      return respostaErro(
        'O banco já contém dados. A migração só pode ser feita uma vez.',
        'CONFLITO',
        409
      );
    }

    const json = await req.json();
    const dados = migracaoLocalStorageSchema.parse(json);

    // Preparar dados
    const projetos = (dados.projetos || []).map((p: any) => ({
      id: p.id,
      nome: p.nome,
      cliente: p.cliente || null,
      descricao: p.descricao || null,
      cor: p.cor || 'violeta',
      status: p.status || 'planejado',
      dataInicio: new Date(`${p.dataInicio}T00:00:00Z`),
      dataFimPrevista: new Date(`${p.dataFimPrevista}T00:00:00Z`),
      concluidoEm: p.concluidoEm ? new Date(p.concluidoEm) : null,
      valorCentavos: p.valorCentavos || 0,
      porcentagem: typeof p.porcentagem === 'number' ? p.porcentagem : 45,
      recebimentoPrevistoPara: p.recebimentoPrevistoPara
        ? new Date(`${p.recebimentoPrevistoPara}T00:00:00Z`)
        : null,
      recebidoEm: p.recebidoEm ? new Date(`${p.recebidoEm}T00:00:00Z`) : null,
      valorRecebidoCentavos: p.valorRecebidoCentavos ?? null,
      criadoEm: p.criadoEm ? new Date(p.criadoEm) : new Date(),
    }));

    const importacoes = (dados.importacoes || []).map((i: any) => ({
      id: i.id,
      projetoId: i.projetoId,
      nomeArquivo: i.nomeArquivo,
      tamanhoBytes: i.tamanhoBytes,
      totalPaginas: i.totalPaginas,
      colunasDetectadas: i.colunasDetectadas,
      colunasEscolhidas: i.colunasEscolhidas,
      mapeamento: i.mapeamento,
      linhaCabecalho: i.linhaCabecalho,
      totalLinhas: i.totalLinhas,
      criadoEm: i.criadoEm ? new Date(i.criadoEm) : new Date(),
    }));

    const linhas = (dados.linhas || []).map((l: any) => ({
      id: l.id,
      importacaoId: l.importacaoId,
      projetoId: l.projetoId,
      numeroLinha: l.numeroLinha,
      dados: l.dados,
    }));

    const tarefas = (dados.tarefas || []).map((t: any) => ({
      id: t.id,
      projetoId: t.projetoId,
      titulo: t.titulo,
      tituloTraduzido: t.tituloTraduzido || null,
      observacoes: t.observacoes || null,
      status: t.status || 'a_fazer',
      prazo: t.prazo ? new Date(`${t.prazo}T00:00:00Z`) : null,
      ordem: t.ordem || 0,
      linhaOrigemId: t.linhaOrigemId || null,
      concluidaEm: t.concluidaEm ? new Date(t.concluidaEm) : null,
      criadoEm: t.criadoEm ? new Date(t.criadoEm) : new Date(),
    }));

    // Transação única
    await prisma.$transaction(async (tx) => {
      if (projetos.length > 0) {
        await tx.projeto.createMany({ data: projetos });
      }
      if (importacoes.length > 0) {
        await tx.importacao.createMany({ data: importacoes });
      }
      if (linhas.length > 0) {
        await tx.linhaImportada.createMany({ data: linhas });
      }
      if (tarefas.length > 0) {
        await tx.tarefa.createMany({ data: tarefas });
      }

      if (dados.configuracao) {
        await tx.configuracao.upsert({
          where: { id: 1 },
          update: {
            janelaRecebimentoDias: dados.configuracao.janelaRecebimentoDias || 10,
            moeda: dados.configuracao.moeda || 'USD',
            tema: dados.configuracao.tema || 'sistema',
          },
          create: {
            id: 1,
            janelaRecebimentoDias: dados.configuracao.janelaRecebimentoDias || 10,
            moeda: dados.configuracao.moeda || 'USD',
            tema: dados.configuracao.tema || 'sistema',
          },
        });
      }
    });

    return respostaSucesso({
      projetos: projetos.length,
      tarefas: tarefas.length,
      importacoes: importacoes.length,
      linhas: linhas.length,
    });
  } catch (err) {
    return tratarErroApi(err);
  }
}
