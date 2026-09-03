import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, respostaErro, tratarErroApi } from '@/lib/api';
import { calcularRecebimentoPrevisto } from '@/lib/prazo';
import { obterHojeISO } from '@/lib/datas';
import { enriquecerProjetoComTarefas } from '@/lib/servidor/projetos';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const config = await prisma.configuracao.findFirst();
    const janelaDias = config?.janelaRecebimentoDias ?? 10;

    const agora = new Date();
    const hojeIso = obterHojeISO();
    const recebimentoPrevistoIso = calcularRecebimentoPrevisto(hojeIso, janelaDias);

    const projetoAtualizado = await prisma.projeto.update({
      where: { id },
      data: {
        status: 'finalizado',
        concluidoEm: agora,
        recebimentoPrevistoPara: new Date(`${recebimentoPrevistoIso}T00:00:00Z`),
      },
      include: {
        tarefas: {
          select: {
            status: true,
          },
        },
      },
    });

    const totalTarefas = projetoAtualizado.tarefas.length;
    const tarefasConcluidas = projetoAtualizado.tarefas.filter((t) => t.status === 'concluida').length;

    return respostaSucesso(enriquecerProjetoComTarefas(projetoAtualizado, totalTarefas, tarefasConcluidas));
  } catch (err) {
    return tratarErroApi(err);
  }
}
