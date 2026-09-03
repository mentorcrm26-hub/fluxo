import { FragmentoTexto } from './extrair';

export interface LinhaFragmentos {
  pagina: number;
  yMedio: number;
  fragmentos: FragmentoTexto[];
}

function calcularMediana(numeros: number[]): number {
  if (numeros.length === 0) return 10;
  const ordenados = [...numeros].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 !== 0
    ? ordenados[meio]
    : (ordenados[meio - 1] + ordenados[meio]) / 2;
}

/**
 * Agrupa fragmentos no eixo Y baseado na mediana das alturas e tolerância
 */
export function agruparEmLinhas(fragmentos: FragmentoTexto[]): LinhaFragmentos[] {
  if (fragmentos.length === 0) return [];

  const alturas = fragmentos.map((f) => f.altura).filter((h) => h > 0);
  const medianaAltura = calcularMediana(alturas);
  const tolerancia = Math.max(3, medianaAltura * 0.5);

  // Agrupa primeiro por página
  const porPagina: Record<number, FragmentoTexto[]> = {};
  for (const f of fragmentos) {
    if (!porPagina[f.pagina]) porPagina[f.pagina] = [];
    porPagina[f.pagina].push(f);
  }

  const todasLinhas: LinhaFragmentos[] = [];
  const paginasOrdenadas = Object.keys(porPagina).map(Number).sort((a, b) => a - b);

  for (const pag of paginasOrdenadas) {
    const fragsDaPag = porPagina[pag];
    // Ordena por Y decrescente (topo para base)
    fragsDaPag.sort((a, b) => b.y - a.y);

    let linhaAtual: FragmentoTexto[] = [];
    let yReferencia = 0;

    for (const f of fragsDaPag) {
      if (linhaAtual.length === 0) {
        linhaAtual.push(f);
        yReferencia = f.y;
      } else {
        if (Math.abs(f.y - yReferencia) <= tolerancia) {
          linhaAtual.push(f);
          // Atualiza yReferencia como média móvel
          yReferencia = linhaAtual.reduce((acc, cur) => acc + cur.y, 0) / linhaAtual.length;
        } else {
          // Fecha linha anterior
          linhaAtual.sort((a, b) => a.x - b.x);
          todasLinhas.push({
            pagina: pag,
            yMedio: yReferencia,
            fragmentos: linhaAtual,
          });

          // Inicia nova linha
          linhaAtual = [f];
          yReferencia = f.y;
        }
      }
    }

    if (linhaAtual.length > 0) {
      linhaAtual.sort((a, b) => a.x - b.x);
      todasLinhas.push({
        pagina: pag,
        yMedio: yReferencia,
        fragmentos: linhaAtual,
      });
    }
  }

  return todasLinhas;
}
