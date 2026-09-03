import { format, parseISO, startOfDay, differenceInCalendarDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Utilitários para formatação e manipulação de datas no padrão pt-BR
 */

export function obterHojeISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatarDataExtenso(data: Date = new Date()): string {
  return format(data, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatarDataCurta(dataStr: string | null | undefined): string {
  if (!dataStr) return '—';
  try {
    const data = typeof dataStr === 'string' && dataStr.length === 10
      ? parseISO(dataStr)
      : new Date(dataStr);
    return format(data, 'dd/MM/yyyy');
  } catch {
    return '—';
  }
}

export function formatarDataDiaMes(dataStr: string | null | undefined): string {
  if (!dataStr) return '—';
  try {
    const data = typeof dataStr === 'string' && dataStr.length === 10
      ? parseISO(dataStr)
      : new Date(dataStr);
    return format(data, 'dd/MM');
  } catch {
    return '—';
  }
}

export function formatarDataHora(dataStr: string | null | undefined): string {
  if (!dataStr) return '—';
  try {
    const data = new Date(dataStr);
    return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '—';
  }
}

export function diferencaDiasCalendario(dataFutura: Date | string, dataBase: Date | string = new Date()): number {
  const d1 = typeof dataFutura === 'string' ? parseISO(dataFutura.slice(0, 10)) : startOfDay(dataFutura);
  const d2 = typeof dataBase === 'string' ? parseISO(dataBase.slice(0, 10)) : startOfDay(dataBase);
  return differenceInCalendarDays(d1, d2);
}

export function adicionarDiasCorridos(dataBase: Date | string, dias: number): string {
  const base = typeof dataBase === 'string' ? parseISO(dataBase.slice(0, 10)) : dataBase;
  const resultado = addDays(base, dias);
  return format(resultado, 'yyyy-MM-dd');
}

export function obterSaudacao(hora: number = new Date().getHours()): string {
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}
