'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Botao } from '../ui/Botao';
import { CorProjeto, Projeto } from '@/lib/dados/tipos';
import { parsearUSD, formatarUSD, calcularMinhaParteCentavos } from '@/lib/dinheiro';
import { obterHojeISO, adicionarDiasCorridos } from '@/lib/datas';
import { useCriarProjeto, useAtualizarProjeto } from '@/lib/dados/hooks';
import { useToast } from '../ui/Toast';

const CORES_DISPONIVEIS: { id: CorProjeto; rotulo: string; hex: string }[] = [
  { id: 'violeta', rotulo: 'Violeta', hex: '#8b5cf6' },
  { id: 'azul', rotulo: 'Azul', hex: '#3b82f6' },
  { id: 'verde', rotulo: 'Verde', hex: '#10b981' },
  { id: 'ambar', rotulo: 'Âmbar', hex: '#f59e0b' },
  { id: 'rosa', rotulo: 'Rosa', hex: '#ec4899' },
  { id: 'ciano', rotulo: 'Ciano', hex: '#06b6d4' },
];

const esquemaProjeto = z.object({
  nome: z.string().min(1, 'Nome do projeto é obrigatório').max(100, 'Nome muito longo'),
  cliente: z.string().max(100, 'Nome do cliente muito longo').optional(),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início inválida'),
  dataFimPrevista: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de previsão inválida'),
});

type FormDados = z.infer<typeof esquemaProjeto>;

interface FormularioProjetoProps {
  aberto: boolean;
  aoFechar: () => void;
  projetoParaEditar?: Projeto | null;
}

