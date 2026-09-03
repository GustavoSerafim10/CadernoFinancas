import { useMemo } from "react";
import { motion } from "framer-motion";
import { ResumoMes, PontoHistorico, Metas, ResumoApostas } from "../types";
import { cartaoEstilo } from "../components/estilosComuns";
import { calcularInsightsFinanceiros } from "../utils/insightsFinanceiros";

interface Props {
  resumoMes: ResumoMes;
  resumoMesAnterior: ResumoMes;
  historicoMensal: PontoHistorico[];
  metas: Metas;
  resumoApostas: ResumoApostas;
}

const CORES_TOM: Record<string, string> = {
  positivo: "var(--verde)",
  atencao: "var(--rust)",
  neutro: "var(--accent)",
};

export function Insights({ resumoMes, resumoMesAnterior, historicoMensal, metas, resumoApostas }: Props) {
  const itens = useMemo(
    () => calcularInsightsFinanceiros(resumoMes, resumoMesAnterior, historicoMensal, metas, resumoApostas),
    [resumoMes, resumoMesAnterior, historicoMensal, metas, resumoApostas]
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 24 }}>
        leituras automáticas sobre o seu mês, geradas a partir dos seus próprios lançamentos — sem inteligência
        artificial, só regras matemáticas simples.
      </div>

      {itens.length > 0 ? (
        <section style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
          {itens.map((item) => (
            <div
              key={item.texto}
              style={{
                ...cartaoEstilo,
                padding: "16px 18px",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                borderColor: `${CORES_TOM[item.tom]}55`,
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1, flex: "0 0 auto" }}>{item.emoji}</span>
              <span style={{ fontSize: 14.5, lineHeight: 1.5 }}>{item.texto}</span>
            </div>
          ))}
        </section>
      ) : (
        <div style={{ ...cartaoEstilo, padding: "20px 22px", fontSize: 14, color: "var(--ink-soft)", maxWidth: 640 }}>
          Ainda não tenho dado suficiente pra gerar leituras esse mês. Lance algumas transações e volte aqui.
        </div>
      )}
    </motion.div>
  );
}
