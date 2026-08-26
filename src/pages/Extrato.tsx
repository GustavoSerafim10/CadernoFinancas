import { useState } from "react";
import { Conta, Transacao, Recorrencia, TipoTransacao } from "../types";
import { CATEGORIAS, catLabel, catCor } from "../constants";
import { formatarMoeda, parseMoeda } from "../utils/format";
import { SeletorMes } from "../components/SeletorMes";
import { IconeX, IconeEditar } from "../components/Icones";
import { rotuloCampo, campoInput, botaoPrimario, botaoSecundario, linkDiscreto } from "../components/estilosComuns";

interface Props {
  refDate: Date;
  mudarMes: (delta: number) => void;
  monthKey: string;
  transacoesDoMes: Transacao[];
  contas: Conta[];
  recorrencias: Recorrencia[];
  adicionarTransacao: (dados: Omit<Transacao, "id" | "recorrenciaId">) => void;
  removerTransacao: (id: string) => void;
  editarTransacao: (id: string, dados: Omit<Transacao, "id" | "recorrenciaId">) => void;
  adicionarConta: (nome: string, cor: string) => void;
  removerConta: (id: string) => boolean;
  adicionarRecorrencia: (r: Omit<Recorrencia, "id" | "ativa">) => void;
  toggleRecorrencia: (id: string) => void;
  removerRecorrencia: (id: string) => void;
  gerarLancamentosDoMes: () => number;
}

