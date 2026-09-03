'use client';

import React, { useState } from 'react';
import { ColunaDetectada } from '@/lib/dados/tipos';
import { Checkbox } from '../ui/Checkbox';
import { Pencil, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartaoColunaProps {
  coluna: ColunaDetectada;
  selecionada: boolean;
  ehTitulo: boolean;
  aoAlternar: () => void;
  aoRenomear: (novoNome: string) => void;
}

export function CartaoColuna({
  coluna,
  selecionada,
  ehTitulo,
  aoAlternar,
  aoRenomear,
}: CartaoColunaProps) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(coluna.nome);

  const handleSalvarEdicao = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nome.trim()) {
      aoRenomear(nome.trim().toUpperCase());
    } else {
      setNome(coluna.nome);
    }
    setEditando(false);
  };

  // Pontos de confiança
  const renderConfianca = () => {
    const conf = coluna.confianca;
    if (conf >= 0.8) {
      return (
        <span className="text-xs text-sucesso tracking-widest font-mono" title={`Confiança alta: ${(conf * 100).toFixed(0)}%`}>
          ●●●
        </span>
      );
    }
    if (conf >= 0.5) {
      return (
        <span className="text-xs text-alerta tracking-widest font-mono" title={`Confiança média: ${(conf * 100).toFixed(0)}%`}>
          ●●○
        </span>
      );
    }
    return (
      <span className="text-xs text-perigo tracking-widest font-mono" title={`Confiança baixa: ${(conf * 100).toFixed(0)}%`}>
        ●○○
      </span>
    );
  };

  return (
    <div
      onClick={() => {
        if (!editando && !ehTitulo) {
          aoAlternar();
        }
      }}
      className={cn(
        'group flex flex-col justify-between p-4 rounded-m border transition-all duration-120 select-none cursor-pointer',
        selecionada
          ? 'bg-acento-suave border-acento shadow-1'
          : 'bg-superficie border-borda hover:border-borda-forte hover:bg-superficie-2',
        ehTitulo && 'ring-2 ring-acento'
      )}
    >
      {/* Header do Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selecionada || ehTitulo}
              disabled={ehTitulo}
              onCheckedChange={() => !ehTitulo && aoAlternar()}
            />

            {editando ? (
              <form onSubmit={handleSalvarEdicao} className="flex items-center gap-1 flex-1 min-w-0">
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onBlur={() => handleSalvarEdicao()}
                  autoFocus
                  className="w-full text-xs font-bold uppercase bg-superficie-2 text-texto px-1.5 py-0.5 rounded border border-acento outline-none"
                />
                <button
                  type="submit"
                  className="text-acento-claro p-0.5 hover:text-white"
                  title="Salvar"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-xs font-bold uppercase text-texto truncate">
                  {coluna.nome}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditando(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-texto-3 hover:text-texto p-0.5 rounded transition-opacity"
                  title="Renomear coluna"
                  aria-label="Renomear coluna"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {ehTitulo && (
            <span className="bg-acento text-white text-[10px] font-bold px-1.5 py-0.5 rounded-p uppercase tracking-wider">
              TÍTULO
            </span>
          )}
        </div>

        {/* Amostras de dados */}
        <div className="space-y-1 pl-7">
          {coluna.amostras && coluna.amostras.length > 0 ? (
            coluna.amostras.slice(0, 3).map((amostra, idx) => (
              <p key={idx} className="text-xs text-texto-2 truncate">
                {amostra || '—'}
              </p>
            ))
          ) : (
            <p className="text-xs text-texto-3 italic">Sem amostras nesta coluna</p>
          )}
        </div>
      </div>

      {/* Footer com confiança */}
      <div className="pt-3 mt-3 border-t border-borda/60 flex items-center justify-between pl-7">
        <span className="text-[11px] text-texto-3 font-medium">Confiança</span>
        {renderConfianca()}
      </div>
    </div>
  );
}
