import { format, subDays, addDays } from 'date-fns';
import { Projeto, Tarefa, Importacao, LinhaImportada, Configuracao } from './tipos';

export interface DadosArmazenamento {
  projetos: Projeto[];
  tarefas: Tarefa[];
  importacoes: Importacao[];
  linhas: LinhaImportada[];
  configuracao: Configuracao;
}

const RUAS_EXEMPLO = [
  'Av. Paulista, 1578', 'Rua Augusta, 420', 'Rua Oscar Freire, 982', 'Av. Brigadeiro Faria Lima, 2014',
  'Rua da Consolação, 1102', 'Av. Rebouças, 840', 'Rua Bela Cintra, 630', 'Rua Haddock Lobo, 755',
  'Av. Brasil, 1420', 'Rua Estados Unidos, 310', 'Rua Pamplona, 520', 'Alameda Santos, 1800',
  'Alameda Jaú, 915', 'Alameda Campinas, 430', 'Rua Teodoro Sampaio, 1250', 'Rua Cardeal Arcoverde, 890',
  'Rua Fradique Coutinho, 340', 'Rua dos Pinheiros, 610', 'Av. Santo Amaro, 2400', 'Rua Vergueiro, 3100',
  'Av. Engenheiro Luís Carlos Berrini, 105', 'Rua Gomes de Carvalho, 1507', 'Rua Funchal, 418', 'Av. Chucri Zaidan, 920',
  'Rua Olimpíadas, 205', 'Rua Samuel Morse, 74', 'Rua Arizona, 142', 'Rua Michigan, 320',
  'Av. Ibirapuera, 3103', 'Av. Indianópolis, 1420', 'Rua Domingos de Morais, 2564', 'Rua Tutóia, 480',
  'Rua Sena Madureira, 600', 'Rua Borges Lagoa, 1065', 'Rua Pedro de Toledo, 720', 'Rua Loefgren, 1430',
  'Av. Jabaquara, 1890', 'Rua Afonso Celso, 550', 'Rua Santa Cruz, 812', 'Av. Dr. Ricardo Jafet, 1500',
  'Rua Voluntários da Pátria, 2140', 'Rua Braz Leme, 1000', 'Rua Alfredo Pujol, 480', 'Av. Cruzeiro do Sul, 2800',
  'Rua Cantareira, 306', 'Rua 25 de Março, 820', 'Rua Florêncio de Abreu, 450', 'Rua São Bento, 200',
  'Rua Boa Vista, 140', 'Rua XV de Novembro, 88', 'Rua Direita, 60', 'Praça da Sé, 100',
  'Rua Álvares Penteado, 180', 'Rua Libero Badaró, 340', 'Viaduto do Chá, 15', 'Rua Marconi, 111',
  'Rua Barão de Itapetininga, 255', 'Rua 7 de Abril, 390', 'Rua da Quitanda, 96', 'Rua da Mooca, 1420',
  'Rua Visconde de Inhomerim, 410', 'Rua Juventus, 320', 'Rua Borges de Figueiredo, 900', 'Rua Taquari, 550',
  'Rua Bresser, 840', 'Rua Silva Teles, 310', 'Rua Maria Marcolina, 502', 'Rua Coimbra, 120',
  'Av. Celso Garcia, 3400', 'Rua Tuiuti, 1820', 'Rua Emília Marengo, 450', 'Rua Cantagalo, 890',
  'Rua Itapura, 1200', 'Rua Monte Serrat, 640', 'Rua Serra de Bragança, 780', 'Rua Apucarana, 940',
  'Rua Azevedo Soares, 1100', 'Rua Coelho Lisboa, 320', 'Praça Silvio Romero, 45', 'Rua Platina, 210',
  'Av. Radial Leste, 4500', 'Rua Vilela, 610', 'Rua Melo Freire, 800', 'Rua Francisco Marengo, 340',
  'Rua Guaimbé, 510', 'Rua Visconde de Laguna, 140', 'Rua do Oratório, 1600', 'Rua Juventus, 670',
  'Rua Terenas, 230', 'Rua Capitão Pacheco e Chaves, 313', 'Rua Manifesto, 1200', 'Rua Silva Bueno, 1850',
  'Rua Bom Pastor, 2100', 'Rua Lino Coutinho, 890', 'Rua Greenfeld, 120', 'Rua Cipriano Barata, 1400',
  'Rua Xavier de Almeida, 620', 'Rua Tabor, 310', 'Rua Leais Paulistanos, 450', 'Rua Costa Aguiar, 910',
  'Rua Lord Cockrane, 400', 'Rua Almirante Lobo, 780', 'Rua General Lecor, 520', 'Rua Auriverde, 340',
  'Av. Nazaré, 1200', 'Rua Vergueiro, 4500', 'Rua Gentil de Moura, 320', 'Rua Santa Cruz, 1800',
  'Rua Cursino, 950', 'Av. do Cursino, 2100', 'Rua Vigário Albernaz, 430', 'Rua Ibituruna, 620',
  'Rua Fagundes Filho, 380', 'Av. Jabaquara, 2900', 'Rua Guatapará, 150', 'Rua Carneiro da Cunha, 410',
  'Rua Caramuru, 730', 'Rua Luís Góis, 1240', 'Rua Mirassol, 310', 'Rua Correia de Lemos, 560',
];

