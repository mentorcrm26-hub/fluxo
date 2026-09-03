import React from 'react';
import { StatusRecebimento } from '@/lib/dados/tipos';
import { nivelUrgencia, formatarMensagemPrazoRecebimento } from '@/lib/prazo';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PilulaPrazoProps {
  statusRecebimento: StatusRecebimento;
  diasAteRecebimento: number | null;
  className?: string;
}

export function PilulaPrazo({
  statusRecebimento,
  diasAteRecebimento,
  className,
}: PilulaPrazoProps) {
  if (statusRecebimento === 'recebido') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sucesso-suave text-sucesso border border-sucesso/20',
          className
        )}
      >
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Recebido</span>
      </span>
    );
  }

  if (statusRecebimento === 'pendente') {
    return null;
  }

  const urgencia = nivelUrgencia(diasAteRecebimento);
  const texto = formatarMensagemPrazoRecebimento(diasAteRecebimento, statusRecebimento);

  if (urgencia === 'critico') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-perigo-suave text-perigo border border-perigo/20',
          className
        )}
      >
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{texto}</span>
      </span>
    );
  }

  if (urgencia === 'alerta') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-alerta-suave text-alerta border border-alerta/20',
          className
        )}
      >
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{texto}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-superficie-2 text-texto-2 border border-borda',
        className
      )}
    >
      <Clock className="w-3.5 h-3.5 flex-shrink-0 text-texto-3" />
      <span>{texto}</span>
    </span>
  );
}
