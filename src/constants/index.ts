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

export type PaginaId = "dashboard" | "extrato" | "investimentos" | "apostas" | "metas";

export interface PaginaDef {
  id: PaginaId;
  label: string;
}

export const PAGINAS: PaginaDef[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "extrato", label: "Extrato" },
  { id: "investimentos", label: "Investimentos" },
  { id: "apostas", label: "Apostas" },
  { id: "metas", label: "Metas" },
];

export function catLabel(id: string | null): string {
  return CATEGORIAS.find((c) => c.id === id)?.label || "—";
}

export function catCor(id: string | null): string {
  return CATEGORIAS.find((c) => c.id === id)?.cor || "#7A7166";
}
