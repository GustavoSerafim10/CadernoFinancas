import { ReactNode } from "react";
import { cartaoEstilo } from "./estilosComuns";
import { IconeMenuPontos } from "./Icones";

interface Props {
  titulo: string;
  acao?: ReactNode;
  rodape?: ReactNode;
  children: ReactNode;
}

export function Painel({ titulo, acao, rodape, children }: Props) {
  return (
    <div className="cf-card" style={{ ...cartaoEstilo, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {titulo}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
          {acao}
          <span style={{ color: "var(--ink-soft)", display: "flex", opacity: 0.6 }}>
            <IconeMenuPontos />
          </span>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      {rodape && <div style={{ marginTop: 14 }}>{rodape}</div>}
    </div>
  );
}
