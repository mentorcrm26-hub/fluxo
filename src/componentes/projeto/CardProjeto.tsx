import React from 'react';
import Link from 'next/link';
import { ProjetoComResumo } from '@/lib/dados/tipos';
import { BadgeStatus } from './BadgeStatus';
import { PilulaPrazo } from './PilulaPrazo';
import { BarraProgresso } from './BarraProgresso';
import { formatarUSD, calcularMinhaParteCentavos } from '@/lib/dinheiro';
import { formatarDataDiaMes } from '@/lib/datas';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CORES_HEX = {
  violeta: '#6A5AF0',
  azul: '#4DA3FF',
  verde: '#34D399',
  ambar: '#FBBF24',
  rosa: '#F472B6',
  ciano: '#22D3EE',
};

export function CardProjeto({ projeto }: { projeto: ProjetoComResumo }) {
  const isAtrasado = projeto.statusRecebimento === 'atrasado';
  const isRecebido = projeto.statusRecebimento === 'recebido';
  const isArquivado = projeto.status === 'arquivado';
  const corHex = isAtrasado ? '#FF6B6B' : CORES_HEX[projeto.cor] || '#6A5AF0';

  const porcentagem = typeof projeto.porcentagem === 'number' ? projeto.porcentagem : 45;
  const minhaParteCentavos = calcularMinhaParteCentavos(projeto.valorCentavos, porcentagem);

  return (
    <Link
      href={`/projetos/${projeto.id}`}
      className={cn(
        'group relative flex flex-col justify-between rounded-g bg-superficie border border-borda p-5 md:p-6 transition-all duration-120 outline-none',
        'hover:bg-superficie-2 hover:-translate-y-0.5 hover:shadow-2 hover:border-borda-forte',
        'focus-visible:ring-2 focus-visible:ring-acento',
        isArquivado && 'opacity-60',
        isAtrasado && 'border-l-4 border-l-perigo'
      )}
      style={{
        borderLeftColor: isAtrasado ? 'var(--perigo)' : corHex,
        borderLeftWidth: '4px',
      }}
    >
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-base font-semibold text-texto truncate group-hover:text-acento-claro transition-colors">
              {projeto.nome}
            </h3>
            <p className="text-xs text-texto-2 truncate">
              {projeto.cliente || 'Sem cliente vinculado'}
            </p>
          </div>
          <BadgeStatus status={projeto.status} tamanho="p" />
        </div>

        {/* Valores Monetários: Total Cheio e Porcentagem */}
        <div className="pt-1 bg-superficie-2/50 rounded-m p-2.5 border border-borda/50 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-texto-3 uppercase font-semibold tracking-wider block">
                Valor Total
              </span>
              <span
                className={cn(
                  'numero text-base font-bold tracking-tight',
                  isRecebido ? 'text-sucesso' : 'text-texto'
                )}
              >
                {formatarUSD(projeto.valorCentavos)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-acento-claro uppercase font-semibold tracking-wider block">
                Sua Parte ({porcentagem}%)
              </span>
              <span className="numero text-base font-bold text-acento-claro">
                {formatarUSD(minhaParteCentavos)}
              </span>
            </div>
          </div>
          {isRecebido && (
            <div className="pt-1 flex items-center gap-1 text-[11px] font-medium text-sucesso">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recebimento Liquidado</span>
            </div>
          )}
        </div>

        {/* Barra de Progresso */}
        <div className="pt-2">
          <BarraProgresso
            concluidas={projeto.tarefasConcluidas}
            total={projeto.totalTarefas}
            progresso={projeto.progresso}
          />
        </div>
      </div>

      {/* Footer com Prazos */}
      <div className="pt-4 mt-4 border-t border-borda flex items-center justify-between text-xs text-texto-3">
        <div className="flex items-center gap-1.5 numero">
          <span>{formatarDataDiaMes(projeto.dataInicio)}</span>
          <ArrowRight className="w-3 h-3 text-texto-3" />
          <span>{formatarDataDiaMes(projeto.dataFimPrevista)}</span>
        </div>

        <PilulaPrazo
          statusRecebimento={projeto.statusRecebimento}
          diasAteRecebimento={projeto.diasAteRecebimento}
        />
      </div>
    </Link>
  );
}
