import React from 'react';
import { StatusProjeto } from '@/lib/dados/tipos';
import { Badge } from '../ui/Badge';
import { PlayCircle, CheckCircle2, Clock, Archive } from 'lucide-react';

interface BadgeStatusProps {
  status: StatusProjeto;
  tamanho?: 'p' | 'm';
}

export function BadgeStatus({ status, tamanho = 'm' }: BadgeStatusProps) {
  if (status === 'em_andamento') {
    return (
      <Badge variante="acento" tamanho={tamanho}>
        <PlayCircle className="w-3 h-3" />
        <span>Em andamento</span>
      </Badge>
    );
  }

  if (status === 'finalizado') {
    return (
      <Badge variante="info" tamanho={tamanho}>
        <CheckCircle2 className="w-3 h-3" />
        <span>Finalizado</span>
      </Badge>
    );
  }

  if (status === 'planejado') {
    return (
      <Badge variante="neutro" tamanho={tamanho}>
        <Clock className="w-3 h-3" />
        <span>Planejado</span>
      </Badge>
    );
  }

  return (
    <Badge variante="neutro" tamanho={tamanho}>
      <Archive className="w-3 h-3" />
      <span>Arquivado</span>
    </Badge>
  );
}
