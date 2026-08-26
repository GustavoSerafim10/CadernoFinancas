import { CSSProperties } from "react";
import { MESES } from "../constants";
import { IconeSeta } from "./Icones";

interface Props {
  refDate: Date;
  mudarMes: (delta: number) => void;
  corDestaque?: string;
}

export function SeletorMes({ refDate, mudarMes, corDestaque = "var(--rust)" }: Props) {
  const botaoSeta: CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "1.5px solid var(--ink)",
    background: "transparent",
    color: "var(--ink)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
      <button onClick={() => mudarMes(-1)} aria-label="Mês anterior" className="cf-btn cf-focus" style={botaoSeta}>
        <IconeSeta dir="left" />
      </button>
      <div
        style={{
          border: `2px solid ${corDestaque}`,
          borderRadius: 6,
          padding: "6px 20px",
          transform: "rotate(-1.2deg)",
          color: corDestaque,
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          userSelect: "none",
        }}
      >
        {MESES[refDate.getMonth()]} · {refDate.getFullYear()}
      </div>
      <button onClick={() => mudarMes(1)} aria-label="Próximo mês" className="cf-btn cf-focus" style={botaoSeta}>
        <IconeSeta dir="right" />
      </button>
    </div>
  );
}
