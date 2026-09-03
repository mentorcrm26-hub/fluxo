'use client';

import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTema } from './ProvedorTema';

export function AlternadorTema({ compacto = false }: { compacto?: boolean }) {
  const { tema, definirTema } = useTema();

  if (compacto) {
    return (
      <button
        type="button"
        onClick={() => definirTema(tema === 'escuro' ? 'claro' : 'escuro')}
        className="w-10 h-10 rounded-m flex items-center justify-center text-texto-2 hover:text-texto hover:bg-superficie-2 transition-colors border border-borda"
        title={`Alternar para tema ${tema === 'escuro' ? 'claro' : 'escuro'}`}
        aria-label="Alternar tema"
      >
        {tema === 'escuro' ? <Sun className="w-5 h-5 text-alerta" /> : <Moon className="w-5 h-5 text-acento" />}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-superficie-2 border border-borda rounded-m">
      <button
        type="button"
        onClick={() => definirTema('escuro')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-p text-xs font-medium transition-colors ${
          tema === 'escuro'
            ? 'bg-acento text-white shadow-1'
            : 'text-texto-2 hover:text-texto'
        }`}
        title="Tema Escuro"
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Escuro</span>
      </button>

      <button
        type="button"
        onClick={() => definirTema('claro')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-p text-xs font-medium transition-colors ${
          tema === 'claro'
            ? 'bg-acento text-white shadow-1'
            : 'text-texto-2 hover:text-texto'
        }`}
        title="Tema Claro"
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Claro</span>
      </button>

      <button
        type="button"
        onClick={() => definirTema('sistema')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-p text-xs font-medium transition-colors ${
          tema === 'sistema'
            ? 'bg-acento text-white shadow-1'
            : 'text-texto-2 hover:text-texto'
        }`}
        title="Seguir Sistema"
      >
        <Laptop className="w-3.5 h-3.5" />
        <span>Auto</span>
      </button>
    </div>
  );
}
