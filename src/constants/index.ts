export interface Categoria {
  id: string;
  label: string;
  cor: string;
}

export const CATEGORIAS: Categoria[] = [
  { id: "moradia", label: "Moradia", cor: "#60A5FA" },
  { id: "alimentacao", label: "Alimentação", cor: "#FB7185" },
  { id: "transporte", label: "Transporte", cor: "#FBBF24" },
  { id: "lazer", label: "Lazer", cor: "#34D399" },
  { id: "saude", label: "Saúde", cor: "#2DD4BF" },
  { id: "educacao", label: "Educação", cor: "#A78BFA" },
  { id: "compras", label: "Compras", cor: "#F472B6" },
  { id: "assinaturas", label: "Assinaturas", cor: "#818CF8" },
  { id: "telefonia", label: "Telefonia & Internet", cor: "#38BDF8" },
  { id: "cuidados-pessoais", label: "Cuidados pessoais", cor: "#FB923C" },
  { id: "casa", label: "Casa", cor: "#CA8A04" },
  { id: "impostos-taxas", label: "Impostos & Taxas", cor: "#EF4444" },
  { id: "dividas-parcelamentos", label: "Dívidas / Parcelamentos", cor: "#B91C1C" },
  { id: "presentes", label: "Presentes", cor: "#E879F9" },
  { id: "viagem", label: "Viagem", cor: "#22D3EE" },
  { id: "apostas", label: "Apostas", cor: "#C084FC" },
  { id: "outros", label: "Outros", cor: "#94A3B8" },
];

export const TIPOS_INVESTIMENTO = [
  "Renda Fixa",
  "Ações",
  "FIIs",
  "Tesouro Direto",
  "Cripto",
  "Outro",
] as const;

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export type PaginaId = "dashboard" | "extrato" | "investimentos" | "apostas" | "simulador" | "metas";

export interface PaginaDef {
  id: PaginaId;
  label: string;
}

export const PAGINAS: PaginaDef[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "extrato", label: "Extrato" },
  { id: "investimentos", label: "Investimentos" },
  { id: "apostas", label: "Apostas" },
  { id: "simulador", label: "Simulador" },
  { id: "metas", label: "Metas" },
];

export function catLabel(id: string | null): string {
  return CATEGORIAS.find((c) => c.id === id)?.label || "—";
}

export function catCor(id: string | null): string {
  return CATEGORIAS.find((c) => c.id === id)?.cor || "#94A3B8";
}
