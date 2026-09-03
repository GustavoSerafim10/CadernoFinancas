import { ReactNode } from "react";
import { cartaoEstilo } from "./estilosComuns";
import { IconeMenuPontos } from "./Icones";

interface Props {
  titulo: string;
  acao?: ReactNode;
  rodape?: ReactNode;
  children: ReactNode;
  /** Só para painéis onde o conteúdo é puramente um gráfico sem tabela/texto equivalente ao lado — dá um resumo pra leitor de tela em vez do SVG cru. */
  resumoGrafico?: string;
}

export function Painel({ titulo, acao, rodape, children, resumoGrafico }: Props) {
  return (
    <div className="cf-card" style={{ ...cartaoEstilo, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", margin: 0 }}>
          {titulo}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
          {acao}
          <span aria-hidden="true" style={{ color: "var(--ink-soft)", display: "flex", opacity: 0.6 }}>
            <IconeMenuPontos />
          </span>
        </div>
      </div>
      <div
        style={{ flex: 1, minHeight: 0 }}
        {...(resumoGrafico ? { role: "img", "aria-label": resumoGrafico } : {})}
      >
        {children}
      </div>
      {rodape && <div style={{ marginTop: 14 }}>{rodape}</div>}
    </div>
  );
}
