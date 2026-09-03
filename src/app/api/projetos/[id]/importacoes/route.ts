import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, tratarErroApi } from '@/lib/api';
import { criarImportacaoSchema } from '@/lib/validadores';
import { traduzirDescricaoParaPtBr } from '@/lib/traducao/tradutor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projetoId } = params;

    const importacoes = await prisma.importacao.findMany({
      where: { projetoId },
      orderBy: { criadoEm: 'desc' },
    });

    const formatadas = importacoes.map((i) => ({
      id: i.id,
      projetoId: i.projetoId,
      nomeArquivo: i.nomeArquivo,
      tamanhoBytes: i.tamanhoBytes,
      totalPaginas: i.totalPaginas,
      colunasDetectadas: i.colunasDetectadas as any,
      colunasEscolhidas: i.colunasEscolhidas as any,
      mapeamento: i.mapeamento as any,
      linhaCabecalho: i.linhaCabecalho,
      totalLinhas: i.totalLinhas,
      criadoEm: i.criadoEm.toISOString(),
    }));

    return respostaSucesso(formatadas);
  } catch (err) {
    return tratarErroApi(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projetoId } = params;
    const json = await req.json();
    const payload = criarImportacaoSchema.parse(json);

    const importacaoId = `imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nomeColunaTitulo =
      payload.colunasDetectadas.find((c) => c.indice === payload.mapeamento.titulo)?.nome || 'Descrição';
    const nomeColunaPrazo =
      payload.mapeamento.prazo !== null
        ? payload.colunasDetectadas.find((c) => c.indice === payload.mapeamento.prazo)?.nome
        : null;
    const nomeColunaObs =
      payload.mapeamento.observacoes !== null
        ? payload.colunasDetectadas.find((c) => c.indice === payload.mapeamento.observacoes)?.nome
        : null;

    // Obter maior ordem existente
    const ultimaTarefa = await prisma.tarefa.findFirst({
      where: { projetoId },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });
    let ordemAtual = ultimaTarefa ? ultimaTarefa.ordem + 1 : 1;

    // Filtrar linhas vazias
    const linhasValidas = payload.linhas.filter((linha) => {
      const valores = Object.values(linha).map((v) => (v || '').trim()).filter(Boolean);
      return valores.length > 0;
    });

    const linhasCriar = linhasValidas.map((linhaDados, i) => {
      const linhaId = crypto.randomUUID();
      return {
        id: linhaId,
        importacaoId,
        projetoId,
        numeroLinha: i + 1,
        dados: linhaDados,
      };
    });

    const tarefasCriar = linhasCriar.map((linha, i) => {
      const tarefaId = crypto.randomUUID();
      const rawTitulo = String(linha.dados[nomeColunaTitulo] || '').trim();
      const titulo = rawTitulo || `Item importado #${i + 1}`;
      const tituloTraduzido =
        linha.dados['Tradução'] ||
        linha.dados['tituloTraduzido'] ||
        traduzirDescricaoParaPtBr(titulo);

      const observacao = nomeColunaObs ? linha.dados[nomeColunaObs] || null : null;

      let prazo: Date | null = null;
      if (nomeColunaPrazo && linha.dados[nomeColunaPrazo]) {
        const strPrazo = linha.dados[nomeColunaPrazo].trim();
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(strPrazo)) {
          const [d, m, y] = strPrazo.split('/');
          prazo = new Date(`${y}-${m}-${d}T00:00:00Z`);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(strPrazo)) {
          prazo = new Date(`${strPrazo}T00:00:00Z`);
        }
      }

      return {
        id: tarefaId,
        projetoId,
        titulo,
        tituloTraduzido: tituloTraduzido || null,
        observacoes: observacao,
        status: 'a_fazer' as const,
        prazo,
        ordem: ordemAtual + i,
        linhaOrigemId: linha.id,
      };
    });

    // Transação atômica
    await prisma.$transaction([
      prisma.importacao.create({
        data: {
          id: importacaoId,
          projetoId,
          nomeArquivo: payload.nomeArquivo,
          tamanhoBytes: payload.tamanhoBytes,
          totalPaginas: payload.totalPaginas,
          colunasDetectadas: payload.colunasDetectadas as any,
          colunasEscolhidas: payload.colunasEscolhidas as any,
          mapeamento: payload.mapeamento as any,
          linhaCabecalho: payload.linhaCabecalho,
          totalLinhas: linhasCriar.length,
        },
      }),
      prisma.linhaImportada.createMany({
        data: linhasCriar,
      }),
      prisma.tarefa.createMany({
        data: tarefasCriar,
      }),
    ]);

    const importacaoSalva = await prisma.importacao.findUnique({
      where: { id: importacaoId },
    });

    return respostaSucesso(
      {
        importacao: {
          id: importacaoSalva!.id,
          projetoId: importacaoSalva!.projetoId,
          nomeArquivo: importacaoSalva!.nomeArquivo,
          tamanhoBytes: importacaoSalva!.tamanhoBytes,
          totalPaginas: importacaoSalva!.totalPaginas,
          colunasDetectadas: importacaoSalva!.colunasDetectadas as any,
          colunasEscolhidas: importacaoSalva!.colunasEscolhidas as any,
          mapeamento: importacaoSalva!.mapeamento as any,
          linhaCabecalho: importacaoSalva!.linhaCabecalho,
          totalLinhas: importacaoSalva!.totalLinhas,
          criadoEm: importacaoSalva!.criadoEm.toISOString(),
        },
        tarefasCriadas: tarefasCriar.length,
      },
      201
    );
  } catch (err) {
    return tratarErroApi(err);
  }
}
