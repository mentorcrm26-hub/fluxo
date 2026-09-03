'use client';

import React, { useState, useMemo } from 'react';
import { Tarefa } from '@/lib/dados/tipos';
import { ItemTarefa } from './ItemTarefa';
import { FormularioTarefa } from './FormularioTarefa';
import { Input } from '../ui/Input';
import { Botao } from '../ui/Botao';
import { EstadoVazio } from '../comum/EstadoVazio';
import { useConcluirTarefas } from '@/lib/dados/hooks';
import { useToast } from '../ui/Toast';
import { Search, Plus, CheckSquare, Square, CheckCheck, ListFilter } from 'lucide-react';

interface ListaTarefasProps {
  projetoId: string;
  tarefas: Tarefa[];
  carregando?: boolean;
}

export function ListaTarefas({ projetoId, tarefas, carregando }: ListaTarefasProps) {
  const { sucesso } = useToast();
  const concluirEmLote = useConcluirTarefas(projetoId);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'a_fazer' | 'concluida'>('todas');
  const [modalNovaTarefa, setModalNovaTarefa] = useState(false);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  // Filtra as tarefas
  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t) => {
      // Filtro de busca
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const noTitulo = t.titulo.toLowerCase().includes(termo);
        const nasObs = t.observacoes ? t.observacoes.toLowerCase().includes(termo) : false;
        if (!noTitulo && !nasObs) return false;
      }

      // Filtro de status
      if (filtroStatus === 'a_fazer') return t.status !== 'concluida';
      if (filtroStatus === 'concluida') return t.status === 'concluida';
      return true;
    });
  }, [tarefas, busca, filtroStatus]);

  const concluidasQtd = tarefas.filter((t) => t.status === 'concluida').length;
  const totalQtd = tarefas.length;

  const handleAlternarSelecao = (id: string) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelecionarTodas = () => {
    if (selecionados.length === tarefasFiltradas.length) {
      setSelecionados([]);
    } else {
      setSelecionados(tarefasFiltradas.map((t) => t.id));
    }
  };

  const handleConcluirSelecionadas = async () => {
    if (selecionados.length === 0) return;
    await concluirEmLote.mutateAsync(selecionados);
    sucesso(`${selecionados.length} tarefas marcadas como concluídas.`);
    setSelecionados([]);
    setModoSelecao(false);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Controles e Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-borda">
        {/* Busca e Filtro de Status */}
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Buscar tarefas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              iconeEsquerda={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-1 bg-superficie-2 border border-borda p-1 rounded-m">
            <button
              type="button"
              onClick={() => setFiltroStatus('todas')}
              className={`px-2.5 py-1 rounded-p text-xs font-medium transition-colors ${
                filtroStatus === 'todas'
                  ? 'bg-acento text-white'
                  : 'text-texto-2 hover:text-texto'
              }`}
            >
              Todas ({totalQtd})
            </button>
            <button
              type="button"
              onClick={() => setFiltroStatus('a_fazer')}
              className={`px-2.5 py-1 rounded-p text-xs font-medium transition-colors ${
                filtroStatus === 'a_fazer'
                  ? 'bg-acento text-white'
                  : 'text-texto-2 hover:text-texto'
              }`}
            >
              A fazer ({totalQtd - concluidasQtd})
            </button>
            <button
              type="button"
              onClick={() => setFiltroStatus('concluida')}
              className={`px-2.5 py-1 rounded-p text-xs font-medium transition-colors ${
                filtroStatus === 'concluida'
                  ? 'bg-acento text-white'
                  : 'text-texto-2 hover:text-texto'
              }`}
            >
              Concluídas ({concluidasQtd})
            </button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {tarefas.length > 0 && (
            <Botao
              variante="secundario"
              tamanho="m"
              onClick={() => {
                setModoSelecao(!modoSelecao);
                setSelecionados([]);
              }}
            >
              {modoSelecao ? 'Cancelar seleção' : 'Selecionar em lote'}
            </Botao>
          )}

          <Botao
            variante="primario"
            tamanho="m"
            iconeEsquerda={<Plus className="w-4 h-4" />}
            onClick={() => setModalNovaTarefa(true)}
          >
            Nova Tarefa
          </Botao>
        </div>
      </div>

      {/* Barra de Ações em Lote */}
      {modoSelecao && (
        <div className="p-3 bg-superficie-2 border border-acento/30 rounded-m flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-120">
          <div className="flex items-center gap-3">
            <Botao
              variante="fantasma"
              tamanho="p"
              onClick={handleSelecionarTodas}
              iconeEsquerda={
                selecionados.length === tarefasFiltradas.length ? (
                  <CheckSquare className="w-4 h-4 text-acento" />
                ) : (
                  <Square className="w-4 h-4" />
                )
              }
            >
              {selecionados.length === tarefasFiltradas.length ? 'Desmarcar todas' : 'Selecionar todas'}
            </Botao>
            <span className="text-xs text-texto-2 numero">
              {selecionados.length} selecionada(s)
            </span>
          </div>

          {selecionados.length > 0 && (
            <Botao
              variante="sucesso"
              tamanho="p"
              onClick={handleConcluirSelecionadas}
              carregando={concluirEmLote.isPending}
              iconeEsquerda={<CheckCheck className="w-4 h-4" />}
            >
              Concluir selecionadas
            </Botao>
          )}
        </div>
      )}

      {/* Lista de Tarefas */}
      {tarefasFiltradas.length === 0 ? (
        <EstadoVazio
          tipo={tarefas.length === 0 ? 'tarefas' : 'busca'}
          termoBusca={busca}
          acao={
            tarefas.length === 0 ? (
              <Botao
                variante="primario"
                onClick={() => setModalNovaTarefa(true)}
                iconeEsquerda={<Plus className="w-4 h-4" />}
              >
                Criar primeira tarefa
              </Botao>
            ) : (
              <Botao
                variante="secundario"
                onClick={() => {
                  setBusca('');
                  setFiltroStatus('todas');
                }}
              >
                Limpar filtros
              </Botao>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {tarefasFiltradas.map((tarefa) => (
            <ItemTarefa
              key={tarefa.id}
              tarefa={tarefa}
              selecionada={selecionados.includes(tarefa.id)}
              emModoSelecao={modoSelecao}
              aoAlternarSelecao={handleAlternarSelecao}
            />
          ))}
        </div>
      )}

      {/* Modal de Criação Manual */}
      <FormularioTarefa
        aberto={modalNovaTarefa}
        aoFechar={() => setModalNovaTarefa(false)}
        projetoId={projetoId}
      />
    </div>
  );
}
