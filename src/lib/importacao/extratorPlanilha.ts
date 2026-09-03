import { extrairFragmentosPdf, FragmentoTexto } from '../pdf/extrair';
import { agruparEmLinhas, LinhaFragmentos } from '../pdf/linhas';
import { formatarUSD, parsearUSD } from '../dinheiro';
import { traduzirDescricaoParaPtBr } from '../traducao/tradutor';

export interface ItemExtraido {
  id: string;
  titulo: string;
  tituloTraduzido?: string | null;
  observacoes: string | null;
  prazo: string | null;
  quantidade: string | null;
  valorCentavos: number | null;
  dadosBrutos: Record<string, string>;
  selecionado: boolean;
}

export interface ResultadoExtracao {
  nomeArquivo: string;
  tamanhoBytes: number;
  totalPaginas: number;
  itens: ItemExtraido[];
  colunasDetectadas: string[];
}

/**
 * Extrai itens de arquivo PDF ou CSV/Planilha de forma direta e inteligente
 */
export async function extrairItensDoArquivo(
  arquivo: File,
  aoProgredir?: (pagina: number, total: number) => void
): Promise<ResultadoExtracao> {
  const nome = arquivo.name.toLowerCase();

  if (nome.endsWith('.csv') || nome.endsWith('.txt') || nome.endsWith('.tsv')) {
    return extrairDeTextoPlano(arquivo);
  }

  // Padrão: Processamento avançado de PDF
  return extrairDePdf(arquivo, aoProgredir);
}

/**
 * Extrai itens de CSV / TSV / TXT
 */
async function extrairDeTextoPlano(arquivo: File): Promise<ResultadoExtracao> {
  const texto = await arquivo.text();
  const linhasCruas = texto.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  if (linhasCruas.length === 0) {
    return {
      nomeArquivo: arquivo.name,
      tamanhoBytes: arquivo.size,
      totalPaginas: 1,
      itens: [],
      colunasDetectadas: [],
    };
  }

  // Detecta delimitador (, ; ou \t)
  const primeiraLinha = linhasCruas[0];
  const contaVirgula = (primeiraLinha.match(/,/g) || []).length;
  const contaPontoVirgula = (primeiraLinha.match(/;/g) || []).length;
  const contaTab = (primeiraLinha.match(/\t/g) || []).length;

  let delimitador = ',';
  if (contaPontoVirgula > contaVirgula && contaPontoVirgula > contaTab) delimitador = ';';
  else if (contaTab > contaVirgula && contaTab > contaPontoVirgula) delimitador = '\t';

  // Função auxiliar para dividir respeitando aspas
  const dividirLinha = (linha: string): string[] => {
    const regex = new RegExp(
      `(?:^|${delimitador})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimitador}]*))`,
      'g'
    );
    const campos: string[] = [];
    let match;
    while ((match = regex.exec(linha))) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      campos.push((val || '').trim());
      if (regex.lastIndex === linha.length && linha.endsWith(delimitador)) {
        campos.push('');
      }
    }
    return campos;
  };

  const cabecalho = dividirLinha(linhasCruas[0]).map((c, i) => c || `Coluna ${i + 1}`);
  const linhasDados = linhasCruas.slice(1).map(dividirLinha);

  // Encontra coluna com maior probabilidade de ser título / descrição
  let idxDesc = cabecalho.findIndex((c) =>
    /descri[çc][ãa]o|description|item|servi[çc]o|tarefa|task|nome|t[íi]tulo|work|produto/i.test(c)
  );
  if (idxDesc === -1) idxDesc = 0;

  const idxQtd = cabecalho.findIndex((c) => /qtd|quantidade|qty|count/i.test(c));
  const idxValor = cabecalho.findIndex((c) => /valor|pre[çc]o|price|total|custo|cost/i.test(c));

  const itens: ItemExtraido[] = [];

  linhasDados.forEach((linha, i) => {
    const dadosBrutos: Record<string, string> = {};
    cabecalho.forEach((col, cIdx) => {
      if (linha[cIdx]) dadosBrutos[col] = linha[cIdx];
    });

    const titulo = linha[idxDesc] || linha.find((c) => c.length > 0) || `Item #${i + 1}`;
    const qtd = idxQtd >= 0 ? linha[idxQtd] || null : null;
    const valorStr = idxValor >= 0 ? linha[idxValor] || null : null;
    const valorCentavos = valorStr ? parsearUSD(valorStr) : null;

    // Monta detalhes
    const partesDetalhes: string[] = [];
    cabecalho.forEach((col, cIdx) => {
      if (cIdx !== idxDesc && linha[cIdx] && linha[cIdx].trim().length > 0) {
        partesDetalhes.push(`${col}: ${linha[cIdx].trim()}`);
      }
    });

    const tituloLimpo = titulo.trim();
    const tituloTraduzido = traduzirDescricaoParaPtBr(tituloLimpo);

    itens.push({
      id: `item-${Date.now()}-${i + 1}`,
      titulo: tituloLimpo,
      tituloTraduzido: tituloTraduzido !== tituloLimpo ? tituloTraduzido : null,
      quantidade: qtd,
      valorCentavos,
      observacoes: partesDetalhes.length > 0 ? partesDetalhes.join(' · ') : null,
      prazo: null,
      dadosBrutos,
      selecionado: true,
    });
  });

  return {
    nomeArquivo: arquivo.name,
    tamanhoBytes: arquivo.size,
    totalPaginas: 1,
    itens,
    colunasDetectadas: cabecalho,
  };
}

