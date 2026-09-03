import { useState } from "react";
import { cartaoEstilo } from "./estilosComuns";
import { SaudeFinanceira, FatorSaude } from "../utils/saudeFinanceira";

interface Props {
  saude: SaudeFinanceira;
}

function corPorScore(score: number): string {
  if (score >= 80) return "var(--verde)";
  if (score >= 60) return "var(--accent)";
  if (score >= 40) return "var(--ouro)";
  return "var(--rust)";
}

function corPorTom(tom: FatorSaude["tom"]): string {
  if (tom === "bom") return "var(--verde)";
  if (tom === "atencao") return "var(--rust)";
  return "var(--ink-soft)";
}

function iconePorTom(tom: FatorSaude["tom"]): string {
  if (tom === "bom") return "✓";
  if (tom === "atencao") return "⚠";
  return "•";
}

export function CardSaudeFinanceira({ saude }: Props) {
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const cor = corPorScore(saude.score);

  return (
    <div className="cf-card" style={{ ...cartaoEstilo, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 auto", minWidth: 220 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--ink-soft)",
              marginBottom: 10,
            }}
          >
            Saúde financeira
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
            <span className="cf-num" style={{ fontSize: 34, fontWeight: 700, color: cor }}>
              {saude.score}
            </span>
            <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>/ 100</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: cor, marginLeft: 6 }}>{saude.rotulo}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", width: 220 }}>
            <div style={{ height: "100%", width: `${saude.score}%`, borderRadius: 4, background: cor }} />
          </div>
        </div>

        {saude.bullets.length > 0 && (
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 9 }}>
            {saude.bullets.map((b) => (
              <div key={b.texto} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                <span style={{ color: b.positivo ? "var(--verde)" : "var(--rust)", fontWeight: 700 }}>
                  {b.positivo ? "↑" : "↓"}
                </span>
                <span style={{ color: "var(--ink)" }}>{b.texto}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setDetalhesAbertos((v) => !v)}
          className="cf-link-mais cf-focus"
          style={{ flex: "0 0 auto", alignSelf: "flex-start" }}
          aria-expanded={detalhesAbertos}
        >
          {detalhesAbertos ? "Ocultar detalhes" : "Ver detalhes"} {detalhesAbertos ? "↑" : "→"}
        </button>
      </div>

      {detalhesAbertos && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {saude.fatores.map((f) => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ color: corPorTom(f.tom), fontWeight: 700, width: 14, flex: "0 0 auto" }}>
                {iconePorTom(f.tom)}
              </span>
              <span style={{ color: "var(--ink)", flex: "1 1 auto", minWidth: 0 }}>
                {f.label} <span style={{ color: "var(--ink-soft)" }}>— {f.detalhe}</span>
              </span>
              <span className="cf-num" style={{ color: corPorTom(f.tom), flex: "0 0 auto", whiteSpace: "nowrap" }}>
                +{f.pontos}/{f.maxPontos}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
