import { NextRequest, NextResponse } from 'next/server';
import { verificarTokenSessao, NOME_COOKIE_SESSAO } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(NOME_COOKIE_SESSAO)?.value;
  const sessao = await verificarTokenSessao(token);

  if (!sessao.valido) {
    return NextResponse.json(
      { autenticado: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    autenticado: true,
    usuario: sessao.usuario,
    expiraEm: sessao.payload?.exp,
  });
}
