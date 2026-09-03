import { useMemo, CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, BarChart, Line, Area, AreaChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";
import { ResumoMes, PontoHistorico, Insight, ResumoApostas, Transacao, Metas } from "../types";
import { MESES, catLabel, PaginaId } from "../constants";
import { formatarMoeda, formatarPct } from "../utils/format";
import { KpiCard } from "../components/KpiCard";
import { Painel } from "../components/Painel";
import { CardSaudeFinanceira } from "../components/CardSaudeFinanceira";
import { calcularSaudeFinanceira } from "../utils/saudeFinanceira";
import { IconeCarteira, IconeCartao, IconeInvestimentos, IconeApostas, IconeSaldo } from "../components/Icones";
import { rotuloCampo, cartaoEstilo } from "../components/estilosComuns";
import {
  CHART_GRID, CHART_AXIS_TEXT, CHART_AXIS_LINE, CHART_TOOLTIP_STYLE, CHART_TOOLTIP_ITEM_STYLE, CHART_TOOLTIP_LABEL_STYLE,
  CHART_STROKE_SEPARATOR, COR_GASTOS, COR_INVESTIDO, COR_RECEITA_ICONE, COR_APOSTAS, COR_ACCENT,
} from "../components/chartTheme";

interface Props {
  refDate: Date;
  resumoMes: ResumoMes;
  resumoMesAnterior: ResumoMes;
  historicoMensal: PontoHistorico[];
  transacoesDoMes: Transacao[];
  insights: Insight[];
  resumoApostas: ResumoApostas;
  metas: Metas;
  setPagina: (p: PaginaId) => void;
}

function formatarEixoValor(v: number): string {
  return Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`;
}

interface TickMesAtualProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  ultimoLabel: string;
}

function TickMesAtual({ x, y, payload, ultimoLabel }: TickMesAtualProps) {
  if (x === undefined || y === undefined || payload === undefined) return null;
  const ativo = payload.value === ultimoLabel;
  return (
    <g transform={`translate(${x},${y})`}>
      {ativo && <rect x={-18} y={-3} width={36} height={17} rx={8} fill="var(--accent)" fillOpacity={0.3} />}
      <text x={0} y={9} textAnchor="middle" fontSize={10.5} fill={ativo ? "#F4F4F8" : CHART_AXIS_TEXT} fontWeight={ativo ? 700 : 400}>
        {payload.value}
      </text>
    </g>
  );
}

function DonutComTotal({ children, total }: { children: ReactNode; total: number }) {
  return (
    <div style={{ position: "relative", width: 142, height: 142 }}>
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 10, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total</span>
        <span className="cf-num" style={{ fontSize: 15, fontWeight: 700 }}>{formatarMoeda(total)}</span>
      </div>
    </div>
  );
}

interface SaldoPontoProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: { saldo: number };
  ultimoIndice: number;
  label: string;
}

function SaldoDotFinal({ cx, cy, index, payload, ultimoIndice, label }: SaldoPontoProps) {
  if (cx === undefined || cy === undefined || payload === undefined) return null;
  const isUltimo = index === ultimoIndice;
  return (
    <g>
      {isUltimo && (
        <>
          <rect x={cx - 98} y={cy - 34} width={92} height={30} rx={6} fill="#121018" stroke="rgba(255,255,255,0.14)" />
          <text x={cx - 52} y={cy - 21} textAnchor="middle" fontSize={9} fill="#9A99AE">
            {label}
          </text>
          <text x={cx - 52} y={cy - 10} textAnchor="middle" fontSize={11} fontWeight={700} fill="#F4F4F8">
            {formatarMoeda(payload.saldo)}
          </text>
        </>
      )}
      <circle cx={cx} cy={cy} r={isUltimo ? 4 : 2.5} fill={COR_ACCENT} stroke="#0a0a0f" strokeWidth={isUltimo ? 2 : 1.5} />
    </g>
  );
}

const SEM_DADOS: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  minHeight: 100,
  fontSize: 12.5,
  color: "var(--ink-soft)",
  textAlign: "center",
};

export function Dashboard({
  refDate, resumoMes, resumoMesAnterior, historicoMensal, transacoesDoMes,
  insights, resumoApostas, metas, setPagina,
}: Props) {
  const saude = useMemo(
    () => calcularSaudeFinanceira(resumoMes, resumoMesAnterior, metas),
    [resumoMes, resumoMesAnterior, metas]
  );
  const historicoComLabel = historicoMensal.map((h) => {
    const [ano, mes] = h.chave.split("-");
    return {
      ...h,
      label: `${MESES[parseInt(mes, 10) - 1]?.slice(0, 3) || mes}/${ano.slice(2)}`,
      saldo: h.receita - h.gastos - h.investido + h.lucroApostas,
    };
  });

  const mesAnteriorDate = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
  const mesAnteriorLabel = `${MESES[mesAnteriorDate.getMonth()].slice(0, 3).toLowerCase()}/${mesAnteriorDate.getFullYear()}`;

  const serieReceita = historicoMensal.map((h) => h.receita);
  const serieGastos = historicoMensal.map((h) => h.gastos);
  const serieInvestido = historicoMensal.map((h) => h.investido);
  const serieApostas = historicoMensal.map((h) => h.lucroApostas);
  const serieSaldo = historicoMensal.map((h) => h.receita - h.gastos - h.investido + h.lucroApostas);

  const totalGastosCategoria = resumoMes.porCategoria.reduce((s, c) => s + c.total, 0);

  const categoriasOrdenadas = useMemo(
    () => [...resumoMes.porCategoria].sort((a, b) => b.total - a.total),
    [resumoMes.porCategoria]
  );

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
      .slice(0, 5);
  }, [resumoMes.porCategoria, resumoMesAnterior.porCategoria]);

  const temMesAnterior = resumoMesAnterior.porCategoria.length > 0;

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

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(178px, 1fr))", gap: 14, marginBottom: 32 }}>
        <KpiCard
          icone={<IconeCarteira />}
          label="receita"
          valor={resumoMes.receita}
          valorAnterior={resumoMesAnterior.receita}
          formatar={formatarMoeda}
          serieMensal={serieReceita}
          corIcone={COR_RECEITA_ICONE}
          corSpark={COR_RECEITA_ICONE}
          rotuloAnterior={mesAnteriorLabel}
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
          rotuloAnterior={mesAnteriorLabel}
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
          rotuloAnterior={mesAnteriorLabel}
        />
        <KpiCard
          icone={<IconeApostas />}
          label="apostas"
          valor={resumoApostas.lucro}
          valorAnterior={serieApostas[serieApostas.length - 2] ?? 0}
          formatar={(v) => `${v >= 0 ? "+" : ""}${formatarMoeda(v)}`}
          serieMensal={serieApostas}
          corIcone={COR_APOSTAS}
          corSpark={COR_APOSTAS}
          rotuloAnterior={mesAnteriorLabel}
        />
        <KpiCard
          icone={<IconeSaldo />}
          label="saldo livre"
          valor={resumoMes.saldo}
          valorAnterior={resumoMesAnterior.saldo}
          formatar={formatarMoeda}
          serieMensal={serieSaldo}
          corIcone={COR_ACCENT}
          corSpark={COR_ACCENT}
          rotuloAnterior={mesAnteriorLabel}
        />
      </section>

      <CardSaudeFinanceira saude={saude} />

      <section style={{ marginBottom: 20 }}>
        <Painel titulo="Fluxo de Caixa Mensal" acao={<span className="cf-pill-decorativo">Últimos 12 meses ⌄</span>}>
          {historicoComLabel.length > 1 ? (
            <>
              <div style={{ display: "flex", gap: 14, marginBottom: 12, fontSize: 12, color: "var(--ink-soft)", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: COR_INVESTIDO, display: "inline-block" }} />receita
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: COR_GASTOS, display: "inline-block" }} />gastos
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 1.5, background: COR_ACCENT, display: "inline-block" }} />saldo
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={historicoComLabel} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={(props) => (
                      <TickMesAtual {...props} ultimoLabel={historicoComLabel[historicoComLabel.length - 1]?.label || ""} />
                    )}
                    axisLine={{ stroke: CHART_AXIS_LINE }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatarEixoValor} />
                  <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
                  <Bar dataKey="receita" name="Receita" fill={COR_INVESTIDO} radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="gastos" name="Gastos" fill={COR_GASTOS} radius={[4, 4, 0, 0]} barSize={16} />
                  <Line dataKey="saldo" name="Saldo" stroke={COR_ACCENT} strokeWidth={2} dot={{ r: 3, fill: COR_ACCENT }} />
                </ComposedChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div style={SEM_DADOS}>Histórico insuficiente ainda.</div>
          )}
        </Painel>
      </section>

      <section className="cf-grid-3" style={{ marginBottom: 20 }}>
        <Painel titulo="Gastos por Categoria">
          {resumoMes.porCategoria.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <DonutComTotal total={totalGastosCategoria}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={resumoMes.porCategoria} dataKey="total" nameKey="label" innerRadius={42} outerRadius={68} paddingAngle={2}>
                      {resumoMes.porCategoria.map((c) => (
                        <Cell key={c.id} fill={c.cor} stroke={CHART_STROKE_SEPARATOR} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => formatarMoeda(v)}
                      contentStyle={CHART_TOOLTIP_STYLE}
                      itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                      labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                      position={{ x: -20, y: -66 }}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </DonutComTotal>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "0 0 6px", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-soft)", fontWeight: 500 }}>
                      Categoria
                    </th>
                    <th style={{ textAlign: "right", padding: "0 0 6px", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-soft)", fontWeight: 500 }}>
                      Valor
                    </th>
                    <th style={{ textAlign: "right", padding: "0 0 6px 10px", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-soft)", fontWeight: 500 }}>
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasOrdenadas.slice(0, 4).map((c) => (
                    <tr key={c.id}>
                      <td style={{ padding: "3px 0", color: "var(--ink-soft)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.cor, flex: "0 0 auto" }} />
                          {c.label}
                        </span>
                      </td>
                      <td className="cf-num" style={{ padding: "3px 0", textAlign: "right", whiteSpace: "nowrap" }}>{formatarMoeda(c.total)}</td>
                      <td className="cf-num" style={{ padding: "3px 0 3px 10px", textAlign: "right", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {totalGastosCategoria > 0 ? Math.round((c.total / totalGastosCategoria) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={SEM_DADOS}>Sem gastos registrados neste mês.</div>
          )}
        </Painel>

        <Painel titulo="Evolução do saldo">
          {saldoAcumulado.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={saldoAcumulado} margin={{ top: 42, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="saldoAcumuladoGradiente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COR_ACCENT} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COR_ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: CHART_AXIS_TEXT, fontSize: 10.5 }} axisLine={{ stroke: CHART_AXIS_LINE }} tickLine={false} />
                <YAxis
                  domain={[(min: number) => Math.min(0, min), (max: number) => Math.ceil(max * 1.25)]}
                  tick={{ fill: CHART_AXIS_TEXT, fontSize: 10.5 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatarEixoValor}
                />
                <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  stroke={COR_ACCENT}
                  strokeWidth={2}
                  fill="url(#saldoAcumuladoGradiente)"
                  dot={({ key, ...props }) => (
                    <SaldoDotFinal
                      key={key}
                      {...props}
                      ultimoIndice={saldoAcumulado.length - 1}
                      label={saldoAcumulado[saldoAcumulado.length - 1]?.label || ""}
                    />
                  )}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={SEM_DADOS}>Histórico insuficiente ainda.</div>
          )}
        </Painel>

        <Painel
          titulo="Distribuição por Categoria"
          rodape={
            <button onClick={() => setPagina("metas")} className="cf-link-mais cf-focus">
              Ver todas categorias →
            </button>
          }
        >
          {categoriasOrdenadas.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <DonutComTotal total={totalGastosCategoria}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoriasOrdenadas} dataKey="total" nameKey="label" innerRadius={42} outerRadius={68} paddingAngle={2}>
                      {categoriasOrdenadas.map((c) => (
                        <Cell key={c.id} fill={c.cor} stroke={CHART_STROKE_SEPARATOR} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => formatarPct((v / (totalGastosCategoria || 1)) * 100)}
                      contentStyle={CHART_TOOLTIP_STYLE}
                      itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                      labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                      position={{ x: -20, y: -66 }}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </DonutComTotal>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "0 0 6px", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-soft)", fontWeight: 500 }}>
                      Categoria
                    </th>
                    <th style={{ textAlign: "right", padding: "0 0 6px", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-soft)", fontWeight: 500 }}>
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasOrdenadas.slice(0, 4).map((c) => {
                    const pct = totalGastosCategoria > 0 ? Math.round((c.total / totalGastosCategoria) * 100) : 0;
                    return (
                      <tr key={c.id}>
                        <td style={{ padding: "4px 0", color: "var(--ink-soft)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.cor, flex: "0 0 auto" }} />
                            <span style={{ flex: "0 0 auto", maxWidth: 82, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.label}
                            </span>
                            <span style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                              <span style={{ display: "block", height: "100%", width: `${pct}%`, borderRadius: 3, background: c.cor }} />
                            </span>
                          </div>
                        </td>
                        <td className="cf-num" style={{ padding: "4px 0 4px 10px", textAlign: "right", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={SEM_DADOS}>Sem gastos registrados neste mês.</div>
          )}
        </Painel>
      </section>

      <section className="cf-grid-2">
        <Painel titulo="Gastos por Categoria (Comparativo)">
          {comparativoCategorias.length > 0 ? (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 11, color: "var(--ink-soft)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: COR_INVESTIDO, display: "inline-block" }} />este mês
                </span>
                {temMesAnterior && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: COR_ACCENT, display: "inline-block" }} />mês anterior
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={Math.max(140, comparativoCategorias.length * 40)}>
                <BarChart data={comparativoCategorias} layout="vertical" margin={{ top: 4, right: 58, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: CHART_AXIS_TEXT, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatarEixoValor} />
                  <YAxis type="category" dataKey="label" width={78} tick={{ fill: CHART_AXIS_TEXT, fontSize: 10.5 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
                  <Bar dataKey="atual" name="este mês" fill={COR_INVESTIDO} radius={[0, 3, 3, 0]} barSize={7}>
                    <LabelList dataKey="atual" position="right" formatter={(v: number) => formatarMoeda(v)} fill={CHART_AXIS_TEXT} fontSize={9.5} />
                  </Bar>
                  {temMesAnterior && (
                    <Bar dataKey="anterior" name="mês anterior" fill={COR_ACCENT} radius={[0, 3, 3, 0]} barSize={7}>
                      <LabelList dataKey="anterior" position="right" formatter={(v: number) => formatarMoeda(v)} fill={CHART_AXIS_TEXT} fontSize={9.5} />
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div style={SEM_DADOS}>Sem dados suficientes ainda.</div>
          )}
        </Painel>

        <Painel
          titulo="Últimos Lançamentos"
          rodape={
            <button onClick={() => setPagina("extrato")} className="cf-link-mais cf-focus">
              Ver todos lançamentos →
            </button>
          }
        >
          {ultimosLancamentos.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Data", "Descrição", "Categoria", "", "Valor"].map((titulo, i) => (
                      <th
                        key={titulo || i}
                        style={{
                          textAlign: i === 4 ? "right" : i === 3 ? "center" : "left",
                          padding: "5px 6px",
                          fontSize: 9.5,
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
                    const entrada = t.tipo === "receita" || t.tipo === "investimento";
                    const cor = entrada ? "var(--verde)" : "var(--rust)";
                    return (
                      <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="cf-num" style={{ padding: "7px 6px", color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                          {new Date(t.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </td>
                        <td style={{ padding: "7px 6px", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.descricao}
                        </td>
                        <td style={{ padding: "7px 6px", color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                          {t.tipo === "receita" ? "Receita" : t.tipo === "investimento" ? "Investimento" : catLabel(t.categoria)}
                        </td>
                        <td style={{ padding: "7px 6px", textAlign: "center", color: cor, fontWeight: 700 }}>{entrada ? "↑" : "↓"}</td>
                        <td className="cf-num" style={{ padding: "7px 6px", textAlign: "right", color: cor, fontWeight: 600, whiteSpace: "nowrap" }}>
                          {formatarMoeda(t.valor)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={SEM_DADOS}>Sem lançamentos neste mês.</div>
          )}
        </Painel>
      </section>
    </motion.div>
  );
}
