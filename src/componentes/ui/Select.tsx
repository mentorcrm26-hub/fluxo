import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  valor: string | number;
  rotulo: string;
  desabilitado?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  opcoes: SelectOption[];
  rotulo?: string;
  erro?: string;
  dica?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, opcoes, rotulo, erro, dica, id, ...props }, ref) => {
    const selectId = id || (rotulo ? rotulo.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {rotulo && (
          <label htmlFor={selectId} className="block text-xs font-medium text-texto-2 uppercase tracking-wider">
            {rotulo}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full h-10 px-3 pr-10 bg-superficie-2 text-texto border border-borda rounded-m text-sm appearance-none transition-colors duration-120 outline-none cursor-pointer',
              'focus:border-acento focus:ring-1 focus:ring-acento',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              erro ? 'border-perigo focus:border-perigo focus:ring-perigo' : '',
              className
            )}
            {...props}
          >
            {opcoes.map((op) => (
              <option key={op.valor} value={op.valor} disabled={op.desabilitado} className="bg-superficie text-texto">
                {op.rotulo}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-texto-3">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {dica && !erro && <p className="text-xs text-texto-3">{dica}</p>}
        {erro && <p className="text-xs text-perigo font-medium">{erro}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