export function Extrato({
  refDate, mudarMes, transacoesDoMes, contas, recorrencias,
  adicionarTransacao, removerTransacao, editarTransacao, adicionarConta, removerConta,
  adicionarRecorrencia, toggleRecorrencia, removerRecorrencia, gerarLancamentosDoMes,
}: Props) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0].id);
  const [tipo, setTipo] = useState<TipoTransacao>("gasto");
  const [contaId, setContaId] = useState(contas[0]?.id || "");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [tornarRecorrente, setTornarRecorrente] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<TipoTransacao | "todos">("todos");
  const [filtroConta, setFiltroConta] = useState("todas");

  const [novaContaNome, setNovaContaNome] = useState("");
  const [mostrarGestao, setMostrarGestao] = useState(false);
  const [msgGerar, setMsgGerar] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const contaSelecionada = contaId || contas[0]?.id || "";

  function limparFormulario() {
    setDescricao("");
    setValor("");
    setTornarRecorrente(false);
    setEditandoId(null);
  }

  function iniciarEdicao(t: Transacao) {
    setEditandoId(t.id);
    setDescricao(t.descricao);
    setValor(String(t.valor).replace(".", ","));
    setCategoria(t.categoria || CATEGORIAS[0].id);
    setTipo(t.tipo);
    setContaId(t.contaId);
    setData(t.data.slice(0, 10));
    setTornarRecorrente(false);
  }

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    const v = parseMoeda(valor);
    if (!descricao.trim() || v === null || v <= 0 || !contaSelecionada) return;
    const dataISO = `${data}T12:00:00.000Z`;
    const dados = {
      descricao: descricao.trim(),
      valor: v,
      categoria: tipo === "gasto" ? categoria : null,
      tipo,
      contaId: contaSelecionada,
      data: dataISO,
    };
    if (editandoId) {
      editarTransacao(editandoId, dados);
    } else {
      adicionarTransacao(dados);
      if (tornarRecorrente) {
        adicionarRecorrencia({ ...dados, diaDoMes: new Date(data).getDate() });
      }
    }
    limparFormulario();
  }

  function gerar() {
    const n = gerarLancamentosDoMes();
    setMsgGerar(n > 0 ? `${n} lançamento(s) recorrente(s) criado(s) para este mês.` : "Nenhum lançamento pendente — já está tudo em dia.");
  }

  function handleRemoverTransacao(t: Transacao) {
    if (window.confirm(`Excluir o lançamento "${t.descricao}" (${formatarMoeda(t.valor)})?`)) {
      removerTransacao(t.id);
    }
  }

  function handleRemoverConta(c: Conta) {
    if (!window.confirm(`Excluir a conta "${c.nome}"?`)) return;
    if (!removerConta(c.id)) {
      window.alert(
        `"${c.nome}" tem lançamentos ou recorrências vinculados e não pode ser excluída. Remova-os primeiro.`
      );
    }
  }

  function handleRemoverRecorrencia(r: Recorrencia) {
    if (window.confirm(`Excluir a recorrência "${r.descricao}"? Os lançamentos já gerados por ela não serão apagados.`)) {
      removerRecorrencia(r.id);
    }
  }

  const listaFiltrada = transacoesDoMes
    .filter((t) => filtroTipo === "todos" || t.tipo === filtroTipo)
    .filter((t) => filtroConta === "todas" || t.contaId === filtroConta)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <div>
      <SeletorMes refDate={refDate} mudarMes={mudarMes} corDestaque="var(--rust)" />

      <section style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ ...rotuloCampo, marginBottom: 0 }}>{editandoId ? "editando lançamento" : "novo lançamento"}</div>
          {editandoId && (
            <button onClick={limparFormulario} className="cf-focus" style={linkDiscreto}>
              cancelar
            </button>
          )}
        </div>
        <form onSubmit={submeter} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end", marginBottom: 8 }}>
          <div style={{ flex: "2 1 160px" }}>
            <input className="cf-focus" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="descrição" style={campoInput} />
          </div>
          <div style={{ flex: "1 1 100px" }}>
            <input className="cf-num cf-focus" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="R$ 0,00" inputMode="decimal" style={campoInput} />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <select className="cf-focus" value={tipo} onChange={(e) => setTipo(e.target.value as TipoTransacao)} style={campoInput}>
              <option value="gasto">Gasto</option>
              <option value="receita">Receita</option>
              <option value="investimento">Investimento</option>
            </select>
          </div>
          {tipo === "gasto" && (
            <div style={{ flex: "1 1 130px" }}>
              <select className="cf-focus" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={campoInput}>
                {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          )}
          <div style={{ flex: "1 1 130px" }}>
            <select className="cf-focus" value={contaSelecionada} onChange={(e) => setContaId(e.target.value)} style={campoInput}>
              {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <input type="date" className="cf-focus" value={data} onChange={(e) => setData(e.target.value)} style={campoInput} />
          </div>
          <button type="submit" className="cf-btn cf-focus" style={botaoPrimario}>
            {editandoId ? "Salvar" : "Anotar"}
          </button>
        </form>
        {!editandoId && (
          <label style={{ fontSize: 12.5, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={tornarRecorrente} onChange={(e) => setTornarRecorrente(e.target.checked)} />
            tornar recorrente (repete todo mês no mesmo dia)
          </label>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <button onClick={() => setMostrarGestao((v) => !v)} className="cf-focus" style={linkDiscreto}>
          {mostrarGestao ? "ocultar" : "gerenciar"} contas e recorrências
        </button>

        {mostrarGestao && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <div style={rotuloCampo}>contas e cartões</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {contas.map((c) => (
                  <span key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid var(--paper-linha)", borderRadius: 20, padding: "4px 10px 4px 12px", fontSize: 13 }}>
                    {c.nome}
                    {contas.length > 1 && (
                      <button onClick={() => handleRemoverConta(c)} className="cf-focus" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", display: "flex" }}>
                        <IconeX />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="cf-focus"
                  value={novaContaNome}
                  onChange={(e) => setNovaContaNome(e.target.value)}
                  placeholder="nome da nova conta/cartão"
                  style={{ ...campoInput, maxWidth: 240 }}
                />
                <button
                  onClick={() => { if (novaContaNome.trim()) { adicionarConta(novaContaNome.trim(), "#20303F"); setNovaContaNome(""); } }}
                  className="cf-focus"
                  style={botaoSecundario}
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div>
              <div style={rotuloCampo}>lançamentos recorrentes</div>
              {recorrencias.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>
                  nenhuma recorrência cadastrada ainda — marque "tornar recorrente" ao anotar um lançamento.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                  {recorrencias.map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--paper-linha)" }}>
                      <span style={{ flex: 1, opacity: r.ativa ? 1 : 0.5 }}>{r.descricao} · dia {r.diaDoMes}</span>
                      <span className="cf-num" style={{ opacity: r.ativa ? 1 : 0.5 }}>{formatarMoeda(r.valor)}</span>
                      <button onClick={() => toggleRecorrencia(r.id)} className="cf-focus" style={{ ...botaoSecundario, padding: "3px 10px", fontSize: 11.5 }}>
                        {r.ativa ? "pausar" : "ativar"}
                      </button>
                      <button onClick={() => handleRemoverRecorrencia(r)} className="cf-focus" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", display: "flex" }}>
                        <IconeX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={gerar} className="cf-focus" style={botaoSecundario}>gerar lançamentos deste mês</button>
              {msgGerar && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 8 }}>{msgGerar}</div>}
            </div>
          </div>
        )}
      </section>

      <section>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as TipoTransacao | "todos")} className="cf-focus" style={{ ...campoInput, maxWidth: 150 }}>
            <option value="todos">todos os tipos</option>
            <option value="receita">receitas</option>
            <option value="gasto">gastos</option>
            <option value="investimento">investimentos</option>
          </select>
          <select value={filtroConta} onChange={(e) => setFiltroConta(e.target.value)} className="cf-focus" style={{ ...campoInput, maxWidth: 180 }}>
            <option value="todas">todas as contas</option>
            {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        {listaFiltrada.length === 0 ? (
          <p style={{ color: "var(--ink-soft)", fontSize: 14, fontStyle: "italic" }}>nada por aqui ainda esse mês.</p>
        ) : (
          listaFiltrada.map((t) => {
            const isReceita = t.tipo === "receita";
            const isInv = t.tipo === "investimento";
            const cor = isReceita ? "var(--ink)" : isInv ? "var(--verde)" : "var(--rust)";
            return (
              <div key={t.id} className="cf-linha" style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--paper-linha)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: isReceita ? "var(--ink)" : isInv ? "var(--verde)" : catCor(t.categoria), flex: "0 0 auto" }} />
                <span style={{ flex: 1, fontSize: 14.5 }}>{t.descricao}</span>
                <span style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase" }}>
                  {contas.find((c) => c.id === t.contaId)?.nome || "—"}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", minWidth: 78, textAlign: "right" }}>
                  {isReceita ? "receita" : isInv ? "investimento" : catLabel(t.categoria)}
                </span>
                <span className="cf-num" style={{ fontSize: 15, fontWeight: 600, minWidth: 92, textAlign: "right", color: cor }}>
                  {isReceita || isInv ? "+" : "−"} {formatarMoeda(t.valor)}
                </span>
                <button onClick={() => iniciarEdicao(t)} aria-label={`Editar ${t.descricao}`} className="cf-linha-remover cf-focus" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 4 }}>
                  <IconeEditar />
                </button>
                <button onClick={() => handleRemoverTransacao(t)} aria-label={`Remover ${t.descricao}`} className="cf-linha-remover cf-focus" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 4 }}>
                  <IconeX />
                </button>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
