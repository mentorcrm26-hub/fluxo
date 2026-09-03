import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { respostaSucesso, tratarErroApi } from '@/lib/api';
import { salvarConfiguracaoSchema } from '@/lib/validadores';

export const dynamic = 'force-dynamic';

async function obterOuCriarConfiguracao() {
  let config = await prisma.configuracao.findFirst();
  if (!config) {
    config = await prisma.configuracao.create({
      data: {
        id: 1,
        janelaRecebimentoDias: 10,
        moeda: 'USD',
        tema: 'sistema',
      },
    });
  }
  return config;
}

export async function GET(_req: NextRequest) {
  try {
    const config = await obterOuCriarConfiguracao();

    return respostaSucesso({
      janelaRecebimentoDias: config.janelaRecebimentoDias,
      moeda: config.moeda as 'USD' | 'BRL',
      tema: config.tema as 'sistema' | 'claro' | 'escuro',
    });
  } catch (err) {
    return tratarErroApi(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const json = await req.json();
    const dados = salvarConfiguracaoSchema.parse(json);

    await obterOuCriarConfiguracao();

    const configAtualizada = await prisma.configuracao.update({
      where: { id: 1 },
      data: dados,
    });

    return respostaSucesso({
      janelaRecebimentoDias: configAtualizada.janelaRecebimentoDias,
      moeda: configAtualizada.moeda as 'USD' | 'BRL',
      tema: configAtualizada.tema as 'sistema' | 'claro' | 'escuro',
    });
  } catch (err) {
    return tratarErroApi(err);
  }
}
