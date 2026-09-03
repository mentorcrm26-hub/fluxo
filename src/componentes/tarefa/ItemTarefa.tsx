'use client';

import React from 'react';
import { Tarefa } from '@/lib/dados/tipos';
import { formatarDataCurta } from '@/lib/datas';
import { Checkbox } from '../ui/Checkbox';
import { Trash2, Calendar } from 'lucide-react';
import { useAtualizarTarefa, useExcluirTarefa } from '@/lib/dados/hooks';
import { cn } from '@/lib/utils';
import { traduzirDescricaoParaPtBr } from '@/lib/traducao/tradutor';

interface ItemTarefaProps {
  tarefa: Tarefa;
  selecionada?: boolean;
  emModoSelecao?: boolean;
  aoAlternarSelecao?: (id: string) => void;
}

export function ItemTarefa({
  tarefa,
  selecionada = false,
  emModoSelecao = false,
  aoAlternarSelecao,
}: ItemTarefaProps) {
  const atualizarTarefa = useAtualizarTarefa(tarefa.projetoId);
  const excluirTarefa = useExcluirTarefa(tarefa.projetoId);

  const isConcluida = tarefa.status === 'concluida';
  const traducao = tarefa.tituloTraduzido || traduzirDescricaoParaPtBr(tarefa.titulo);
  const temTraducaoDiferente = traducao && traducao.trim().toLowerCase() !== tarefa.titulo.trim().toLowerCase();

  const handleToggleStatus = (checked: boolean) => {
    atualizarTarefa.mutate({
      id: tarefa.id,
      dados: {
        status: checked ? 'concluida' : 'a_fazer',
      },
    });
  };

  const handleExcluir = (e: React.MouseEvent) => {
    e.stopPropagation();
    excluirTarefa.mutate(tarefa.id);
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3.5 rounded-m border transition-all duration-120',
        isConcluida
          ? 'bg-superficie/50 border-borda/60'
          : 'bg-superficie border-borda hover:bg-superficie-2 hover:border-borda-forte',
        selecionada && 'border-acento bg-acento-suave/30'
      )}
    >
      {emModoSelecao ? (
        <Checkbox
          checked={selecionada}
          onCheckedChange={() => aoAlternarSelecao && aoAlternarSelecao(tarefa.id)}
          className="mt-0.5"
        />
      ) : (
        <Checkbox
          checked={isConcluida}
          onCheckedChange={handleToggleStatus}
          className="mt-0.5"
        />
      )}

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium transition-colors duration-120 break-words',
              isConcluida ? 'line-through text-texto-3' : 'text-texto'
            )}
          >
            {tarefa.titulo}
          </p>

          <button
            type="button"
            onClick={handleExcluir}
            className="opacity-0 group-hover:opacity-100 text-texto-3 hover:text-perigo p-1 rounded transition-all shrink-0"
            title="Excluir tarefa"
            aria-label="Excluir tarefa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {temTraducaoDiferente && (
          <div
            className={cn(
              'flex items-start gap-1.5 p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium leading-relaxed',
              isConcluida && 'opacity-60 line-through'
            )}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0 select-none">
              PT-BR
            </span>
            <span className="break-words">{traducao}</span>
          </div>
        )}

        {tarefa.observacoes && (
          <p className={cn('text-xs break-words', isConcluida ? 'text-texto-3/80' : 'text-texto-2')}>
            {tarefa.observacoes}
          </p>
        )}

        {tarefa.prazo && (
          <div className="flex items-center gap-1 text-[11px] text-texto-3 numero pt-0.5">
            <Calendar className="w-3 h-3" />
            <span>Prazo: {formatarDataCurta(tarefa.prazo)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
