'use client';

import React from 'react';
import { ColunaDetectada, MapeamentoColunas } from '@/lib/dados/tipos';
import { CartaoColuna } from './CartaoColuna';
import { Botao } from '../ui/Botao';
import { Select } from '../ui/Select';
import { ArrowLeft, ArrowRight, CheckSquare, Square } from 'lucide-react';

interface PassoColunasProps {
  colunas: ColunaDetectada[];
  colunasEscolhidas: number[];
  mapeamento: MapeamentoColunas;
  totalLinhas: number;
  aoAlternarColuna: (indice: number) => void;
  aoRenomearColuna: (indice: number, novoNome: string) => void;
  aoSelecionarTodasColunas: () => void;
  aoAtualizarMapeamento: (novoMapeamento: Partial<MapeamentoColunas>) => void;
  aoAvancar: () => void;
  aoVoltar: () => void;
}

export function PassoColunas({
  colunas,
  colunasEscolhidas,
  mapeamento,
  totalLinhas,
  aoAlternarColuna,
  aoRenomearColuna,
  aoSelecionarTodasColunas,
  aoAtualizarMapeamento,
  aoAvancar,
  aoVoltar,
}: PassoColunasProps) {
  const todasMarcadas = colunasEscolhidas.length === colunas.length;
  const colunaTituloValida = mapeamento.titulo !== null && colunasEscolhidas.includes(mapeamento.titulo);

  // Opções para o select de colunas (apenas as marcadas)
  const opcoesColunasMarcadas = colunas
    .filter((c) => colunasEscolhidas.includes(c.indice))
    .map((c) => ({
      valor: c.indice,
      rotulo: c.nome,
    }));

  const opcoesOpcionais = [
    { valor: -1, rotulo: 'Nenhuma (opcional)' },
    ...opcoesColunasMarcadas,
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-16">
      {/* Cabeçalho do Passo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-texto">Quais colunas você quer importar?</h2>
          <p className="text-sm text-texto-2">
            Marque as que interessam. As demais serão ignoradas na geração de tarefas.
          </p>
        </div>

        <Botao
          variante="secundario"
          tamanho="p"
          onClick={aoSelecionarTodasColunas}
          iconeEsquerda={
            todasMarcadas ? <CheckSquare className="w-4 h-4 text-acento" /> : <Square className="w-4 h-4" />
          }
        >
          {todasMarcadas ? 'Desmarcar todas' : 'Marcar todas'}
        </Botao>
      </div>

      {/* Grid de Cartões de Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colunas.map((col) => (
          <CartaoColuna
            key={col.indice}
            coluna={col}
            selecionada={colunasEscolhidas.includes(col.indice)}
            ehTitulo={mapeamento.titulo === col.indice}
            aoAlternar={() => aoAlternarColuna(col.indice)}
            aoRenomear={(novoNome) => aoRenomearColuna(col.indice, novoNome)}
          />
        ))}
      </div>

      {/* Bloco de Mapeamento de Campos */}
      <div className="p-5 rounded-g bg-superficie border border-borda space-y-4 shadow-1">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-texto uppercase tracking-wider">
            Mapeamento de Campos
          </h3>
          <p className="text-xs text-texto-2">
            Defina qual coluna dará origem ao título da tarefa e aos campos adicionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            rotulo="O título da tarefa virá de: *"
            opcoes={
              opcoesColunasMarcadas.length > 0
                ? opcoesColunasMarcadas
                : [{ valor: -1, rotulo: 'Nenhuma coluna marcada' }]
            }
            value={mapeamento.titulo ?? ''}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 0) {
                aoAtualizarMapeamento({ titulo: val });
              }
            }}
          />

          <Select
            rotulo="Prazo da tarefa:"
            opcoes={opcoesOpcionais}
            value={mapeamento.prazo ?? -1}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              aoAtualizarMapeamento({ prazo: val >= 0 ? val : null });
            }}
          />

          <Select
            rotulo="Observações / Detalhes:"
            opcoes={opcoesOpcionais}
            value={mapeamento.observacoes ?? -1}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              aoAtualizarMapeamento({ observacoes: val >= 0 ? val : null });
            }}
          />
        </div>
      </div>

      {/* Barra de Rodapé Fixa */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-superficie/95 backdrop-blur-md border-t border-borda py-3 px-4 md:px-8 flex items-center justify-between">
        <div className="text-xs md:text-sm text-texto-2 numero">
          <strong className="text-texto">{colunasEscolhidas.length}</strong> de{' '}
          <strong className="text-texto">{colunas.length}</strong> colunas marcadas ·{' '}
          <strong className="text-texto">{totalLinhas}</strong> linhas
        </div>

        <div className="flex items-center gap-3">
          {!colunaTituloValida && (
            <span className="text-xs text-alerta hidden sm:inline">
              Selecione a coluna obrigatória de título para continuar
            </span>
          )}

          <Botao
            variante="secundario"
            onClick={aoVoltar}
            iconeEsquerda={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar
          </Botao>

          <Botao
            variante="primario"
            disabled={!colunaTituloValida}
            onClick={aoAvancar}
            iconeDireita={<ArrowRight className="w-4 h-4" />}
          >
            Continuar
          </Botao>
        </div>
      </div>
    </div>
  );
}
