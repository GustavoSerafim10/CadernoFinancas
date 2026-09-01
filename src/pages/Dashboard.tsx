import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, BarChart, Line, Area, AreaChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ResumoMes, PontoHistorico, Insight, ResumoApostas, Transacao } from "../types";
import { MESES, catLabel } from "../constants";
import { formatarMoeda, formatarPct } from "../utils/format";
import { SeletorMes } from "../components/SeletorMes";
import { KpiCard } from "../components/KpiCard";
import { IconeCarteira, IconeCartao, IconeInvestimentos, IconeApostas, IconeSaldo } from "../components/Icones";
import { rotuloCampo, cartaoEstilo, botaoSecundario } from "../components/estilosComuns";
import {
  CHART_GRID, CHART_AXIS_TEXT, CHART_AXIS_LINE, CHART_TOOLTIP_STYLE, CHART_STROKE_SEPARATOR,
  COR_GASTOS, COR_INVESTIDO, COR_RECEITA, COR_APOSTAS, COR_ACCENT,
} from "../components/chartTheme";

interface Props {
  refDate: Date;
  mudarMes: (delta: number) => void;
  resumoMes: ResumoMes;
  resumoMesAnterior: ResumoMes;
  historicoMensal: PontoHistorico[];
  transacoesDoMes: Transacao[];
  insights: Insight[];
  resumoApostas: ResumoApostas;
  exportarCSV: () => void;
  exportarTudoJSON: () => void;
}

