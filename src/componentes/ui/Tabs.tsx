import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  rotulo: string;
  contador?: number;
  icone?: React.ReactNode;
}

export interface TabsProps {
  abas: TabItem[];
  abaAtiva: string;
  aoMudarAba: (id: string) => void;
  className?: string;
}

export function Tabs({ abas, abaAtiva, aoMudarAba, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-2 border-b border-borda overflow-x-auto scrollbar-none', className)}>
      {abas.map((aba) => {
        const ativa = aba.id === abaAtiva;
        return (
          <button
            key={aba.id}
            type="button"
            onClick={() => aoMudarAba(aba.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200 outline-none whitespace-nowrap',
              ativa
                ? 'border-acento text-texto'
                : 'border-transparent text-texto-2 hover:text-texto hover:border-borda-forte',
              'focus-visible:ring-2 focus-visible:ring-acento'
            )}
          >
            {aba.icone && <span className="text-texto-3">{aba.icone}</span>}
            <span>{aba.rotulo}</span>
            {aba.contador !== undefined && (
              <span
                className={cn(
                  'numero px-2 py-0.5 rounded-full text-xs font-semibold',
                  ativa ? 'bg-acento text-white' : 'bg-superficie-3 text-texto-3'
                )}
              >
                {aba.contador}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
