import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type CodigoErroApi =
  | 'DADOS_INVALIDOS'
  | 'NAO_ENCONTRADO'
  | 'REGRA_VIOLADA'
  | 'CONFLITO'
  | 'NAO_AUTORIZADO'
  | 'ERRO_INTERNO';

export interface RespostaErroApi {
  erro: {
    codigo: CodigoErroApi;
    mensagem: string;
    campos?: Record<string, string[]> | null;
  };
}

export function respostaSucesso<T>(dados: T, status: number = 200) {
  return NextResponse.json(dados, { status });
}

export function respostaVazia(status: number = 204) {
  return new NextResponse(null, { status });
}

export function respostaErro(
  mensagem: string,
  codigo: CodigoErroApi = 'ERRO_INTERNO',
  status: number = 500,
  campos: Record<string, string[]> | null = null
) {
  const corpo: RespostaErroApi = {
    erro: {
      codigo,
      mensagem,
      campos,
    },
  };
  return NextResponse.json(corpo, { status });
}

export function tratarErroApi(err: unknown) {
  if (err instanceof ZodError) {
    const campos: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const campo = e.path.join('.') || 'geral';
      if (!campos[campo]) campos[campo] = [];
      campos[campo].push(e.message);
    });

    return respostaErro(
      'Dados de entrada inválidos. Verifique os campos preenchidos.',
      'DADOS_INVALIDOS',
      400,
      campos
    );
  }

  if (err instanceof Error) {
    if (err.message.includes('não encontrado') || err.message.includes('inexistente')) {
      return respostaErro(err.message, 'NAO_ENCONTRADO', 404);
    }
    if (err.message.includes('já foi recebido') || err.message.includes('já contém')) {
      return respostaErro(err.message, 'REGRA_VIOLADA', 409);
    }
    return respostaErro(err.message, 'ERRO_INTERNO', 500);
  }

  console.error('[ERRO_API_INESPERADO]:', err);
  return respostaErro('Ocorreu um erro interno no servidor. Tente novamente.', 'ERRO_INTERNO', 500);
}
