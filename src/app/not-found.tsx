import React from 'react';
import Link from 'next/link';
import { Botao } from '@/componentes/ui/Botao';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-superficie-2 border border-borda flex items-center justify-center text-texto-3">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-texto">Página não encontrada</h1>
      <p className="text-sm text-texto-2 max-w-sm">
        O endereço que você tentou acessar não existe ou foi removido.
      </p>
      <Link href="/">
        <Botao variante="primario" iconeEsquerda={<ArrowLeft className="w-4 h-4" />}>
          Voltar ao Início
        </Botao>
      </Link>
    </div>
  );
}
