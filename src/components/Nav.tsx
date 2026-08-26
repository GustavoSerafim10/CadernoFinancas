import { PAGINAS, PaginaId } from "../constants";

interface Props {
  pagina: PaginaId;
  setPagina: (p: PaginaId) => void;
}

export function Nav({ pagina, setPagina }: Props) {
  return (
    <nav style={{ display: "flex", gap: 2, marginBottom: 28, flexWrap: "wrap", borderBottom: "1.5px solid var(--ink)" }}>
      {PAGINAS.map((p) => {
        const ativa = pagina === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setPagina(p.id)}
            className="cf-tab cf-focus"
            style={{
              padding: "9px 18px",
              fontSize: 13.5,
              letterSpacing: "0.03em",
              color: ativa ? "var(--paper)" : p.cor,
              background: ativa ? p.cor : "transparent",
              borderRadius: "6px 6px 0 0",
              marginBottom: -1.5,
              border: `1.5px solid ${ativa ? p.cor : "transparent"}`,
              borderBottom: ativa ? `1.5px solid ${p.cor}` : "1.5px solid transparent",
            }}
          >
            {p.label}
          </button>
        );
      })}
    </nav>
  );
}
