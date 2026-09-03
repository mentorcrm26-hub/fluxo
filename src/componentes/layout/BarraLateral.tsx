'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderKanban,
  Coins,
  Settings,
  Plus,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlternadorTema } from './AlternadorTema';
import { Botao } from '../ui/Botao';

interface BarraLateralProps {
  aoAbrirNovoProjeto: () => void;
}

export function BarraLateral({ aoAbrirNovoProjeto }: BarraLateralProps) {
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
    <aside className="hidden md:flex flex-col justify-between w-[72px] lg:w-[260px] bg-superficie border-r border-borda h-screen sticky top-0 flex-shrink-0 z-30 transition-all duration-320 p-4">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-m bg-acento flex items-center justify-center text-white shadow-1 flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="hidden lg:block">
            <span className="font-bold text-lg text-texto tracking-wider block font-display">
              FLUXO
            </span>
            <span className="text-[10px] text-texto-3 uppercase tracking-widest block font-medium">
              Workspace Pessoal
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Botao
            onClick={aoAbrirNovoProjeto}
            variante="primario"
            className="w-full hidden lg:flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </Botao>
          <button
            type="button"
            onClick={aoAbrirNovoProjeto}
            className="w-10 h-10 mx-auto rounded-m bg-acento text-white flex lg:hidden items-center justify-center shadow-1 hover:bg-acento-claro transition-colors"
            title="Novo Projeto"
            aria-label="Novo Projeto"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5 pt-2">
          {rotas.map((rota) => {
            const Icone = rota.icone;
            return (
              <Link
                key={rota.href}
                href={rota.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-m text-sm font-medium transition-colors outline-none',
                  rota.ativo
                    ? 'bg-acento-suave text-acento-claro border border-acento/20'
                    : 'text-texto-2 hover:text-texto hover:bg-superficie-2',
                  'focus-visible:ring-2 focus-visible:ring-acento'
                )}
                title={rota.nome}
              >
                <Icone className={cn('w-5 h-5 flex-shrink-0', rota.ativo ? 'text-acento-claro' : 'text-texto-3')} />
                <span className="hidden lg:inline">{rota.nome}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-borda flex flex-col gap-3">
        <div className="hidden lg:block">
          <AlternadorTema />
        </div>
        <div className="lg:hidden flex justify-center">
          <AlternadorTema compacto />
        </div>
      </div>
    </aside>
  );
}
