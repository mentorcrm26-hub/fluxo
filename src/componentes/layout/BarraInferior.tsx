'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, Coins, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BarraInferiorProps {
  aoAbrirNovoProjeto: () => void;
}

export function BarraInferior({ aoAbrirNovoProjeto }: BarraInferiorProps) {
  const pathname = usePathname();

  const rotas = [
    {
      nome: 'Início',
      href: '/',
      icone: FolderKanban,
      ativo: pathname === '/' || pathname.startsWith('/projetos'),
    },
    {
      nome: 'Recebimentos',
      href: '/recebimentos',
      icone: Coins,
      ativo: pathname === '/recebimentos',
    },
    {
      nome: 'Configurações',
      href: '/configuracoes',
      icone: Settings,
      ativo: pathname === '/configuracoes',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-superficie/95 backdrop-blur-md border-t border-borda h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-4 flex items-center justify-around select-none touch-manipulation">
      {/* Início */}
      <Link
        href={rotas[0].href}
        className={cn(
          'flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-p transition-colors',
          rotas[0].ativo ? 'text-acento-claro' : 'text-texto-3 hover:text-texto-2'
        )}
      >
        <FolderKanban className="w-5 h-5" />
        <span className="text-[10px] font-medium">{rotas[0].nome}</span>
      </Link>

      {/* Botão Central Elevado */}
      <div className="-mt-6 flex justify-center">
        <button
          type="button"
          onClick={aoAbrirNovoProjeto}
          className="w-13 h-13 rounded-full bg-acento text-white flex items-center justify-center shadow-2 hover:bg-acento-claro active:scale-95 transition-all border-4 border-fundo"
          title="Novo Projeto"
          aria-label="Novo Projeto"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Recebimentos */}
      <Link
        href={rotas[1].href}
        className={cn(
          'flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-p transition-colors',
          rotas[1].ativo ? 'text-acento-claro' : 'text-texto-3 hover:text-texto-2'
        )}
      >
        <Coins className="w-5 h-5" />
        <span className="text-[10px] font-medium">{rotas[1].nome}</span>
      </Link>

      {/* Configurações */}
      <Link
        href={rotas[2].href}
        className={cn(
          'flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-p transition-colors',
          rotas[2].ativo ? 'text-acento-claro' : 'text-texto-3 hover:text-texto-2'
        )}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] font-medium">{rotas[2].nome}</span>
      </Link>
    </nav>
  );
}
