import { useMemo, CSSProperties } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, BarChart, Line, Area, AreaChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ResumoMes, PontoHistorico, Insight, ResumoApostas, Transacao } from "../types";
import { MESES, catLabel, PaginaId } from "../constants";
import { formatarMoeda, formatarPct } from "../utils/format";
import { SeletorMes } from "../components/SeletorMes";
import { KpiCard } from "../components/KpiCard";
import { Painel } from "../components/Painel";
import { IconeCarteira, IconeCartao, IconeInvestimentos, IconeApostas, IconeSaldo, IconeDownload } from "../components/Icones";
import { rotuloCampo, cartaoEstilo, botaoSecundario } from "../components/estilosComuns";
import {
  CHART_GRID, CHART_AXIS_TEXT, CHART_AXIS_LINE, CHART_TOOLTIP_STYLE, CHART_TOOLTIP_ITEM_STYLE, CHART_TOOLTIP_LABEL_STYLE,
  CHART_STROKE_SEPARATOR, COR_GASTOS, COR_INVESTIDO, COR_RECEITA, COR_APOSTAS, COR_ACCENT,
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
  setPagina: (p: PaginaId) => void;
}

function formatarEixoValor(v: number): string {
  return Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`;
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
  refDate, mudarMes, resumoMes, resumoMesAnterior, historicoMensal, transacoesDoMes,
  insights, resumoApostas, exportarCSV, exportarTudoJSON, setPagina,
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <SeletorMes refDate={refDate} mudarMes={mudarMes} semMargem />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={exportarCSV} className="cf-focus" style={{ ...botaoSecundario, fontSize: 12, display: "flex", alignItems: "center", gap: 7 }}>
            <IconeDownload /> Exportar CSV
          </button>
          <button onClick={exportarTudoJSON} className="cf-focus" style={{ ...botaoSecundario, fontSize: 12, display: "flex", alignItems: "center", gap: 7 }}>
            <IconeDownload /> Exportar JSON
          </button>
        </div>
      </div>

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

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 20 }}>
        <Painel titulo="Gastos por categoria">
          {resumoMes.porCategoria.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 108, height: 108 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={resumoMes.porCategoria} dataKey="total" nameKey="label" innerRadius={32} outerRadius={52} paddingAngle={2}>
                      {resumoMes.porCategoria.map((c) => (
                        <Cell key={c.id} fill={c.cor} stroke={CHART_STROKE_SEPARATOR} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                {categoriasOrdenadas.slice(0, 4).map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.cor, flex: "0 0 auto" }} />
                    <span style={{ color: "var(--ink-soft)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.label}
                    </span>
                    <span className="cf-num" style={{ flex: "0 0 auto" }}>{formatarMoeda(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={SEM_DADOS}>Sem gastos registrados neste mês.</div>
          )}
        </Painel>

        <Painel titulo="Fluxo de caixa mensal" acao={<span className="cf-pill-decorativo">Últimos 12 meses ⌄</span>}>
          {historicoComLabel.length > 1 ? (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 11, color: "var(--ink-soft)", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: COR_GASTOS, display: "inline-block" }} />gastos
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: COR_INVESTIDO, display: "inline-block" }} />investido
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 1.5, background: COR_RECEITA, display: "inline-block" }} />receita
                </span>
              </div>
              <ResponsiveContainer width="100%" height={170}>
                <ComposedChart data={historicoComLabel} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: CHART_AXIS_TEXT, fontSize: 10.5 }} axisLine={{ stroke: CHART_AXIS_LINE }} tickLine={false} />
                  <YAxis tick={{ fill: CHART_AXIS_TEXT, fontSize: 10.5 }} axisLine={false} tickLine={false} tickFormatter={formatarEixoValor} />
                  <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
                  <Bar dataKey="gastos" name="Gastos" fill={COR_GASTOS} radius={[3, 3, 0, 0]} barSize={10} />
                  <Bar dataKey="investido" name="Investido" fill={COR_INVESTIDO} radius={[3, 3, 0, 0]} barSize={10} />
                  <Line dataKey="receita" name="Receita" stroke={COR_RECEITA} strokeWidth={1.75} strokeDasharray="4 3" dot={{ r: 2.5, fill: COR_RECEITA }} />
                </ComposedChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div style={SEM_DADOS}>Histórico insuficiente ainda.</div>
          )}
        </Painel>

        <Painel titulo="Evolução do saldo acumulado">
          {saldoAcumulado.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={saldoAcumulado} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="saldoAcumuladoGradiente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COR_ACCENT} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COR_ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: CHART_AXIS_TEXT, fontSize: 10.5 }} axisLine={{ stroke: CHART_AXIS_LINE }} tickLine={false} />
                <YAxis tick={{ fill: CHART_AXIS_TEXT, fontSize: 10.5 }} axisLine={false} tickLine={false} tickFormatter={formatarEixoValor} />
                <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
                <Area type="monotone" dataKey="saldo" stroke={COR_ACCENT} strokeWidth={2} fill="url(#saldoAcumuladoGradiente)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={SEM_DADOS}>Histórico insuficiente ainda.</div>
          )}
        </Painel>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        <Painel
          titulo="Distribuição por categoria"
          rodape={
            <button onClick={() => setPagina("metas")} className="cf-link-mais cf-focus">
              Ver todas categorias →
            </button>
          }
        >
          {categoriasOrdenadas.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 108, height: 108 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoriasOrdenadas} dataKey="total" nameKey="label" innerRadius={32} outerRadius={52} paddingAngle={2}>
                      {categoriasOrdenadas.map((c) => (
                        <Cell key={c.id} fill={c.cor} stroke={CHART_STROKE_SEPARATOR} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatarPct((v / (totalGastosCategoria || 1)) * 100)} contentStyle={CHART_TOOLTIP_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                {categoriasOrdenadas.slice(0, 4).map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.cor, flex: "0 0 auto" }} />
                    <span style={{ color: "var(--ink-soft)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.label}
                    </span>
                    <span className="cf-num" style={{ flex: "0 0 auto", color: "var(--text-muted)" }}>
                      {totalGastosCategoria > 0 ? Math.round((c.total / totalGastosCategoria) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={SEM_DADOS}>Sem gastos registrados neste mês.</div>
          )}
        </Painel>

        <Painel titulo="Comparativo por categoria">
          {comparativoCategorias.length > 0 ? (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 11, color: "var(--ink-soft)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: "rgba(255,255,255,0.22)", display: "inline-block" }} />mês anterior
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: COR_ACCENT, display: "inline-block" }} />este mês
                </span>
              </div>
              <ResponsiveContainer width="100%" height={Math.max(140, comparativoCategorias.length * 34)}>
                <BarChart data={comparativoCategorias} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: CHART_AXIS_TEXT, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatarEixoValor} />
                  <YAxis type="category" dataKey="label" width={78} tick={{ fill: CHART_AXIS_TEXT, fontSize: 10.5 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
                  <Bar dataKey="anterior" name="mês anterior" fill="rgba(255,255,255,0.18)" radius={[0, 3, 3, 0]} barSize={7} />
                  <Bar dataKey="atual" name="este mês" fill={COR_ACCENT} radius={[0, 3, 3, 0]} barSize={7} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div style={SEM_DADOS}>Sem dados suficientes ainda.</div>
          )}
        </Painel>

        <Painel
          titulo="Últimos lançamentos"
          rodape={
            <button onClick={() => setPagina("extrato")} className="cf-link-mais cf-focus">
              Ver todos lançamentos →
            </button>
          }
        >
          {ultimosLancamentos.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Data", "Descrição", "Valor"].map((titulo, i) => (
                      <th
                        key={titulo}
                        style={{
                          textAlign: i === 2 ? "right" : "left",
                          padding: "5px 6px",
                          fontSize: 10,
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
                        <td className="cf-num" style={{ padding: "7px 6px", color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                          {new Date(t.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </td>
                        <td style={{ padding: "7px 6px", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.descricao}
                        </td>
                        <td className="cf-num" style={{ padding: "7px 6px", textAlign: "right", color: cor, fontWeight: 600, whiteSpace: "nowrap" }}>
                          {isReceita || isInv ? "+" : "−"} {formatarMoeda(t.valor)}
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
