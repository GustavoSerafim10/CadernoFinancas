/**
 * Valor atual de um investimento com rentabilidade automática, por juros
 * compostos mensais desde a data do aporte até hoje. Meses decorridos conta
 * por diferença de mês-calendário (não dias/30), então um aporte feito no
 * fim do mês já conta como "1 mês" assim que vira o mês seguinte — igual o
 * banco fecha o rendimento mensal. É uma estimativa a taxa fixa: serve bem
 * pra Caixinha (renda fixa de verdade) ou como aproximação do dividend
 * yield médio de algo como um FII, mas não reflete a variação real de preço
 * de mercado de ativos como ações, FIIs ou cripto.
 */
export function calcularValorComRentabilidadeMensal(valorAportado: number, dataInicioISO: string, taxaMensalPct: number): number {
  const inicio = new Date(dataInicioISO);
  const agora = new Date();
  const meses = Math.max(0, (agora.getFullYear() - inicio.getFullYear()) * 12 + (agora.getMonth() - inicio.getMonth()));
  return valorAportado * Math.pow(1 + taxaMensalPct / 100, meses);
}
