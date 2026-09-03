import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, respostaErro } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return respostaSucesso({ ok: true, banco: true });
  } catch (err: any) {
    return respostaErro('Banco de dados indisponível', 'ERRO_INTERNO', 500);
  }
}
