import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaVazia, tratarErroApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.importacao.delete({
      where: { id },
    });

    return respostaVazia();
  } catch (err) {
    return tratarErroApi(err);
  }
}
