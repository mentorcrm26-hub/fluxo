import { ColunaDetectada } from '../dados/tipos';

function ehMajoritariamenteNaoNumerica(texto: string): boolean {
  if (!texto || texto.trim() === '') return false;
  const limpo = texto.replace(/[\s\-_/.,;:()]/g, '');
  if (limpo.length === 0) return false;
  const digitos = (limpo.match(/\d/g) || []).length;
  return digitos / limpo.length < 0.5;
}

/**
 * Heurística para detectar a linha de cabeçalho da tabela
 */
export function detectarLinhaCabecalho(
  matriz: string[][],
  colunas: ColunaDetectada[]
): { linhaCabecalho: number; colunasComNome: ColunaDetectada[] } {
  const totalColunas = colunas.length;
  let melhorLinha = 0;
  let encontrou = false;

  for (let r = 0; r < Math.min(15, matriz.length); r++) {
    const linha = matriz[r];
    const celulasNaoVazias = linha.filter((c) => c && c.trim().length > 0);
    const preenchimento = celulasNaoVazias.length / totalColunas;

    if (preenchimento >= 0.6) {
      const celulasNaoNumericas = celulasNaoVazias.filter(ehMajoritariamenteNaoNumerica);
      const proporcaoNaoNumerica = celulasNaoNumericas.length / celulasNaoVazias.length;

      if (proporcaoNaoNumerica >= 0.65) {
        // Verifica se não se repete idêntica nas próximas 5 linhas
        const textoLinha = linha.join('|').toLowerCase();
        let repete = false;
        for (let nextR = r + 1; nextR < Math.min(r + 6, matriz.length); nextR++) {
          if (matriz[nextR].join('|').toLowerCase() === textoLinha) {
            repete = true;
            break;
          }
        }

        if (!repete) {
          melhorLinha = r;
          encontrou = true;
          break;
        }
      }
    }
  }

  // Atualiza os nomes das colunas com os textos da linha de cabeçalho
  const colunasAtualizadas = colunas.map((col, cIdx) => {
    const textoCabecalho = matriz[melhorLinha]?.[cIdx]?.trim();
    const nome = textoCabecalho && textoCabecalho.length > 0
      ? textoCabecalho.toUpperCase()
      : `COLUNA ${cIdx + 1}`;

    return {
      ...col,
      nome,
    };
  });

  return {
    linhaCabecalho: melhorLinha,
    colunasComNome: colunasAtualizadas,
  };
}
