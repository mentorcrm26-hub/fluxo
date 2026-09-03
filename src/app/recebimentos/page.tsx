'use client';

import React, { useMemo } from 'react';
import { useRecebimentos, useResumoFinanceiro } from '@/lib/dados/hooks';
import { ResumoFinanceiro } from '@/componentes/financeiro/ResumoFinanceiro';
import { LinhaRecebimento } from '@/componentes/financeiro/LinhaRecebimento';
import { EstadoVazio } from '@/componentes/comum/EstadoVazio';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function RecebimentosPage() {
  const { data: recebimentos = [], isLoading: carregandoRecebimentos } = useRecebimentos();
  const { data: resumo, isLoading: carregandoResumo } = useResumoFinanceiro();

  const mesAtualNome = format(new Date(), 'MMMM', { locale: ptBR });

  // Agrupamento
  const grupos = useMemo(() => {
    const atrasados = recebimentos.filter(
      (p) => p.statusRecebimento === 'atrasado'
    );

    const venceEstaSemana = recebimentos.filter(
      (p) =>
        p.statusRecebimento === 'a_receber' &&
        p.diasAteRecebimento !== null &&
        p.diasAteRecebimento >= 0 &&
        p.diasAteRecebimento <= 7
    );

    const proximos = recebimentos.filter(
      (p) =>
        p.statusRecebimento === 'a_receber' &&
        p.diasAteRecebimento !== null &&
        p.diasAteRecebimento > 7
    );

    const liquidados = recebimentos.filter(
      (p) => p.statusRecebimento === 'recebido'
    );

    return {
      atrasados,
      venceEstaSemana,
      proximos,
      liquidados,
    };
  }, [recebimentos]);

  const temItens = recebimentos.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-texto tracking-tight">
          Painel de Recebimentos
        </h1>
        <p className="text-sm text-texto-2 mt-0.5">
          Acompanhamento dos prazos de liquidação financeira e projetos finalizados.
        </p>
      </div>

      {/* Resumo Financeiro */}
      <ResumoFinanceiro dados={resumo} carregando={carregandoResumo} />

      {/* Grupos de Recebimento */}
      {carregandoRecebimentos ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-superficie-2 rounded-p w-40" />
          <div className="h-16 bg-superficie-2 rounded-m w-full" />
          <div className="h-16 bg-superficie-2 rounded-m w-full" />
        </div>
      ) : !temItens ? (
        <EstadoVazio tipo="recebimentos" />
      ) : (
        <div className="space-y-8">
          {/* Grupo 1: Atrasado */}
          {grupos.atrasados.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-perigo uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Atrasado ({grupos.atrasados.length})</span>
              </div>
              <div className="space-y-2">
                {grupos.atrasados.map((p) => (
                  <LinhaRecebimento key={p.id} projeto={p} />
                ))}
              </div>
            </div>
          )}

          {/* Grupo 2: Vence esta semana */}
          {grupos.venceEstaSemana.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-alerta uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Vence esta semana ({grupos.venceEstaSemana.length})</span>
              </div>
              <div className="space-y-2">
                {grupos.venceEstaSemana.map((p) => (
                  <LinhaRecebimento key={p.id} projeto={p} />
                ))}
              </div>
            </div>
          )}

          {/* Grupo 3: Próximos */}
          {grupos.proximos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-texto-2 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-acento-claro" />
                <span>Próximos Vencimentos ({grupos.proximos.length})</span>
              </div>
              <div className="space-y-2">
                {grupos.proximos.map((p) => (
                  <LinhaRecebimento key={p.id} projeto={p} />
                ))}
              </div>
            </div>
          )}

          {/* Grupo 4: Recebidos no Mês */}
          {grupos.liquidados.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-sucesso uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recebidos ({grupos.liquidados.length})</span>
              </div>
              <div className="space-y-2">
                {grupos.liquidados.map((p) => (
                  <LinhaRecebimento key={p.id} projeto={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
