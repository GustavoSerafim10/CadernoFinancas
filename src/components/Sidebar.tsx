import { motion } from "framer-motion";
import { PAGINAS, PaginaId } from "../constants";
import {
  IconeDashboard, IconeExtrato, IconeInvestimentos, IconeApostas, IconeSimulador, IconeMetas,
} from "./Icones";

interface Props {
  pagina: PaginaId;
  setPagina: (p: PaginaId) => void;
}

const ICONES: Record<PaginaId, () => React.ReactElement> = {
  dashboard: IconeDashboard,
  extrato: IconeExtrato,
  investimentos: IconeInvestimentos,
  apostas: IconeApostas,
  simulador: IconeSimulador,
  metas: IconeMetas,
};

export function Sidebar({ pagina, setPagina }: Props) {
  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: 76,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "20px 0",
        background: "rgba(10, 10, 15, 0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRight: "1px solid var(--border)",
      }}
    >
      <div style={{ marginBottom: 18 }} title="Nightfolio">
        <svg width="30" height="30" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="8" fill="#0a0a0f" />
          <path d="M21 5a12 12 0 1 0 6 20A10 10 0 0 1 21 5Z" fill="#7c6cf6" />
          <path
            d="M8 21l4.5-5.5 3.3 3 6.2-8"
            stroke="#f4f4f8"
            strokeWidth="2.1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {PAGINAS.map((p) => {
        const ativa = pagina === p.id;
        const Icone = ICONES[p.id];
        return (
          <button
            key={p.id}
            onClick={() => setPagina(p.id)}
            title={p.label}
            aria-label={p.label}
            aria-current={ativa ? "page" : undefined}
            className="cf-focus"
            style={{
              position: "relative",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: ativa ? "var(--ink)" : "var(--ink-soft)",
              borderRadius: 12,
            }}
          >
            {ativa && (
              <motion.div
                layoutId="sidebar-indicador"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  background: "var(--surface-glass-hover)",
                  border: "1px solid rgba(124, 108, 246, 0.35)",
                  boxShadow: "0 0 16px var(--accent-glow)",
                }}
              />
            )}
            <span style={{ position: "relative", display: "flex", transform: "scale(1.3)" }}>
              <Icone />
            </span>
          </button>
        );
      })}
    </nav>
  );
}
