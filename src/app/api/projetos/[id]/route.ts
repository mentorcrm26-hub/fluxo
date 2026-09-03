import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, respostaVazia, respostaErro, tratarErroApi } from '@/lib/api';
import { atualizarProjetoSchema } from '@/lib/validadores';
import { enriquecerProjetoComTarefas } from '@/lib/servidor/projetos';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const projeto = await prisma.projeto.findUnique({
      where: { id },
      include: {
        tarefas: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!projeto) {
      return respostaErro(`Projeto com ID "${id}" não encontrado.`, 'NAO_ENCONTRADO', 404);
    }

    const totalTarefas = projeto.tarefas.length;
    const tarefasConcluidas = projeto.tarefas.filter((t) => t.status === 'concluida').length;

    return respostaSucesso(enriquecerProjetoComTarefas(projeto, totalTarefas, tarefasConcluidas));
  } catch (err) {
    return tratarErroApi(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const json = await req.json();
    const dados = atualizarProjetoSchema.parse(json);

    const updateData: any = {};
    if (dados.nome !== undefined) updateData.nome = dados.nome;
    if (dados.cliente !== undefined) updateData.cliente = dados.cliente;
    if (dados.descricao !== undefined) updateData.descricao = dados.descricao;
    if (dados.cor !== undefined) updateData.cor = dados.cor;
    if (dados.status !== undefined) updateData.status = dados.status;
    if (dados.dataInicio !== undefined) updateData.dataInicio = new Date(`${dados.dataInicio}T00:00:00Z`);
    if (dados.dataFimPrevista !== undefined) updateData.dataFimPrevista = new Date(`${dados.dataFimPrevista}T00:00:00Z`);
    if (dados.valorCentavos !== undefined) updateData.valorCentavos = dados.valorCentavos;
    if (dados.porcentagem !== undefined) updateData.porcentagem = dados.porcentagem;
    if (dados.recebimentoPrevistoPara !== undefined) {
      updateData.recebimentoPrevistoPara = dados.recebimentoPrevistoPara
        ? new Date(`${dados.recebimentoPrevistoPara}T00:00:00Z`)
        : null;
    }
    if (dados.recebidoEm !== undefined) {
      updateData.recebidoEm = dados.recebidoEm ? new Date(`${dados.recebidoEm}T00:00:00Z`) : null;
    }
    if (dados.valorRecebidoCentavos !== undefined) {
      updateData.valorRecebidoCentavos = dados.valorRecebidoCentavos;
    }

    const projetoAtualizado = await prisma.projeto.update({
      where: { id },
      data: updateData,
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.projeto.delete({
      where: { id },
    });

    return respostaVazia();
  } catch (err) {
    return tratarErroApi(err);
  }
}
