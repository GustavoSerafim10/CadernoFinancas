/**
 * Valor atual de uma caixinha com rentabilidade automática, por juros
 * compostos mensais desde a data em que foi guardada até hoje. Meses
 * decorridos conta por diferença de mês-calendário (não dias/30), então um
 * depósito feito no fim do mês já conta como "1 mês" assim que vira o mês
 * seguinte — igual o banco fecha o rendimento mensal.
 */
export function calcularValorAtualCaixinha(valorAportado: number, dataInicioISO: string, taxaMensalPct: number): number {
  const inicio = new Date(dataInicioISO);
  const agora = new Date();
  const meses = Math.max(0, (agora.getFullYear() - inicio.getFullYear()) * 12 + (agora.getMonth() - inicio.getMonth()));
  return valorAportado * Math.pow(1 + taxaMensalPct / 100, meses);
}
