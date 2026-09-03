import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, tratarErroApi } from '@/lib/api';
import { criarTarefaSchema } from '@/lib/validadores';
import { transformarTarefaPrisma } from '@/lib/servidor/projetos';
import { traduzirDescricaoParaPtBr } from '@/lib/traducao/tradutor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projetoId } = params;

    const tarefas = await prisma.tarefa.findMany({
      where: { projetoId },
      orderBy: { ordem: 'asc' },
    });

    return respostaSucesso(tarefas.map(transformarTarefaPrisma));
  } catch (err) {
    return tratarErroApi(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projetoId } = params;
    const json = await req.json();
    const dados = criarTarefaSchema.parse(json);

    const ultimaTarefa = await prisma.tarefa.findFirst({
      where: { projetoId },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });

    const proximaOrdem = ultimaTarefa ? ultimaTarefa.ordem + 1 : 1;
    const tituloTraduzido = dados.tituloTraduzido !== undefined
      ? dados.tituloTraduzido
      : traduzirDescricaoParaPtBr(dados.titulo);

    const novaTarefa = await prisma.tarefa.create({
      data: {
        projetoId,
        titulo: dados.titulo,
        tituloTraduzido: tituloTraduzido || null,
        observacoes: dados.observacoes || null,
        status: 'a_fazer',
        prazo: dados.prazo ? new Date(`${dados.prazo}T00:00:00Z`) : null,
        ordem: proximaOrdem,
      },
    });

    return respostaSucesso(transformarTarefaPrisma(novaTarefa), 201);
  } catch (err) {
    return tratarErroApi(err);
  }
}