/**
 * Extrai itens de PDF com costura automática de linhas quebradas e detecção de tabelas
 */
async function extrairDePdf(
  arquivo: File,
  aoProgredir?: (pagina: number, total: number) => void
): Promise<ResultadoExtracao> {
  const { fragmentos, totalPaginas } = await extrairFragmentosPdf(arquivo, aoProgredir);

  if (fragmentos.length < 5) {
    return {
      nomeArquivo: arquivo.name,
      tamanhoBytes: arquivo.size,
      totalPaginas,
      itens: [],
      colunasDetectadas: [],
    };
  }

  // Agrupa fragmentos em linhas visuais
  const linhasVisuais = agruparEmLinhas(fragmentos);

  // 1. Localiza a linha do cabeçalho da tabela de itens
  let indiceLinhaCabecalho = -1;
  let colunasDetectadas: { nome: string; x: number; largura: number }[] = [];

  const palavrasChaveCabecalho = [
    'qty', 'quantity', 'count', 'stock', 'description', 'unit price', 'total cost',
    'property', 'item', 'descrição', 'serviço', 'valor', 'total', 'quantidade', 'unidade'
  ];

  for (let i = 0; i < Math.min(30, linhasVisuais.length); i++) {
    const linha = linhasVisuais[i];
    const textoLinha = linha.fragmentos.map((f) => f.texto.toLowerCase()).join(' ');

    let ocorrencias = 0;
    for (const kw of palavrasChaveCabecalho) {
      if (textoLinha.includes(kw)) ocorrencias++;
    }

    // Se encontrou 2 ou mais termos de cabeçalho na mesma linha (ex: "Qty Count Stock Description Unit Price Total Cost Property")
    if (ocorrencias >= 2) {
      indiceLinhaCabecalho = i;
      colunasDetectadas = linha.fragmentos.map((f) => ({
        nome: f.texto.trim(),
        x: f.x,
        largura: f.largura,
      }));
      break;
    }
  }

  // Se não encontrou linha de cabeçalho explícita, usa padrão
  const inicioDados = indiceLinhaCabecalho >= 0 ? indiceLinhaCabecalho + 1 : 0;
  const linhasTabela = linhasVisuais.slice(inicioDados);

  // 2. Extrai itens agrupando linhas que pertencem ao mesmo item
  // Em ordens de serviço / purchase orders, um novo item começa quando o primeiro campo tem quantidade (ex: 1.0000, 29.0000)
  // ou quando tem código de estoque / item numerado.
  interface LinhaItemTemp {
    textos: string[];
    fragmentos: FragmentoTexto[];
  }

  const gruposItens: LinhaItemTemp[] = [];
  let itemAtual: LinhaItemTemp | null = null;

  for (const linha of linhasTabela) {
    const frags = [...linha.fragmentos].sort((a, b) => a.x - b.x);
    const textoCompleto = frags.map((f) => f.texto.trim()).join(' ').trim();

    // Ignora cabeçalhos repetidos em quebras de página ou rodapés
    if (/^(page\s*:\s*\d+|p[áa]gina\s*\d+|purchase order no\.|total amount|signature)/i.test(textoCompleto)) {
      continue;
    }

    const primeiroFrag = frags[0]?.texto.trim() || '';

    // Verifica se a linha indica o início de um novo item da tabela
    // Ex: "1.0000", "29.0000", "1", "12", "item 1", etc.
    const ehNumeroQuantidade = /^(\d+(\.\d+)?)$/.test(primeiroFrag);
    const temMultiplosFragmentosDistribuídos = frags.length >= 3;

    const iniciaNovoItem = (ehNumeroQuantidade && frags.length >= 2) || (temMultiplosFragmentosDistribuídos && !itemAtual);

    if (iniciaNovoItem) {
      if (itemAtual) {
        gruposItens.push(itemAtual);
      }
      itemAtual = {
        textos: [textoCompleto],
        fragmentos: [...frags],
      };
    } else if (itemAtual) {
      // Linha de continuação da descrição (quebra de linha)
      itemAtual.textos.push(textoCompleto);
      itemAtual.fragmentos.push(...frags);
    } else if (textoCompleto.length > 5) {
      // Linha avulsa com texto relevante
      itemAtual = {
        textos: [textoCompleto],
        fragmentos: [...frags],
      };
    }
  }

  if (itemAtual) {
    gruposItens.push(itemAtual);
  }

  // 3. Converte os grupos temporários em itens finais limpos
  const itens: ItemExtraido[] = [];

  gruposItens.forEach((grupo, idx) => {
    // Coleta todos os fragmentos do grupo
    const frags = grupo.fragmentos;

    // Detecta quantidade (geralmente números como 1.0000 ou 29.0000 no início)
    let quantidade: string | null = null;
    let valorCentavos: number | null = null;
    let stockCode: string | null = null;
    let propertyCode: string | null = null;

    // Busca valores numéricos e monetários
    const textosNaoDescricao: string[] = [];
    const partesDescricao: string[] = [];

    for (const f of frags) {
      const t = f.texto.trim();
      if (!t) continue;

      if (!quantidade && /^(\d+(\.\d+)?)$/.test(t) && f.x < 150) {
        quantidade = t;
        continue;
      }

      if (/^[a-z0-9_]{6,20}$/i.test(t) && !t.includes(' ') && f.x < 250 && !stockCode) {
        stockCode = t;
        continue;
      }

      if (/^fl\d+$/i.test(t) || /^prop\d+$/i.test(t)) {
        propertyCode = t;
        continue;
      }

      if (/^\$?\d+(\.\d{2})?$/.test(t) && f.x > 300) {
        const valCents = parsearUSD(t);
        if (valCents > 0) valorCentavos = valCents;
        continue;
      }

      partesDescricao.push(t);
    }

    // Limpa ruídos, URLs, disclaimers legais e carimbos de data/hora do título
    let tituloLimpo = partesDescricao.join(' ').replace(/\s+/g, ' ').trim();
    if (!tituloLimpo || tituloLimpo.length < 3) {
      tituloLimpo = grupo.textos.join(' ').trim();
    }

    tituloLimpo = tituloLimpo
      .replace(/By accepting or performing some or all of the work described in this purchase or work order[\s\S]*/gi, '')
      .replace(/https?:\/\/[^\s]+/gi, '')
      .replace(/Total\s+[\d,.]+\s+Description[\s\S]*/gi, '')
      .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s*(AM|PM)?/gi, '')
      .replace(/\b(PO Closed\?|GL Review|Pending)\b/gi, '')
      .replace(/\|\s*\|/g, '|')
      .replace(/\s+/g, ' ')
      .trim();

    // Remove número de quantidade duplicado no início (ex: "1 Front Exterior" -> "Front Exterior")
    tituloLimpo = tituloLimpo.replace(/^\d+(\.\d+)?\s+/, '').trim();

    if (!tituloLimpo) {
      tituloLimpo = `Item #${idx + 1}`;
    }

    // Detalhes extras organizados
    const detalhesArray: string[] = [];
    if (quantidade) detalhesArray.push(`Qtd: ${quantidade}`);
    if (valorCentavos) detalhesArray.push(`Valor: ${formatarUSD(valorCentavos)}`);
    if (stockCode) detalhesArray.push(`Código: ${stockCode}`);
    if (propertyCode) detalhesArray.push(`Imóvel: ${propertyCode}`);

    const dadosBrutos: Record<string, string> = {
      'Item': `#${idx + 1}`,
      'Descrição': tituloLimpo,
    };
    if (quantidade) dadosBrutos['Quantidade'] = quantidade;
    if (valorCentavos) dadosBrutos['Valor'] = formatarUSD(valorCentavos);
    if (stockCode) dadosBrutos['Código'] = stockCode;
    if (propertyCode) dadosBrutos['Imóvel'] = propertyCode;

    const tituloTraduzido = traduzirDescricaoParaPtBr(tituloLimpo);

    itens.push({
      id: `pdf-item-${Date.now()}-${idx + 1}`,
      titulo: tituloLimpo,
      tituloTraduzido: tituloTraduzido !== tituloLimpo ? tituloTraduzido : null,
      quantidade,
      valorCentavos,
      observacoes: detalhesArray.length > 0 ? detalhesArray.join(' · ') : null,
      prazo: null,
      dadosBrutos,
      selecionado: true,
    });
  });

  return {
    nomeArquivo: arquivo.name,
    tamanhoBytes: arquivo.size,
    totalPaginas,
    itens,
    colunasDetectadas: colunasDetectadas.map((c) => c.nome),
  };
}
