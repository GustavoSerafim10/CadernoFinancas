import { ResumoMes, Metas } from "../types";

export interface FatorSaude {
  label: string;
  detalhe: string;
  pontos: number;
  maxPontos: number;
  tom: "bom" | "atencao" | "neutro";
}

export interface SaudeFinanceira {
  score: number;
  rotulo: string;
  bullets: { texto: string; positivo: boolean }[];
  fatores: FatorSaude[];
}

/**
 * Score 0-100 combinando taxa de poupança (peso 50), tendência de gastos vs
 * mês anterior (peso 30) e aderência às metas por categoria (peso 20).
 * Cada fator cai pra um valor neutro (60% do peso) quando não há dado
 * suficiente pra calculá-lo, em vez de zerar o score por falta de
 * histórico. `fatores` expõe a contribuição de cada um por extenso, pra
 * responder "por que minha nota é essa" em vez de só mostrar o número.
 */
export function calcularSaudeFinanceira(
  resumoMes: ResumoMes,
  resumoMesAnterior: ResumoMes,
  metas: Metas
): SaudeFinanceira {
  const bullets: { texto: string; positivo: boolean }[] = [];
  const fatores: FatorSaude[] = [];

  const PESO_POUPANCA = 50;
  const PESO_TENDENCIA = 30;
  const PESO_METAS = 20;

  const taxaPoupanca = resumoMes.receita > 0 ? resumoMes.saldo / resumoMes.receita : 0;
  const scorePoupanca = resumoMes.receita > 0 ? Math.max(0, Math.min(100, (taxaPoupanca / 0.4) * 100)) : 60;
  fatores.push({
    label: "Capacidade de poupança",
    detalhe:
      resumoMes.receita > 0
        ? taxaPoupanca >= 0
          ? `Sobrou ${Math.round(taxaPoupanca * 100)}% da renda este mês, ainda sem destino`
          : `Gastos superaram a renda em ${Math.round(Math.abs(taxaPoupanca) * 100)}% este mês`
        : "Sem receita lançada este mês ainda",
    pontos: Math.round((scorePoupanca / 100) * PESO_POUPANCA),
    maxPontos: PESO_POUPANCA,
    tom: taxaPoupanca >= 0.2 ? "bom" : taxaPoupanca >= 0 ? "neutro" : "atencao",
  });

  let scoreTendencia = 60;
  if (resumoMesAnterior.gastos > 0) {
    const variacao = (resumoMes.gastos - resumoMesAnterior.gastos) / resumoMesAnterior.gastos;
    scoreTendencia = Math.max(0, Math.min(100, 100 - variacao * 150));
    if (variacao <= -0.05) {
      bullets.push({ texto: `Gastos caíram ${Math.round(Math.abs(variacao) * 100)}% vs mês anterior`, positivo: true });
    } else if (variacao >= 0.05) {
      bullets.push({ texto: `Gastos subiram ${Math.round(variacao * 100)}% vs mês anterior`, positivo: false });
    }
    fatores.push({
      label: "Tendência de gastos",
      detalhe:
        variacao <= 0
          ? `Gastos caíram ${Math.round(Math.abs(variacao) * 100)}% vs mês anterior`
          : `Gastos subiram ${Math.round(variacao * 100)}% vs mês anterior`,
      pontos: Math.round((scoreTendencia / 100) * PESO_TENDENCIA),
      maxPontos: PESO_TENDENCIA,
      tom: variacao <= -0.05 ? "bom" : variacao >= 0.05 ? "atencao" : "neutro",
    });
  } else {
    fatores.push({
      label: "Tendência de gastos",
      detalhe: "Ainda sem mês anterior pra comparar",
      pontos: Math.round((scoreTendencia / 100) * PESO_TENDENCIA),
      maxPontos: PESO_TENDENCIA,
      tom: "neutro",
    });
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
    fatores.push({
      label: "Aderência às metas",
      detalhe:
        dentroDoOrcamento === categoriasComMeta.length
          ? `Dentro do orçamento nas ${categoriasComMeta.length} categoria(s) com meta`
          : `${categoriasComMeta.length - dentroDoOrcamento} de ${categoriasComMeta.length} categoria(s) acima da meta`,
      pontos: Math.round((scoreMetas / 100) * PESO_METAS),
      maxPontos: PESO_METAS,
      tom: dentroDoOrcamento === categoriasComMeta.length ? "bom" : "atencao",
    });
  } else {
    fatores.push({
      label: "Aderência às metas",
      detalhe: "Nenhuma meta de categoria definida ainda",
      pontos: Math.round((scoreMetas / 100) * PESO_METAS),
      maxPontos: PESO_METAS,
      tom: "neutro",
    });
  }

  if (resumoMes.receita > 0) {
    bullets.push(
      resumoMes.saldo >= 0
        ? { texto: "Saldo positivo este mês", positivo: true }
        : { texto: "Gastos superaram a receita este mês", positivo: false }
    );
  }

  // A pontuação total é a soma dos pontos já arredondados de cada fator (não
  // uma média arredondada à parte) — assim o "Ver detalhes" sempre soma
  // exatamente pro número mostrado no card, sem discrepância de arredondamento.
  const score = fatores.reduce((s, f) => s + f.pontos, 0);
  const rotulo = score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Regular" : "Atenção necessária";

  return { score: Math.max(0, Math.min(100, score)), rotulo, bullets: bullets.slice(0, 3), fatores };
}
