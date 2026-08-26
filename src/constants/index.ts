export interface Categoria {
  id: string;
  label: string;
  cor: string;
}

export const CATEGORIAS: Categoria[] = [
  { id: "moradia", label: "Moradia", cor: "#5B4A3F" },
  { id: "alimentacao", label: "Alimentação", cor: "#A8462B" },
  { id: "transporte", label: "Transporte", cor: "#8A5A2B" },
  { id: "lazer", label: "Lazer", cor: "#6B5B95" },
  { id: "saude", label: "Saúde", cor: "#2E7D6B" },
  { id: "educacao", label: "Educação", cor: "#2B5D8A" },
  { id: "outros", label: "Outros", cor: "#7A7166" },
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

export type PaginaId = "dashboard" | "extrato" | "investimentos" | "metas";

export interface PaginaDef {
  id: PaginaId;
  label: string;
  cor: string;
}

export const PAGINAS: PaginaDef[] = [
  { id: "dashboard", label: "Dashboard", cor: "#20303F" },
  { id: "extrato", label: "Extrato", cor: "#A8462B" },
  { id: "investimentos", label: "Investimentos", cor: "#2E7D5E" },
  { id: "metas", label: "Metas", cor: "#B8862B" },
];

export function catLabel(id: string | null): string {
  return CATEGORIAS.find((c) => c.id === id)?.label || "—";
}

export function catCor(id: string | null): string {
  return CATEGORIAS.find((c) => c.id === id)?.cor || "#7A7166";
}
