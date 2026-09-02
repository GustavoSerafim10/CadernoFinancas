import { ReactNode, useId } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { NumeroAnimado } from "./NumeroAnimado";
import { cartaoEstilo, rotuloCampo } from "./estilosComuns";

interface Props {
  icone: ReactNode;
  label: string;
  valor: number;
  valorAnterior: number;
  formatar: (v: number) => string;
  serieMensal: number[];
  corIcone: string;
  corSpark: string;
  direcaoBoa?: "alta" | "baixa";
  rotuloAnterior?: string;
}

export function KpiCard({
  icone, label, valor, valorAnterior, formatar, serieMensal, corIcone, corSpark, direcaoBoa = "alta", rotuloAnterior,
}: Props) {
  const gradientId = useId();
  const temComparacao = valorAnterior !== 0;
  const diff = valor - valorAnterior;
  const pct = temComparacao ? (diff / Math.abs(valorAnterior)) * 100 : 0;
  const subiu = diff > 0;
  const boa = diff === 0 ? null : direcaoBoa === "baixa" ? !subiu : subiu;
  const corBadge = boa === null ? "var(--ink-soft)" : boa ? "var(--verde)" : "var(--rust)";

  const dadosSpark = serieMensal.map((v, i) => ({ i, v }));

  return (
    <div className="cf-card" style={{ ...cartaoEstilo, padding: "16px 18px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 62,
            height: 62,
            borderRadius: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${corIcone}33`,
            border: `1px solid ${corIcone}66`,
            color: corIcone,
            flex: "0 0 auto",
          }}
        >
          <span style={{ display: "flex", transform: "scale(2.3)" }}>{icone}</span>
        </span>
        <div style={{ ...rotuloCampo, marginBottom: 0 }}>{label}</div>
      </div>

      <NumeroAnimado valor={valor} formatar={formatar} className="cf-num" style={{ fontSize: 21, fontWeight: 700 }} />

      {temComparacao && (
        <span className="cf-num" style={{ fontSize: 11, color: corBadge, whiteSpace: "nowrap" }}>
          {subiu ? "↑" : diff < 0 ? "↓" : "—"} {formatarPctAbs(pct)}
          {rotuloAnterior && <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}> vs {rotuloAnterior}</span>}
        </span>
      )}

      {dadosSpark.length > 1 && (
        <div style={{ height: 32, margin: "0 -2px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dadosSpark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={corSpark} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={corSpark} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={corSpark}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function formatarPctAbs(v: number): string {
  return `${Math.abs(v).toFixed(1)}%`;
}
