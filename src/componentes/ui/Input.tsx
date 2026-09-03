import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  erro?: string;
  rotulo?: string;
  dica?: string;
  iconeEsquerda?: React.ReactNode;
  iconeDireita?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', erro, rotulo, dica, iconeEsquerda, iconeDireita, id, ...props }, ref) => {
    const inputId = id || (rotulo ? rotulo.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {rotulo && (
          <label htmlFor={inputId} className="block text-xs font-medium text-texto-2 uppercase tracking-wider">
            {rotulo}
          </label>
        )}
        <div className="relative flex items-center">
          {iconeEsquerda && (
            <div className="absolute left-3 flex items-center pointer-events-none text-texto-3">
              {iconeEsquerda}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'w-full h-10 px-3 bg-superficie-2 text-texto placeholder:text-texto-3 border border-borda rounded-m text-sm transition-colors duration-120 outline-none',
              'focus:border-acento focus:ring-1 focus:ring-acento',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              iconeEsquerda ? 'pl-9' : '',
              iconeDireita ? 'pr-9' : '',
              erro ? 'border-perigo focus:border-perigo focus:ring-perigo' : '',
              className
            )}
            {...props}
          />
          {iconeDireita && (
            <div className="absolute right-3 flex items-center text-texto-3">
              {iconeDireita}
            </div>
          )}
        </div>
        {dica && !erro && <p className="text-xs text-texto-3">{dica}</p>}
        {erro && <p className="text-xs text-perigo font-medium">{erro}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