export function FormularioProjeto({
  aberto,
  aoFechar,
  projetoParaEditar,
}: FormularioProjetoProps) {
  const { sucesso, erro } = useToast();
  const criarProjeto = useCriarProjeto();
  const atualizarProjeto = useAtualizarProjeto();

  const [corSelecionada, setCorSelecionada] = useState<CorProjeto>('violeta');
  const [valorTexto, setValorTexto] = useState('$0.00');
  const [porcentagem, setPorcentagem] = useState<number>(45);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormDados>({
    resolver: zodResolver(esquemaProjeto),
    defaultValues: {
      nome: '',
      cliente: '',
      descricao: '',
      dataInicio: obterHojeISO(),
      dataFimPrevista: adicionarDiasCorridos(new Date(), 30),
    },
  });

  useEffect(() => {
    if (projetoParaEditar) {
      reset({
        nome: projetoParaEditar.nome,
        cliente: projetoParaEditar.cliente || '',
        descricao: projetoParaEditar.descricao || '',
        dataInicio: projetoParaEditar.dataInicio,
        dataFimPrevista: projetoParaEditar.dataFimPrevista,
      });
      setCorSelecionada(projetoParaEditar.cor);
      setValorTexto(formatarUSD(projetoParaEditar.valorCentavos));
      setPorcentagem(typeof projetoParaEditar.porcentagem === 'number' ? projetoParaEditar.porcentagem : 45);
    } else {
      reset({
        nome: '',
        cliente: '',
        descricao: '',
        dataInicio: obterHojeISO(),
        dataFimPrevista: adicionarDiasCorridos(new Date(), 30),
      });
      setCorSelecionada('violeta');
      setValorTexto('$0.00');
      setPorcentagem(45);
    }
  }, [projetoParaEditar, aberto, reset]);

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limpo = e.target.value.replace(/\D/g, '');
    const centavos = parseInt(limpo || '0', 10);
    setValorTexto(formatarUSD(centavos));
  };

  const handlePorcentagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPorcentagem(isNaN(val) ? 0 : val);
  };

  const onSubmit = async (dados: FormDados) => {
    const valorCentavos = parsearUSD(valorTexto);

    try {
      if (projetoParaEditar) {
        await atualizarProjeto.mutateAsync({
          id: projetoParaEditar.id,
          dados: {
            nome: dados.nome,
            cliente: dados.cliente?.trim() || null,
            descricao: dados.descricao?.trim() || null,
            cor: corSelecionada,
            dataInicio: dados.dataInicio,
            dataFimPrevista: dados.dataFimPrevista,
            valorCentavos,
            porcentagem,
          },
        });
        sucesso('Projeto atualizado com sucesso.');
      } else {
        await criarProjeto.mutateAsync({
          nome: dados.nome,
          cliente: dados.cliente?.trim() || null,
          descricao: dados.descricao?.trim() || null,
          cor: corSelecionada,
          dataInicio: dados.dataInicio,
          dataFimPrevista: dados.dataFimPrevista,
          valorCentavos,
          porcentagem,
        });
        sucesso('Projeto criado com sucesso.');
      }
      aoFechar();
    } catch (err: any) {
      erro('Erro ao salvar projeto.', err.message || 'Verifique os dados informados.');
    }
  };

  const isSalvando = criarProjeto.isPending || atualizarProjeto.isPending;
  const valorTotalCentavos = parsearUSD(valorTexto);
  const minhaParteCentavos = calcularMinhaParteCentavos(valorTotalCentavos, porcentagem);

  return (
    <Dialog
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={projetoParaEditar ? 'Editar Projeto' : 'Novo Projeto'}
      descricao={
        projetoParaEditar
          ? 'Atualize os dados e configurações do projeto.'
          : 'Preencha as informações básicas para iniciar um novo projeto.'
      }
      tamanho="m"
      rodape={
        <>
          <Botao type="button" variante="fantasma" onClick={aoFechar} disabled={isSalvando}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-projeto" carregando={isSalvando}>
            {projetoParaEditar ? 'Salvar Alterações' : 'Criar Projeto'}
          </Botao>
        </>
      }
    >
      <form id="form-projeto" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          rotulo="Nome do Projeto"
          placeholder="Ex: Levantamento Topográfico Zona Sul"
          erro={errors.nome?.message}
          {...register('nome')}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            rotulo="Cliente (opcional)"
            placeholder="Ex: Construtora Vega"
            erro={errors.cliente?.message}
            {...register('cliente')}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-texto-2 uppercase tracking-wider">
              Valor do Contrato
            </label>
            <input
              type="text"
              value={valorTexto}
              onChange={handleValorChange}
              className="numero w-full h-10 px-3 bg-superficie-2 text-texto border border-borda rounded-m text-sm outline-none focus:border-acento focus:ring-1 focus:ring-acento"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-texto-2 uppercase tracking-wider">
              Sua Porcentagem (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={porcentagem}
                onChange={handlePorcentagemChange}
                className="numero w-full h-10 px-3 pr-8 bg-superficie-2 text-texto border border-borda rounded-m text-sm outline-none focus:border-acento focus:ring-1 focus:ring-acento"
              />
              <span className="absolute right-3 top-2.5 text-xs text-texto-3 font-bold">%</span>
            </div>
          </div>
        </div>

        {/* Preview do Repasse / Sua Parte */}
        <div className="flex items-center justify-between p-3 rounded-m bg-acento-suave/40 border border-acento/20 text-xs">
          <span className="text-texto-2">
            Sua parte calculada neste projeto (<strong className="text-texto">{porcentagem}%</strong>):
          </span>
          <span className="numero font-bold text-sm text-acento-claro">
            {formatarUSD(minhaParteCentavos)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            rotulo="Data de Início"
            type="date"
            erro={errors.dataInicio?.message}
            {...register('dataInicio')}
          />

          <Input
            rotulo="Previsão de Término"
            type="date"
            erro={errors.dataFimPrevista?.message}
            {...register('dataFimPrevista')}
          />
        </div>

        {/* Escolha de Cor */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-texto-2 uppercase tracking-wider">
            Cor de Identificação
          </label>
          <div className="flex items-center gap-3">
            {CORES_DISPONIVEIS.map((cor) => (
              <button
                key={cor.id}
                type="button"
                onClick={() => setCorSelecionada(cor.id)}
                className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                  corSelecionada === cor.id ? 'ring-2 ring-white ring-offset-2 ring-offset-superficie scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: cor.hex }}
                title={cor.rotulo}
                aria-label={`Selecionar cor ${cor.rotulo}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-texto-2 uppercase tracking-wider">
            Descrição / Observações (opcional)
          </label>
          <textarea
            rows={3}
            placeholder="Detalhes adicionais, escopo ou notas sobre o projeto..."
            className="w-full p-3 bg-superficie-2 text-texto border border-borda rounded-m text-sm outline-none focus:border-acento focus:ring-1 focus:ring-acento resize-none"
            {...register('descricao')}
          />
        </div>
      </form>
    </Dialog>
  );
}
