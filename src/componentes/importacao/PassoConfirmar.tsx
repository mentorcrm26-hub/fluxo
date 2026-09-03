'use client';

import React from 'react';
import { ColunaDetectada, MapeamentoColunas } from '@/lib/dados/tipos';
import { Botao } from '../ui/Botao';
import { formatarDataCurta } from '@/lib/datas';
import { ArrowLeft, Check, FileCheck, Calendar, Layers } from 'lucide-react';

interface PassoConfirmarProps {
  nomeArquivo: string;
  tamanhoBytes: number;
  totalPaginas: number;
  colunas: ColunaDetectada[];
  colunasEscolhidas: number[];
  mapeamento: MapeamentoColunas;
  linhas: string[][];
  importando: boolean;
  aoConfirmar: () => void;
  aoVoltar: () => void;
}

export function PassoConfirmar({
  nomeArquivo,
  tamanhoBytes,
  totalPaginas,
  colunas,
  colunasEscolhidas,
  mapeamento,
  linhas,
  importando,
  aoConfirmar,
  aoVoltar,
}: PassoConfirmarProps) {
  const totalLinhas = linhas.length;
  const colunasFiltradas = colunas.filter((c) => colunasEscolhidas.includes(c.indice));

  const nomeColunaTitulo = colunas.find((c) => c.indice === mapeamento.titulo)?.nome || 'TÍTULO';
  const nomeColunaPrazo = mapeamento.prazo !== null
    ? colunas.find((c) => c.indice === mapeamento.prazo)?.nome
    : null;
  const nomeColunaObs = mapeamento.observacoes !== null
    ? colunas.find((c) => c.indice === mapeamento.observacoes)?.nome
    : null;

  // Monta as 5 primeiras tarefas de amostra
  const amostraTarefas = linhas.slice(0, 5).map((linha, idx) => {
    const titulo = linha[mapeamento.titulo] || `Item #${idx + 1}`;
    const prazo = mapeamento.prazo !== null ? linha[mapeamento.prazo] : null;
    const obs = mapeamento.observacoes !== null ? linha[mapeamento.observacoes] : null;

    return {
      titulo,
      prazo,
      obs,
    };
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-texto">Confirmar Importação</h2>
        <p className="text-sm text-texto-2">
          Revise o resumo antes de criar as tarefas deste projeto.
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-m bg-superficie border border-borda space-y-1">
          <span className="text-xs text-texto-3 block uppercase font-medium">Tarefas a Criar</span>
          <span className="numero text-2xl font-bold text-acento-claro">{totalLinhas}</span>
          <span className="text-[11px] text-texto-2 block">1 tarefa por linha</span>
        </div>

        <div className="p-4 rounded-m bg-superficie border border-borda space-y-1">
          <span className="text-xs text-texto-3 block uppercase font-medium">Colunas Importadas</span>
          <span className="numero text-2xl font-bold text-texto">{colunasEscolhidas.length}</span>
          <span className="text-[11px] text-texto-2 block">de {colunas.length} detectadas</span>
        </div>

        <div className="p-4 rounded-m bg-superficie border border-borda space-y-1">
          <span className="text-xs text-texto-3 block uppercase font-medium">Documento</span>
          <span className="text-sm font-semibold text-texto truncate block">{nomeArquivo}</span>
          <span className="text-[11px] text-texto-3 numero block">
            {totalPaginas} {totalPaginas === 1 ? 'página' : 'páginas'} · {(tamanhoBytes / 1024).toFixed(0)} KB
          </span>
        </div>
      </div>

      {/* Amostra das primeiras tarefas */}
      <div className="rounded-g bg-superficie border border-borda p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-borda">
          <h3 className="text-xs font-semibold text-texto uppercase tracking-wider">
            Amostra das 5 primeiras tarefas que serão geradas
          </h3>
          <span className="text-xs text-texto-3 numero">Total: {totalLinhas} tarefas</span>
        </div>

        <div className="space-y-2">
          {amostraTarefas.map((tarefa, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-p bg-superficie-2 border border-borda/60 text-xs"
            >
              <span className="numero text-texto-3 font-medium w-5 text-center">{idx + 1}</span>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-texto truncate">{tarefa.titulo}</p>
                {tarefa.obs && (
                  <p className="text-texto-2 text-[11px] truncate">
                    {nomeColunaObs}: {tarefa.obs}
                  </p>
                )}
              </div>
              {tarefa.prazo && (
                <div className="flex items-center gap-1 text-texto-3 numero whitespace-nowrap">
                  <Calendar className="w-3 h-3" />
                  <span>{tarefa.prazo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between pt-4 border-t border-borda">
        <Botao
          variante="secundario"
          onClick={aoVoltar}
          disabled={importando}
          iconeEsquerda={<ArrowLeft className="w-4 h-4" />}
        >
          Voltar
        </Botao>

        <Botao
          variante="primario"
          carregando={importando}
          onClick={aoConfirmar}
          iconeEsquerda={<FileCheck className="w-4 h-4" />}
        >
          Importar e Criar {totalLinhas} Tarefas
        </Botao>
      </div>
    </div>
  );
}
