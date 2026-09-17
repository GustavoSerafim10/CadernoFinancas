import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Aposta, ResumoApostas } from "../types";
import { formatarMoeda, formatarPct, parseMoeda } from "../utils/format";
import { SeletorMes } from "../components/SeletorMes";
import { IconeX, IconeSeta } from "../components/Icones";
import { NumeroAnimado } from "../components/NumeroAnimado";
import {
  rotuloCampo, campoInput, cartaoEstilo, botaoPrimario, botaoSecundario, botaoGhost, linkDiscreto, badgeEstilo,
} from "../components/estilosComuns";

interface GrupoDia {
  chave: string;
  rotulo: string;
  apostas: Aposta[];
  apostado: number;
  lucro: number;
  pendentes: number;
}

function rotuloDia(iso: string): string {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  const chaveD = d.toLocaleDateString("pt-BR");
  if (chaveD === hoje.toLocaleDateString("pt-BR")) return "hoje";
  if (chaveD === ontem.toLocaleDateString("pt-BR")) return "ontem";
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", "");
}

function agruparPorDia(apostasOrdenadas: Aposta[]): GrupoDia[] {
  const grupos: GrupoDia[] = [];
  for (const a of apostasOrdenadas) {
    const chave = new Date(a.data).toLocaleDateString("pt-BR");
    let g = grupos[grupos.length - 1];
    if (!g || g.chave !== chave) {
      g = { chave, rotulo: rotuloDia(a.data), apostas: [], apostado: 0, lucro: 0, pendentes: 0 };
      grupos.push(g);
    }
    g.apostas.push(a);
    g.apostado += a.valorApostado;
    if (a.resultado === "pendente") {
      g.pendentes += 1;
    } else {
      g.lucro += a.resultado === "ganhou" ? a.retorno - a.valorApostado : -a.valorApostado;
    }
  }
  return grupos;
}

interface Props {
  refDate: Date;
  mudarMes: (delta: number) => void;
  apostasDoMes: Aposta[];
  resumoApostas: ResumoApostas;
  adicionarAposta: (descricao: string, valorApostado: number, data: string) => void;
  resolverAposta: (id: string, resultado: "ganhou" | "perdeu", retorno: number) => void;
  reabrirAposta: (id: string) => void;
  removerAposta: (id: string) => void;
}

