import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Investimento } from "../types";
import { TIPOS_INVESTIMENTO } from "../constants";
import { formatarMoeda, formatarPct, parseMoeda } from "../utils/format";
import { IconeX, IconeEditar } from "../components/Icones";
import { rotuloCampo, campoInput, cartaoEstilo, botaoPrimario, linkDiscreto } from "../components/estilosComuns";

interface Props {
  investimentos: Investimento[];
  adicionarInvestimento: (inv: Omit<Investimento, "id">) => void;
  removerInvestimento: (id: string) => void;
  atualizarInvestimento: (id: string, campos: Partial<Investimento>) => void;
}

const CORES_TIPO = ["#20303F", "#2E7D5E", "#A8462B", "#B8862B", "#6B5B95", "#7A7166"];

export function Investimentos({ investimentos, adicionarInvestimento, removerInvestimento, atualizarInvestimento }: Props) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<string>(TIPOS_INVESTIMENTO[0]);
  const [aportado, setAportado] = useState("");
  const [atual, setAtual] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  function limparFormulario() {
    setNome("");
    setAportado("");
    setAtual("");
    setTipo(TIPOS_INVESTIMENTO[0]);
    setEditandoId(null);
  }

  function iniciarEdicao(inv: Investimento) {
    setEditandoId(inv.id);
    setNome(inv.nome);
    setTipo(inv.tipo);
    setAportado(String(inv.valorAportado).replace(".", ","));
    setAtual(String(inv.valorAtual).replace(".", ","));
  }

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    const va = parseMoeda(aportado);
    const vt = parseMoeda(atual);
    if (!nome.trim() || va === null || vt === null || va <= 0) return;
    if (editandoId) {
      atualizarInvestimento(editandoId, { nome: nome.trim(), tipo, valorAportado: va, valorAtual: vt });
    } else {
      adicionarInvestimento({ nome: nome.trim(), tipo, valorAportado: va, valorAtual: vt, data: new Date().toISOString() });
    }
    limparFormulario();
  }

  const totais = useMemo(() => {
    const totalAportado = investimentos.reduce((s, i) => s + i.valorAportado, 0);
    const totalAtual = investimentos.reduce((s, i) => s + i.valorAtual, 0);
    const rentabilidade = totalAportado > 0 ? ((totalAtual - totalAportado) / totalAportado) * 100 : 0;
    const porTipo = TIPOS_INVESTIMENTO.map((t, i) => ({
      tipo: t,
      valor: investimentos.filter((inv) => inv.tipo === t).reduce((s, inv) => s + inv.valorAtual, 0),
      cor: CORES_TIPO[i % CORES_TIPO.length],
    })).filter((t) => t.valor > 0);
    return { totalAportado, totalAtual, rentabilidade, porTipo };
  }, [investimentos]);

  return (
    <div>
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
            <input className="cf-focus" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="nome — ex: Tesouro Selic 2029" style={campoInput} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <select className="cf-focus" value={tipo} onChange={(e) => setTipo(e.target.value)} style={campoInput}>
              {TIPOS_INVESTIMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 110px" }}>
            <input className="cf-num cf-focus" value={aportado} onChange={(e) => setAportado(e.target.value)} placeholder="aportado" inputMode="decimal" style={campoInput} />
          </div>
          <div style={{ flex: "1 1 110px" }}>
            <input className="cf-num cf-focus" value={atual} onChange={(e) => setAtual(e.target.value)} placeholder="valor atual" inputMode="decimal" style={campoInput} />
          </div>
          <button type="submit" className="cf-btn cf-focus" style={botaoPrimario}>
            {editandoId ? "Salvar" : "Adicionar"}
          </button>
        </form>
      </section>

      {investimentos.length > 0 && (
        <>
          <section style={{ ...cartaoEstilo, marginBottom: 32 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>carteira</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
              <div>
                <div style={rotuloCampo}>total aportado</div>
                <div className="cf-num" style={{ fontSize: 19, fontWeight: 600 }}>{formatarMoeda(totais.totalAportado)}</div>
              </div>
              <div>
                <div style={rotuloCampo}>valor atual</div>
                <div className="cf-num" style={{ fontSize: 19, fontWeight: 600 }}>{formatarMoeda(totais.totalAtual)}</div>
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
              <div style={{ width: 200, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={totais.porTipo} dataKey="valor" nameKey="tipo" innerRadius={50} outerRadius={90} paddingAngle={2}>
                      {totais.porTipo.map((t, i) => <Cell key={i} fill={t.cor} stroke="var(--paper)" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={{ background: "#EDE6D4", border: "1px solid #20303F", borderRadius: 6, fontSize: 13 }} />
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
            {investimentos.map((inv) => {
              const rent = inv.valorAportado > 0 ? ((inv.valorAtual - inv.valorAportado) / inv.valorAportado) * 100 : 0;
              const rotulo = `${inv.nome}, ${inv.tipo}, ${formatarMoeda(inv.valorAtual)}`;
              return (
                <div key={inv.id} className="cf-linha" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--paper-linha)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5 }}>{inv.nome}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase" }}>{inv.tipo}</div>
                  </div>
                  <input
                    key={`${inv.id}-${inv.valorAtual}`}
                    className="cf-num cf-focus"
                    defaultValue={inv.valorAtual}
                    onBlur={(e) => {
                      const v = parseMoeda(e.target.value);
                      if (v !== null) atualizarInvestimento(inv.id, { valorAtual: v });
                    }}
                    style={{ ...campoInput, width: 100, textAlign: "right" }}
                  />
                  <span className="cf-num" style={{ fontSize: 13, minWidth: 64, textAlign: "right", color: rent >= 0 ? "var(--verde)" : "var(--rust)" }}>
                    {formatarPct(rent)}
                  </span>
                  <button
                    onClick={() => iniciarEdicao(inv)}
                    aria-label={`Editar ${rotulo}`}
                    className="cf-linha-remover cf-focus"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 4 }}
                  >
                    <IconeEditar />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir a posição "${inv.nome}"?`)) removerInvestimento(inv.id);
                    }}
                    aria-label={`Remover ${rotulo}`}
                    className="cf-linha-remover cf-focus"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 4 }}
                  >
                    <IconeX />
                  </button>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
