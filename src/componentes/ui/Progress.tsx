import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  valor: number; // 0 a 100
  altura?: 'p' | 'm' | 'g';
  variante?: 'acento' | 'sucesso' | 'alerta' | 'perigo';
  className?: string;
  mostrarRotulo?: boolean;
}

export function Progress({
  valor,
  altura = 'm',
  variante = 'acento',
  className,
  mostrarRotulo = false,
}: ProgressProps) {
  const porcentagem = Math.min(100, Math.max(0, Math.round(valor)));

  const alturasClasses = {
    p: 'h-1.5',
    m: 'h-2',
    g: 'h-3',
  };

  const variantesClasses = {
    acento: 'bg-acento',
    sucesso: 'bg-sucesso',
    alerta: 'bg-alerta',
    perigo: 'bg-perigo',
  };

  return (
    <div className={cn('w-full space-y-1', className)}>
      <div className={cn('w-full bg-superficie-3 rounded-full overflow-hidden', alturasClasses[altura])}>
        <div
          className={cn('h-full transition-all duration-320 rounded-full', variantesClasses[variante])}
          style={{ width: `${porcentagem}%` }}
          role="progressbar"
          aria-valuenow={porcentagem}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {mostrarRotulo && (
        <div className="flex justify-end">
          <span className="numero text-xs font-semibold text-texto-2">{porcentagem}%</span>
        </div>
      )}
    </div>
  );
}
