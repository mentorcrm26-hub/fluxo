'use client';

import React from 'react';
import { Botao } from '../ui/Botao';
import { ColunaDetectada } from '@/lib/dados/tipos';
import { Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PassoTabelaProps {
  linhas: string[][];
  colunas: ColunaDetectada[];
  linhaCabecalhoIndex: number;
  aoSelecionarCabecalho: (index: number) => void;
  aoAvancar: () => void;
  aoVoltar: () => void;
}

export function PassoTabela({
  linhas,
  colunas,
  linhaCabecalhoIndex,
  aoSelecionarCabecalho,
  aoAvancar,
  aoVoltar,
}: PassoTabelaProps) {
  const previewLinhas = linhas.slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-texto">Conferir Tabela e Cabeçalho</h2>
        <p className="text-sm text-texto-2">
          Verifique a estrutura detectada. A linha destacada será utilizada como o cabeçalho da tabela.
        </p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-m bg-acento-suave/40 border border-acento/20 text-acento-claro text-xs">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>Se a linha destacada não for o cabeçalho, clique na linha correta para ajustá-la.</span>
      </div>

      {/* Tabela de Preview */}
      <div className="overflow-x-auto rounded-g bg-superficie border border-borda max-h-[500px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead className="sticky top-0 z-10 bg-superficie-2 border-b border-borda">
            <tr>
              <th className="py-2.5 px-3 text-texto-3 w-12 text-center numero">#</th>
              {colunas.map((col, idx) => (
                <th key={idx} className="py-2.5 px-3 font-semibold text-texto whitespace-nowrap">
                  {col.nome || `COLUNA ${idx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borda">
            {previewLinhas.map((linha, rIdx) => {
              const ehCabecalho = rIdx === linhaCabecalhoIndex;

              return (
                <tr
                  key={rIdx}
                  onClick={() => aoSelecionarCabecalho(rIdx)}
                  className={cn(
                    'cursor-pointer transition-colors duration-120 group',
                    ehCabecalho
                      ? 'bg-acento-suave text-acento-claro font-semibold hover:bg-acento-suave/80'
                      : 'hover:bg-superficie-2 text-texto'
                  )}
                >
                  <td className="py-2.5 px-3 text-center text-texto-3 numero select-none">
                    {ehCabecalho ? (
                      <span className="bg-acento text-white px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                        CAB
                      </span>
                    ) : (
                      rIdx + 1
                    )}
                  </td>
                  {colunas.map((_, cIdx) => (
                    <td
                      key={cIdx}
                      className={cn(
                        'py-2.5 px-3 whitespace-nowrap max-w-xs truncate',
                        ehCabecalho && 'text-acento-claro'
                      )}
                    >
                      {linha[cIdx] || '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-texto-3">
        Exibindo as primeiras {previewLinhas.length} linhas de {linhas.length} detectadas.
      </p>

      {/* Controles de Navegação */}
      <div className="flex items-center justify-between pt-4 border-t border-borda">
        <Botao
          variante="secundario"
          onClick={aoVoltar}
          iconeEsquerda={<ArrowLeft className="w-4 h-4" />}
        >
          Voltar
        </Botao>
        <Botao
          variante="primario"
          onClick={aoAvancar}
          iconeDireita={<ArrowRight className="w-4 h-4" />}
        >
          Continuar para Colunas
        </Botao>
      </div>
    </div>
  );
}
