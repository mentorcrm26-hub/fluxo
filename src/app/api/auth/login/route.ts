import { NextRequest, NextResponse } from 'next/server';
import {
  validarCredenciais,
  criarTokenSessao,
  NOME_COOKIE_SESSAO,
  DURACAO_SESSAO_PADRAO_DIAS,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { usuario, senha, lembrar = true } = body;

    if (!usuario || !senha) {
      return NextResponse.json(
        { erro: 'Usuário e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const usuarioEsperado = process.env.AUTH_USUARIO;
    const senhaEsperada = process.env.AUTH_SENHA;

    // Se estiver em desenvolvimento sem credenciais configuradas, permite admin padrão
    const credenciaisValidas =
      validarCredenciais(usuario, senha) ||
      (!usuarioEsperado && !senhaEsperada && process.env.NODE_ENV !== 'production');

    if (!credenciaisValidas) {
      return NextResponse.json(
        { erro: 'Usuário ou senha incorretos.' },
        { status: 401 }
      );
    }

    const diasValidade = lembrar ? DURACAO_SESSAO_PADRAO_DIAS : 1;
    const token = await criarTokenSessao(usuario, diasValidade);

    const response = NextResponse.json({
      sucesso: true,
      usuario,
      mensagem: 'Login efetuado com sucesso.',
    });

    const maxAgeSegundos = diasValidade * 24 * 60 * 60;

    response.cookies.set(NOME_COOKIE_SESSAO, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSegundos,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { erro: 'Erro interno ao processar login.' },
      { status: 500 }
    );
  }
}
