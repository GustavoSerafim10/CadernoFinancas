import { CSSProperties } from "react";

export const rotuloCampo: CSSProperties = {
  fontSize: 11,
  color: "var(--ink-soft)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
  display: "block",
};

export const campoInput: CSSProperties = {
  width: "100%",
  border: "none",
  borderBottom: "1.5px solid var(--border)",
  background: "transparent",
  padding: "6px 2px",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
};

export const cartaoEstilo: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "20px 22px",
  background: "var(--surface-glass)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
};

export const botaoPrimario: CSSProperties = {
  padding: "8px 18px",
  borderRadius: 8,
  border: "1.5px solid var(--accent-press)",
  background: "var(--accent-press)",
  color: "var(--ink)",
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 20px var(--accent-glow)",
};

export const botaoSecundario: CSSProperties = {
  padding: "7px 14px",
  borderRadius: 8,
  border: "1.5px solid var(--border-strong)",
  background: "var(--surface-glass)",
  color: "var(--ink-soft)",
  fontSize: 13,
  cursor: "pointer",
};

export const linkDiscreto: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontSize: 12.5,
  color: "var(--ink-soft)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

export const botaoGhost: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--ink-soft)",
  padding: 4,
  display: "flex",
  borderRadius: 6,
};

export function valorDestaque(cor?: string, tamanho = 20): CSSProperties {
  return { fontSize: tamanho, fontWeight: 700, color: cor || "var(--ink)" };
}

export function badgeEstilo(cor: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    color: cor,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${cor}`,
  };
}
