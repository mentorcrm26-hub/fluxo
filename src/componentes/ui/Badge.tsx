import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variante?: 'neutro' | 'acento' | 'sucesso' | 'alerta' | 'perigo' | 'info';
  tamanho?: 'p' | 'm';
}

export function Badge({
  className,
  variante = 'neutro',
  tamanho = 'm',
  children,
  ...props
}: BadgeProps) {
  const variantesClasses = {
    neutro: 'bg-superficie-2 text-texto-2 border border-borda',
    acento: 'bg-acento-suave text-acento-claro border border-acento/20',
    sucesso: 'bg-sucesso-suave text-sucesso border border-sucesso/20',
    alerta: 'bg-alerta-suave text-alerta border border-alerta/20',
    perigo: 'bg-perigo-suave text-perigo border border-perigo/20',
    info: 'bg-info/10 text-info border border-info/20',
  };

  const tamanhosClasses = {
    p: 'px-2 py-0.5 text-[11px]',
    m: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-p select-none',
        variantesClasses[variante],
        tamanhosClasses[tamanho],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
