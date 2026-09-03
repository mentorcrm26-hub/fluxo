'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultadoExtracao, ItemExtraido } from '@/lib/importacao/extratorPlanilha';
import { IndicadorPassos } from './IndicadorPassos';
import { PassoUpload } from './PassoUpload';
import { PassoRevisaoItens } from './PassoRevisaoItens';
import { useCriarImportacao } from '@/lib/dados/hooks';
import { useToast } from '../ui/Toast';

interface AssistenteProps {
  projetoId: string;
}

export function Assistente({ projetoId }: AssistenteProps) {
  const router = useRouter();
  const { sucesso, erro } = useToast();
  const criarImportacao = useCriarImportacao(projetoId);

  const [passoAtual, setPassoAtual] = useState(1);
  const [passoMaximo, setPassoMaximo] = useState(1);

  // Estado da importação
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [itens, setItens] = useState<ItemExtraido[]>([]);
  const [extracaoCompleta, setExtracaoCompleta] = useState<ResultadoExtracao | null>(null);

  const handleConcluirUpload = (resultado: {
    arquivo: File;
    extracao: ResultadoExtracao;
  }) => {
    setArquivo(resultado.arquivo);
    setItens(resultado.extracao.itens);
    setExtracaoCompleta(resultado.extracao);
    setPassoAtual(2);
    setPassoMaximo(2);
  };

  const handleAlternarItem = (id: string) => {
    setItens((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selecionado: !item.selecionado } : item
      )
    );
  };

  const handleEditarTitulo = (id: string, novoTitulo: string) => {
    setItens((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, titulo: novoTitulo } : item
      )
    );
  };

  const handleAlternarTodos = () => {
    const todosMarcados = itens.every((i) => i.selecionado);
    setItens((prev) =>
      prev.map((item) => ({ ...item, selecionado: !todosMarcados }))
    );
  };

  const handleFinalizarImportacao = async () => {
    if (!arquivo || itens.length === 0) return;

    const itensSelecionados = itens.filter((i) => i.selecionado);
    if (itensSelecionados.length === 0) {
      erro('Nenhum item selecionado', 'Por favor, selecione ao menos um item para importar.');
      return;
    }

    try {
      // Monta as linhas formatadas para o repositório
      const linhasFormatadas: Record<string, string>[] = itensSelecionados.map((item) => {
        const obj: Record<string, string> = {
          'Descrição': item.titulo,
        };
        if (item.tituloTraduzido) {
          obj['Tradução'] = item.tituloTraduzido;
        }
        if (item.observacoes) {
          obj['Observações'] = item.observacoes;
        }
        if (item.quantidade) {
          obj['Quantidade'] = item.quantidade;
        }
        if (item.valorCentavos) {
          obj['Valor'] = String(item.valorCentavos);
        }
        return obj;
      });

      const colunasDetectadas = [
        {
          indice: 0,
          nome: 'Descrição',
          xInicio: 0,
          xFim: 500,
          confianca: 1,
          amostras: itensSelecionados.slice(0, 3).map((i) => i.titulo),
        },
        {
          indice: 1,
          nome: 'Observações',
          xInicio: 501,
          xFim: 1000,
          confianca: 1,
          amostras: itensSelecionados.slice(0, 3).map((i) => i.observacoes || ''),
        },
      ];

      const res = await criarImportacao.mutateAsync({
        nomeArquivo: arquivo.name,
        tamanhoBytes: arquivo.size,
        totalPaginas: extracaoCompleta?.totalPaginas || 1,
        colunasDetectadas,
        colunasEscolhidas: [0, 1],
        mapeamento: {
          titulo: 0,
          prazo: null,
          observacoes: 1,
        },
        linhaCabecalho: 0,
        linhas: linhasFormatadas,
      });

      sucesso(
        'Importação concluída com sucesso!',
        `${res.tarefasCriadas} tarefas foram criadas e adicionadas ao projeto.`
      );
      router.push(`/projetos/${projetoId}?aba=tarefas`);
    } catch (err: any) {
      erro('Erro ao importar itens.', err.message || 'Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <IndicadorPassos
        passoAtual={passoAtual}
        passoMaximoAlcancado={passoMaximo}
        aoMudarPasso={(p) => setPassoAtual(p)}
      />

      {passoAtual === 1 && (
        <PassoUpload
          projetoId={projetoId}
          aoConcluirProcessamento={handleConcluirUpload}
        />
      )}

      {passoAtual === 2 && (
        <PassoRevisaoItens
          nomeArquivo={arquivo?.name || 'documento.pdf'}
          itens={itens}
          importando={criarImportacao.isPending}
          aoAlternarItem={handleAlternarItem}
          aoEditarTitulo={handleEditarTitulo}
          aoAlternarTodos={handleAlternarTodos}
          aoConfirmarImportacao={handleFinalizarImportacao}
          aoVoltar={() => setPassoAtual(1)}
        />
      )}
    </div>
  );
}
