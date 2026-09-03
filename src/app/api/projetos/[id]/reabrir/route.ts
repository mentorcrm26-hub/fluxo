import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, respostaErro, tratarErroApi } from '@/lib/api';
import { enriquecerProjetoComTarefas } from '@/lib/servidor/projetos';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const projetoExistente = await prisma.projeto.findUnique({
      where: { id },
    });

    if (!projetoExistente) {
      return respostaErro(`Projeto com ID "${id}" não encontrado.`, 'NAO_ENCONTRADO', 404);
    }

    if (projetoExistente.recebidoEm !== null) {
      return respostaErro(
        'Este projeto já foi recebido. Desfaça o recebimento antes de reabrir.',
        'REGRA_VIOLADA',
        409
      );
    }

    const projetoAtualizado = await prisma.projeto.update({
      where: { id },
      data: {
        status: 'em_andamento',
        concluidoEm: null,
        recebimentoPrevistoPara: null,
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
