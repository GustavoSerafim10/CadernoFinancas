import { ResumoMes, Metas } from "../types";

export interface SaudeFinanceira {
  score: number;
  rotulo: string;
  bullets: { texto: string; positivo: boolean }[];
}

/**
 * Score 0-100 combinando taxa de poupança (peso 50), tendência de gastos vs
 * mês anterior (peso 30) e aderência às metas por categoria (peso 20).
 * Cada fator cai pra um valor neutro (60) quando não há dado suficiente
 * pra calculá-lo, em vez de zerar o score por falta de histórico.
 */
export function calcularSaudeFinanceira(
  resumoMes: ResumoMes,
  resumoMesAnterior: ResumoMes,
  metas: Metas
): SaudeFinanceira {
  const bullets: { texto: string; positivo: boolean }[] = [];

  const taxaPoupanca = resumoMes.receita > 0 ? resumoMes.saldo / resumoMes.receita : 0;
  const scorePoupanca = Math.max(0, Math.min(100, (taxaPoupanca / 0.4) * 100));

  let scoreTendencia = 60;
  if (resumoMesAnterior.gastos > 0) {
    const variacao = (resumoMes.gastos - resumoMesAnterior.gastos) / resumoMesAnterior.gastos;
    scoreTendencia = Math.max(0, Math.min(100, 100 - variacao * 150));
    if (variacao <= -0.05) {
      bullets.push({ texto: `Gastos caíram ${Math.round(Math.abs(variacao) * 100)}% vs mês anterior`, positivo: true });
    } else if (variacao >= 0.05) {
      bullets.push({ texto: `Gastos subiram ${Math.round(variacao * 100)}% vs mês anterior`, positivo: false });
    }
  }

  const categoriasComMeta = Object.keys(metas).filter((id) => metas[id] > 0);
  let scoreMetas = 60;
  if (categoriasComMeta.length > 0) {
    const dentroDoOrcamento = categoriasComMeta.filter((id) => {
      const gastoCat = resumoMes.porCategoria.find((c) => c.id === id)?.total || 0;
      return gastoCat <= metas[id];
    }).length;
    scoreMetas = (dentroDoOrcamento / categoriasComMeta.length) * 100;
    bullets.push(
      dentroDoOrcamento === categoriasComMeta.length
        ? { texto: "Dentro do orçamento em todas as categorias com meta", positivo: true }
        : { texto: `${categoriasComMeta.length - dentroDoOrcamento} categoria(s) acima da meta`, positivo: false }
    );
  }

  if (resumoMes.receita > 0) {
    bullets.push(
      resumoMes.saldo >= 0
        ? { texto: "Saldo positivo este mês", positivo: true }
        : { texto: "Gastos superaram a receita este mês", positivo: false }
    );
  }

  const score = Math.round(scorePoupanca * 0.5 + scoreTendencia * 0.3 + scoreMetas * 0.2);
  const rotulo = score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Regular" : "Atenção necessária";

  return { score: Math.max(0, Math.min(100, score)), rotulo, bullets: bullets.slice(0, 3) };
}
