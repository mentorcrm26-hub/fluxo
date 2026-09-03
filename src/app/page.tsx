'use client';

import React, { useState, useEffect } from 'react';
import { useProjetos, useResumoFinanceiro } from '@/lib/dados/hooks';
import { ResumoFinanceiro } from '@/componentes/financeiro/ResumoFinanceiro';
import { GridProjetos } from '@/componentes/projeto/GridProjetos';
import { FormularioProjeto } from '@/componentes/projeto/FormularioProjeto';
import { Input } from '@/componentes/ui/Input';
import { Select } from '@/componentes/ui/Select';
import { formatarDataExtenso, obterSaudacao } from '@/lib/datas';
import { StatusProjeto } from '@/lib/dados/tipos';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';
import { Botao } from '@/componentes/ui/Botao';

export default function PaginaInicial() {
  const [busca, setBusca] = useState('');
  const [termoDebounced, setTermoDebounced] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusProjeto | 'todos'>('todos');
  const [ordem, setOrdem] = useState<'recentes' | 'prazo' | 'valor' | 'progresso'>('recentes');
  const [visualizacao, setVisualizacao] = useState<'grade' | 'tabela'>('grade');
  const [modalNovoProjetoAberto, setModalNovoProjetoAberto] = useState(false);

  // Debounce de busca de 250ms conforme PRD
  useEffect(() => {
    const timer = setTimeout(() => {
      setTermoDebounced(busca);
    }, 250);
    return () => clearTimeout(timer);
  }, [busca]);

  const { data: resumo, isLoading: carregandoResumo } = useResumoFinanceiro();
  const { data: projetos, isLoading: carregandoProjetos } = useProjetos({
    status: statusFiltro,
    busca: termoDebounced,
    ordem,
  });

  const saudacao = obterSaudacao();
  const dataHojeExtenso = formatarDataExtenso(new Date());

  const opcoesOrdem = [
    { valor: 'recentes', rotulo: 'Mais recentes' },
    { valor: 'prazo', rotulo: 'Prazo mais próximo' },
    { valor: 'valor', rotulo: 'Maior valor' },
    { valor: 'progresso', rotulo: 'Maior progresso' },
  ];

  const filtrosStatusList: { id: StatusProjeto | 'todos'; rotulo: string }[] = [
    { id: 'todos', rotulo: 'Todos' },
    { id: 'em_andamento', rotulo: 'Em andamento' },
    { id: 'finalizado', rotulo: 'Finalizados' },
    { id: 'planejado', rotulo: 'Planejados' },
    { id: 'arquivado', rotulo: 'Arquivados' },
  ];

  const handleLimparFiltros = () => {
    setBusca('');
    setTermoDebounced('');
    setStatusFiltro('todos');
    setOrdem('recentes');
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Home com Saudação e Busca Rápida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-texto tracking-tight capitalize">
            {saudacao}
          </h1>
          <p className="text-xs md:text-sm text-texto-2 capitalize mt-0.5">
            {dataHojeExtenso}
          </p>
        </div>

        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar projeto ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            iconeEsquerda={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Bloco de Resumo Financeiro Dominante */}
      <ResumoFinanceiro dados={resumo} carregando={carregandoResumo} />

      {/* Seção de Projetos */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borda">
          {/* Filtros de Status (Abas horizontais) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {filtrosStatusList.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFiltro(f.id)}
                className={`px-3 py-1.5 rounded-p text-xs font-medium transition-all whitespace-nowrap ${
                  statusFiltro === f.id
                    ? 'bg-acento text-white shadow-1'
                    : 'bg-superficie-2 text-texto-2 hover:text-texto hover:bg-superficie-3 border border-borda'
                }`}
              >
                {f.rotulo}
              </button>
            ))}
          </div>

          {/* Ordenação e Alternador de Visualização */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="w-44">
              <Select
                opcoes={opcoesOrdem}
                value={ordem}
                onChange={(e) => setOrdem(e.target.value as any)}
              />
            </div>

            <div className="flex items-center bg-superficie-2 border border-borda rounded-m p-0.5">
              <button
                type="button"
                onClick={() => setVisualizacao('grade')}
                className={`p-1.5 rounded-p transition-colors ${
                  visualizacao === 'grade'
                    ? 'bg-acento text-white'
                    : 'text-texto-3 hover:text-texto'
                }`}
                title="Visualização em Grade"
                aria-label="Visualização em Grade"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setVisualizacao('tabela')}
                className={`p-1.5 rounded-p transition-colors ${
                  visualizacao === 'tabela'
                    ? 'bg-acento text-white'
                    : 'text-texto-3 hover:text-texto'
                }`}
                title="Visualização em Tabela"
                aria-label="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grade de Projetos */}
        <GridProjetos
          projetos={projetos}
          carregando={carregandoProjetos}
          visualizacao={visualizacao}
          temFiltroAtivo={statusFiltro !== 'todos'}
          termoBusca={termoDebounced}
          aoLimparFiltros={handleLimparFiltros}
          aoCriarProjeto={() => setModalNovoProjetoAberto(true)}
        />
      </div>

      {/* Modal de Criação de Projetos */}
      <FormularioProjeto
        aberto={modalNovoProjetoAberto}
        aoFechar={() => setModalNovoProjetoAberto(false)}
      />
    </div>
  );
}
