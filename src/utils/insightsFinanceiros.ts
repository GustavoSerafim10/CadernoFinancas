import { ResumoMes, PontoHistorico, Metas, ResumoApostas, Recorrencia } from "../types";
import { catLabel } from "../constants";
import { formatarMoeda } from "./format";

export interface InsightItem {
  emoji: string;
  texto: string;
  tom: "positivo" | "atencao" | "neutro";
}

/**
 * Gera mensagens de insight a partir de regras matemáticas simples sobre os
 * dados já calculados no hook — sem IA. Cada regra só entra na lista quando
 * há dado suficiente pra ela fazer sentido (ex: comparação com mês anterior
 * exige que o mês anterior tenha alguma despesa lançada).
 */
export function calcularInsightsFinanceiros(
  resumoMes: ResumoMes,
  resumoMesAnterior: ResumoMes,
  historicoMensal: PontoHistorico[],
  metas: Metas,
  resumoApostas: ResumoApostas,
  recorrencias: Recorrencia[]
): InsightItem[] {
  const itens: InsightItem[] = [];

  if (resumoMesAnterior.gastos > 0) {
    const variacao = ((resumoMes.gastos - resumoMesAnterior.gastos) / resumoMesAnterior.gastos) * 100;
    if (Math.abs(variacao) >= 3) {
      itens.push({
        emoji: variacao < 0 ? "💡" : "⚠️",
        texto: `Seus gastos ${variacao < 0 ? "caíram" : "subiram"} ${Math.round(Math.abs(variacao))}% em relação ao mês anterior.`,
        tom: variacao < 0 ? "positivo" : "atencao",
      });
    }
  }

  if (resumoMes.receita > 0 && resumoMes.gastos > 0) {
    const pctGastos = (resumoMes.gastos / resumoMes.receita) * 100;
    itens.push({
      emoji: "📉",
      texto: `Seus gastos representam ${Math.round(pctGastos)}% da sua receita este mês.`,
      tom: pctGastos >= 80 ? "atencao" : "neutro",
    });
  }

  if (resumoMes.receita > 0) {
    const taxa = (resumoMes.saldo / resumoMes.receita) * 100;
    itens.push({
      emoji: taxa >= 0 ? "💰" : "⚠️",
      texto:
        taxa >= 0
          ? `Sobrou ${Math.round(taxa)}% da sua renda este mês, ainda sem destino.`
          : `Seus gastos superaram a renda em ${Math.round(Math.abs(taxa))}% este mês.`,
      tom: taxa >= 20 ? "positivo" : taxa >= 0 ? "neutro" : "atencao",
    });
  }

  if (resumoMes.saldo > 0) {
    itens.push({
      emoji: "🎯",
      texto: `Com o saldo livre deste mês, você tem aproximadamente ${formatarMoeda(resumoMes.saldo)} de margem pra investir sem comprometer o que já está reservado.`,
      tom: "positivo",
    });
  }

  const totalGastos = resumoMes.porCategoria.reduce((s, c) => s + c.total, 0);
  if (totalGastos > 0) {
    const maior = [...resumoMes.porCategoria].sort((a, b) => b.total - a.total)[0];
    const pct = Math.round((maior.total / totalGastos) * 100);
    itens.push({
      emoji: "📊",
      texto: `${maior.label} representa ${pct}% das suas despesas este mês.`,
      tom: pct >= 40 ? "atencao" : "neutro",
    });
  }

  const recorrentesAtivas = recorrencias.filter((r) => r.ativa && r.tipo === "gasto");
  if (recorrentesAtivas.length > 0) {
    const totalMensal = recorrentesAtivas.reduce((s, r) => s + r.valor, 0);
    itens.push({
      emoji: "🔁",
      texto: `Você tem ${recorrentesAtivas.length} gasto(s) recorrente(s) somando ${formatarMoeda(totalMensal)}/mês — projetando ${formatarMoeda(totalMensal * 12)} em 12 meses.`,
      tom: "neutro",
    });
  }

  const categoriasComMeta = Object.entries(metas).filter(([, limite]) => limite > 0);
  if (categoriasComMeta.length === 0) {
    itens.push({
      emoji: "🎯",
      texto: "Você ainda não definiu orçamento para nenhuma categoria.",
      tom: "neutro",
    });
  } else {
    categoriasComMeta.forEach(([catId, limite]) => {
      const gasto = resumoMes.porCategoria.find((c) => c.id === catId)?.total || 0;
      const pct = (gasto / limite) * 100;
      if (pct >= 90) {
        itens.push({
          emoji: pct >= 100 ? "🚨" : "🎯",
          texto: `Você já usou ${Math.round(pct)}% do orçamento de ${catLabel(catId)}.`,
          tom: pct >= 100 ? "atencao" : "neutro",
        });
      }
    });
  }

  const mesesComDado = historicoMensal.filter((h) => h.receita > 0 || h.gastos > 0);
  if (mesesComDado.length >= 2) {
    const saldos = mesesComDado.map((h) => h.receita - h.gastos - h.investido + h.lucroApostas);
    const acumulado = saldos.reduce((s, v) => s + v, 0);
    const media = acumulado / saldos.length;
    const alvo = 5000;
    const faltam = alvo - acumulado;
    if (media > 0 && faltam > 0) {
      const meses = Math.ceil(faltam / media);
      itens.push({
        emoji: "📈",
        texto: `Mantendo a média de ${formatarMoeda(media)}/mês, você pode acumular R$ 5.000 em aproximadamente ${meses} ${meses === 1 ? "mês" : "meses"}.`,
        tom: "positivo",
      });
    }
  }

  if (resumoApostas.ganhas + resumoApostas.perdidas > 0) {
    itens.push({
      emoji: resumoApostas.lucro >= 0 ? "🎲" : "⚠️",
      texto: `Suas operações resolvidas este mês tiveram ${Math.round(resumoApostas.taxaAcerto)}% de acerto, com lucro líquido de ${formatarMoeda(resumoApostas.lucro)}.`,
      tom: resumoApostas.lucro >= 0 ? "positivo" : "atencao",
    });
  }

  return itens;
}
