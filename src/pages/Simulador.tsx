import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatarMoeda, parseMoeda } from "../utils/format";
import { simular, MAX_MESES } from "../wasm/engine";
import { NumeroAnimado } from "../components/NumeroAnimado";
import { rotuloCampo, campoInput, cartaoEstilo, botaoPrimario, badgeEstilo } from "../components/estilosComuns";
import {
  CHART_GRID, CHART_AXIS_TEXT, CHART_AXIS_LINE, CHART_TOOLTIP_STYLE, CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_LABEL_STYLE, COR_ACCENT,
} from "../components/chartTheme";

interface Resultado {
  saldos: number[];
  totalAportado: number;
}

export function Simulador() {
  const [valorInicial, setValorInicial] = useState("1000");
  const [aporteMensal, setAporteMensal] = useState("300");
  const [taxaAnual, setTaxaAnual] = useState("10");
  const [anos, setAnos] = useState("10");

  const [calculando, setCalculando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    const vi = parseMoeda(valorInicial);
    const am = parseMoeda(aporteMensal);
    const ta = parseMoeda(taxaAnual);
    const anosNum = parseInt(anos, 10);
    if (vi === null || am === null || ta === null || vi < 0 || am < 0 || ta < 0 || isNaN(anosNum) || anosNum <= 0) {
      setErro("Confere os valores — todos precisam ser números válidos e positivos.");
      return;
    }
    const meses = Math.min(anosNum * 12, MAX_MESES);
    setErro(null);
    setCalculando(true);
    try {
      const saldos = await simular(vi, am, ta, meses);
      setResultado({ saldos, totalAportado: vi + am * saldos.length });
    } catch {
      setErro("Não consegui carregar o motor de simulação (WebAssembly) agora.");
    } finally {
      setCalculando(false);
    }
  }

  const dadosGrafico = resultado
    ? resultado.saldos.map((saldo, i) => ({ mes: i + 1, saldo }))
    : [];
  const saldoFinal = resultado?.saldos[resultado.saldos.length - 1] ?? 0;
  const totalJuros = resultado ? saldoFinal - resultado.totalAportado : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={rotuloCampo}>simulador de investimentos</div>
      </div>
      <div style={{ marginBottom: 22 }}>
        <span style={badgeEstilo(COR_ACCENT)}>⚙ calculado via Rust + WebAssembly</span>
      </div>

      <section style={{ marginBottom: 28 }}>
        <form onSubmit={submeter} style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 140px" }}>
            <label style={rotuloCampo}>valor inicial</label>
            <input className="cf-num cf-focus" value={valorInicial} onChange={(e) => setValorInicial(e.target.value)} inputMode="decimal" style={campoInput} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={rotuloCampo}>aporte mensal</label>
            <input className="cf-num cf-focus" value={aporteMensal} onChange={(e) => setAporteMensal(e.target.value)} inputMode="decimal" style={campoInput} />
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label style={rotuloCampo}>taxa anual (%)</label>
            <input className="cf-num cf-focus" value={taxaAnual} onChange={(e) => setTaxaAnual(e.target.value)} inputMode="decimal" style={campoInput} />
          </div>
          <div style={{ flex: "1 1 100px" }}>
            <label style={rotuloCampo}>anos (máx. {MAX_MESES / 12})</label>
            <input
              className="cf-num cf-focus"
              type="number"
              min={1}
              max={MAX_MESES / 12}
              value={anos}
              onChange={(e) => setAnos(e.target.value)}
              style={campoInput}
            />
          </div>
          <button type="submit" className="cf-btn cf-focus" style={botaoPrimario} disabled={calculando}>
            {calculando ? "calculando…" : "Simular"}
          </button>
        </form>
        {erro && <div style={{ color: "var(--rust)", fontSize: 12.5, marginTop: 10 }}>{erro}</div>}
      </section>

      {resultado && resultado.saldos.length > 0 && (
        <>
          <section className="cf-card" style={{ ...cartaoEstilo, marginBottom: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
              <div>
                <div style={rotuloCampo}>saldo final</div>
                <NumeroAnimado valor={saldoFinal} formatar={formatarMoeda} className="cf-num" style={{ fontSize: 20, fontWeight: 700 }} />
              </div>
              <div>
                <div style={rotuloCampo}>total aportado</div>
                <NumeroAnimado valor={resultado.totalAportado} formatar={formatarMoeda} className="cf-num" style={{ fontSize: 20, fontWeight: 600 }} />
              </div>
              <div>
                <div style={rotuloCampo}>total em juros</div>
                <NumeroAnimado
                  valor={totalJuros}
                  formatar={formatarMoeda}
                  className="cf-num"
                  style={{ fontSize: 20, fontWeight: 600, color: "var(--verde)" }}
                />
              </div>
            </div>
          </section>

          <section>
            <div style={rotuloCampo}>evolução do saldo</div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dadosGrafico} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="simuladorGradiente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COR_ACCENT} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={COR_ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }}
                  axisLine={{ stroke: CHART_AXIS_LINE }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}m`}
                />
                <YAxis
                  tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(v: number) => formatarMoeda(v)}
                  labelFormatter={(v) => `mês ${v}`}
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                />
                <Area type="monotone" dataKey="saldo" stroke={COR_ACCENT} strokeWidth={2} fill="url(#simuladorGradiente)" />
              </AreaChart>
            </ResponsiveContainer>
          </section>
        </>
      )}
    </motion.div>
  );
}
