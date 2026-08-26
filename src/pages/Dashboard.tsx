import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ResumoMes, PontoHistorico, Insight, ResumoApostas } from "../types";
import { MESES, catLabel } from "../constants";
import { formatarMoeda, formatarPct } from "../utils/format";
import { SeletorMes } from "../components/SeletorMes";
import { rotuloCampo, cartaoEstilo, linkDiscreto } from "../components/estilosComuns";

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
    <div>
      <div style={{ display: "flex", gap: 18, marginBottom: 6 }}>
        <button onClick={exportarCSV} className="cf-focus" style={linkDiscreto}>exportar este mês (CSV)</button>
        <button onClick={exportarTudoJSON} className="cf-focus" style={linkDiscreto}>exportar tudo (JSON)</button>
      </div>

      <SeletorMes refDate={refDate} mudarMes={mudarMes} corDestaque="var(--ink)" />

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
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>resumo do mês</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
          <div>
            <div style={rotuloCampo}>receita</div>
            <div className="cf-num" style={{ fontSize: 19, fontWeight: 600 }}>{formatarMoeda(resumoMes.receita)}</div>
          </div>
          <div>
            <div style={rotuloCampo}>gastos</div>
            <div className="cf-num" style={{ fontSize: 19, fontWeight: 600, color: "var(--rust)" }}>{formatarMoeda(resumoMes.gastos)}</div>
          </div>
          <div>
            <div style={rotuloCampo}>investido</div>
            <div className="cf-num" style={{ fontSize: 19, fontWeight: 600, color: "var(--verde)" }}>{formatarMoeda(resumoMes.investido)}</div>
          </div>
          {resumoApostas.apostado > 0 && (
            <div>
              <div style={rotuloCampo}>apostas</div>
              <div
                className="cf-num"
                style={{ fontSize: 19, fontWeight: 600, color: resumoApostas.lucro >= 0 ? "var(--verde)" : "var(--rust)" }}
              >
                {resumoApostas.lucro >= 0 ? "+" : ""}
                {formatarMoeda(resumoApostas.lucro)}
              </div>
            </div>
          )}
          <div>
            <div style={rotuloCampo}>saldo livre</div>
            <div className="cf-num" style={{ fontSize: 19, fontWeight: 700, color: resumoMes.saldo < 0 ? "var(--rust)" : "var(--ink)" }}>
              {formatarMoeda(resumoMes.saldo)}
            </div>
          </div>
        </div>
      </section>

      {historicoComLabel.length > 1 && (
        <section style={{ marginBottom: 36 }}>
          <div style={rotuloCampo}>evolução dos últimos meses</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 10, fontSize: 12, color: "var(--ink-soft)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--rust)", display: "inline-block" }} />gastos
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--verde)", display: "inline-block" }} />investido
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 12, height: 1.5, background: "var(--ink)", display: "inline-block" }} />receita
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 12, height: 1.5, background: "#7A3E5E", display: "inline-block" }} />apostas
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={historicoComLabel} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--paper-linha)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#5C6B78", fontSize: 12 }} axisLine={{ stroke: "#CFC4A6" }} tickLine={false} />
              <YAxis tick={{ fill: "#5C6B78", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip
                formatter={(v: number) => formatarMoeda(v)}
                contentStyle={{ background: "#EDE6D4", border: "1px solid #20303F", borderRadius: 6, fontSize: 13, fontFamily: "'Inter', sans-serif" }}
              />
              <Bar dataKey="gastos" name="Gastos" fill="#A8462B" radius={[3, 3, 0, 0]} barSize={14} />
              <Bar dataKey="investido" name="Investido" fill="#2E7D5E" radius={[3, 3, 0, 0]} barSize={14} />
              <Line dataKey="receita" name="Receita" stroke="#20303F" strokeWidth={1.75} strokeDasharray="4 3" dot={{ r: 3, fill: "#20303F" }} />
              <Line dataKey="lucroApostas" name="Apostas" stroke="#7A3E5E" strokeWidth={1.75} dot={{ r: 3, fill: "#7A3E5E" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </section>
      )}

      {resumoMes.porCategoria.length > 0 && (
        <section>
          <div style={rotuloCampo}>gastos por categoria</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...resumoMes.porCategoria].sort((a, b) => b.total - a.total).map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, width: 100, flex: "0 0 auto", color: "var(--ink-soft)" }}>{c.label}</span>
                <div style={{ flex: 1, height: 8, background: "var(--paper-linha)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(c.total / maxCat) * 100}%`, height: "100%", background: c.cor, borderRadius: 4 }} />
                </div>
                <span className="cf-num" style={{ fontSize: 13, width: 84, textAlign: "right", flex: "0 0 auto" }}>{formatarMoeda(c.total)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