const BAIRROS_EXEMPLO = [
  'Bela Vista', 'Cerqueira César', 'Jardins', 'Pinheiros', 'Itaim Bibi', 'Vila Olímpia', 'Moema',
  'Vila Mariana', 'Santana', 'Sé', 'República', 'Mooca', 'Tatuapé', 'Anália Franco', 'Ipiranga', 'Saúde'
];

const RESPONSAVEIS_EXEMPLO = [
  'Carlos Eduardo', 'Mariana Souza', 'Felipe Santos', 'Beatriz Lima', 'Rafael Oliveira', 'Juliana Rocha'
];

export function gerarDadosIniciais(): DadosArmazenamento {
  const agora = new Date();
  const hojeStr = format(agora, 'yyyy-MM-dd');

  // 1. Levantamento Zona Sul (Em andamento, 82/120 tarefas concluídas, com dados importados)
  const proj1Id = 'proj-1';
  const imp1Id = 'imp-1';
  const proj1DataInicio = format(subDays(agora, 22), 'yyyy-MM-dd');
  const proj1DataFim = format(addDays(agora, 27), 'yyyy-MM-dd');

  const proj1: Projeto = {
    id: proj1Id,
    nome: 'Levantamento Zona Sul',
    cliente: 'Construtora Vega',
    descricao: 'Levantamento cadastral e vistoria técnica de 120 imóveis na região sul.',
    cor: 'violeta',
    status: 'em_andamento',
    dataInicio: proj1DataInicio,
    dataFimPrevista: proj1DataFim,
    concluidoEm: null,
    valorCentavos: 1240000, // $ 12,400.00
    porcentagem: 45,
    recebimentoPrevistoPara: null,
    recebidoEm: null,
    valorRecebidoCentavos: null,
    criadoEm: format(subDays(agora, 22), "yyyy-MM-dd'T'10:00:00.000'Z'"),
    atualizadoEm: format(subDays(agora, 1), "yyyy-MM-dd'T'16:30:00.000'Z'"),
  };

  const colunasDetectadasProj1 = [
    { indice: 0, nome: 'ENDEREÇO', xInicio: 40, xFim: 220, confianca: 0.98, amostras: [RUAS_EXEMPLO[0], RUAS_EXEMPLO[1], RUAS_EXEMPLO[2]] },
    { indice: 1, nome: 'BAIRRO', xInicio: 230, xFim: 340, confianca: 0.95, amostras: [BAIRROS_EXEMPLO[0], BAIRROS_EXEMPLO[1], BAIRROS_EXEMPLO[2]] },
    { indice: 2, nome: 'PRAZO', xInicio: 350, xFim: 430, confianca: 0.90, amostras: ['15/09/2026', '18/09/2026', '20/09/2026'] },
    { indice: 3, nome: 'RESPONSÁVEL', xInicio: 440, xFim: 550, confianca: 0.92, amostras: [RESPONSAVEIS_EXEMPLO[0], RESPONSAVEIS_EXEMPLO[1], RESPONSAVEIS_EXEMPLO[2]] },
  ];

  const importacao1: Importacao = {
    id: imp1Id,
    projetoId: proj1Id,
    nomeArquivo: 'Planilha_Imoveis_Zona_Sul_2026.pdf',
    tamanhoBytes: 342000,
    totalPaginas: 4,
    colunasDetectadas: colunasDetectadasProj1,
    colunasEscolhidas: [0, 1, 2, 3],
    mapeamento: { titulo: 0, prazo: 2, observacoes: 1 },
    linhaCabecalho: 0,
    totalLinhas: 120,
    criadoEm: format(subDays(agora, 20), "yyyy-MM-dd'T'11:00:00.000'Z'"),
  };

  const tarefasProj1: Tarefa[] = [];
  const linhasProj1: LinhaImportada[] = [];

  for (let i = 0; i < 120; i++) {
    const tarefaId = `tar-1-${i + 1}`;
    const linhaId = `lin-1-${i + 1}`;
    const rua = RUAS_EXEMPLO[i % RUAS_EXEMPLO.length] + (i >= RUAS_EXEMPLO.length ? ` (Lote ${Math.floor(i / RUAS_EXEMPLO.length) + 1})` : '');
    const bairro = BAIRROS_EXEMPLO[i % BAIRROS_EXEMPLO.length];
    const responsavel = RESPONSAVEIS_EXEMPLO[i % RESPONSAVEIS_EXEMPLO.length];
    const prazoTarefa = format(addDays(subDays(agora, 15), Math.floor(i * 0.3)), 'yyyy-MM-dd');
    const isConcluida = i < 82; // 82 de 120 concluídas

    linhasProj1.push({
      id: linhaId,
      importacaoId: imp1Id,
      projetoId: proj1Id,
      numeroLinha: i + 1,
      dados: {
        'ENDEREÇO': rua,
        'BAIRRO': bairro,
        'PRAZO': format(addDays(agora, (i % 20) + 1), 'dd/MM/yyyy'),
        'RESPONSÁVEL': responsavel,
      },
      tarefaId: tarefaId,
    });

    tarefasProj1.push({
      id: tarefaId,
      projetoId: proj1Id,
      titulo: rua,
      observacoes: `Bairro: ${bairro} · Resp: ${responsavel}`,
      status: isConcluida ? 'concluida' : 'a_fazer',
      prazo: prazoTarefa,
      ordem: i + 1,
      linhaOrigemId: linhaId,
      concluidaEm: isConcluida ? format(subDays(agora, Math.max(1, 20 - Math.floor(i * 0.2))), "yyyy-MM-dd'T'14:00:00.000'Z'") : null,
      criadoEm: format(subDays(agora, 20), "yyyy-MM-dd'T'11:05:00.000'Z'"),
    });
  }

  // 2. Cadastro Industrial (Finalizado há 14 dias, ATRASADO há 4 dias) -> janela 10 dias => venceu há 4 dias
  const proj2Id = 'proj-2';
  const proj2ConcluidoEm = subDays(agora, 14);
  const proj2PrevistoRecebimento = format(addDays(proj2ConcluidoEm, 10), 'yyyy-MM-dd'); // hoje - 4 dias
  const proj2: Projeto = {
    id: proj2Id,
    nome: 'Cadastro Industrial',
    cliente: 'Construtora Vega',
    descricao: 'Levantamento topográfico e mapeamento de galpões do polo industrial.',
    cor: 'rosa',
    status: 'finalizado',
    dataInicio: format(subDays(agora, 45), 'yyyy-MM-dd'),
    dataFimPrevista: format(subDays(agora, 15), 'yyyy-MM-dd'),
    concluidoEm: format(proj2ConcluidoEm, "yyyy-MM-dd'T'17:00:00.000'Z'"),
    valorCentavos: 640000, // $ 6,400.00
    porcentagem: 45,
    recebimentoPrevistoPara: proj2PrevistoRecebimento,
    recebidoEm: null,
    valorRecebidoCentavos: null,
    criadoEm: format(subDays(agora, 45), "yyyy-MM-dd'T'09:00:00.000'Z'"),
    atualizadoEm: format(subDays(agora, 14), "yyyy-MM-dd'T'17:00:00.000'Z'"),
  };

  const tarefasProj2: Tarefa[] = Array.from({ length: 24 }).map((_, i) => ({
    id: `tar-2-${i + 1}`,
    projetoId: proj2Id,
    titulo: `Inspeção e laudo do Galpão ${i + 101}`,
    observacoes: 'Verificação estrutural concluída',
    status: 'concluida',
    prazo: format(subDays(agora, 16), 'yyyy-MM-dd'),
    ordem: i + 1,
    linhaOrigemId: null,
    concluidaEm: format(subDays(agora, 14), "yyyy-MM-dd'T'15:00:00.000'Z'"),
    criadoEm: format(subDays(agora, 45), "yyyy-MM-dd'T'09:30:00.000'Z'"),
  }));

  // 3. Mapeamento Litoral Norte (Finalizado há 8 dias, VENCE EM 2 DIAS - ALERTA) -> janela 10 dias => vence em 2 dias
  const proj3Id = 'proj-3';
  const proj3ConcluidoEm = subDays(agora, 8);
  const proj3PrevistoRecebimento = format(addDays(proj3ConcluidoEm, 10), 'yyyy-MM-dd'); // hoje + 2 dias
  const proj3: Projeto = {
    id: proj3Id,
    nome: 'Mapeamento Litoral Norte',
    cliente: 'Prefeitura de Caraguá',
    descricao: 'Georreferenciamento de áreas públicas de preservação.',
    cor: 'ambar',
    status: 'finalizado',
    dataInicio: format(subDays(agora, 35), 'yyyy-MM-dd'),
    dataFimPrevista: format(subDays(agora, 9), 'yyyy-MM-dd'),
    concluidoEm: format(proj3ConcluidoEm, "yyyy-MM-dd'T'16:45:00.000'Z'"),
    valorCentavos: 980000, // $ 9,800.00
    porcentagem: 45,
    recebimentoPrevistoPara: proj3PrevistoRecebimento,
    recebidoEm: null,
    valorRecebidoCentavos: null,
    criadoEm: format(subDays(agora, 35), "yyyy-MM-dd'T'08:00:00.000'Z'"),
    atualizadoEm: format(subDays(agora, 8), "yyyy-MM-dd'T'16:45:00.000'Z'"),
  };

  const tarefasProj3: Tarefa[] = Array.from({ length: 30 }).map((_, i) => ({
    id: `tar-3-${i + 1}`,
    projetoId: proj3Id,
    titulo: `Delimitação do Setor Costeiro ${String.fromCharCode(65 + (i % 6))}-${(i % 5) + 1}`,
    observacoes: 'Levantamento GNSS de alta precisão',
    status: 'concluida',
    prazo: format(subDays(agora, 10), 'yyyy-MM-dd'),
    ordem: i + 1,
    linhaOrigemId: null,
    concluidaEm: format(subDays(agora, 8), "yyyy-MM-dd'T'14:00:00.000'Z'"),
    criadoEm: format(subDays(agora, 35), "yyyy-MM-dd'T'08:15:00.000'Z'"),
  }));

  // 4. Vistoria Centro (Finalizado há 1 dia, VENCE EM 9 DIAS - NEUTRO)
  const proj4Id = 'proj-4';
  const proj4ConcluidoEm = subDays(agora, 1);
  const proj4PrevistoRecebimento = format(addDays(proj4ConcluidoEm, 10), 'yyyy-MM-dd'); // hoje + 9 dias
  const proj4: Projeto = {
    id: proj4Id,
    nome: 'Vistoria Centro',
    cliente: 'Alfa Engenharia',
    descricao: 'Vistoria cautelar de vizinhança para edificação comercial.',
    cor: 'azul',
    status: 'finalizado',
    dataInicio: format(subDays(agora, 18), 'yyyy-MM-dd'),
    dataFimPrevista: format(subDays(agora, 2), 'yyyy-MM-dd'),
    concluidoEm: format(proj4ConcluidoEm, "yyyy-MM-dd'T'18:20:00.000'Z'"),
    valorCentavos: 2030000, // $ 20,300.00
    porcentagem: 45,
    recebimentoPrevistoPara: proj4PrevistoRecebimento,
    recebidoEm: null,
    valorRecebidoCentavos: null,
    criadoEm: format(subDays(agora, 18), "yyyy-MM-dd'T'11:00:00.000'Z'"),
    atualizadoEm: format(subDays(agora, 1), "yyyy-MM-dd'T'18:20:00.000'Z'"),
  };

  const tarefasProj4: Tarefa[] = Array.from({ length: 18 }).map((_, i) => ({
    id: `tar-4-${i + 1}`,
    projetoId: proj4Id,
    titulo: `Vistoria do Edifício Central Bloco ${i + 1}`,
    observacoes: 'Registro fotográfico e termo assinado',
    status: 'concluida',
    prazo: format(subDays(agora, 2), 'yyyy-MM-dd'),
    ordem: i + 1,
    linhaOrigemId: null,
    concluidaEm: format(subDays(agora, 1), "yyyy-MM-dd'T'16:00:00.000'Z'"),
    criadoEm: format(subDays(agora, 18), "yyyy-MM-dd'T'11:20:00.000'Z'"),
  }));

  // 5. Auditoria Norte (RECEBIDO há 5 dias)
  const proj5Id = 'proj-5';
  const proj5ConcluidoEm = subDays(agora, 15);
  const proj5RecebidoEm = format(subDays(agora, 5), 'yyyy-MM-dd');
  const proj5: Projeto = {
    id: proj5Id,
    nome: 'Auditoria Norte',
    cliente: 'Norte Participações',
    descricao: 'Auditoria técnica e compliance de obras de infraestrutura.',
    cor: 'verde',
    status: 'finalizado',
    dataInicio: format(subDays(agora, 60), 'yyyy-MM-dd'),
    dataFimPrevista: format(subDays(agora, 16), 'yyyy-MM-dd'),
    concluidoEm: format(proj5ConcluidoEm, "yyyy-MM-dd'T'15:00:00.000'Z'"),
    valorCentavos: 2210000, // $ 22,100.00
    porcentagem: 45,
    recebimentoPrevistoPara: format(addDays(proj5ConcluidoEm, 10), 'yyyy-MM-dd'),
    recebidoEm: proj5RecebidoEm,
    valorRecebidoCentavos: 2210000,
    criadoEm: format(subDays(agora, 60), "yyyy-MM-dd'T'10:00:00.000'Z'"),
    atualizadoEm: format(subDays(agora, 5), "yyyy-MM-dd'T'14:00:00.000'Z'"),
  };

  const tarefasProj5: Tarefa[] = Array.from({ length: 35 }).map((_, i) => ({
    id: `tar-5-${i + 1}`,
    projetoId: proj5Id,
    titulo: `Auditoria do Item de Obra #${1000 + i}`,
    observacoes: 'Documentação validada sem inconformidades',
    status: 'concluida',
    prazo: format(subDays(agora, 18), 'yyyy-MM-dd'),
    ordem: i + 1,
    linhaOrigemId: null,
    concluidaEm: format(subDays(agora, 15), "yyyy-MM-dd'T'12:00:00.000'Z'"),
    criadoEm: format(subDays(agora, 60), "yyyy-MM-dd'T'10:15:00.000'Z'"),
  }));

  // 6. Regularização Fundiária (PLANEJADO, ainda sem tarefas)
  const proj6Id = 'proj-6';
  const proj6: Projeto = {
    id: proj6Id,
    nome: 'Regularização Fundiária',
    cliente: 'Prefeitura de Caraguá',
    descricao: 'Levantamento planialtimétrico cadastral para projeto REURB.',
    cor: 'ciano',
    status: 'planejado',
    dataInicio: format(addDays(agora, 5), 'yyyy-MM-dd'),
    dataFimPrevista: format(addDays(agora, 45), 'yyyy-MM-dd'),
    concluidoEm: null,
    valorCentavos: 1500000, // $ 15,000.00
    porcentagem: 45,
    recebimentoPrevistoPara: null,
    recebidoEm: null,
    valorRecebidoCentavos: null,
    criadoEm: format(subDays(agora, 2), "yyyy-MM-dd'T'09:00:00.000'Z'"),
    atualizadoEm: format(subDays(agora, 2), "yyyy-MM-dd'T'09:00:00.000'Z'"),
  };

  const configuracao: Configuracao = {
    janelaRecebimentoDias: 10,
    moeda: 'USD',
    tema: 'escuro',
  };

  return {
    projetos: [proj1, proj2, proj3, proj4, proj5, proj6],
    tarefas: [...tarefasProj1, ...tarefasProj2, ...tarefasProj3, ...tarefasProj4, ...tarefasProj5],
    importacoes: [importacao1],
    linhas: linhasProj1,
    configuracao,
  };
}
