import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, tratarErroApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projetoId } = params;

    const linhas = await prisma.linhaImportada.findMany({
      where: { projetoId },
      include: {
        tarefa: {
          select: { id: true },
        },
      },
      orderBy: { numeroLinha: 'asc' },
    });

    const formatadas = linhas.map((l) => ({
      id: l.id,
      importacaoId: l.importacaoId,
      projetoId: l.projetoId,
      numeroLinha: l.numeroLinha,
      dados: l.dados as Record<string, string>,
      tarefaId: l.tarefa?.id || null,
    }));

    return respostaSucesso(formatadas);
  } catch (err) {
    return tratarErroApi(err);
  }
}
