'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo?: string;
  descricao?: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  tamanho?: 'p' | 'm' | 'g' | 'tela-cheia';
  destrutivo?: boolean;
}

export function Dialog({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  rodape,
  tamanho = 'm',
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberto) {
        aoFechar();
      }
    };

    if (aberto) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  const tamanhosClasses = {
    p: 'max-w-md',
    m: 'max-w-lg',
    g: 'max-w-2xl',
    'tela-cheia': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={aoFechar}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo ? 'dialog-title' : undefined}
        className={cn(
          'relative w-full bg-superficie border border-borda shadow-3 z-10 overflow-hidden flex flex-col max-h-[90vh]',
          'rounded-t-xg md:rounded-xg',
          'animate-in slide-in-from-bottom-6 md:slide-in-from-bottom-2 duration-320',
          tamanhosClasses[tamanho]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-borda">
          <div>
            {titulo && (
              <h2 id="dialog-title" className="text-xl font-semibold text-texto tracking-tight">
                {titulo}
              </h2>
            )}
            {descricao && <p className="text-xs text-texto-2 mt-1">{descricao}</p>}
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="w-8 h-8 rounded-p flex items-center justify-center text-texto-3 hover:text-texto hover:bg-superficie-2 transition-colors ml-4"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">{children}</div>

        {/* Footer */}
        {rodape && (
          <div className="p-4 md:p-6 border-t border-borda bg-superficie-2/50 flex items-center justify-end gap-3">
            {rodape}
          </div>
        )}
      </div>
    </div>
  );
}
