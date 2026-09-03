import { motion } from "framer-motion";
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
  function confirmar(catId: string, bruto: string) {
    const v = parseMoeda(bruto);
    setMetaCategoria(catId, v === null ? 0 : v);
  }

  const estouradas = CATEGORIAS.filter((c) => {
    const limite = metas[c.id] || 0;
    const gasto = resumoMes.porCategoria.find((p) => p.id === c.id)?.total || 0;
    return limite > 0 && gasto >= limite;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
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
            <div key={c.id} style={{ background: "rgba(10, 10, 15, 0.42)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                <span className="cf-num" style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                  {formatarMoeda(gasto)} / {limite > 0 ? formatarMoeda(limite) : "sem limite"}
                </span>
              </div>
              {limite > 0 && (
                <div style={{ height: 8, background: "var(--paper-linha)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progresso}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ height: "100%", background: corBarra, borderRadius: 4 }}
                  />
                </div>
              )}
              <input
                className="cf-num cf-focus"
                aria-label={`Limite mensal para ${c.label}`}
                placeholder="definir limite (R$)"
                defaultValue={limite || ""}
                onBlur={(e) => confirmar(c.id, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmar(c.id, e.currentTarget.value)}
                style={{ ...campoInput, maxWidth: 160 }}
              />
            </div>
          );
        })}
      </section>
    </motion.div>
  );
}
