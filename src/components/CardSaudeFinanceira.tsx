import { cartaoEstilo } from "./estilosComuns";
import { SaudeFinanceira } from "../utils/saudeFinanceira";

interface Props {
  saude: SaudeFinanceira;
}

function corPorScore(score: number): string {
  if (score >= 80) return "var(--verde)";
  if (score >= 60) return "var(--accent)";
  if (score >= 40) return "var(--ouro)";
  return "var(--rust)";
}

export function CardSaudeFinanceira({ saude }: Props) {
  const cor = corPorScore(saude.score);

  return (
    <div
      className="cf-card"
      style={{ ...cartaoEstilo, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", marginBottom: 20 }}
    >
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
    </div>
  );
}
