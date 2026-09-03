'use client';

import React, { useState } from 'react';
import { ProjetoComResumo } from '@/lib/dados/tipos';
import { formatarUSD, calcularMinhaParteCentavos } from '@/lib/dinheiro';
import { formatarDataCurta, formatarDataHora, obterHojeISO } from '@/lib/datas';
import { nivelUrgencia } from '@/lib/prazo';
import { Botao } from '../ui/Botao';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { useReceberProjeto } from '@/lib/dados/hooks';
import { useToast } from '../ui/Toast';
import { Clock, CheckCircle2, AlertTriangle, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContagemRegressivaProps {
  projeto: ProjetoComResumo;
}

export function ContagemRegressiva({ projeto }: ContagemRegressivaProps) {
  const { sucesso, erro } = useToast();
  const receberProjeto = useReceberProjeto();

  const [modalReceberAberto, setModalReceberAberto] = useState(false);
  const [dataRecebido, setDataRecebido] = useState(obterHojeISO());

  const dias = projeto.diasAteRecebimento;
  const isRecebido = projeto.statusRecebimento === 'recebido';
  const isPendente = projeto.statusRecebimento === 'pendente';
  const urgencia = nivelUrgencia(dias);

  const handleConfirmarRecebimento = async () => {
    try {
      await receberProjeto.mutateAsync({
        id: projeto.id,
        recebidoEm: dataRecebido,
      });
      sucesso('Recebimento confirmado com sucesso!');
      setModalReceberAberto(false);
    } catch (err: any) {
      erro('Erro ao registrar recebimento.', err.message || 'Tente novamente.');
    }
  };

  if (isPendente) {
    return (
      <div className="rounded-g bg-superficie border border-borda p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-base font-semibold text-texto">Regra Financeira dos 10 Dias</h4>
          <p className="text-xs text-texto-2">
            Ao finalizar este projeto, a contagem regressiva de 10 dias corridos para recebimento do
            valor de <strong>{formatarUSD(projeto.valorCentavos)}</strong> será iniciada automaticamente.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-texto-3 bg-superficie-2 px-3 py-1.5 rounded-m border border-borda">
          <Clock className="w-4 h-4" />
          <span>Aguardando finalização</span>
        </div>
      </div>
    );
  }

  if (isRecebido) {
    return (
      <div className="rounded-g bg-sucesso-suave/30 border border-sucesso/30 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sucesso-suave border border-sucesso/30 flex items-center justify-center text-sucesso flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-sucesso">Pagamento Recebido</h4>
              <span className="numero text-sm text-texto-2 font-medium">
                ({formatarDataCurta(projeto.recebidoEm)})
              </span>
            </div>
            <p className="text-xs text-texto-2 mt-0.5">
              Valor liquidado de <strong className="numero text-texto">{formatarUSD(projeto.valorRecebidoCentavos || projeto.valorCentavos)}</strong>.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="numero text-2xl font-extrabold text-sucesso">
            {formatarUSD(projeto.valorRecebidoCentavos || projeto.valorCentavos)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'rounded-g p-6 md:p-8 border shadow-1 transition-all',
          urgencia === 'critico' && 'bg-perigo-suave/30 border-perigo/40',
          urgencia === 'alerta' && 'bg-alerta-suave/30 border-alerta/40',
          urgencia === 'neutro' && 'bg-superficie border-borda'
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Lado Esquerdo: Contagem e Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {urgencia === 'critico' ? (
                <AlertTriangle className="w-5 h-5 text-perigo" />
              ) : (
                <Clock className={cn('w-5 h-5', urgencia === 'alerta' ? 'text-alerta' : 'text-acento-claro')} />
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-texto-2">
                Prazo de Recebimento (10 dias corridos)
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span
                className={cn(
                  'numero text-4xl md:text-5xl font-extrabold tracking-tight',
                  urgencia === 'critico' && 'text-perigo',
                  urgencia === 'alerta' && 'text-alerta',
                  urgencia === 'neutro' && 'text-texto'
                )}
              >
                {dias !== null && dias < 0 ? (
                  `Atrasado ${Math.abs(dias)}d`
                ) : dias === 0 ? (
                  'Vence Hoje'
                ) : (
                  `${dias} ${dias === 1 ? 'dia restante' : 'dias restantes'}`
                )}
              </span>
            </div>

            <div className="text-xs text-texto-2 space-y-0.5">
              <p>
                Projeto finalizado em <strong>{formatarDataHora(projeto.concluidoEm)}</strong>.
              </p>
              <p>
                Data limite para recebimento:{' '}
                <strong className="text-texto numero font-semibold">
                  {formatarDataCurta(projeto.recebimentoPrevistoPara)}
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Lado Direito: Ação de Marcar como Recebido */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3">
            <div className="text-left md:text-right">
              <span className="text-xs text-texto-3 block">Valor a Receber</span>
              <span className="numero text-xl md:text-2xl font-bold text-texto">
                {formatarUSD(projeto.valorCentavos)}
              </span>
              <div className="text-xs font-semibold text-acento-claro numero">
                Sua parte ({projeto.porcentagem ?? 45}%): {formatarUSD(calcularMinhaParteCentavos(projeto.valorCentavos, projeto.porcentagem ?? 45))}
              </div>
            </div>

            <Botao
              variante="sucesso"
              iconeEsquerda={<Coins className="w-4 h-4" />}
              onClick={() => setModalReceberAberto(true)}
              className="w-full sm:w-auto"
            >
              Marcar como Recebido
            </Botao>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Recebimento */}
      <Dialog
        aberto={modalReceberAberto}
        aoFechar={() => setModalReceberAberto(false)}
        titulo="Confirmar Recebimento"
        descricao={`Confirme a entrada do valor de ${formatarUSD(projeto.valorCentavos)} na sua conta.`}
        tamanho="p"
        rodape={
          <>
            <Botao
              type="button"
              variante="fantasma"
              onClick={() => setModalReceberAberto(false)}
              disabled={receberProjeto.isPending}
            >
              Cancelar
            </Botao>
            <Botao
              type="button"
              variante="sucesso"
              carregando={receberProjeto.isPending}
              onClick={handleConfirmarRecebimento}
            >
              Confirmar Recebimento
            </Botao>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            rotulo="Data de Recebimento"
            type="date"
            value={dataRecebido}
            onChange={(e) => setDataRecebido(e.target.value)}
          />
          <p className="text-xs text-texto-3">
            O valor de <strong>{formatarUSD(projeto.valorCentavos)}</strong> será contabilizado no mês selecionado.
          </p>
        </div>
      </Dialog>
    </>
  );
}
