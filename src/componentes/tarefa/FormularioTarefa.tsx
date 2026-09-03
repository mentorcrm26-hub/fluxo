'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Botao } from '../ui/Botao';
import { useCriarTarefa } from '@/lib/dados/hooks';
import { useToast } from '../ui/Toast';

const esquemaTarefa = z.object({
  titulo: z.string().min(2, 'O título da tarefa deve ter no mínimo 2 caracteres'),
  observacoes: z.string().optional(),
  prazo: z.string().optional(),
});

type FormDados = z.infer<typeof esquemaTarefa>;

interface FormularioTarefaProps {
  aberto: boolean;
  aoFechar: () => void;
  projetoId: string;
}

export function FormularioTarefa({
  aberto,
  aoFechar,
  projetoId,
}: FormularioTarefaProps) {
  const { sucesso, erro } = useToast();
  const criarTarefa = useCriarTarefa(projetoId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormDados>({
    resolver: zodResolver(esquemaTarefa),
    defaultValues: {
      titulo: '',
      observacoes: '',
      prazo: '',
    },
  });

  const onSubmit = async (dados: FormDados) => {
    try {
      await criarTarefa.mutateAsync({
        titulo: dados.titulo.trim(),
        observacoes: dados.observacoes?.trim() || undefined,
        prazo: dados.prazo || undefined,
      });
      sucesso('Tarefa adicionada com sucesso.');
      reset();
      aoFechar();
    } catch (err: any) {
      erro('Erro ao criar tarefa.', err.message || 'Tente novamente.');
    }
  };

  return (
    <Dialog
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Nova Tarefa Manual"
      descricao="Adicione uma tarefa avulsa a este projeto."
      tamanho="p"
      rodape={
        <>
          <Botao type="button" variante="fantasma" onClick={aoFechar} disabled={criarTarefa.isPending}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-tarefa" carregando={criarTarefa.isPending}>
            Adicionar Tarefa
          </Botao>
        </>
      }
    >
      <form id="form-tarefa" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          rotulo="Título da Tarefa"
          placeholder="Ex: Vistoria do bloco administrativo"
          erro={errors.titulo?.message}
          autoFocus
          {...register('titulo')}
        />

        <Input
          rotulo="Prazo (opcional)"
          type="date"
          erro={errors.prazo?.message}
          {...register('prazo')}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-texto-2 uppercase tracking-wider">
            Observações (opcional)
          </label>
          <textarea
            rows={3}
            placeholder="Anotações, referências ou detalhes técnicos..."
            className="w-full p-3 bg-superficie-2 text-texto border border-borda rounded-m text-sm outline-none focus:border-acento focus:ring-1 focus:ring-acento resize-none"
            {...register('observacoes')}
          />
        </div>
      </form>
    </Dialog>
  );
}
