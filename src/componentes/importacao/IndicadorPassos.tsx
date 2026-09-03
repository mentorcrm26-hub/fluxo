'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndicadorPassosProps {
  passoAtual: number; // 1 a 2
  passoMaximoAlcancado: number;
  aoMudarPasso: (passo: number) => void;
}

const PASSOS = [
  { numero: 1, rotulo: '1. Selecionar Arquivo' },
  { numero: 2, rotulo: '2. Revisar e Importar Itens' },
];

export function IndicadorPassos({
  passoAtual,
  passoMaximoAlcancado,
  aoMudarPasso,
}: IndicadorPassosProps) {
  return (
    <div className="w-full py-3 border-b border-borda">
      <div className="flex items-center justify-center max-w-md mx-auto px-4">
        {PASSOS.map((p, idx) => {
          const isAtivo = p.numero === passoAtual;
          const isConcluido = p.numero < passoAtual;
          const isAcessivel = p.numero <= passoMaximoAlcancado;

          return (
            <React.Fragment key={p.numero}>
              <button
                type="button"
                disabled={!isAcessivel}
                onClick={() => isAcessivel && aoMudarPasso(p.numero)}
                className={cn(
                  'flex items-center gap-2 outline-none group text-left transition-all',
                  !isAcessivel && 'cursor-not-allowed opacity-40'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200',
                    isConcluido && 'bg-sucesso text-white',
                    isAtivo && 'bg-acento text-white ring-4 ring-acento/20',
                    !isConcluido && !isAtivo && 'bg-superficie-2 text-texto-3 border border-borda'
                  )}
                >
                  {isConcluido ? <Check className="w-4 h-4 stroke-[3]" /> : p.numero}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium transition-colors',
                    isAtivo ? 'text-texto font-bold' : 'text-texto-3 group-hover:text-texto-2'
                  )}
                >
                  {p.rotulo}
                </span>
              </button>

              {idx < PASSOS.length - 1 && (
                <div
                  className={cn(
                    'w-12 md:w-20 h-0.5 mx-3 md:mx-6 transition-colors',
                    p.numero < passoAtual ? 'bg-sucesso' : 'bg-borda'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
