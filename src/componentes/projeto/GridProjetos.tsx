'use client';

import React from 'react';
import Link from 'next/link';
import { ProjetoComResumo } from '@/lib/dados/tipos';
import { CardProjeto } from './CardProjeto';
import { BadgeStatus } from './BadgeStatus';
import { PilulaPrazo } from './PilulaPrazo';
import { BarraProgresso } from './BarraProgresso';
import { formatarUSD, calcularMinhaParteCentavos } from '@/lib/dinheiro';
import { formatarDataDiaMes } from '@/lib/datas';
import { EsqueletoGrade, EsqueletoTabela } from '../comum/EsqueletoCard';
import { EstadoVazio } from '../comum/EstadoVazio';
import { Botao } from '../ui/Botao';
import { Plus } from 'lucide-react';

interface GridProjetosProps {
  projetos: ProjetoComResumo[] | undefined;
  carregando: boolean;
  visualizacao: 'grade' | 'tabela';
  temFiltroAtivo: boolean;
  termoBusca?: string;
  aoLimparFiltros: () => void;
  aoCriarProjeto: () => void;
}

export function GridProjetos({
  projetos,
  carregando,
  visualizacao,
  temFiltroAtivo,
  termoBusca,
  aoLimparFiltros,
  aoCriarProjeto,
}: GridProjetosProps) {
  if (carregando) {
    return visualizacao === 'grade' ? <EsqueletoGrade quantidade={6} /> : <EsqueletoTabela linhas={6} />;
  }

  if (!projetos || projetos.length === 0) {
    if (temFiltroAtivo || (termoBusca && termoBusca.trim() !== '')) {
      return (
        <EstadoVazio
          tipo="busca"
          termoBusca={termoBusca}
          acao={
            <Botao variante="secundario" onClick={aoLimparFiltros}>
              Limpar filtros
            </Botao>
          }
        />
      );
    }

    return (
      <EstadoVazio
        tipo="projetos"
        acao={
          <Botao variante="primario" onClick={aoCriarProjeto} iconeEsquerda={<Plus className="w-4 h-4" />}>
            Novo projeto
          </Botao>
        }
      />
    );
  }

  if (visualizacao === 'grade') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {projetos.map((projeto) => (
          <CardProjeto key={projeto.id} projeto={projeto} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-g bg-superficie border border-borda">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-borda bg-superficie-2 text-xs text-texto-2 uppercase font-medium">
            <th className="py-3 px-4">Projeto</th>
            <th className="py-3 px-4">Cliente</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Progresso</th>
            <th className="py-3 px-4 text-right">Valor</th>
            <th className="py-3 px-4 text-right">Prazo / Recebimento</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borda">
          {projetos.map((projeto) => (
            <tr
              key={projeto.id}
              className="hover:bg-superficie-2/70 transition-colors group cursor-pointer"
            >
              <td className="py-3.5 px-4 font-medium text-texto">
                <Link
                  href={`/projetos/${projeto.id}`}
                  className="block group-hover:text-acento-claro transition-colors"
                >
                  {projeto.nome}
                </Link>
              </td>
              <td className="py-3.5 px-4 text-texto-2">
                {projeto.cliente || '—'}
              </td>
              <td className="py-3.5 px-4">
                <BadgeStatus status={projeto.status} tamanho="p" />
              </td>
              <td className="py-3.5 px-4 w-48">
                <BarraProgresso
                  concluidas={projeto.tarefasConcluidas}
                  total={projeto.totalTarefas}
                  progresso={projeto.progresso}
                />
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="font-bold numero text-texto text-sm">
                  {formatarUSD(projeto.valorCentavos)}
                </div>
                <div className="text-[11px] font-semibold numero text-acento-claro">
                  Sua parte ({projeto.porcentagem ?? 45}%): {formatarUSD(calcularMinhaParteCentavos(projeto.valorCentavos, projeto.porcentagem ?? 45))}
                </div>
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-texto-3 numero">
                    {formatarDataDiaMes(projeto.dataFimPrevista)}
                  </span>
                  <PilulaPrazo
                    statusRecebimento={projeto.statusRecebimento}
                    diasAteRecebimento={projeto.diasAteRecebimento}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
