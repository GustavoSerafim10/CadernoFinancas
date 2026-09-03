import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Investimento } from "../types";
import { TIPOS_INVESTIMENTO } from "../constants";
import { formatarMoeda, formatarPct, parseMoeda } from "../utils/format";
import { calcularValorAtualCaixinha } from "../utils/caixinha";
import { useOcultarSvgDecorativo } from "../hooks/useOcultarSvgDecorativo";
import { IconeX, IconeEditar } from "../components/Icones";
import { NumeroAnimado } from "../components/NumeroAnimado";
import { rotuloCampo, campoInput, cartaoEstilo, botaoPrimario, botaoGhost, linkDiscreto } from "../components/estilosComuns";
import {
  CHART_STROKE_SEPARATOR, CHART_TOOLTIP_STYLE, CHART_TOOLTIP_ITEM_STYLE, CHART_TOOLTIP_LABEL_STYLE,
  CORES_TIPO_INVESTIMENTO,
} from "../components/chartTheme";

interface Props {
  investimentos: Investimento[];
  adicionarInvestimento: (inv: Omit<Investimento, "id">) => void;
  removerInvestimento: (id: string) => void;
  atualizarInvestimento: (id: string, campos: Partial<Investimento>) => void;
}

export function Investimentos({ investimentos, adicionarInvestimento, removerInvestimento, atualizarInvestimento }: Props) {
  const donutRef = useRef<HTMLDivElement>(null);
  useOcultarSvgDecorativo(donutRef);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<string>(TIPOS_INVESTIMENTO[0]);
  const [aportado, setAportado] = useState("");
  const [atual, setAtual] = useState("");
  const [taxaMensal, setTaxaMensal] = useState("");
  const [dataAporte, setDataAporte] = useState(() => new Date().toISOString().slice(0, 10));
  const [instituicao, setInstituicao] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const ehCaixinha = tipo === "Caixinha";

  function limparFormulario() {
    setNome("");
    setAportado("");
    setAtual("");
    setTaxaMensal("");
    setDataAporte(new Date().toISOString().slice(0, 10));
    setInstituicao("");
    setTipo(TIPOS_INVESTIMENTO[0]);
    setEditandoId(null);
  }

  function iniciarEdicao(inv: Investimento) {
    setEditandoId(inv.id);
    setNome(inv.nome);
    setTipo(inv.tipo);
    setAportado(String(inv.valorAportado).replace(".", ","));
    setAtual(String(inv.valorAtual).replace(".", ","));
    setTaxaMensal(inv.taxaMensal !== undefined ? String(inv.taxaMensal).replace(".", ",") : "");
    setDataAporte(inv.data.slice(0, 10));
    setInstituicao(inv.instituicao || "");
  }

  function valorAtualEfetivo(inv: Investimento): number {
    if (inv.tipo === "Caixinha" && inv.taxaMensal !== undefined) {
      return calcularValorAtualCaixinha(inv.valorAportado, inv.data, inv.taxaMensal);
    }
    return inv.valorAtual;
  }

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    const va = parseMoeda(aportado);
    if (!nome.trim() || va === null || va <= 0 || !dataAporte) return;
    const dataISO = `${dataAporte}T12:00:00.000Z`;
    const instituicaoCampo = instituicao.trim() || undefined;

    if (ehCaixinha) {
      const taxa = parseMoeda(taxaMensal);
      if (taxa === null || taxa < 0) return;
      if (editandoId) {
        atualizarInvestimento(editandoId, { nome: nome.trim(), tipo, valorAportado: va, valorAtual: va, data: dataISO, taxaMensal: taxa, instituicao: instituicaoCampo });
      } else {
        adicionarInvestimento({ nome: nome.trim(), tipo, valorAportado: va, valorAtual: va, data: dataISO, taxaMensal: taxa, instituicao: instituicaoCampo });
      }
    } else {
      const vt = parseMoeda(atual);
      if (vt === null) return;
      if (editandoId) {
        atualizarInvestimento(editandoId, { nome: nome.trim(), tipo, valorAportado: va, valorAtual: vt, data: dataISO, taxaMensal: undefined, instituicao: instituicaoCampo });
      } else {
        adicionarInvestimento({ nome: nome.trim(), tipo, valorAportado: va, valorAtual: vt, data: dataISO, instituicao: instituicaoCampo });
      }
    }
    limparFormulario();
  }

  const totais = useMemo(() => {
    const totalAportado = investimentos.reduce((s, i) => s + i.valorAportado, 0);
    const totalAtual = investimentos.reduce((s, i) => s + valorAtualEfetivo(i), 0);
    const resultado = totalAtual - totalAportado;
    const rentabilidade = totalAportado > 0 ? (resultado / totalAportado) * 100 : 0;
    const porTipo = TIPOS_INVESTIMENTO.map((t, i) => ({
      tipo: t,
      valor: investimentos.filter((inv) => inv.tipo === t).reduce((s, inv) => s + valorAtualEfetivo(inv), 0),
      cor: CORES_TIPO_INVESTIMENTO[i % CORES_TIPO_INVESTIMENTO.length],
    })).filter((t) => t.valor > 0);
    return { totalAportado, totalAtual, resultado, rentabilidade, porTipo };
  }, [investimentos]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ ...rotuloCampo, marginBottom: 0 }}>{editandoId ? "editando posição" : "adicionar posição"}</div>
          {editandoId && (
            <button onClick={limparFormulario} className="cf-focus" style={linkDiscreto}>
              cancelar
            </button>
          )}
        </div>
        <form onSubmit={submeter} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: "2 1 160px" }}>
            <input className="cf-focus" aria-label="Nome do investimento" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="nome — ex: Tesouro Selic 2029" style={campoInput} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <select className="cf-focus" aria-label="Tipo do investimento" value={tipo} onChange={(e) => setTipo(e.target.value)} style={campoInput}>
              {TIPOS_INVESTIMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 110px" }}>
            <input className="cf-num cf-focus" aria-label="Valor aportado" value={aportado} onChange={(e) => setAportado(e.target.value)} placeholder="aportado" inputMode="decimal" style={campoInput} />
          </div>
          <div style={{ flex: "1 1 110px" }}>
            {ehCaixinha ? (
              <input className="cf-num cf-focus" aria-label="Rentabilidade mensal em porcentagem" value={taxaMensal} onChange={(e) => setTaxaMensal(e.target.value)} placeholder="rentabilidade % ao mês" inputMode="decimal" style={campoInput} />
            ) : (
              <input className="cf-num cf-focus" aria-label="Valor atual" value={atual} onChange={(e) => setAtual(e.target.value)} placeholder="valor atual" inputMode="decimal" style={campoInput} />
            )}
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <input type="date" className="cf-focus" aria-label="Data do aporte" value={dataAporte} onChange={(e) => setDataAporte(e.target.value)} style={campoInput} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <input className="cf-focus" aria-label="Instituição ou corretora, opcional" value={instituicao} onChange={(e) => setInstituicao(e.target.value)} placeholder="instituição — opcional" style={campoInput} />
          </div>
          <button type="submit" className="cf-btn cf-focus" style={botaoPrimario}>
            {editandoId ? "Salvar" : "Adicionar"}
          </button>
        </form>
      </section>

      {investimentos.length === 0 ? (
        <p style={{ color: "var(--ink-soft)", fontSize: 14, fontStyle: "italic" }}>nenhuma posição registrada ainda.</p>
      ) : (
        <>
          <section className="cf-card" style={{ ...cartaoEstilo, marginBottom: 32 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>carteira</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
              <div>
                <div style={rotuloCampo}>total aportado</div>
                <NumeroAnimado valor={totais.totalAportado} formatar={formatarMoeda} className="cf-num" style={{ fontSize: 19, fontWeight: 600 }} />
              </div>
              <div>
                <div style={rotuloCampo}>valor atual</div>
                <NumeroAnimado valor={totais.totalAtual} formatar={formatarMoeda} className="cf-num" style={{ fontSize: 19, fontWeight: 600 }} />
              </div>
              <div>
                <div style={rotuloCampo}>resultado</div>
                <div className="cf-num" style={{ fontSize: 19, fontWeight: 700, color: totais.resultado >= 0 ? "var(--verde)" : "var(--rust)" }}>
                  {totais.resultado > 0 ? "+" : ""}
                  {formatarMoeda(totais.resultado)}
                </div>
              </div>
              <div>
                <div style={rotuloCampo}>rentabilidade</div>
                <div className="cf-num" style={{ fontSize: 19, fontWeight: 700, color: totais.rentabilidade >= 0 ? "var(--verde)" : "var(--rust)" }}>
                  {formatarPct(totais.rentabilidade)}
                </div>
              </div>
            </div>
          </section>

          {totais.porTipo.length > 1 && (
            <section style={{ marginBottom: 32, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
              <div
                ref={donutRef}
                role="img"
                aria-label={`Gráfico de rosca com o valor investido por tipo: ${totais.porTipo.map((t) => `${t.tipo} ${formatarMoeda(t.valor)}`).join(", ")}.`}
                style={{ width: 200, height: 200 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={totais.porTipo} dataKey="valor" nameKey="tipo" innerRadius={50} outerRadius={90} paddingAngle={2}>
                      {totais.porTipo.map((t, i) => <Cell key={i} fill={t.cor} stroke={CHART_STROKE_SEPARATOR} strokeWidth={2} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={CHART_TOOLTIP_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {totais.porTipo.map((t) => (
                  <div key={t.tipo} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: t.cor }} />
                    <span style={{ color: "var(--ink-soft)", minWidth: 100 }}>{t.tipo}</span>
                    <span className="cf-num">{formatarMoeda(t.valor)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div style={rotuloCampo}>posições</div>
            {investimentos.map((inv, i) => {
              const ehCaixinhaLinha = inv.tipo === "Caixinha" && inv.taxaMensal !== undefined;
              const valorAtual = valorAtualEfetivo(inv);
              const rent = inv.valorAportado > 0 ? ((valorAtual - inv.valorAportado) / inv.valorAportado) * 100 : 0;
              const rotulo = `${inv.nome}, ${inv.tipo}, ${formatarMoeda(valorAtual)}`;
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="cf-linha"
                  style={{ display: "flex", alignItems: "center", gap: 12, rowGap: 6, flexWrap: "wrap", padding: "10px 0", borderBottom: "1px solid var(--paper-linha)" }}
                >
                  <div style={{ flex: "1 1 140px", minWidth: 0 }} title={`Aportado em ${new Date(inv.data).toLocaleDateString("pt-BR")}`}>
                    <div style={{ fontSize: 14.5 }}>{inv.nome}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase" }}>
                      {inv.tipo}
                      {ehCaixinhaLinha && ` · ${formatarPct(inv.taxaMensal!)}/mês`}
                      {inv.instituicao && ` · ${inv.instituicao}`}
                    </div>
                  </div>
                  {ehCaixinhaLinha ? (
                    <span
                      className="cf-num"
                      aria-label={`Valor atual de ${inv.nome}`}
                      style={{ ...campoInput, width: 100, textAlign: "right", display: "inline-block", border: "1px solid transparent" }}
                    >
                      {formatarMoeda(valorAtual)}
                    </span>
                  ) : (
                    <input
                      key={`${inv.id}-${inv.valorAtual}`}
                      className="cf-num cf-focus"
                      aria-label={`Valor atual de ${inv.nome}`}
                      defaultValue={inv.valorAtual}
                      onBlur={(e) => {
                        const v = parseMoeda(e.target.value);
                        if (v !== null) atualizarInvestimento(inv.id, { valorAtual: v });
                      }}
                      style={{ ...campoInput, width: 100, textAlign: "right" }}
                    />
                  )}
                  <span className="cf-num" style={{ fontSize: 13, minWidth: 64, textAlign: "right", color: rent >= 0 ? "var(--verde)" : "var(--rust)" }}>
                    {formatarPct(rent)}
                  </span>
                  <button
                    onClick={() => iniciarEdicao(inv)}
                    aria-label={`Editar ${rotulo}`}
                    className="cf-linha-remover cf-focus"
                    style={botaoGhost}
                  >
                    <IconeEditar />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir a posição "${inv.nome}"?`)) removerInvestimento(inv.id);
                    }}
                    aria-label={`Remover ${rotulo}`}
                    className="cf-linha-remover cf-focus"
                    style={botaoGhost}
                  >
                    <IconeX />
                  </button>
                </motion.div>
              );
            })}
          </section>
        </>
      )}
    </motion.div>
  );
}
