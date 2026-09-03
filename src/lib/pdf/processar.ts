import { ColunaDetectada } from '../dados/tipos';
import { extrairFragmentosPdf } from './extrair';
import { agruparEmLinhas } from './linhas';
import { detectarColunas } from './colunas';
import { detectarLinhaCabecalho } from './cabecalho';
import { limparMatriz } from './limpeza';

export interface ResultadoProcessamento {
  linhas: string[][]; // matriz com dados e cabeçalho
  colunas: ColunaDetectada[];
  linhaCabecalho: number;
  totalPaginas: number;
  temCamadaTexto: boolean;
}

const LIMITE_TAMANHO_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Orquestra todo o processamento e extração de PDF no navegador
 */
export async function processarPdf(
  arquivo: File,
  aoProgredir?: (pagina: number, total: number) => void
): Promise<ResultadoProcessamento> {
  if (arquivo.size > LIMITE_TAMANHO_BYTES) {
    const tamanhoMb = (arquivo.size / (1024 * 1024)).toFixed(1);
    throw new Error(`O arquivo possui ${tamanhoMb} MB e excede o limite máximo permitido de 20 MB.`);
  }

  // 1. Extração de fragmentos de texto
  const { fragmentos, totalPaginas } = await extrairFragmentosPdf(arquivo, aoProgredir);

  // 2. Verifica se o PDF possui camada de texto real (>= 10 fragmentos)
  if (fragmentos.length < 10) {
    return {
      linhas: [],
      colunas: [],
      linhaCabecalho: 0,
      totalPaginas,
      temCamadaTexto: false,
    };
  }

  // 3. Agrupa fragmentos em linhas no eixo Y
  const linhasFragmentadas = agruparEmLinhas(fragmentos);

  // 4. Detecta colunas no eixo X e projeta em matriz
  const { colunas, matriz } = detectarColunas(linhasFragmentadas);

  // 5. Detecta linha de cabeçalho
  const { linhaCabecalho, colunasComNome } = detectarLinhaCabecalho(matriz, colunas);

  // 6. Limpeza e descarte de linhas vazias e rodapés
  const { matrizLimpa, novoIndiceCabecalho } = limparMatriz(matriz, linhaCabecalho);

  return {
    linhas: matrizLimpa,
    colunas: colunasComNome,
    linhaCabecalho: novoIndiceCabecalho,
    totalPaginas,
    temCamadaTexto: true,
  };
}
