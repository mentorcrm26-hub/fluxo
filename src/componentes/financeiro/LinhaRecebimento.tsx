'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProjetoComResumo } from '@/lib/dados/tipos';
import { formatarUSD, calcularMinhaParteCentavos } from '@/lib/dinheiro';
import { formatarDataCurta, obterHojeISO } from '@/lib/datas';
import { PilulaPrazo } from '../projeto/PilulaPrazo';
import { Botao } from '../ui/Botao';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { useReceberProjeto } from '@/lib/dados/hooks';
import { useToast } from '../ui/Toast';
import { Coins, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinhaRecebimentoProps {
  projeto: ProjetoComResumo;
}

export function LinhaRecebimento({ projeto }: LinhaRecebimentoProps) {
  const { sucesso, erro } = useToast();
  const receberProjeto = useReceberProjeto();

  const [modalAberto, setModalAberto] = useState(false);
  const [dataRecebido, setDataRecebido] = useState(obterHojeISO());

  const isRecebido = projeto.statusRecebimento === 'recebido';

  const handleConfirmarRecebimento = async () => {
    try {
      await receberProjeto.mutateAsync({
        id: projeto.id,
        recebidoEm: dataRecebido,
      });
      sucesso('Recebimento confirmado!');
      setModalAberto(false);
    } catch (err: any) {
      erro('Erro ao registrar recebimento.', err.message || 'Tente novamente.');
    }
  };

  return (
    <>
      <div
        className={cn(
          'group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-m bg-superficie border border-borda gap-3 transition-all duration-120',
          'hover:bg-superficie-2 hover:border-borda-forte'
        )}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/projetos/${projeto.id}`}
              className="text-sm font-semibold text-texto hover:text-acento-claro transition-colors truncate"
            >
              {projeto.nome}
            </Link>
          </div>
          <p className="text-xs text-texto-2 truncate">
            {projeto.cliente || 'Sem cliente vinculado'}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="text-left sm:text-right">
            <span
              className={cn(
                'numero text-sm md:text-base font-bold block',
                isRecebido ? 'text-sucesso' : 'text-texto'
              )}
            >
              {formatarUSD(projeto.valorCentavos)}
            </span>
            <span className="text-[11px] font-semibold text-acento-claro numero block">
              Sua parte ({projeto.porcentagem ?? 45}%): {formatarUSD(calcularMinhaParteCentavos(projeto.valorCentavos, projeto.porcentagem ?? 45))}
            </span>
            <span className="text-[11px] text-texto-3 numero block">
              {isRecebido
                ? `Recebido em ${formatarDataCurta(projeto.recebidoEm)}`
                : `Limite: ${formatarDataCurta(projeto.recebimentoPrevistoPara)}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PilulaPrazo
              statusRecebimento={projeto.statusRecebimento}
              diasAteRecebimento={projeto.diasAteRecebimento}
            />

            {!isRecebido && (
              <Botao
                variante="secundario"
                tamanho="p"
                className="opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setModalAberto(true)}
                iconeEsquerda={<Coins className="w-3.5 h-3.5 text-sucesso" />}
              >
                Receber
              </Botao>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <Dialog
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo="Marcar como Recebido"
        descricao={`Confirmar pagamento de ${formatarUSD(projeto.valorCentavos)} do projeto "${projeto.nome}".`}
        tamanho="p"
        rodape={
          <>
            <Botao
              type="button"
              variante="fantasma"
              onClick={() => setModalAberto(false)}
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
              Confirmar
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
        </div>
      </Dialog>
    </>
  );
}
