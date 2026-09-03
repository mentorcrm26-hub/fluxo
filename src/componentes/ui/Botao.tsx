import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo' | 'fantasma' | 'sucesso' | 'borda';
  tamanho?: 'p' | 'm' | 'g' | 'icone';
  carregando?: boolean;
  iconeEsquerda?: React.ReactNode;
  iconeDireita?: React.ReactNode;
}

export const Botao = React.forwardRef<HTMLButtonElement, BotaoProps>(
  (
    {
      className,
      variante = 'primario',
      tamanho = 'm',
      carregando = false,
      iconeEsquerda,
      iconeDireita,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantesClasses = {
      primario: 'bg-acento hover:bg-acento-claro text-white shadow-1 active:scale-[0.98]',
      secundario: 'bg-superficie-2 hover:bg-superficie-3 text-texto border border-borda active:scale-[0.98]',
      perigo: 'bg-perigo hover:bg-perigo/90 text-white shadow-1 active:scale-[0.98]',
      sucesso: 'bg-sucesso hover:bg-sucesso/90 text-slate-950 font-bold shadow-1 active:scale-[0.98]',
      fantasma: 'text-texto-2 hover:text-texto hover:bg-superficie-2 active:scale-[0.98]',
      borda: 'border border-borda-forte text-texto hover:bg-superficie-2 active:scale-[0.98]',
    };

    const tamanhosClasses = {
      p: 'h-8 px-3 text-xs gap-1.5 rounded-p font-medium',
      m: 'h-10 px-4 text-sm gap-2 rounded-m font-medium',
      g: 'h-12 px-6 text-base gap-2.5 rounded-m font-medium',
      icone: 'h-10 w-10 p-0 rounded-m flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || carregando}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-120 outline-none select-none disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-fundo',
          variantesClasses[variante],
          tamanhosClasses[tamanho],
          className
        )}
        {...props}
      >
        {carregando ? (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        ) : (
          iconeEsquerda && <span className="flex-shrink-0">{iconeEsquerda}</span>
        )}
        {children}
        {!carregando && iconeDireita && <span className="flex-shrink-0">{iconeDireita}</span>}
      </button>
    );
  }
);

Botao.displayName = 'Botao';
