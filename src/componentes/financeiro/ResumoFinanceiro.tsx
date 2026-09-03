'use client';

import React from 'react';
import { ResumoFinanceiro as ResumoTipo } from '@/lib/dados/tipos';
import { formatarUSD } from '@/lib/dinheiro';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResumoFinanceiroProps {
  dados: ResumoTipo | undefined;
  carregando?: boolean;
}

export function ResumoFinanceiro({ dados, carregando }: ResumoFinanceiroProps) {
  const nomeMesAtual = format(new Date(), 'MMMM', { locale: ptBR }).toUpperCase();

  const aReceber = dados?.aReceberCentavos || 0;
  const qtdReceber = dados?.aReceberQuantidade || 0;

  const recebidoMes = dados?.recebidoNoMesCentavos || 0;
  const qtdRecebidoMes = dados?.recebidoNoMesQuantidade || 0;

  const atrasado = dados?.atrasadoCentavos || 0;
  const qtdAtrasado = dados?.atrasadoQuantidade || 0;

  const temAtrasado = atrasado > 0;

  return (
    <div className="relative overflow-hidden rounded-xg bg-superficie border border-borda p-6 md:p-8 shadow-1">
      {/* Gradiente radial único do app: acento a 6% saindo do canto superior esquerdo */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(106, 90, 240, 0.08) 0%, rgba(106, 90, 240, 0) 70%)',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {/* Bloco 1 — A RECEBER (O maior elemento visual) */}
        <div className="md:col-span-1 flex flex-col justify-between pr-0 md:pr-6 md:border-r border-borda">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-texto-2 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-acento-claro" />
              <span>A Receber</span>
            </div>
            <div className="numero text-3xl md:text-4xl lg:text-[40px] font-extrabold text-texto leading-none tracking-tight pt-2">
              {carregando ? (
                <div className="h-10 bg-superficie-2 rounded-p w-48 animate-pulse" />
              ) : (
                formatarUSD(aReceber)
              )}
            </div>
          </div>
          <p className="text-xs text-texto-3 mt-3">
            {carregando ? (
              <span className="inline-block h-3 bg-superficie-2 rounded w-20 animate-pulse" />
            ) : (
              `${qtdReceber} ${qtdReceber === 1 ? 'projeto com valor previsto' : 'projetos com valores previstos'}`
            )}
          </p>
        </div>

        {/* Bloco 2 — RECEBIDO NO MÊS */}
        <div className="flex flex-col justify-between pr-0 md:pr-6 md:border-r border-borda">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-texto-2 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-sucesso" />
              <span>Recebido em {nomeMesAtual}</span>
            </div>
            <div className="numero text-2xl md:text-3xl font-bold text-sucesso tracking-tight pt-2">
              {carregando ? (
                <div className="h-8 bg-superficie-2 rounded-p w-36 animate-pulse" />
              ) : (
                formatarUSD(recebidoMes)
              )}
            </div>
          </div>
          <p className="text-xs text-texto-3 mt-3">
            {carregando ? (
              <span className="inline-block h-3 bg-superficie-2 rounded w-20 animate-pulse" />
            ) : (
              `${qtdRecebidoMes} ${qtdRecebidoMes === 1 ? 'projeto liquidado' : 'projetos liquidados'}`
            )}
          </p>
        </div>

        {/* Bloco 3 — ATRASADO */}
        <div
          className={cn(
            'flex flex-col justify-between p-4 rounded-m transition-all',
            temAtrasado
              ? 'bg-perigo-suave/40 border border-perigo/30'
              : 'opacity-50 border border-transparent'
          )}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-texto-2 text-xs font-semibold uppercase tracking-wider">
              <AlertTriangle className={cn('w-4 h-4', temAtrasado ? 'text-perigo' : 'text-texto-3')} />
              <span>Atrasado</span>
            </div>
            <div
              className={cn(
                'numero text-2xl md:text-3xl font-bold tracking-tight pt-2',
                temAtrasado ? 'text-perigo' : 'text-texto-3'
              )}
            >
              {carregando ? (
                <div className="h-8 bg-superficie-2 rounded-p w-32 animate-pulse" />
              ) : (
                formatarUSD(atrasado)
              )}
            </div>
          </div>
          <p className="text-xs text-texto-3 mt-3">
            {carregando ? (
              <span className="inline-block h-3 bg-superficie-2 rounded w-20 animate-pulse" />
            ) : temAtrasado ? (
              <span className="text-perigo font-medium">
                {qtdAtrasado} {qtdAtrasado === 1 ? 'projeto com prazo estourado' : 'projetos com prazo estourado'}
              </span>
            ) : (
              'Nenhum recebimento em atraso'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
