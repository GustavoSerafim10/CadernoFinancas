import { useState } from "react";
import { Aposta, ResumoApostas } from "../types";
import { formatarMoeda, formatarPct, parseMoeda } from "../utils/format";
import { SeletorMes } from "../components/SeletorMes";
import { IconeX } from "../components/Icones";
import { rotuloCampo, campoInput, cartaoEstilo, botaoPrimario, botaoSecundario, linkDiscreto } from "../components/estilosComuns";

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
  }

  function confirmarGanhou(id: string) {
    const v = parseMoeda(retornoInput);
    if (v === null || v < 0) return;
    resolverAposta(id, "ganhou", v);
    setResolvendoGanhoId(null);
    setRetornoInput("");
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

  return (
    <div>
      <SeletorMes refDate={refDate} mudarMes={mudarMes} corDestaque="#7A3E5E" />

      <section style={{ marginBottom: 30 }}>
        <div style={rotuloCampo}>nova aposta</div>
        <form onSubmit={submeter} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: "2 1 200px" }}>
            <input
              className="cf-focus"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="descrição — ex: Flamengo x Palmeiras, dupla vitória"
              style={campoInput}
            />
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <input
              className="cf-num cf-focus"
              value={valorApostado}
              onChange={(e) => setValorApostado(e.target.value)}
              placeholder="valor apostado"
              inputMode="decimal"
              style={campoInput}
            />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <input type="date" className="cf-focus" value={data} onChange={(e) => setData(e.target.value)} style={campoInput} />
          </div>
          <button type="submit" className="cf-btn cf-focus" style={botaoPrimario}>Registrar</button>
        </form>
      </section>

      <section style={{ ...cartaoEstilo, marginBottom: 32 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>resumo do mês</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16 }}>
          <div>
            <div style={rotuloCampo}>apostado</div>
            <div className="cf-num" style={{ fontSize: 19, fontWeight: 600 }}>{formatarMoeda(resumoApostas.apostado)}</div>
          </div>
          <div>
            <div style={rotuloCampo}>retorno</div>
            <div className="cf-num" style={{ fontSize: 19, fontWeight: 600 }}>{formatarMoeda(resumoApostas.retorno)}</div>
          </div>
          <div>
            <div style={rotuloCampo}>lucro líquido</div>
            <div
              className="cf-num"
              style={{ fontSize: 19, fontWeight: 700, color: resumoApostas.lucro >= 0 ? "var(--verde)" : "var(--rust)" }}
            >
              {resumoApostas.lucro >= 0 ? "+" : ""}
              {formatarMoeda(resumoApostas.lucro)}
            </div>
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
          lista.map((a) => {
            const lucro = a.resultado === "ganhou" ? a.retorno - a.valorApostado : a.resultado === "perdeu" ? -a.valorApostado : 0;
            const corStatus =
              a.resultado === "ganhou" ? "var(--verde)" : a.resultado === "perdeu" ? "var(--rust)" : "var(--ink-soft)";
            const rotuloStatus = a.resultado === "ganhou" ? "ganhou" : a.resultado === "perdeu" ? "perdeu" : "pendente";
            const rotulo = `${a.descricao}, ${formatarMoeda(a.valorApostado)}, ${new Date(a.data).toLocaleDateString("pt-BR")}`;
            return (
              <div key={a.id} className="cf-linha" style={{ padding: "10px 0", borderBottom: "1px solid var(--paper-linha)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: corStatus, flex: "0 0 auto" }} />
                  <span style={{ flex: 1, fontSize: 14.5 }}>{a.descricao}</span>
                  <span style={{ fontSize: 11.5, color: corStatus, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {rotuloStatus}
                  </span>
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
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 4, display: "flex" }}
                  >
                    <IconeX />
                  </button>
                </div>

                {resolvendoGanhoId === a.id && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, marginLeft: 19 }}>
                    <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>voltou quanto no total?</span>
                    <input
                      autoFocus
                      className="cf-num cf-focus"
                      value={retornoInput}
                      onChange={(e) => setRetornoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmarGanhou(a.id)}
                      style={{ ...campoInput, width: 110 }}
                    />
                    <button onClick={() => confirmarGanhou(a.id)} className="cf-focus" style={{ ...botaoSecundario, padding: "3px 10px", fontSize: 11.5 }}>
                      confirmar
                    </button>
                    <button onClick={() => setResolvendoGanhoId(null)} className="cf-focus" style={linkDiscreto}>
                      cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
