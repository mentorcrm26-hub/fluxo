'use client';

import React, { useState } from 'react';
import { BarraLateral } from './BarraLateral';
import { BarraInferior } from './BarraInferior';
import { FormularioProjeto } from '../projeto/FormularioProjeto';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [modalNovoProjetoAberto, setModalNovoProjetoAberto] = useState(false);

  return (
    <div className="min-h-screen bg-fundo text-texto flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <BarraLateral aoAbrirNovoProjeto={() => setModalNovoProjetoAberto(true)} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8 flex flex-col items-center">
        <div className="w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BarraInferior aoAbrirNovoProjeto={() => setModalNovoProjetoAberto(true)} />

      {/* Global New Project Modal */}
      <FormularioProjeto
        aberto={modalNovoProjetoAberto}
        aoFechar={() => setModalNovoProjetoAberto(false)}
      />
    </div>
  );
}
