/**
 * Utilitários monetários. Todos os valores são inteiros em centavos.
 * A moeda do projeto é o Dólar Americano ($ / USD).
 */

export function formatarUSD(centavos: number): string {
  const dolares = (centavos || 0) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dolares);
}

// Aliases para moeda padrão
export const formatarMoeda = formatarUSD;
export const formatarBRL = formatarUSD;

export function formatarUSDCurto(centavos: number): string {
  const dolares = (centavos || 0) / 100;
  if (Math.abs(dolares) >= 1_000_000) {
    const valor = (dolares / 1_000_000).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
    return `$${valor}M`;
  }
  if (Math.abs(dolares) >= 1_000) {
    const valor = (dolares / 1_000).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
    return `$${valor}k`;
  }
  return formatarUSD(centavos);
}

export const formatarMoedaCurto = formatarUSDCurto;
export const formatarBRLCurto = formatarUSDCurto;

export function parsearUSD(texto: string): number {
  if (!texto) return 0;
  // Limpa caracteres que não sejam dígitos, vírgula ou ponto
  const limpo = texto.replace(/[^\d,.-]/g, '').trim();
  if (!limpo) return 0;

  // Se contiver tanto . quanto , (ex: 12,400.00 ou 12.400,00)
  if (limpo.includes(',') && limpo.includes('.')) {
    const ultimoPonto = limpo.lastIndexOf('.');
    const ultimaVirgula = limpo.lastIndexOf(',');
    if (ultimoPonto > ultimaVirgula) {
      // Formato americano padrão: 12,400.50
      const partes = limpo.split('.');
      const inteiros = partes[0].replace(/,/g, '');
      const decimais = (partes[1] || '0').padEnd(2, '0').slice(0, 2);
      const totalCentavos = parseInt(`${inteiros}${decimais}`, 10);
      return isNaN(totalCentavos) ? 0 : totalCentavos;
    } else {
      // Formato com vírgula no final: 12.400,50
      const partes = limpo.split(',');
      const inteiros = partes[0].replace(/\./g, '');
      const decimais = (partes[1] || '0').padEnd(2, '0').slice(0, 2);
      const totalCentavos = parseInt(`${inteiros}${decimais}`, 10);
      return isNaN(totalCentavos) ? 0 : totalCentavos;
    }
  }

  // Se tiver apenas vírgula (ex: 12400,00)
  if (limpo.includes(',') && !limpo.includes('.')) {
    const partes = limpo.split(',');
    const inteiros = partes[0];
    const decimais = (partes[1] || '0').padEnd(2, '0').slice(0, 2);
    const totalCentavos = parseInt(`${inteiros}${decimais}`, 10);
    return isNaN(totalCentavos) ? 0 : totalCentavos;
  }

  // Se tiver apenas ponto decimal (ex: 12400.50)
  if (limpo.includes('.')) {
    const partes = limpo.split('.');
    const inteiros = partes[0];
    const decimais = (partes[1] || '0').padEnd(2, '0').slice(0, 2);
    const totalCentavos = parseInt(`${inteiros}${decimais}`, 10);
    return isNaN(totalCentavos) ? 0 : totalCentavos;
  }

  const numero = parseFloat(limpo);
  if (isNaN(numero)) return 0;
  return Math.round(numero * 100);
}

export const parsearMoeda = parsearUSD;
export const parsearBRL = parsearUSD;

export function calcularMinhaParteCentavos(
  valorTotalCentavos: number,
  porcentagem: number = 45
): number {
  const perc = isNaN(porcentagem) || porcentagem < 0 ? 45 : porcentagem;
  return Math.round(((valorTotalCentavos || 0) * perc) / 100);
}
