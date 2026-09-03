import { Projeto, StatusRecebimento } from './dados/tipos';
import { adicionarDiasCorridos, diferencaDiasCalendario, obterHojeISO } from './datas';

/**
 * Regra central do app: prazos, recebimentos e urgência
 */

export function calcularRecebimentoPrevisto(concluidoEm: Date | string, janelaDias: number = 10): string {
  return adicionarDiasCorridos(concluidoEm, janelaDias);
}

export function diasAte(dataISO: string): number {
  return diferencaDiasCalendario(dataISO, obterHojeISO());
}

export function derivarStatusRecebimento(projeto: Projeto): StatusRecebimento {
  if (projeto.recebidoEm !== null) {
    return 'recebido';
  }
  if (projeto.status !== 'finalizado') {
    return 'pendente';
  }
  if (!projeto.recebimentoPrevistoPara) {
    return 'a_receber';
  }

  const dias = diasAte(projeto.recebimentoPrevistoPara);
  if (dias < 0) {
    return 'atrasado';
  }
  return 'a_receber';
}

export function nivelUrgencia(dias: number | null): 'neutro' | 'alerta' | 'critico' {
  if (dias === null || dias > 3) {
    return 'neutro';
  }
  if (dias >= 0) {
    return 'alerta';
  }
  return 'critico';
}

export function formatarMensagemPrazoRecebimento(dias: number | null, statusRecebimento: StatusRecebimento): string {
  if (statusRecebimento === 'recebido') {
    return 'Recebido';
  }
  if (statusRecebimento === 'pendente') {
    return 'Pendente de finalização';
  }
  if (dias === null) {
    return 'A definir';
  }
  if (dias < 0) {
    const atraso = Math.abs(dias);
    return `Atrasado há ${atraso} ${atraso === 1 ? 'dia' : 'dias'}`;
  }
  if (dias === 0) {
    return 'Vence hoje';
  }
  if (dias === 1) {
    return 'Vence amanhã';
  }
  return `Recebe em ${dias} dias`;
}
