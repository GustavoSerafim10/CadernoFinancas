import { ReactNode } from "react";
import { motion } from "framer-motion";
import { PAGINAS, PaginaId } from "../constants";

interface Props {
  pagina: PaginaId;
  setPagina: (p: PaginaId) => void;
  right?: ReactNode;
}

export function TopTabs({ pagina, setPagina, right }: Props) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 14,
        marginBottom: 24,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="cf-tabs-lista">
        {PAGINAS.map((p) => {
          const ativa = pagina === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPagina(p.id)}
              aria-current={ativa ? "page" : undefined}
              className="cf-focus"
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 4px 12px",
                fontSize: 13.5,
                fontWeight: 600,
                color: ativa ? "var(--ink)" : "var(--ink-soft)",
                flex: "0 0 auto",
                whiteSpace: "nowrap",
              }}
            >
              {p.label}
              {ativa && (
                <motion.div
                  layoutId="top-tabs-indicador"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "var(--accent)", borderRadius: 2 }}
                />
              )}
            </button>
          );
        })}
      </div>
      {right && <div style={{ paddingBottom: 12 }}>{right}</div>}
    </nav>
  );
}
