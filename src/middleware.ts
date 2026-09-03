import { NextRequest, NextResponse } from 'next/server';

function comparacaoSegura(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let resultado = 0;
  for (let i = 0; i < a.length; i++) {
    resultado |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return resultado === 0;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir rota de healthcheck e arquivos estáticos sem autenticação
  if (
    pathname === '/api/saude' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const usuarioEsperado = process.env.AUTH_USUARIO;
  const senhaEsperada = process.env.AUTH_SENHA;

  // Se não estiver configurado em desenvolvimento, permite acesso local
  if (!usuarioEsperado || !senhaEsperada) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'CRÍTICO: AUTH_USUARIO e AUTH_SENHA precisam estar definidos em produção.'
      );
      return new NextResponse('Configuração de autenticação pendente no servidor.', {
        status: 500,
      });
    }
    return NextResponse.next();
  }

  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Acesso restrito. Autenticação necessária.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Fluxo"',
      },
    });
  }

  try {
    const credenciaisBase64 = authHeader.split(' ')[1];
    const credenciais = Buffer.from(credenciaisBase64, 'base64').toString('utf-8');
    const [usuario, ...restoSenha] = credenciais.split(':');
    const senha = restoSenha.join(':');

    const usuarioValido = comparacaoSegura(usuario || '', usuarioEsperado);
    const senhaValida = comparacaoSegura(senha || '', senhaEsperada);

    if (usuarioValido && senhaValida) {
      return NextResponse.next();
    }
  } catch (err) {
    // Falha ao decodificar credenciais
  }

  return new NextResponse('Credenciais inválidas.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Fluxo"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
