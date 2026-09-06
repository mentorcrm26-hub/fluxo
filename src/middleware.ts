import { NextRequest, NextResponse } from 'next/server';
import {
  verificarTokenSessao,
  comparacaoSegura,
  NOME_COOKIE_SESSAO,
} from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Permitir rotas públicas, healthcheck, autenticação e arquivos estáticos/PWA
  if (
    pathname === '/api/saude' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/sw.js' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.png' ||
    pathname.startsWith('/icons/') ||
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

  // 2. Verificar Sessão Persistente via Cookie (Suporte Total a PWA Mobile e Desktop)
  const tokenCookie = req.cookies.get(NOME_COOKIE_SESSAO)?.value;
  const sessao = await verificarTokenSessao(tokenCookie);

  if (sessao.valido) {
    // Se o usuário já está logado e tenta acessar a tela de login, redireciona para o painel
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // 3. Se não estiver autenticado e estiver acessando a página de login, permite a exibição
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 4. Compatibilidade com HTTP Basic Auth (para integrações de API / scripts legados)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Basic ')) {
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
    } catch {
      // Falha ao decodificar credenciais
    }
  }

  // 5. Se não autenticado e for uma chamada de API interna, retorna erro 401 JSON
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { erro: 'Acesso restrito. Autenticação necessária.' },
      { status: 401 }
    );
  }

  // 6. Para navegação de páginas web, redireciona para a tela de Login moderna
  const loginUrl = new URL('/login', req.url);
  if (pathname !== '/') {
    loginUrl.searchParams.set('redirect', pathname);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
