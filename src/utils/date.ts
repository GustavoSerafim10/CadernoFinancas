export function chaveDoMes(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function mesesAnteriores(monthKey: string, n: number): string[] {
  const [ano, mes] = monthKey.split("-").map(Number);
  const out: string[] = [];
  for (let i = 1; i <= n; i++) {
    let m = mes - i;
    let a = ano;
    if (m <= 0) {
      m += 12;
      a -= 1;
    }
    out.push(`${a}-${String(m).padStart(2, "0")}`);
  }
  return out;
}

export function diasNoMes(monthKey: string): number {
  const [ano, mes] = monthKey.split("-").map(Number);
  return new Date(ano, mes, 0).getDate();
}

export function gerarId(prefixo: string): string {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
