/**
 * Limpeza e descarte de ruído da matriz extraída
 */
export function limparMatriz(
  matriz: string[][],
  linhaCabecalhoIndex: number
): { matrizLimpa: string[][]; novoIndiceCabecalho: number } {
  if (matriz.length === 0) {
    return { matrizLimpa: [], novoIndiceCabecalho: 0 };
  }

  const cabecalhoOriginal = matriz[linhaCabecalhoIndex];
  const textoCabecalho = cabecalhoOriginal ? cabecalhoOriginal.join('|').trim() : '';

  const matrizLimpa: string[][] = [];
  let novoIndiceCabecalho = 0;

  matriz.forEach((linha, idx) => {
    // 1. Trim em cada célula
    const linhaAparada = linha.map((c) => (c || '').trim());

    // 2. Descartar linhas totalmente vazias
    const temConteudo = linhaAparada.some((c) => c.length > 0);
    if (!temConteudo) return;

    // 3. Se for a linha de cabeçalho original
    if (idx === linhaCabecalhoIndex) {
      novoIndiceCabecalho = matrizLimpa.length;
      matrizLimpa.push(linhaAparada);
      return;
    }

    // 4. Descartar linhas que repetem exatamente o cabeçalho (quebras de página)
    const textoLinha = linhaAparada.join('|').trim();
    if (textoLinha === textoCabecalho && textoCabecalho.length > 0) {
      return;
    }

    // 5. Descartar numeração de página isolada como "Página 1 de 4" ou "1 / 4"
    if (
      linhaAparada.filter((c) => c.length > 0).length === 1 &&
      /^(p[áa]gina|\d+\s*\/\s*\d+|\d+$)/i.test(linhaAparada.find((c) => c.length > 0) || '')
    ) {
      return;
    }

    matrizLimpa.push(linhaAparada);
  });

  return {
    matrizLimpa,
    novoIndiceCabecalho,
  };
}
