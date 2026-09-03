import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, respostaErro, tratarErroApi } from '@/lib/api';
import { obterHojeISO } from '@/lib/datas';
import { enriquecerProjetoComTarefas } from '@/lib/servidor/projetos';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    let dataRecebimentoIso = obterHojeISO();

    try {
      const json = await req.json();
      if (json && json.data && /^\d{4}-\d{2}-\d{2}$/.test(json.data)) {
        dataRecebimentoIso = json.data;
      }
    } catch {
      // Corpo opcional
    }

    const projeto = await prisma.projeto.findUnique({
      where: { id },
    });

    if (!projeto) {
      return respostaErro(`Projeto com ID "${id}" não encontrado.`, 'NAO_ENCONTRADO', 404);
    }

    const projetoAtualizado = await prisma.projeto.update({
      where: { id },
      data: {
        recebidoEm: new Date(`${dataRecebimentoIso}T00:00:00Z`),
        valorRecebidoCentavos: projeto.valorCentavos,
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
