import { motion } from "framer-motion";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ResumoMes, PontoHistorico, Insight, ResumoApostas } from "../types";
import { MESES, catLabel } from "../constants";
import { formatarMoeda, formatarPct } from "../utils/format";
import { SeletorMes } from "../components/SeletorMes";
import { NumeroAnimado } from "../components/NumeroAnimado";
import { rotuloCampo, cartaoEstilo, linkDiscreto } from "../components/estilosComuns";
import {
  CHART_GRID, CHART_AXIS_TEXT, CHART_AXIS_LINE, CHART_TOOLTIP_STYLE,
  COR_GASTOS, COR_INVESTIDO, COR_RECEITA, COR_APOSTAS,
} from "../components/chartTheme";

interface Props {
  refDate: Date;
  mudarMes: (delta: number) => void;
  resumoMes: ResumoMes;
  historicoMensal: PontoHistorico[];
  insights: Insight[];
  resumoApostas: ResumoApostas;
  exportarCSV: () => void;
  exportarTudoJSON: () => void;
}

export function Dashboard({ refDate, mudarMes, resumoMes, historicoMensal, insights, resumoApostas, exportarCSV, exportarTudoJSON }: Props) {
  const maxCat = Math.max(1, ...resumoMes.porCategoria.map((c) => c.total));

  const historicoComLabel = historicoMensal.map((h) => {
    const [ano, mes] = h.chave.split("-");
    return { ...h, label: `${MESES[parseInt(mes, 10) - 1]?.slice(0, 3) || mes}/${ano.slice(2)}` };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <div style={{ display: "flex", gap: 18, marginBottom: 6 }}>
        <button onClick={exportarCSV} className="cf-focus" style={linkDiscreto}>exportar este mês (CSV)</button>
        <button onClick={exportarTudoJSON} className="cf-focus" style={linkDiscreto}>exportar tudo (JSON)</button>
      </div>

      <SeletorMes refDate={refDate} mudarMes={mudarMes} />

      {insights.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <div style={rotuloCampo}>insights automáticos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {insights.map((ins) => (
              <div
                key={ins.categoria}
                style={{ ...cartaoEstilo, padding: "12px 16px", borderColor: "var(--rust)", display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--rust)", flex: "0 0 auto" }} />
                <span style={{ fontSize: 14 }}>
                  Você gastou <strong className="cf-num">{formatarPct(ins.pct)}</strong> a mais em{" "}
                  <strong>{catLabel(ins.categoria)}</strong> comparado à sua média recente ({formatarMoeda(ins.val)} vs.
                  média de {formatarMoeda(ins.media)}).
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ ...cartaoEstilo, marginBottom: 32 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>resumo do mês</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
          <div>
            <div style={rotuloCampo}>receita</div>
            <NumeroAnimado valor={resumoMes.receita} formatar={formatarMoeda} className="cf-num" style={{ fontSize: 19, fontWeight: 600 }} />
          </div>
          <div>
            <div style={rotuloCampo}>gastos</div>
            <NumeroAnimado valor={resumoMes.gastos} formatar={formatarMoeda} className="cf-num" style={{ fontSize: 19, fontWeight: 600, color: "var(--rust)" }} />
          </div>
          <div>
            <div style={rotuloCampo}>investido</div>
            <NumeroAnimado valor={resumoMes.investido} formatar={formatarMoeda} className="cf-num" style={{ fontSize: 19, fontWeight: 600, color: "var(--verde)" }} />
          </div>
          {resumoApostas.apostado > 0 && (
            <div>
              <div style={rotuloCampo}>apostas</div>
              <NumeroAnimado
                valor={resumoApostas.lucro}
                formatar={(v) => `${v >= 0 ? "+" : ""}${formatarMoeda(v)}`}
                className="cf-num"
                style={{ fontSize: 19, fontWeight: 600, color: resumoApostas.lucro >= 0 ? "var(--verde)" : "var(--rust)" }}
              />
            </div>
          )}
          <div>
            <div style={rotuloCampo}>saldo livre</div>
            <NumeroAnimado
              valor={resumoMes.saldo}
              formatar={formatarMoeda}
              className="cf-num"
              style={{ fontSize: 19, fontWeight: 700, color: resumoMes.saldo < 0 ? "var(--rust)" : "var(--ink)" }}
            />
          </div>
        </div>
      </section>

      {historicoComLabel.length > 1 && (
        <section style={{ marginBottom: 36 }}>
          <div style={rotuloCampo}>evolução dos últimos meses</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 10, fontSize: 12, color: "var(--ink-soft)", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: COR_GASTOS, display: "inline-block" }} />gastos
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: COR_INVESTIDO, display: "inline-block" }} />investido
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 12, height: 1.5, background: COR_RECEITA, display: "inline-block" }} />receita
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 12, height: 1.5, background: COR_APOSTAS, display: "inline-block" }} />apostas
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={historicoComLabel} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }} axisLine={{ stroke: CHART_AXIS_LINE }} tickLine={false} />
              <YAxis tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="gastos" name="Gastos" fill={COR_GASTOS} radius={[3, 3, 0, 0]} barSize={14} />
              <Bar dataKey="investido" name="Investido" fill={COR_INVESTIDO} radius={[3, 3, 0, 0]} barSize={14} />
              <Line dataKey="receita" name="Receita" stroke={COR_RECEITA} strokeWidth={1.75} strokeDasharray="4 3" dot={{ r: 3, fill: COR_RECEITA }} />
              <Line dataKey="lucroApostas" name="Apostas" stroke={COR_APOSTAS} strokeWidth={1.75} dot={{ r: 3, fill: COR_APOSTAS }} />
            </ComposedChart>
          </ResponsiveContainer>
        </section>
      )}

      {resumoMes.porCategoria.length > 0 && (
        <section>
          <div style={rotuloCampo}>gastos por categoria</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...resumoMes.porCategoria].sort((a, b) => b.total - a.total).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <span style={{ fontSize: 13, width: 100, flex: "0 0 auto", color: "var(--ink-soft)" }}>{c.label}</span>
                <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.total / maxCat) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
                    style={{ height: "100%", background: c.cor, borderRadius: 4 }}
                  />
                </div>
                <span className="cf-num" style={{ fontSize: 13, width: 84, textAlign: "right", flex: "0 0 auto" }}>{formatarMoeda(c.total)}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
