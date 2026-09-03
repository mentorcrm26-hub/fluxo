import React from 'react';
import { FolderKanban, FileSpreadsheet, SearchX, Coins, FileWarning } from 'lucide-react';

interface EstadoVazioProps {
  tipo?: 'projetos' | 'tarefas' | 'busca' | 'recebimentos' | 'pdf-imagem' | 'generico';
  titulo?: string;
  descricao?: string;
  termoBusca?: string;
  acao?: React.ReactNode;
}

export function EstadoVazio({
  tipo = 'generico',
  titulo,
  descricao,
  termoBusca,
  acao,
}: EstadoVazioProps) {
  let icone = <FolderKanban className="w-10 h-10 text-texto-3" />;
  let tituloPadrao = 'Nenhum item encontrado';
  let descPadrao = 'Nenhum dado disponível no momento.';

  if (tipo === 'projetos') {
    icone = <FolderKanban className="w-12 h-12 text-acento" />;
    tituloPadrao = 'Nenhum projeto ainda';
    descPadrao = 'Crie o primeiro projeto para começar a organizar prazos e recebimentos.';
  } else if (tipo === 'tarefas') {
    icone = <FileSpreadsheet className="w-12 h-12 text-acento" />;
    tituloPadrao = 'Este projeto está vazio';
    descPadrao = 'Importe uma planilha em PDF ou adicione tarefas manualmente.';
  } else if (tipo === 'busca') {
    icone = <SearchX className="w-12 h-12 text-texto-3" />;
    tituloPadrao = termoBusca ? `Nada encontrado para "${termoBusca}"` : 'Nenhum resultado encontrado';
    descPadrao = 'Tente outro termo ou limpe os filtros.';
  } else if (tipo === 'recebimentos') {
    icone = <Coins className="w-12 h-12 text-sucesso" />;
    tituloPadrao = 'Nada a receber no momento';
    descPadrao = 'Quando você finalizar um projeto, ele aparece aqui com o prazo de 10 dias.';
  } else if (tipo === 'pdf-imagem') {
    icone = <FileWarning className="w-12 h-12 text-alerta" />;
    tituloPadrao = 'Este PDF é uma imagem';
    descPadrao = 'O arquivo foi digitalizado e não tem texto para extrair.';
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-g bg-superficie border border-borda my-4 min-h-[260px]">
      <div className="w-16 h-16 rounded-full bg-superficie-2 border border-borda flex items-center justify-center mb-4">
        {icone}
      </div>
      <h3 className="text-lg font-semibold text-texto mb-1">{titulo || tituloPadrao}</h3>
      <p className="text-sm text-texto-2 max-w-md mb-6">{descricao || descPadrao}</p>
      {acao && <div>{acao}</div>}
    </div>
  );
}
