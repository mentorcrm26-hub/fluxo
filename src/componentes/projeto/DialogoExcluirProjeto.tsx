'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Botao } from '../ui/Botao';
import { ProjetoComResumo } from '@/lib/dados/tipos';
import { useExcluirProjeto } from '@/lib/dados/hooks';
import { useToast } from '../ui/Toast';
import { AlertTriangle } from 'lucide-react';

interface DialogoExcluirProjetoProps {
  aberto: boolean;
  aoFechar: () => void;
  projeto: ProjetoComResumo | null;
  aoExcluirSucesso?: () => void;
}

export function DialogoExcluirProjeto({
  aberto,
  aoFechar,
  projeto,
  aoExcluirSucesso,
}: DialogoExcluirProjetoProps) {
  const [confirmacaoTexto, setConfirmacaoTexto] = useState('');
  const excluirProjeto = useExcluirProjeto();
  const { sucesso, erro } = useToast();

  useEffect(() => {
    if (aberto) {
      setConfirmacaoTexto('');
    }
  }, [aberto]);

  if (!projeto) return null;

  const nomeExato = projeto.nome;
  const podeExcluir = confirmacaoTexto.trim() === nomeExato;

  const handleExcluir = async () => {
    if (!podeExcluir) return;

    try {
      await excluirProjeto.mutateAsync(projeto.id);
      sucesso(`Projeto "${projeto.nome}" foi excluído com sucesso.`);
      aoFechar();
      if (aoExcluirSucesso) {
        aoExcluirSucesso();
      }
    } catch (err: any) {
      erro('Erro ao excluir projeto.', err.message || 'Tente novamente.');
    }
  };

  return (
    <Dialog
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Excluir Projeto"
      tamanho="p"
      rodape={
        <>
          <Botao
            type="button"
            variante="fantasma"
            onClick={aoFechar}
            disabled={excluirProjeto.isPending}
          >
            Cancelar
          </Botao>
          <Botao
            type="button"
            variante="perigo"
            disabled={!podeExcluir || excluirProjeto.isPending}
            carregando={excluirProjeto.isPending}
            onClick={handleExcluir}
          >
            Excluir Definitivamente
          </Botao>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-m bg-perigo-suave border border-perigo/20 text-perigo text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            Esta ação é <strong>irreversível</strong>. Todas as tarefas ({projeto.totalTarefas}),
            importações e dados associados a este projeto serão excluídos permanentemente.
          </p>
        </div>

        <p className="text-sm text-texto-2">
          Para confirmar a exclusão, digite exatamente o nome do projeto:{' '}
          <strong className="text-texto font-mono bg-superficie-2 px-1.5 py-0.5 rounded border border-borda select-all">
            {nomeExato}
          </strong>
        </p>

        <Input
          placeholder="Digite o nome do projeto aqui"
          value={confirmacaoTexto}
          onChange={(e) => setConfirmacaoTexto(e.target.value)}
          autoFocus
        />
      </div>
    </Dialog>
  );
}
