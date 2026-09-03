import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, tratarErroApi } from '@/lib/api';
import { enriquecerProjetoComTarefas } from '@/lib/servidor/projetos';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const projetosPrisma = await prisma.projeto.findMany({
      where: {
        OR: [
          { status: 'finalizado' },
          { recebidoEm: { not: null } },
        ],
      },
      include: {
        tarefas: {
          select: {
            status: true,
          },
        },
      },
      orderBy: [
        { recebimentoPrevistoPara: 'asc' },
        { criadoEm: 'desc' },
      ],
    });

    const projetosComResumo = projetosPrisma.map((p) => {
      const totalTarefas = p.tarefas.length;
      const tarefasConcluidas = p.tarefas.filter((t) => t.status === 'concluida').length;
      return enriquecerProjetoComTarefas(p, totalTarefas, tarefasConcluidas);
    });

    return respostaSucesso(projetosComResumo);
  } catch (err) {
    return tratarErroApi(err);
  }
}
