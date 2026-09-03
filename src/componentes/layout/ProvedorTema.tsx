'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Tema = 'escuro' | 'claro' | 'sistema';

interface TemaContextoTipo {
  tema: Tema;
  definirTema: (novoTema: Tema) => void;
  temaAtual: 'escuro' | 'claro';
}

const TemaContexto = createContext<TemaContextoTipo>({
  tema: 'escuro',
  definirTema: () => {},
  temaAtual: 'escuro',
});

export function ProvedorTema({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>('escuro');
  const [temaAtual, setTemaAtual] = useState<'escuro' | 'claro'>('escuro');
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    const salvo = localStorage.getItem('fluxo:tema') as Tema | null;
    if (salvo && ['escuro', 'claro', 'sistema'].includes(salvo)) {
      setTema(salvo);
    }
  }, []);

  useEffect(() => {
    if (!montado) return;

    const aplicarTema = () => {
      let efetivo: 'escuro' | 'claro' = 'escuro';

      if (tema === 'sistema') {
        const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
        efetivo = prefereEscuro ? 'escuro' : 'claro';
      } else {
        efetivo = tema;
      }

      setTemaAtual(efetivo);

      if (efetivo === 'claro') {
        document.documentElement.setAttribute('data-tema', 'claro');
      } else {
        document.documentElement.removeAttribute('data-tema');
      }
    };

    aplicarTema();

    if (tema === 'sistema') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => aplicarTema();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [tema, montado]);

  const definirTema = (novoTema: Tema) => {
    setTema(novoTema);
    localStorage.setItem('fluxo:tema', novoTema);
  };

  return (
    <TemaContexto.Provider value={{ tema, definirTema, temaAtual }}>
      {children}
    </TemaContexto.Provider>
  );
}

export function useTema() {
  return useContext(TemaContexto);
}
