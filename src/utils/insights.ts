import { Transacao, Insight } from "../types";
import { mesesAnteriores } from "./date";

/**
 * Compara o gasto de cada categoria no mês atual com a média dos até 3 meses
 * anteriores. Retorna as categorias em que o gasto atual superou a média em
 * mais de 20%, ordenadas da maior variação para a menor.
 */
export function calcularInsights(transacoes: Transacao[], monthKey: string): Insight[] {
  const anteriores = mesesAnteriores(monthKey, 3);

  const atual: Record<string, number> = {};
  transacoes
    .filter((t) => t.tipo === "gasto" && t.data.startsWith(monthKey) && t.categoria)
    .forEach((t) => {
      const cat = t.categoria as string;
      atual[cat] = (atual[cat] || 0) + t.valor;
    });

  const historico: Record<string, { soma: number; count: number }> = {};
  anteriores.forEach((mk) => {
    const porCategoria: Record<string, number> = {};
    transacoes
      .filter((t) => t.tipo === "gasto" && t.data.startsWith(mk) && t.categoria)
      .forEach((t) => {
        const cat = t.categoria as string;
        porCategoria[cat] = (porCategoria[cat] || 0) + t.valor;
      });
    Object.entries(porCategoria).forEach(([cat, valor]) => {
      if (!historico[cat]) historico[cat] = { soma: 0, count: 0 };
      historico[cat].soma += valor;
      historico[cat].count += 1;
    });
  });

  const insights: Insight[] = [];
  Object.entries(atual).forEach(([categoria, val]) => {
    const h = historico[categoria];
    if (h && h.count > 0) {
      const media = h.soma / h.count;
      if (media > 0 && val > media * 1.2) {
        insights.push({ categoria, pct: ((val - media) / media) * 100, val, media });
      }
    }
  });

  return insights.sort((a, b) => b.pct - a.pct).slice(0, 3);
}
