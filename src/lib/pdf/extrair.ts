export interface FragmentoTexto {
  texto: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
  pagina: number;
}

/**
 * Extrai todos os fragmentos de texto com coordenadas de cada página do PDF
 */
export async function extrairFragmentosPdf(
  arquivo: File,
  aoProgredir?: (pagina: number, total: number) => void
): Promise<{ fragmentos: FragmentoTexto[]; totalPaginas: number }> {
  // Carrega dinamicamente o pdfjs-dist legado para máxima compatibilidade no browser
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Configura o worker
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  const arrayBuffer = await arquivo.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPaginas = pdfDoc.numPages;

  if (totalPaginas > 200) {
    throw new Error(`O arquivo excede o limite de 200 páginas (possui ${totalPaginas} páginas).`);
  }

  const fragmentos: FragmentoTexto[] = [];

  for (let numPag = 1; numPag <= totalPaginas; numPag++) {
    if (aoProgredir) {
      aoProgredir(numPag, totalPaginas);
    }

    const pagina = await pdfDoc.getPage(numPag);
    const textContent = await pagina.getTextContent();

    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string' && item.str.trim() !== '') {
        const x = item.transform[4];
        const y = item.transform[5];
        const largura = item.width || 0;
        const altura = item.height || (item.transform[0] ? Math.abs(item.transform[0]) : 10);

        fragmentos.push({
          texto: item.str,
          x,
          y,
          largura,
          altura,
          pagina: numPag,
        });
      }
    }
  }

  return { fragmentos, totalPaginas };
}
