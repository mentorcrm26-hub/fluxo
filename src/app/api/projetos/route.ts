import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, tratarErroApi } from '@/lib/api';
import { criarProjetoSchema } from '@/lib/validadores';
import { enriquecerProjetoComTarefas } from '@/lib/servidor/projetos';
import { StatusProjeto } from '@/lib/dados/tipos';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const busca = searchParams.get('busca')?.toLowerCase().trim();
    const ordem = searchParams.get('ordem') || 'recentes';

    const where: any = {};

    if (statusParam && statusParam !== 'todos') {
      where.status = statusParam;
    }

    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { cliente: { contains: busca, mode: 'insensitive' } },
        { descricao: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const projetosPrisma = await prisma.projeto.findMany({
      where,
      include: {
        tarefas: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    const projetosComResumo = projetosPrisma.map((p) => {
      const totalTarefas = p.tarefas.length;
      const tarefasConcluidas = p.tarefas.filter((t) => t.status === 'concluida').length;
      return enriquecerProjetoComTarefas(p, totalTarefas, tarefasConcluidas);
    });

    // Ordenação
    if (ordem === 'prazo') {
      projetosComResumo.sort((a, b) => (a.dataFimPrevista || '').localeCompare(b.dataFimPrevista || ''));
    } else if (ordem === 'valor') {
      projetosComResumo.sort((a, b) => b.valorCentavos - a.valorCentavos);
    } else if (ordem === 'progresso') {
      projetosComResumo.sort((a, b) => b.progresso - a.progresso);
    }

    return respostaSucesso(projetosComResumo);
  } catch (err) {
    return tratarErroApi(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const dados = criarProjetoSchema.parse(json);

    const novo = await prisma.projeto.create({
      data: {
        nome: dados.nome,
        cliente: dados.cliente || null,
        descricao: dados.descricao || null,
        cor: dados.cor,
        status: 'em_andamento',
        dataInicio: new Date(`${dados.dataInicio}T00:00:00Z`),
        dataFimPrevista: new Date(`${dados.dataFimPrevista}T00:00:00Z`),
        valorCentavos: dados.valorCentavos,
        porcentagem: dados.porcentagem ?? 45,
      },
    });

    const projetoFormatado = enriquecerProjetoComTarefas(novo, 0, 0);
    return respostaSucesso(projetoFormatado, 201);
  } catch (err) {
    return tratarErroApi(err);
  }
}
