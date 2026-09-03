import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, tratarErroApi } from '@/lib/api';
import { obterHojeISO } from '@/lib/datas';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const hojeIso = obterHojeISO();
    const hojeDate = new Date(`${hojeIso}T00:00:00Z`);

    const ano = hojeDate.getUTCFullYear();
    const mes = hojeDate.getUTCMonth(); // 0-indexed

    const inicioMes = new Date(Date.UTC(ano, mes, 1));
    const fimMes = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59, 999));

    // Consultas agregadas no banco
    const [aReceberAgg, atrasadoAgg, recebidoNoMesAgg, emExecucaoAgg] = await Promise.all([
      prisma.projeto.aggregate({
        where: {
          status: 'finalizado',
          recebidoEm: null,
          recebimentoPrevistoPara: {
            gte: hojeDate,
          },
        },
        _sum: { valorCentavos: true },
        _count: { id: true },
      }),
      prisma.projeto.aggregate({
        where: {
          status: 'finalizado',
          recebidoEm: null,
          recebimentoPrevistoPara: {
            lt: hojeDate,
          },
        },
        _sum: { valorCentavos: true },
        _count: { id: true },
      }),
      prisma.projeto.aggregate({
        where: {
          recebidoEm: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
        _sum: { valorRecebidoCentavos: true, valorCentavos: true },
        _count: { id: true },
      }),
      prisma.projeto.aggregate({
        where: {
          status: 'em_andamento',
        },
        _sum: { valorCentavos: true },
        _count: { id: true },
      }),
    ]);

    const recebidoCentavos =
      recebidoNoMesAgg._sum.valorRecebidoCentavos ?? recebidoNoMesAgg._sum.valorCentavos ?? 0;

    return respostaSucesso({
      aReceberCentavos: aReceberAgg._sum.valorCentavos ?? 0,
      aReceberQuantidade: aReceberAgg._count.id ?? 0,
      recebidoNoMesCentavos: recebidoCentavos,
      recebidoNoMesQuantidade: recebidoNoMesAgg._count.id ?? 0,
      atrasadoCentavos: atrasadoAgg._sum.valorCentavos ?? 0,
      atrasadoQuantidade: atrasadoAgg._count.id ?? 0,
      emExecucaoCentavos: emExecucaoAgg._sum.valorCentavos ?? 0,
      emExecucaoQuantidade: emExecucaoAgg._count.id ?? 0,
    });
  } catch (err) {
    return tratarErroApi(err);
  }
}
