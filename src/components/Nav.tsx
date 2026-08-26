import { motion } from "framer-motion";
import { PAGINAS, PaginaId } from "../constants";

interface Props {
  pagina: PaginaId;
  setPagina: (p: PaginaId) => void;
}

export function Nav({ pagina, setPagina }: Props) {
  return (
    <nav
      style={{
        display: "flex",
        gap: 4,
        marginBottom: 32,
        flexWrap: "wrap",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {PAGINAS.map((p) => {
        const ativa = pagina === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setPagina(p.id)}
            className="cf-tab cf-focus"
            style={{
              position: "relative",
              padding: "10px 18px",
              fontSize: 13.5,
              letterSpacing: "0.02em",
              color: ativa ? "var(--ink)" : "var(--ink-soft)",
              transition: "color 0.15s ease",
            }}
          >
            {p.label}
            {ativa && (
              <motion.div
                layoutId="nav-indicador"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                style={{
                  position: "absolute",
                  left: 6,
                  right: 6,
                  bottom: -1,
                  height: 2,
                  borderRadius: 2,
                  background: "var(--accent)",
                  boxShadow: "0 0 12px var(--accent-glow)",
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
