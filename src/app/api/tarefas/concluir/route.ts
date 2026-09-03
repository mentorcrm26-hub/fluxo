import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaVazia, tratarErroApi } from '@/lib/api';
import { concluirTarefasSchema } from '@/lib/validadores';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { ids } = concluirTarefasSchema.parse(json);

    const agora = new Date();

    await prisma.tarefa.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: 'concluida',
        concluidaEm: agora,
      },
    });

    return respostaVazia(200);
  } catch (err) {
    return tratarErroApi(err);
  }
}
