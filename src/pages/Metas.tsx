import { useState } from "react";
import { Metas as MetasType, ResumoMes } from "../types";
import { CATEGORIAS, MESES } from "../constants";
import { formatarMoeda, parseMoeda } from "../utils/format";
import { cartaoEstilo, campoInput } from "../components/estilosComuns";

interface Props {
  metas: MetasType;
  setMetaCategoria: (catId: string, limite: number) => void;
  resumoMes: ResumoMes;
  refDate: Date;
}

export function Metas({ metas, setMetaCategoria, resumoMes, refDate }: Props) {
  const [edicao, setEdicao] = useState<Record<string, string>>({});

  function confirmar(catId: string) {
    const bruto = edicao[catId] ?? "";
    const v = parseMoeda(bruto);
    setMetaCategoria(catId, v === null ? 0 : v);
  }

  const estouradas = CATEGORIAS.filter((c) => {
    const limite = metas[c.id] || 0;
    const gasto = resumoMes.porCategoria.find((p) => p.id === c.id)?.total || 0;
    return limite > 0 && gasto >= limite;
  });

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 24 }}>
        metas mensais de {MESES[refDate.getMonth()].toLowerCase()} — defina um limite por categoria e acompanhe o quanto já usou.
      </div>

      {estouradas.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          {estouradas.map((c) => (
            <div key={c.id} style={{ ...cartaoEstilo, padding: "12px 16px", borderColor: "var(--rust)", marginBottom: 8, fontSize: 14 }}>
              <strong>{c.label}</strong> já passou do limite este mês.
            </div>
          ))}
        </section>
      )}

      <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {CATEGORIAS.map((c) => {
          const limite = metas[c.id] || 0;
          const gasto = resumoMes.porCategoria.find((p) => p.id === c.id)?.total || 0;
          const progresso = limite > 0 ? Math.min(100, (gasto / limite) * 100) : 0;
          const corBarra = progresso >= 100 ? "var(--rust)" : progresso >= 70 ? "var(--ouro)" : "var(--verde)";
          return (
            <div key={c.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                <span className="cf-num" style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                  {formatarMoeda(gasto)} / {limite > 0 ? formatarMoeda(limite) : "sem limite"}
                </span>
              </div>
              {limite > 0 && (
                <div style={{ height: 8, background: "var(--paper-linha)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: `${progresso}%`, height: "100%", background: corBarra, borderRadius: 4 }} />
                </div>
              )}
              <input
                className="cf-num cf-focus"
                placeholder="definir limite (R$)"
                defaultValue={limite || ""}
                onChange={(e) => setEdicao((s) => ({ ...s, [c.id]: e.target.value }))}
                onBlur={() => confirmar(c.id)}
                onKeyDown={(e) => e.key === "Enter" && confirmar(c.id)}
                style={{ ...campoInput, maxWidth: 160 }}
              />
            </div>
          );
        })}
      </section>
    </div>
  );
}
