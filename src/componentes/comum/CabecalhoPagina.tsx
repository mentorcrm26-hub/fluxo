import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface CabecalhoPaginaProps {
  titulo: string;
  subtitulo?: string;
  linkVoltar?: {
    href: string;
    rotulo?: string;
  };
  acoes?: React.ReactNode;
}

export function CabecalhoPagina({
  titulo,
  subtitulo,
  linkVoltar,
  acoes,
}: CabecalhoPaginaProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-6 border-b border-borda">
      <div className="flex items-start gap-3">
        {linkVoltar && (
          <Link
            href={linkVoltar.href}
            className="mt-1 w-9 h-9 rounded-m border border-borda flex items-center justify-center text-texto-2 hover:text-texto hover:bg-superficie-2 transition-colors flex-shrink-0"
            title={linkVoltar.rotulo || 'Voltar'}
            aria-label={linkVoltar.rotulo || 'Voltar'}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-texto tracking-tight">{titulo}</h1>
          {subtitulo && <p className="text-sm text-texto-2 mt-0.5">{subtitulo}</p>}
        </div>
      </div>

      {acoes && <div className="flex items-center gap-3 self-start md:self-auto">{acoes}</div>}
    </div>
  );
}
