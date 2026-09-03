'use client';

import React, { useState, useRef } from 'react';
import { FileUp, FileSpreadsheet, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Botao } from '../ui/Botao';
import { Progress } from '../ui/Progress';
import { extrairItensDoArquivo, ResultadoExtracao } from '@/lib/importacao/extratorPlanilha';
import { EstadoVazio } from '../comum/EstadoVazio';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PassoUploadProps {
  projetoId: string;
  aoConcluirProcessamento: (resultado: {
    arquivo: File;
    extracao: ResultadoExtracao;
  }) => void;
}

export function PassoUpload({ projetoId, aoConcluirProcessamento }: PassoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isArrastando, setIsArrastando] = useState(false);
  const [erroMensagem, setErroMensagem] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [progressoPaginas, setProgressoPaginas] = useState<{ atual: number; total: number } | null>(null);
  const [pdfEhImagem, setPdfEhImagem] = useState(false);

  const exibirErroTemporario = (msg: string) => {
    setErroMensagem(msg);
    setTimeout(() => {
      setErroMensagem(null);
    }, 5000);
  };

  const handleArquivo = async (arquivo: File) => {
    if (!arquivo) return;

    const nome = arquivo.name.toLowerCase();
    const formatoValido =
      arquivo.type === 'application/pdf' ||
      nome.endsWith('.pdf') ||
      nome.endsWith('.csv') ||
      nome.endsWith('.txt') ||
      nome.endsWith('.tsv');

    if (!formatoValido) {
      exibirErroTemporario('Formato não suportado. Por favor, envie uma planilha em formato PDF, CSV ou TXT.');
      return;
    }

    if (arquivo.size > 25 * 1024 * 1024) {
      exibirErroTemporario(`O arquivo possui ${(arquivo.size / (1024 * 1024)).toFixed(1)} MB e ultrapassa o limite de 25 MB.`);
      return;
    }

    setProcessando(true);
    setPdfEhImagem(false);
    setProgressoPaginas(null);

    try {
      const extracao = await extrairItensDoArquivo(arquivo, (pagina, total) => {
        setProgressoPaginas({ atual: pagina, total });
      });

      if (extracao.itens.length === 0 && nome.endsWith('.pdf')) {
        setPdfEhImagem(true);
        setProcessando(false);
        return;
      }

      if (extracao.itens.length === 0) {
        exibirErroTemporario('Nenhum item ou linha de dados foi detectado no arquivo.');
        setProcessando(false);
        return;
      }

      aoConcluirProcessamento({
        arquivo,
        extracao,
      });
    } catch (err: any) {
      exibirErroTemporario(err.message || 'Erro ao processar o arquivo.');
    } finally {
      setProcessando(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsArrastando(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleArquivo(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsArrastando(true);
  };

  const handleDragLeave = () => {
    setIsArrastando(false);
  };

  if (pdfEhImagem) {
    return (
      <EstadoVazio
        tipo="pdf-imagem"
        titulo="Documento sem texto detectável"
        descricao="O arquivo não possui texto selecionável para extração automática. Você pode adicionar as tarefas deste projeto diretamente na tela de tarefas."
        acao={
          <Botao
            variante="primario"
            onClick={() => router.push(`/projetos/${projetoId}?aba=tarefas`)}
          >
            Criar tarefas manualmente
          </Botao>
        }
      />
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto py-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-acento-suave text-acento-claro text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Importação Automática Direta</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-texto">
          Envie sua Planilha ou Ordem de Serviço
        </h2>
        <p className="text-sm text-texto-2">
          O sistema detectará e organizará todos os itens da tabela automaticamente como tarefas.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !processando && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-g transition-all duration-200 cursor-pointer min-h-[260px]',
          isArrastando
            ? 'border-acento bg-acento-suave scale-[1.01]'
            : 'border-borda bg-superficie hover:border-borda-forte hover:bg-superficie-2 shadow-1',
          erroMensagem && 'border-perigo bg-perigo-suave/20'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv,.txt,.tsv,application/pdf,text/csv,text/plain"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleArquivo(e.target.files[0]);
            }
          }}
        />

        {processando ? (
          <div className="w-full max-w-xs space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-acento animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-texto">
                {progressoPaginas
                  ? `Lendo página ${progressoPaginas.atual} de ${progressoPaginas.total}`
                  : 'Processando arquivo...'}
              </p>
              <p className="text-xs text-texto-3">Detectando e organizando itens da planilha...</p>
            </div>
            {progressoPaginas && (
              <Progress
                valor={(progressoPaginas.atual / progressoPaginas.total) * 100}
                altura="m"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
                isArrastando
                  ? 'bg-acento text-white'
                  : 'bg-superficie-2 text-texto-2 border border-borda'
              )}
            >
              <FileSpreadsheet className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-texto">
                Arraste seu arquivo PDF ou planilha aqui
              </p>
              <p className="text-xs text-texto-3">ou clique para selecionar do computador</p>
            </div>

            <span className="text-[11px] text-texto-3 numero">
              Suporta PDF (Purchase Orders, Ordens de Serviço), CSV e TXT
            </span>
          </div>
        )}
      </div>

      {erroMensagem && (
        <div className="flex items-center gap-2 p-3 bg-perigo-suave border border-perigo/30 rounded-m text-perigo text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{erroMensagem}</span>
        </div>
      )}
    </div>
  );
}
