import { ColunaDetectada } from '../dados/tipos';
import { LinhaFragmentos } from './linhas';
import { FragmentoTexto } from './extrair';

interface IntervaloColuna {
  indice: number;
  xInicio: number;
  xFim: number;
  confianca: number;
  nome: string;
  amostras: string[];
}

/**
 * Detecta colunas a partir de vãos horizontais no eixo X e projeta fragmentos nas colunas
 */
export function detectarColunas(linhas: LinhaFragmentos[]): {
  colunas: ColunaDetectada[];
  matriz: string[][];
} {
  if (linhas.length === 0) {
    return { colunas: [], matriz: [] };
  }

  // 1. Coleta estatísticas de caracteres
  let totalCaracteres = 0;
  let totalLargura = 0;
  const todosFragmentos: FragmentoTexto[] = [];

  for (const l of linhas) {
    for (const f of l.fragmentos) {
      todosFragmentos.push(f);
      if (f.texto.length > 0 && f.largura > 0) {
        totalCaracteres += f.texto.length;
        totalLargura += f.largura;
      }
    }
  }

  const larguraMediaCaractere = totalCaracteres > 0 ? totalLargura / totalCaracteres : 6;
  const limiarVao = Math.max(12, larguraMediaCaractere * 2.2);

  // 2. Coleta posições X de início e fim dos fragmentos
  const posicoesXInicio = todosFragmentos.map((f) => f.x).sort((a, b) => a - b);

  // 3. Clusteriza intervalos de colunas identificando vãos significativos
  const clusters: { minX: number; maxX: number; frags: FragmentoTexto[] }[] = [];

  // Alternativa robusta para agrupamento por densidade de X
  for (const f of todosFragmentos) {
    const centroX = f.x + f.largura / 2;
    let clusterEncontrado = clusters.find((c) => {
      // Se sobrepõe ou está muito próximo
      return (
        (f.x >= c.minX - limiarVao && f.x <= c.maxX + limiarVao) ||
        (centroX >= c.minX && centroX <= c.maxX)
      );
    });

    if (clusterEncontrado) {
      clusterEncontrado.minX = Math.min(clusterEncontrado.minX, f.x);
      clusterEncontrado.maxX = Math.max(clusterEncontrado.maxX, f.x + f.largura);
      clusterEncontrado.frags.push(f);
    } else {
      clusters.push({
        minX: f.x,
        maxX: f.x + f.largura,
        frags: [f],
      });
    }
  }

  // Ordena clusters por X inicial
  clusters.sort((a, b) => a.minX - b.minX);

  // Mescla clusters que ficaram muito próximos após expansão
  const clustersMesclados: typeof clusters = [];
  for (const c of clusters) {
    if (clustersMesclados.length === 0) {
      clustersMesclados.push(c);
    } else {
      const ultimo = clustersMesclados[clustersMesclados.length - 1];
      if (c.minX <= ultimo.maxX + (limiarVao * 0.5)) {
        ultimo.maxX = Math.max(ultimo.maxX, c.maxX);
        ultimo.frags.push(...c.frags);
      } else {
        clustersMesclados.push(c);
      }
    }
  }

  const totalLinhas = linhas.length;

  // 4. Avalia confiança e constrói colunas preliminares
  const colunasValidas: IntervaloColuna[] = [];

  clustersMesclados.forEach((cluster, idx) => {
    // Linhas que possuem fragmento caindo nesta coluna
    const linhasPresentes = new Set<number>();
    linhas.forEach((l, lIdx) => {
      const tem = l.fragmentos.some((f) => {
        const centro = f.x + f.largura / 2;
        return centro >= cluster.minX - 4 && centro <= cluster.maxX + 4;
      });
      if (tem) linhasPresentes.add(lIdx);
    });

    const confianca = Math.min(1, linhasPresentes.size / totalLinhas);

    if (confianca >= 0.12 || clustersMesclados.length <= 4) {
      colunasValidas.push({
        indice: colunasValidas.length,
        xInicio: cluster.minX,
        xFim: cluster.maxX,
        confianca,
        nome: `Coluna ${colunasValidas.length + 1}`,
        amostras: [],
      });
    }
  });

  // Se por acaso não detectou colunas, cria 1 coluna abrangente
  if (colunasValidas.length === 0) {
    colunasValidas.push({
      indice: 0,
      xInicio: 0,
      xFim: 1000,
      confianca: 1,
      nome: 'Coluna 1',
      amostras: [],
    });
  }

  // 5. Mapeia cada linha para a matriz de células das colunas
  const matriz: string[][] = [];

  for (const l of linhas) {
    const linhaCelulas = new Array(colunasValidas.length).fill('');

    for (const f of l.fragmentos) {
      const centroF = f.x + f.largura / 2;
      let melhorColunaIdx = -1;
      let maiorSobreposicao = -1;

      colunasValidas.forEach((col, cIdx) => {
        const inicio = col.xInicio;
        const fim = col.xFim;

        // Se o centro está dentro da coluna
        if (centroF >= inicio && centroF <= fim) {
          melhorColunaIdx = cIdx;
        } else {
          // Calcula sobreposição de intervalo
          const sobrep = Math.max(0, Math.min(f.x + f.largura, fim) - Math.max(f.x, inicio));
          if (sobrep > maiorSobreposicao && sobrep > 0) {
            maiorSobreposicao = sobrep;
            melhorColunaIdx = cIdx;
          }
        }
      });

      if (melhorColunaIdx === -1) {
        // Encontra a coluna mais próxima
        let menorDist = Infinity;
        colunasValidas.forEach((col, cIdx) => {
          const dist = Math.min(Math.abs(centroF - col.xInicio), Math.abs(centroF - col.xFim));
          if (dist < menorDist) {
            menorDist = dist;
            melhorColunaIdx = cIdx;
          }
        });
      }

      if (melhorColunaIdx >= 0) {
        const textoExistente = linhaCelulas[melhorColunaIdx];
        linhaCelulas[melhorColunaIdx] = textoExistente
          ? `${textoExistente} ${f.texto.trim()}`
          : f.texto.trim();
      }
    }

    matriz.push(linhaCelulas.map((cel) => cel.trim()));
  }

  // 6. Extrai amostras para cada coluna
  colunasValidas.forEach((col, cIdx) => {
    const amostras: string[] = [];
    for (let r = 0; r < matriz.length; r++) {
      const val = matriz[r][cIdx];
      if (val && val.length > 0 && !amostras.includes(val)) {
        amostras.push(val);
        if (amostras.length >= 3) break;
      }
    }
    col.amostras = amostras;
  });

  const colunasResultado: ColunaDetectada[] = colunasValidas.map((c) => ({
    indice: c.indice,
    nome: c.nome,
    xInicio: Math.round(c.xInicio),
    xFim: Math.round(c.xFim),
    confianca: Number(c.confianca.toFixed(2)),
    amostras: c.amostras,
  }));

  return {
    colunas: colunasResultado,
    matriz,
  };
}
