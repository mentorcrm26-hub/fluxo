import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, tratarErroApi } from '@/lib/api';
import { obterHojeISO } from '@/lib/datas';
import { calcularMinhaParteCentavos } from '@/lib/dinheiro';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const hojeIso = obterHojeISO();
    const hojeDate = new Date(`${hojeIso}T00:00:00Z`);

    const ano = hojeDate.getUTCFullYear();
    const mes = hojeDate.getUTCMonth(); // 0-indexed

    const inicioMes = new Date(Date.UTC(ano, mes, 1));
    const fimMes = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59, 999));

    // Buscar projetos com seus valores e porcentagens
    const projetos = await prisma.projeto.findMany({
      select: {
        id: true,
        status: true,
        valorCentavos: true,
        porcentagem: true,
        valorRecebidoCentavos: true,
        recebidoEm: true,
        recebimentoPrevistoPara: true,
      },
    });

    let aReceberCentavos = 0;
    let aReceberQuantidade = 0;
    let recebidoNoMesCentavos = 0;
    let recebidoNoMesQuantidade = 0;
    let atrasadoCentavos = 0;
    let atrasadoQuantidade = 0;
    let emExecucaoCentavos = 0;
    let emExecucaoQuantidade = 0;

    for (const p of projetos) {
      const porcentagem = typeof p.porcentagem === 'number' ? p.porcentagem : 45;
      const minhaParteCentavos = calcularMinhaParteCentavos(p.valorCentavos, porcentagem);

      if (p.status === 'em_andamento') {
        emExecucaoCentavos += minhaParteCentavos;
        emExecucaoQuantidade += 1;
      }

      if (p.recebidoEm) {
        const dataRecebido = new Date(p.recebidoEm);
        if (dataRecebido >= inicioMes && dataRecebido <= fimMes) {
          const valorBase = p.valorRecebidoCentavos ?? p.valorCentavos;
          recebidoNoMesCentavos += calcularMinhaParteCentavos(valorBase, porcentagem);
          recebidoNoMesQuantidade += 1;
        }
      } else if (p.status === 'finalizado') {
        if (p.recebimentoPrevistoPara && new Date(p.recebimentoPrevistoPara) < hojeDate) {
          atrasadoCentavos += minhaParteCentavos;
          atrasadoQuantidade += 1;
          // Projetos atrasados também constam no total a receber
          aReceberCentavos += minhaParteCentavos;
          aReceberQuantidade += 1;
        } else {
          aReceberCentavos += minhaParteCentavos;
          aReceberQuantidade += 1;
        }
      }
    }

    return respostaSucesso({
      aReceberCentavos,
      aReceberQuantidade,
      recebidoNoMesCentavos,
      recebidoNoMesQuantidade,
      atrasadoCentavos,
      atrasadoQuantidade,
      emExecucaoCentavos,
      emExecucaoQuantidade,
    });
  } catch (err) {
    return tratarErroApi(err);
  }
}

