import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, respostaVazia, tratarErroApi } from '@/lib/api';
import { atualizarTarefaSchema } from '@/lib/validadores';
import { transformarTarefaPrisma } from '@/lib/servidor/projetos';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const json = await req.json();
    const dados = atualizarTarefaSchema.parse(json);

    const tarefaAtual = await prisma.tarefa.findUnique({
      where: { id },
    });

    if (!tarefaAtual) {
      throw new Error(`Tarefa com ID "${id}" não encontrada`);
    }

    const updateData: any = {};
    if (dados.titulo !== undefined) updateData.titulo = dados.titulo;
    if (dados.tituloTraduzido !== undefined) updateData.tituloTraduzido = dados.tituloTraduzido;
    if (dados.observacoes !== undefined) updateData.observacoes = dados.observacoes;
    if (dados.ordem !== undefined) updateData.ordem = dados.ordem;
    if (dados.prazo !== undefined) {
      updateData.prazo = dados.prazo ? new Date(`${dados.prazo}T00:00:00Z`) : null;
    }

    if (dados.status !== undefined) {
      updateData.status = dados.status;
      if (dados.status === 'concluida' && tarefaAtual.status !== 'concluida') {
        updateData.concluidaEm = new Date();
      } else if (dados.status !== 'concluida') {
        updateData.concluidaEm = null;
      }
    }

    const tarefaAtualizada = await prisma.tarefa.update({
      where: { id },
      data: updateData,
    });

    return respostaSucesso(transformarTarefaPrisma(tarefaAtualizada));
  } catch (err) {
    return tratarErroApi(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.tarefa.delete({
      where: { id },
    });

    return respostaVazia();
  } catch (err) {
    return tratarErroApi(err);
  }
}
