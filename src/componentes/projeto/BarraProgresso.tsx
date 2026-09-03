import React from 'react';
import { Progress } from '../ui/Progress';
import { cn } from '@/lib/utils';

interface BarraProgressoProps {
  concluidas: number;
  total: number;
  progresso: number;
  className?: string;
  variante?: 'acento' | 'sucesso';
}

export function BarraProgresso({
  concluidas,
  total,
  progresso,
  className,
  variante = 'acento',
}: BarraProgressoProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Progress valor={progresso} variante={progresso === 100 ? 'sucesso' : variante} altura="m" />
      <div className="flex items-center justify-between text-xs text-texto-2">
        <span className="numero font-medium">{progresso}%</span>
        <span className="numero">
          {concluidas}/{total} {total === 1 ? 'tarefa' : 'tarefas'}
        </span>
      </div>
    </div>
  );
}
