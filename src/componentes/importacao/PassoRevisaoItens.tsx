'use client';

import React, { useState } from 'react';
import { ItemExtraido } from '@/lib/importacao/extratorPlanilha';
import { Botao } from '../ui/Botao';
import {
  CheckCircle2,
  CheckSquare,
  Square,
  ArrowLeft,
  Edit2,
  Check,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatarUSD } from '@/lib/dinheiro';

interface PassoRevisaoItensProps {
  nomeArquivo: string;
  itens: ItemExtraido[];
  importando: boolean;
  aoAlternarItem: (id: string) => void;
  aoEditarTitulo: (id: string, novoTitulo: string) => void;
  aoAlternarTodos: () => void;
  aoConfirmarImportacao: () => void;
  aoVoltar: () => void;
}

export function PassoRevisaoItens({
  nomeArquivo,
  itens,
  importando,
  aoAlternarItem,
  aoEditarTitulo,
  aoAlternarTodos,
  aoConfirmarImportacao,
  aoVoltar,
}: PassoRevisaoItensProps) {
  const [itemEmEdicao, setItemEmEdicao] = useState<string | null>(null);
  const [tituloTemp, setTituloTemp] = useState('');

  const selecionados = itens.filter((i) => i.selecionado);
  const totalSelecionados = selecionados.length;
  const todosSelecionados = totalSelecionados === itens.length && itens.length > 0;

  const iniciarEdicao = (item: ItemExtraido) => {
    setItemEmEdicao(item.id);
    setTituloTemp(item.titulo);
  };

  const salvarEdicao = (id: string) => {
    if (tituloTemp.trim()) {
      aoEditarTitulo(id, tituloTemp.trim());
    }
    setItemEmEdicao(null);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-150">
      {/* Cabeçalho de Resumo com Ação Rápida */}
      <div className="rounded-xg bg-superficie border border-borda p-5 md:p-6 shadow-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-full bg-sucesso-suave border border-sucesso/30 flex items-center justify-center text-sucesso flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-texto">
                {itens.length} {itens.length === 1 ? 'item detectado' : 'itens detectados'}
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-acento-claro bg-acento-suave px-2 py-0.5 rounded-full border border-acento/20">
                <Sparkles className="w-3 h-3" /> Auto-detectado
              </span>
            </div>
            <p className="text-xs text-texto-2 mt-1">
              Arquivo: <strong className="text-texto font-medium">{nomeArquivo}</strong> · {totalSelecionados} de {itens.length} selecionados
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
          <Botao
            variante="secundario"
            tamanho="p"
            onClick={aoAlternarTodos}
            iconeEsquerda={
              todosSelecionados ? (
                <CheckSquare className="w-4 h-4 text-acento" />
              ) : (
                <Square className="w-4 h-4" />
              )
            }
          >
            {todosSelecionados ? 'Desmarcar todos' : 'Marcar todos'}
          </Botao>

          <Botao
            variante="primario"
            tamanho="p"
            carregando={importando}
            disabled={totalSelecionados === 0}
            onClick={aoConfirmarImportacao}
            iconeEsquerda={<CheckCircle2 className="w-4 h-4" />}
            className="font-bold shadow-md px-4"
          >
            {importando ? 'Importando...' : `Importar (${totalSelecionados})`}
          </Botao>
        </div>
      </div>

      {/* Lista de Itens Detectados */}
      <div className="space-y-2.5">
        {itens.map((item, index) => {
          const isEditing = itemEmEdicao === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                'group relative rounded-g p-4 border transition-all duration-120 flex flex-col gap-2',
                item.selecionado
                  ? 'bg-superficie border-borda hover:border-borda-forte shadow-sm'
                  : 'bg-superficie-2/40 border-transparent opacity-50'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox de Inclusão */}
                <button
                  type="button"
                  onClick={() => aoAlternarItem(item.id)}
                  className="mt-0.5 text-texto-2 hover:text-texto transition-colors flex-shrink-0"
                  aria-label={item.selecionado ? 'Desmarcar item' : 'Marcar item'}
                >
                  {item.selecionado ? (
                    <CheckSquare className="w-5 h-5 text-acento" />
                  ) : (
                    <Square className="w-5 h-5 text-texto-3" />
                  )}
                </button>

                {/* Número sequencial */}
                <span className="text-xs font-bold text-texto-3 numero mt-0.5 select-none min-w-[24px]">
                  #{index + 1}
                </span>

                {/* Conteúdo do Item */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tituloTemp}
                        onChange={(e) => setTituloTemp(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && salvarEdicao(item.id)}
                        autoFocus
                        className="w-full text-sm font-medium bg-superficie-2 text-texto border border-acento rounded-p px-2.5 py-1 outline-none"
                      />
                      <Botao
                        tamanho="p"
                        variante="primario"
                        onClick={() => salvarEdicao(item.id)}
                        iconeEsquerda={<Check className="w-3.5 h-3.5" />}
                      >
                        Salvar
                      </Botao>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-texto leading-relaxed">
                          {item.titulo}
                        </p>
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(item)}
                          className="opacity-0 group-hover:opacity-100 text-texto-3 hover:text-texto p-1 transition-opacity flex-shrink-0"
                          title="Editar título"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Tradução em Português BR abaixo da original */}
                      {item.tituloTraduzido && (
                        <div className="flex items-start gap-1.5 pt-0.5 text-xs text-acento-claro bg-acento-suave/30 p-2 rounded-m border border-acento/15">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-acento-suave text-acento-claro px-1.5 py-0.5 rounded border border-acento/20 flex-shrink-0 mt-0.5">
                            PT-BR
                          </span>
                          <span className="font-medium leading-relaxed">{item.tituloTraduzido}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadados e Badges do Item */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {item.quantidade && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-superficie-2 text-texto-2 border border-borda numero font-medium text-[11px]">
                        Qtd: {item.quantidade}
                      </span>
                    )}

                    {item.valorCentavos && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sucesso-suave text-sucesso border border-sucesso/20 numero font-semibold text-[11px]">
                        {formatarUSD(item.valorCentavos)}
                      </span>
                    )}

                    {item.observacoes && (
                      <span className="text-texto-3 text-[11px] truncate max-w-xl">
                        {item.observacoes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de Ação Flutuante Sticky no Rodapé (sem sobrepor o menu lateral ou bloquear o scroll) */}
      <div className="sticky bottom-4 z-20 bg-superficie/95 backdrop-blur-md border border-borda rounded-xg p-4 shadow-3 flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <Botao
            variante="secundario"
            onClick={aoVoltar}
            disabled={importando}
            iconeEsquerda={<ArrowLeft className="w-4 h-4" />}
          >
            Escolher outro arquivo
          </Botao>
          <span className="text-xs text-texto-2 numero font-medium">
            <strong className="text-texto">{totalSelecionados}</strong> de{' '}
            <strong className="text-texto">{itens.length}</strong> selecionados
          </span>
        </div>

        <Botao
          variante="primario"
          tamanho="m"
          carregando={importando}
          disabled={totalSelecionados === 0}
          onClick={aoConfirmarImportacao}
          iconeEsquerda={<CheckCircle2 className="w-5 h-5 text-white" />}
          className="w-full sm:w-auto px-6 font-bold shadow-lg shadow-acento/20 text-sm h-11"
        >
          {importando
            ? 'Importando Tarefas...'
            : `Importar ${totalSelecionados} ${totalSelecionados === 1 ? 'Item' : 'Itens'} para o Projeto`}
        </Botao>
      </div>
    </div>
  );
}
