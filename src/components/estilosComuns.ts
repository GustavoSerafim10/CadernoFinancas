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
  borderBottom: "1.5px solid var(--paper-linha)",
  background: "transparent",
  padding: "6px 2px",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
};

export const cartaoEstilo: CSSProperties = {
  border: "1.5px solid var(--ink)",
  borderRadius: 8,
  padding: "20px 22px",
  background: "rgba(255,255,255,0.25)",
};

export const botaoPrimario: CSSProperties = {
  padding: "8px 18px",
  borderRadius: 5,
  border: "1.5px solid var(--ink)",
  background: "var(--ink)",
  color: "var(--paper)",
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
};

export const botaoSecundario: CSSProperties = {
  padding: "7px 14px",
  borderRadius: 5,
  border: "1.5px solid var(--paper-linha)",
  background: "transparent",
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
