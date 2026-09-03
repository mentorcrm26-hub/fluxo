'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjeto } from '@/lib/dados/hooks';
import { Assistente } from '@/componentes/importacao/Assistente';
import { ChevronLeft } from 'lucide-react';
import { EstadoVazio } from '@/componentes/comum/EstadoVazio';
import { Botao } from '@/componentes/ui/Botao';

export default function ImportarPlanilhaPage() {
  const params = useParams();
  const router = useRouter();
  const projetoId = params.id as string;

  const { data: projeto, isLoading } = useProjeto(projetoId);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-superficie-2 rounded-p w-32" />
        <div className="h-10 bg-superficie-2 rounded-m w-1/2" />
        <div className="h-64 bg-superficie-2 rounded-g w-full" />
      </div>
    );
  }

  if (!projeto) {
    return (
      <EstadoVazio
        tipo="projetos"
        titulo="Projeto não encontrado"
        descricao="O projeto para importação não existe."
        acao={
          <Botao variante="primario" onClick={() => router.push('/')}>
            Voltar para Início
          </Botao>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Botão de Voltar */}
      <Link
        href={`/projetos/${projeto.id}`}
        className="inline-flex items-center gap-1 text-xs text-texto-2 hover:text-texto transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Cancelar e voltar para {projeto.nome}</span>
      </Link>

      <div className="border-b border-borda pb-4">
        <h1 className="text-2xl font-bold text-texto tracking-tight">
          Importar Itens da Planilha / PDF
        </h1>
        <p className="text-xs text-texto-2 mt-1">
          Projeto: <strong className="text-texto">{projeto.nome}</strong>
          {projeto.cliente && ` · Cliente: ${projeto.cliente}`}
        </p>
      </div>

      <Assistente projetoId={projeto.id} />
    </div>
  );
}
