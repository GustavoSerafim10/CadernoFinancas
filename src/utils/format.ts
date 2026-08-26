export function formatarMoeda(v: number): string {
  return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

/**
 * Converte texto digitado em número, aceitando tanto "1234,56" quanto o
 * formato brasileiro com separador de milhar "1.234,56". Com um único "."
 * e sem vírgula, assume milhar quando há 3+ dígitos após o ponto (ou mais
 * de um ponto) e decimal caso contrário — cobre tanto "1.234" (mil e
 * duzentos... digitado sem vírgula) quanto "12.50" (decimal via ponto).
 */
export function parseMoeda(bruto: string): number | null {
  const s = bruto.trim();
  if (!s) return null;

  const temVirgula = s.includes(",");
  const temPonto = s.includes(".");

  let normalizado: string;
  if (temVirgula && temPonto) {
    normalizado = s.replace(/\./g, "").replace(",", ".");
  } else if (temVirgula) {
    normalizado = s.replace(",", ".");
  } else if (temPonto) {
    const partes = s.split(".");
    const ultima = partes[partes.length - 1];
    normalizado = partes.length > 2 || ultima.length === 3 ? partes.join("") : s;
  } else {
    normalizado = s;
  }

  const v = parseFloat(normalizado);
  return isNaN(v) ? null : v;
}
