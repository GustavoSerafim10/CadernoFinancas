import { CSSProperties } from "react";
import { MESES } from "../constants";
import { IconeSeta, IconeCalendario } from "./Icones";

interface Props {
  refDate: Date;
  mudarMes: (delta: number) => void;
  corDestaque?: string;
  semMargem?: boolean;
}

export function SeletorMes({ refDate, mudarMes, corDestaque = "var(--accent)", semMargem = false }: Props) {
  const botaoSeta: CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "1px solid var(--border-strong)",
    background: "var(--surface-glass)",
    color: "var(--ink-soft)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: semMargem ? 0 : 28 }}>
      <button onClick={() => mudarMes(-1)} aria-label="Mês anterior" className="cf-btn cf-focus" style={botaoSeta}>
        <IconeSeta dir="left" />
      </button>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "6px 18px",
          background: "var(--surface-glass)",
          color: "var(--ink)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 14.5,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ display: "flex", color: corDestaque, flex: "0 0 auto" }}>
          <IconeCalendario />
        </span>
        {MESES[refDate.getMonth()]} · {refDate.getFullYear()}
      </div>
      <button onClick={() => mudarMes(1)} aria-label="Próximo mês" className="cf-btn cf-focus" style={botaoSeta}>
        <IconeSeta dir="right" />
      </button>
    </div>
  );
}