export function Dashboard({
  refDate, mudarMes, resumoMes, resumoMesAnterior, historicoMensal, transacoesDoMes,
  insights, resumoApostas, exportarCSV, exportarTudoJSON,
}: Props) {
  const historicoComLabel = historicoMensal.map((h) => {
    const [ano, mes] = h.chave.split("-");
    return { ...h, label: `${MESES[parseInt(mes, 10) - 1]?.slice(0, 3) || mes}/${ano.slice(2)}` };
  });

  const serieReceita = historicoMensal.map((h) => h.receita);
  const serieGastos = historicoMensal.map((h) => h.gastos);
  const serieInvestido = historicoMensal.map((h) => h.investido);
  const serieApostas = historicoMensal.map((h) => h.lucroApostas);
  const serieSaldo = historicoMensal.map((h) => h.receita - h.gastos - h.investido + h.lucroApostas);

  const totalGastosCategoria = resumoMes.porCategoria.reduce((s, c) => s + c.total, 0);

  const comparativoCategorias = useMemo(() => {
    const mapa = new Map<string, { id: string; label: string; atual: number; anterior: number }>();
    resumoMes.porCategoria.forEach((c) => mapa.set(c.id, { id: c.id, label: c.label, atual: c.total, anterior: 0 }));
    resumoMesAnterior.porCategoria.forEach((c) => {
      const existente = mapa.get(c.id);
      if (existente) existente.anterior = c.total;
      else mapa.set(c.id, { id: c.id, label: c.label, atual: 0, anterior: c.total });
    });
    return Array.from(mapa.values())
      .sort((a, b) => b.atual + b.anterior - (a.atual + a.anterior))
      .slice(0, 7);
  }, [resumoMes.porCategoria, resumoMesAnterior.porCategoria]);

  const saldoAcumulado = useMemo(
    () =>
      historicoComLabel.map((_, i) => ({
        label: historicoComLabel[i].label,
        saldo: historicoComLabel
          .slice(0, i + 1)
          .reduce((s, x) => s + x.receita - x.gastos - x.investido + x.lucroApostas, 0),
      })),
    [historicoComLabel]
  );

  const ultimosLancamentos = useMemo(
    () => [...transacoesDoMes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5),
    [transacoesDoMes]
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        <button onClick={exportarCSV} className="cf-focus" style={{ ...botaoSecundario, fontSize: 12 }}>
          ⬇ exportar CSV
        </button>
        <button onClick={exportarTudoJSON} className="cf-focus" style={{ ...botaoSecundario, fontSize: 12 }}>
          ⬇ exportar JSON
        </button>
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

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
        <KpiCard
          icone={<IconeCarteira />}
          label="receita"
          valor={resumoMes.receita}
          valorAnterior={resumoMesAnterior.receita}
          formatar={formatarMoeda}
          serieMensal={serieReceita}
          corIcone={COR_RECEITA}
          corSpark={COR_RECEITA}
        />
        <KpiCard
          icone={<IconeCartao />}
          label="gastos"
          valor={resumoMes.gastos}
          valorAnterior={resumoMesAnterior.gastos}
          formatar={formatarMoeda}
          serieMensal={serieGastos}
          corIcone={COR_GASTOS}
          corSpark={COR_GASTOS}
          direcaoBoa="baixa"
        />
        <KpiCard
          icone={<IconeInvestimentos />}
          label="investido"
          valor={resumoMes.investido}
          valorAnterior={resumoMesAnterior.investido}
          formatar={formatarMoeda}
          serieMensal={serieInvestido}
          corIcone={COR_INVESTIDO}
          corSpark={COR_INVESTIDO}
        />
        {resumoApostas.apostado > 0 && (
          <KpiCard
            icone={<IconeApostas />}
            label="apostas"
            valor={resumoApostas.lucro}
            valorAnterior={serieApostas[serieApostas.length - 2] ?? 0}
            formatar={(v) => `${v >= 0 ? "+" : ""}${formatarMoeda(v)}`}
            serieMensal={serieApostas}
            corIcone={COR_APOSTAS}
            corSpark={COR_APOSTAS}
          />
        )}
        <KpiCard
          icone={<IconeSaldo />}
          label="saldo livre"
          valor={resumoMes.saldo}
          valorAnterior={resumoMesAnterior.saldo}
          formatar={formatarMoeda}
          serieMensal={serieSaldo}
          corIcone={COR_ACCENT}
          corSpark={COR_ACCENT}
        />
      </section>

      {historicoComLabel.length > 1 && (
        <section style={{ marginBottom: 36 }}>
          <div style={rotuloCampo}>fluxo de caixa mensal</div>
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

      {saldoAcumulado.length > 1 && (
        <section style={{ marginBottom: 36 }}>
          <div style={rotuloCampo}>evolução do saldo acumulado</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={saldoAcumulado} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="saldoAcumuladoGradiente" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COR_ACCENT} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={COR_ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }} axisLine={{ stroke: CHART_AXIS_LINE }} tickLine={false} />
              <YAxis tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="saldo" stroke={COR_ACCENT} strokeWidth={2} fill="url(#saldoAcumuladoGradiente)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      )}

      {(resumoMes.porCategoria.length > 0 || comparativoCategorias.length > 0) && (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28, marginBottom: 36 }}>
          {resumoMes.porCategoria.length > 0 && (
            <div>
              <div style={rotuloCampo}>gastos por categoria</div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 130, height: 130, flex: "0 0 auto" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={resumoMes.porCategoria} dataKey="total" nameKey="label" innerRadius={38} outerRadius={62} paddingAngle={2}>
                        {resumoMes.porCategoria.map((c) => (
                          <Cell key={c.id} fill={c.cor} stroke={CHART_STROKE_SEPARATOR} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 0 }}>
                  {[...resumoMes.porCategoria].sort((a, b) => b.total - a.total).slice(0, 6).map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.cor, flex: "0 0 auto" }} />
                      <span style={{ color: "var(--ink-soft)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.label}
                      </span>
                      <span className="cf-num" style={{ flex: "0 0 auto" }}>{formatarMoeda(c.total)}</span>
                      <span className="cf-num" style={{ flex: "0 0 auto", width: 36, textAlign: "right", color: "var(--text-muted)" }}>
                        {totalGastosCategoria > 0 ? Math.round((c.total / totalGastosCategoria) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {comparativoCategorias.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ ...rotuloCampo, marginBottom: 0 }}>comparativo por categoria</div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--ink-soft)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: "rgba(255,255,255,0.22)", display: "inline-block" }} />mês anterior
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: COR_ACCENT, display: "inline-block" }} />este mês
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={Math.max(140, comparativoCategorias.length * 32)}>
                <BarChart data={comparativoCategorias} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: CHART_AXIS_TEXT, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <YAxis type="category" dataKey="label" width={92} tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="anterior" name="mês anterior" fill="rgba(255,255,255,0.18)" radius={[0, 3, 3, 0]} barSize={8} />
                  <Bar dataKey="atual" name="este mês" fill={COR_ACCENT} radius={[0, 3, 3, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}

      {ultimosLancamentos.length > 0 && (
        <section>
          <div style={rotuloCampo}>últimos lançamentos</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Data", "Descrição", "Categoria", "Tipo", "Valor"].map((titulo, i) => (
                    <th
                      key={titulo}
                      style={{
                        textAlign: i === 4 ? "right" : "left",
                        padding: "6px 10px",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "var(--ink-soft)",
                        fontWeight: 500,
                      }}
                    >
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ultimosLancamentos.map((t) => {
                  const isReceita = t.tipo === "receita";
                  const isInv = t.tipo === "investimento";
                  const cor = isReceita ? "var(--ink)" : isInv ? "var(--verde)" : "var(--rust)";
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="cf-num" style={{ padding: "8px 10px", color: "var(--ink-soft)" }}>
                        {new Date(t.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td style={{ padding: "8px 10px" }}>{t.descricao}</td>
                      <td style={{ padding: "8px 10px", color: "var(--ink-soft)" }}>
                        {isReceita ? "Receita" : isInv ? "Investimento" : catLabel(t.categoria)}
                      </td>
                      <td style={{ padding: "8px 10px", color: "var(--ink-soft)", textTransform: "capitalize" }}>{t.tipo}</td>
                      <td className="cf-num" style={{ padding: "8px 10px", textAlign: "right", color: cor, fontWeight: 600 }}>
                        {isReceita || isInv ? "+" : "−"} {formatarMoeda(t.valor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </motion.div>
  );
}
