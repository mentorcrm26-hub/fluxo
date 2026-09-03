'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  useProjeto,
  useTarefas,
  useImportacoes,
  useLinhas,
  useFinalizarProjeto,
  useReabrirProjeto,
  useAtualizarProjeto,
  useExcluirImportacao,
} from '@/lib/dados/hooks';
import { BadgeStatus } from '@/componentes/projeto/BadgeStatus';
import { BarraProgresso } from '@/componentes/projeto/BarraProgresso';
import { PilulaPrazo } from '@/componentes/projeto/PilulaPrazo';
import { FormularioProjeto } from '@/componentes/projeto/FormularioProjeto';
import { DialogoExcluirProjeto } from '@/componentes/projeto/DialogoExcluirProjeto';
import { ListaTarefas } from '@/componentes/tarefa/ListaTarefas';
import { ContagemRegressiva } from '@/componentes/financeiro/ContagemRegressiva';
import { Tabs } from '@/componentes/ui/Tabs';
import { Botao } from '@/componentes/ui/Botao';
import { Dialog } from '@/componentes/ui/Dialog';
import { EstadoVazio } from '@/componentes/comum/EstadoVazio';
import { formatarUSD, calcularMinhaParteCentavos } from '@/lib/dinheiro';
import { formatarDataCurta, formatarDataDiaMes } from '@/lib/datas';
import { useToast } from '@/componentes/ui/Toast';
import {
  FileUp,
  CheckCircle2,
  RotateCcw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  Calendar,
  Layers,
  FileSpreadsheet,
  Coins,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';

export default function DetalhesProjetoPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sucesso, erro } = useToast();

  const projetoId = params.id as string;
  const abaAtiva = searchParams.get('aba') || 'tarefas';

  const { data: projeto, isLoading: carregandoProjeto } = useProjeto(projetoId);
  const { data: tarefas = [], isLoading: carregandoTarefas } = useTarefas(projetoId);
  const { data: importacoes = [] } = useImportacoes(projetoId);
  const { data: linhas = [] } = useLinhas(projetoId);

  const finalizarProjeto = useFinalizarProjeto();
  const reabrirProjeto = useReabrirProjeto();
  const atualizarProjeto = useAtualizarProjeto();
  const excluirImportacao = useExcluirImportacao(projetoId);

  // Modais
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [menuAcoesAberto, setMenuAcoesAberto] = useState(false);

  const setAba = (novaAba: string) => {
    router.replace(`/projetos/${projetoId}?aba=${novaAba}`, { scroll: false });
  };

  if (carregandoProjeto) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-superficie-2 rounded-p w-1/3" />
        <div className="h-32 bg-superficie-2 rounded-g w-full" />
        <div className="h-64 bg-superficie-2 rounded-g w-full" />
      </div>
    );
  }

  if (!projeto) {
    return (
      <EstadoVazio
        tipo="projetos"
        titulo="Projeto não encontrado"
        descricao="O projeto solicitado não existe ou foi excluído."
        acao={
          <Botao variante="primario" onClick={() => router.push('/')}>
            Voltar para Início
          </Botao>
        }
      />
    );
  }

  const tarefasPendentes = tarefas.filter((t) => t.status !== 'concluida').length;
  const isFinalizado = projeto.status === 'finalizado';
  const isRecebido = projeto.statusRecebimento === 'recebido';

  const handleFinalizar = async () => {
    if (tarefasPendentes > 0 && !modalFinalizarAberto) {
      setModalFinalizarAberto(true);
      return;
    }

    try {
      await finalizarProjeto.mutateAsync(projeto.id);
      sucesso('Projeto finalizado. Recebimento previsto para 10 dias.');
      setModalFinalizarAberto(false);
    } catch (err: any) {
      erro('Erro ao finalizar projeto.', err.message);
    }
  };

  const handleReabrir = async () => {
    if (isRecebido) {
      erro('Ação não permitida.', 'Este projeto já foi recebido. Desfaça o recebimento antes de reabrir.');
      return;
    }

    try {
      await reabrirProjeto.mutateAsync(projeto.id);
      sucesso('Projeto reaberto com sucesso.');
    } catch (err: any) {
      erro('Erro ao reabrir projeto.', err.message);
    }
  };

  const handleArquivar = async () => {
    const novoStatus = projeto.status === 'arquivado' ? 'em_andamento' : 'arquivado';
    await atualizarProjeto.mutateAsync({
      id: projeto.id,
      dados: { status: novoStatus },
    });
    sucesso(novoStatus === 'arquivado' ? 'Projeto arquivado.' : 'Projeto desarquivado.');
    setMenuAcoesAberto(false);
  };

  const abasConfig = [
    {
      id: 'tarefas',
      rotulo: 'Tarefas',
      contador: tarefas.length,
      icone: <Layers className="w-4 h-4" />,
    },
    {
      id: 'dados',
      rotulo: 'Dados Importados',
      contador: linhas.length,
      icone: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: 'financeiro',
      rotulo: 'Financeiro',
      icone: <Coins className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Botão de Voltar */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-texto-2 hover:text-texto transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Voltar para Projetos</span>
      </Link>

      {/* Cartão de Cabeçalho do Projeto */}
      <div className="rounded-xg bg-superficie border border-borda p-6 md:p-8 space-y-6 shadow-1">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-texto tracking-tight">
                {projeto.nome}
              </h1>
              <BadgeStatus status={projeto.status} />
              <PilulaPrazo
                statusRecebimento={projeto.statusRecebimento}
                diasAteRecebimento={projeto.diasAteRecebimento}
              />
            </div>

            <p className="text-sm text-texto-2">
              {projeto.cliente ? `Cliente: ${projeto.cliente}` : 'Sem cliente vinculado'}
              {projeto.descricao && ` · ${projeto.descricao}`}
            </p>
          </div>

          {/* Valor Monetário e Menu de Ações */}
          <div className="flex items-center gap-4 self-start md:self-auto">
            <div className="text-left md:text-right">
              <span className="text-xs text-texto-3 block">Valor Total</span>
              <span className="numero text-xl md:text-2xl font-bold text-texto">
                {formatarUSD(projeto.valorCentavos)}
              </span>
              <div className="text-xs font-semibold text-acento-claro numero mt-0.5">
                Sua parte ({projeto.porcentagem ?? 45}%): {formatarUSD(calcularMinhaParteCentavos(projeto.valorCentavos, projeto.porcentagem ?? 45))}
              </div>
            </div>

            {/* Menu Dropdown de Ações */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuAcoesAberto(!menuAcoesAberto)}
                className="w-10 h-10 rounded-m border border-borda bg-superficie-2 flex items-center justify-center text-texto-2 hover:text-texto hover:bg-superficie-3 transition-colors"
                title="Mais opções"
                aria-label="Mais opções"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {menuAcoesAberto && (
                <div
                  className="absolute right-0 top-12 z-20 w-48 rounded-m bg-superficie border border-borda shadow-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-120"
                  onClick={() => setMenuAcoesAberto(false)}
                >
                  <button
                    type="button"
                    onClick={() => setModalEditarAberto(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-p text-xs text-texto hover:bg-superficie-2 text-left"
                  >
                    <Pencil className="w-3.5 h-3.5 text-texto-3" />
                    <span>Editar projeto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleArquivar}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-p text-xs text-texto hover:bg-superficie-2 text-left"
                  >
                    <Archive className="w-3.5 h-3.5 text-texto-3" />
                    <span>{projeto.status === 'arquivado' ? 'Desarquivar' : 'Arquivar'}</span>
                  </button>

                  {isFinalizado && (
                    <button
                      type="button"
                      onClick={handleReabrir}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-p text-xs text-texto hover:bg-superficie-2 text-left"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-alerta" />
                      <span>Reabrir projeto</span>
                    </button>
                  )}

                  <div className="h-px bg-borda my-1" />

                  <button
                    type="button"
                    onClick={() => setModalExcluirAberto(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-p text-xs text-perigo hover:bg-perigo-suave text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir projeto</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Progresso e Prazos */}
        <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <BarraProgresso
              concluidas={projeto.tarefasConcluidas}
              total={projeto.totalTarefas}
              progresso={projeto.progresso}
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-texto-3 numero justify-start md:justify-end">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Início: {formatarDataCurta(projeto.dataInicio)}</span>
            </div>
            <span>·</span>
            <div>
              <span>Previsão: {formatarDataCurta(projeto.dataFimPrevista)}</span>
            </div>
          </div>
        </div>

        {/* Ações Principais do Cabeçalho */}
        <div className="pt-4 border-t border-borda flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/projetos/${projeto.id}/importar`}>
              <Botao variante="secundario" iconeEsquerda={<FileUp className="w-4 h-4 text-acento-claro" />}>
                Importar Planilha PDF
              </Botao>
            </Link>
          </div>

          <div>
            {!isFinalizado ? (
              <Botao
                variante="primario"
                onClick={handleFinalizar}
                iconeEsquerda={<CheckCircle2 className="w-4 h-4" />}
              >
                Finalizar Projeto
              </Botao>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-texto-2">Projeto finalizado</span>
                <Botao
                  variante="secundario"
                  tamanho="p"
                  onClick={handleReabrir}
                  iconeEsquerda={<RotateCcw className="w-3.5 h-3.5 text-texto-3" />}
                >
                  Reabrir
                </Botao>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <Tabs abas={abasConfig} abaAtiva={abaAtiva} aoMudarAba={setAba} />

      {/* Conteúdo da Aba Ativa */}
      {abaAtiva === 'tarefas' && (
        <ListaTarefas
          projetoId={projeto.id}
          tarefas={tarefas}
          carregando={carregandoTarefas}
        />
      )}

      {abaAtiva === 'dados' && (
        <div className="space-y-4">
          {linhas.length === 0 ? (
            <EstadoVazio
              tipo="tarefas"
              titulo="Nenhuma planilha importada ainda"
              descricao="Importe uma planilha em PDF para visualizar as colunas e dados brutos extraídos."
              acao={
                <Link href={`/projetos/${projeto.id}/importar`}>
                  <Botao variante="primario" iconeEsquerda={<FileUp className="w-4 h-4" />}>
                    Importar planilha PDF
                  </Botao>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-texto-2 numero">
                  {linhas.length} linhas de dados importadas
                </span>
                {importacoes.length > 0 && (
                  <Botao
                    variante="fantasma"
                    tamanho="p"
                    onClick={async () => {
                      await excluirImportacao.mutateAsync(importacoes[0].id);
                      sucesso('Histórico de importação descartado.');
                    }}
                    iconeEsquerda={<Trash2 className="w-3.5 h-3.5 text-perigo" />}
                  >
                    Descartar dados importados
                  </Botao>
                )}
              </div>

              {/* Tabela de Dados Importados */}
              <div className="overflow-x-auto rounded-g bg-superficie border border-borda max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead className="sticky top-0 z-10 bg-superficie-2 border-b border-borda text-xs uppercase font-semibold text-texto">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center text-texto-3 numero">#</th>
                      {Object.keys(linhas[0]?.dados || {}).map((coluna) => (
                        <th key={coluna} className="py-3 px-4 whitespace-nowrap">
                          {coluna}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borda">
                    {linhas.map((linha, idx) => (
                      <tr
                        key={linha.id}
                        className="h-11 hover:bg-superficie-2/50 transition-colors odd:bg-superficie even:bg-superficie-2/20"
                      >
                        <td className="py-2.5 px-4 text-center text-texto-3 numero">
                          {linha.numeroLinha || idx + 1}
                        </td>
                        {Object.keys(linhas[0]?.dados || {}).map((coluna) => (
                          <td key={coluna} className="py-2.5 px-4 whitespace-nowrap max-w-sm truncate text-texto">
                            {linha.dados[coluna] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {abaAtiva === 'financeiro' && (
        <div className="space-y-6">
          <ContagemRegressiva projeto={projeto} />
        </div>
      )}

      {/* Diálogo de Confirmação para Finalizar com Tarefas Abertas */}
      <Dialog
        aberto={modalFinalizarAberto}
        aoFechar={() => setModalFinalizarAberto(false)}
        titulo="Finalizar Projeto"
        tamanho="p"
        rodape={
          <>
            <Botao
              variante="fantasma"
              onClick={() => setModalFinalizarAberto(false)}
              disabled={finalizarProjeto.isPending}
            >
              Cancelar
            </Botao>
            <Botao
              variante="primario"
              carregando={finalizarProjeto.isPending}
              onClick={handleFinalizar}
            >
              Finalizar Mesmo Assim
            </Botao>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-m bg-alerta-suave border border-alerta/20 text-alerta text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              <strong>{tarefasPendentes}</strong> tarefas continuam em aberto. Finalizar mesmo assim?
            </p>
          </div>
          <p className="text-xs text-texto-2">
            A contagem de 10 dias para recebimento será iniciada imediatamente após a confirmação.
          </p>
        </div>
      </Dialog>

      {/* Modal de Edição de Projeto */}
      <FormularioProjeto
        aberto={modalEditarAberto}
        aoFechar={() => setModalEditarAberto(false)}
        projetoParaEditar={projeto}
      />

      {/* Diálogo de Exclusão de Projeto */}
      <DialogoExcluirProjeto
        aberto={modalExcluirAberto}
        aoFechar={() => setModalExcluirAberto(false)}
        projeto={projeto}
        aoExcluirSucesso={() => router.push('/')}
      />
    </div>
  );
}