export function Apostas({
  refDate, mudarMes, apostasDoMes, resumoApostas,
  adicionarAposta, resolverAposta, reabrirAposta, removerAposta,
}: Props) {
  const [descricao, setDescricao] = useState("");
  const [valorApostado, setValorApostado] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));

  const [resolvendoGanhoId, setResolvendoGanhoId] = useState<string | null>(null);
  const [retornoInput, setRetornoInput] = useState("");
  const [oddInput, setOddInput] = useState("");
  const [diasColapsados, setDiasColapsados] = useState<Set<string>>(new Set());

  function alternarDia(chave: string) {
    setDiasColapsados((prev) => {
      const next = new Set(prev);
      if (next.has(chave)) next.delete(chave);
      else next.add(chave);
      return next;
    });
  }

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    const v = parseMoeda(valorApostado);
    if (!descricao.trim() || v === null || v <= 0) return;
    adicionarAposta(descricao.trim(), v, `${data}T12:00:00.000Z`);
    setDescricao("");
    setValorApostado("");
  }

  function iniciarGanhou(a: Aposta) {
    setResolvendoGanhoId(a.id);
    setRetornoInput(String(a.valorApostado).replace(".", ","));
    setOddInput("");
  }

  function alterarOdd(a: Aposta, valor: string) {
    setOddInput(valor);
    const odd = parseMoeda(valor);
    if (odd !== null && odd > 0) {
      setRetornoInput((a.valorApostado * odd).toFixed(2).replace(".", ","));
    }
  }

  function alterarRetornoManual(valor: string) {
    setRetornoInput(valor);
    setOddInput("");
  }

  function confirmarGanhou(id: string) {
    const v = parseMoeda(retornoInput);
    if (v === null || v < 0) return;
    resolverAposta(id, "ganhou", v);
    setResolvendoGanhoId(null);
    setRetornoInput("");
    setOddInput("");
  }

  function handlePerdeu(a: Aposta) {
    if (window.confirm(`Marcar "${a.descricao}" como perdida (${formatarMoeda(a.valorApostado)})?`)) {
      resolverAposta(a.id, "perdeu", 0);
    }
  }

  function handleRemover(a: Aposta) {
    if (window.confirm(`Excluir a aposta "${a.descricao}"?`)) {
      removerAposta(a.id);
    }
  }

  const lista = [...apostasDoMes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  const grupos = agruparPorDia(lista);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <SeletorMes refDate={refDate} mudarMes={mudarMes} />

      <section style={{ marginBottom: 30 }}>
        <div style={rotuloCampo}>nova aposta</div>
        <form onSubmit={submeter} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: "2 1 200px" }}>
            <input
              className="cf-focus"
              aria-label="Descrição da operação"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="descrição — ex: Flamengo x Palmeiras, dupla vitória"
              style={campoInput}
            />
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <input
              className="cf-num cf-focus"
              aria-label="Valor apostado"
              value={valorApostado}
              onChange={(e) => setValorApostado(e.target.value)}
              placeholder="valor apostado"
              inputMode="decimal"
              style={campoInput}
            />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <input type="date" className="cf-focus" aria-label="Data da operação" value={data} onChange={(e) => setData(e.target.value)} style={campoInput} />
          </div>
          <button type="submit" className="cf-btn cf-focus" style={botaoPrimario}>Registrar</button>
        </form>
      </section>

      <section className="cf-card" style={{ ...cartaoEstilo, marginBottom: 32 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>resumo do mês</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16 }}>
          <div>
            <div style={rotuloCampo}>apostado</div>
            <NumeroAnimado valor={resumoApostas.apostado} formatar={formatarMoeda} className="cf-num" style={{ fontSize: 19, fontWeight: 600 }} />
          </div>
          <div>
            <div style={rotuloCampo}>retorno</div>
            <NumeroAnimado valor={resumoApostas.retorno} formatar={formatarMoeda} className="cf-num" style={{ fontSize: 19, fontWeight: 600 }} />
          </div>
          <div>
            <div style={rotuloCampo}>lucro líquido</div>
            <NumeroAnimado
              valor={resumoApostas.lucro}
              formatar={(v) => `${v >= 0 ? "+" : ""}${formatarMoeda(v)}`}
              className="cf-num"
              style={{ fontSize: 19, fontWeight: 700, color: resumoApostas.lucro >= 0 ? "var(--verde)" : "var(--rust)" }}
            />
          </div>
          <div>
            <div style={rotuloCampo}>taxa de acerto</div>
            <div className="cf-num" style={{ fontSize: 19, fontWeight: 600 }}>
              {resumoApostas.ganhas + resumoApostas.perdidas > 0 ? formatarPct(resumoApostas.taxaAcerto).replace("+", "") : "—"}
            </div>
          </div>
        </div>
        {resumoApostas.pendentes > 0 && (
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 14 }}>
            {resumoApostas.pendentes} aposta(s) pendente(s) — o lucro delas ainda não entra no saldo.
          </div>
        )}
      </section>

      <section>
        <div style={rotuloCampo}>apostas do mês</div>
        {lista.length === 0 ? (
          <p style={{ color: "var(--ink-soft)", fontSize: 14, fontStyle: "italic" }}>nenhuma aposta registrada esse mês.</p>
        ) : (
          <AnimatePresence initial={false}>
          {(() => {
            let indice = 0;
            return grupos.flatMap((g, gi) => {
              const colapsado = diasColapsados.has(g.chave);
              const cabecalho = (
                <button
                  key={`cab-${g.chave}`}
                  type="button"
                  onClick={() => alternarDia(g.chave)}
                  aria-expanded={!colapsado}
                  className="cf-focus"
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 10,
                    width: "100%",
                    marginTop: gi === 0 ? 0 : 22,
                    marginBottom: 6,
                    padding: 0,
                    paddingBottom: 5,
                    borderTop: "none",
                    borderLeft: "none",
                    borderRight: "none",
                    borderBottom: "1px solid var(--border)",
                    background: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        color: "var(--text-muted)",
                        transform: colapsado ? "none" : "rotate(90deg)",
                        transition: "transform 0.18s ease",
                      }}
                    >
                      <IconeSeta dir="right" />
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>
                      {g.rotulo}
                    </span>
                  </span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span className="cf-num" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {formatarMoeda(g.apostado)} apostado{g.pendentes > 0 ? ` · ${g.pendentes} pendente(s)` : ""}
                    </span>
                    <span
                      className="cf-num"
                      style={{ fontSize: 13.5, fontWeight: 600, color: g.lucro >= 0 ? "var(--verde)" : "var(--rust)", opacity: 0.72 }}
                    >
                      {g.lucro >= 0 ? "+" : ""}{formatarMoeda(g.lucro)}
                    </span>
                  </span>
                </button>
              );

              if (colapsado) return [cabecalho];

              const linhas = g.apostas.map((a) => {
                const i = indice++;
                const lucro = a.resultado === "ganhou" ? a.retorno - a.valorApostado : a.resultado === "perdeu" ? -a.valorApostado : 0;
                const corStatus =
                  a.resultado === "ganhou" ? "var(--verde)" : a.resultado === "perdeu" ? "var(--rust)" : "var(--ink-soft)";
                const rotuloStatus = a.resultado === "ganhou" ? "ganhou" : a.resultado === "perdeu" ? "perdeu" : "pendente";
                const rotulo = `${a.descricao}, ${formatarMoeda(a.valorApostado)}, ${new Date(a.data).toLocaleDateString("pt-BR")}`;
                return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, delay: i * 0.03 }}
                className="cf-linha"
                style={{ padding: "10px 0", borderBottom: "1px solid var(--paper-linha)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, rowGap: 8, flexWrap: "wrap" }}>
                  <span style={{ flex: "1 1 140px", minWidth: 0, fontSize: 14.5 }}>{a.descricao}</span>
                  <span style={badgeEstilo(corStatus)}>{rotuloStatus}</span>
                  <span className="cf-num" style={{ fontSize: 13, color: "var(--ink-soft)", minWidth: 84, textAlign: "right" }}>
                    {formatarMoeda(a.valorApostado)}
                  </span>
                  <span
                    className="cf-num"
                    style={{ fontSize: 15, fontWeight: 600, minWidth: 92, textAlign: "right", color: corStatus }}
                  >
                    {a.resultado === "pendente" ? "—" : `${lucro >= 0 ? "+" : ""}${formatarMoeda(lucro)}`}
                  </span>

                  {a.resultado === "pendente" ? (
                    <>
                      <button
                        onClick={() => iniciarGanhou(a)}
                        aria-label={`Marcar ganhou ${rotulo}`}
                        className="cf-focus"
                        style={{ ...botaoSecundario, padding: "3px 10px", fontSize: 11.5, color: "var(--verde)" }}
                      >
                        Ganhou
                      </button>
                      <button
                        onClick={() => handlePerdeu(a)}
                        aria-label={`Marcar perdeu ${rotulo}`}
                        className="cf-focus"
                        style={{ ...botaoSecundario, padding: "3px 10px", fontSize: 11.5, color: "var(--rust)" }}
                      >
                        Perdeu
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => reabrirAposta(a.id)}
                      aria-label={`Reabrir ${rotulo}`}
                      className="cf-focus"
                      style={linkDiscreto}
                    >
                      reabrir
                    </button>
                  )}
                  <button
                    onClick={() => handleRemover(a)}
                    aria-label={`Remover ${rotulo}`}
                    className="cf-focus"
                    style={botaoGhost}
                  >
                    <IconeX />
                  </button>
                </div>

                {resolvendoGanhoId === a.id && (() => {
                  const retornoPreview = parseMoeda(retornoInput);
                  const lucroPreview = retornoPreview !== null ? retornoPreview - a.valorApostado : null;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, rowGap: 8, flexWrap: "wrap", marginTop: 10, marginLeft: 19 }}>
                      <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>odd</span>
                      <input
                        autoFocus
                        className="cf-num cf-focus"
                        aria-label="Odd da aposta"
                        value={oddInput}
                        onChange={(e) => alterarOdd(a, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && confirmarGanhou(a.id)}
                        placeholder="ex: 1,83"
                        style={{ ...campoInput, width: 70 }}
                      />
                      <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>ou voltou quanto no total?</span>
                      <input
                        className="cf-num cf-focus"
                        aria-label="Valor total de retorno"
                        value={retornoInput}
                        onChange={(e) => alterarRetornoManual(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && confirmarGanhou(a.id)}
                        style={{ ...campoInput, width: 100 }}
                      />
                      {lucroPreview !== null && (
                        <span
                          className="cf-num"
                          style={{ fontSize: 12.5, fontWeight: 600, color: lucroPreview >= 0 ? "var(--verde)" : "var(--rust)" }}
                        >
                          lucro: {lucroPreview >= 0 ? "+" : ""}{formatarMoeda(lucroPreview)}
                        </span>
                      )}
                      <button onClick={() => confirmarGanhou(a.id)} className="cf-focus" style={{ ...botaoSecundario, padding: "3px 10px", fontSize: 11.5 }}>
                        confirmar
                      </button>
                      <button onClick={() => setResolvendoGanhoId(null)} className="cf-focus" style={linkDiscreto}>
                        cancelar
                      </button>
                    </div>
                  );
                })()}
              </motion.div>
                );
              });

              return [cabecalho, ...linhas];
            });
          })()}
          </AnimatePresence>
        )}
      </section>
    </motion.div>
  );
}
