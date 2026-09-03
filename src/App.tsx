import { useState, useRef, Suspense, lazy, ChangeEvent } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopTabs } from "./components/TopTabs";
import { SeletorMes } from "./components/SeletorMes";
import { IconeSino, IconeDownload, IconeUpload, IconeX } from "./components/Icones";
import { botaoSecundario, cartaoEstilo } from "./components/estilosComuns";
import { CosmicBackground } from "./components/CosmicBackground";
import { FinanceHud } from "./components/FinanceHud";
import { useFinancas } from "./hooks/useFinancas";
import { setItem } from "./services/storage";
import { chaveDoMes } from "./utils/date";
import { PaginaId } from "./constants";
import { Extrato } from "./pages/Extrato";
import { Apostas } from "./pages/Apostas";
import { Metas } from "./pages/Metas";

const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const Investimentos = lazy(() => import("./pages/Investimentos").then((m) => ({ default: m.Investimentos })));
const Simulador = lazy(() => import("./pages/Simulador").then((m) => ({ default: m.Simulador })));
const Insights = lazy(() => import("./pages/Insights").then((m) => ({ default: m.Insights })));

export default function App() {
  const [refDate, setRefDate] = useState(new Date());
  const [pagina, setPagina] = useState<PaginaId>("dashboard");
  const [avisoOrigemDispensado, setAvisoOrigemDispensado] = useState(false);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);
  const inputImportacaoRef = useRef<HTMLInputElement>(null);
  const monthKey = chaveDoMes(refDate);
  const financas = useFinancas(monthKey);

  function mudarMes(delta: number) {
    setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() + delta, 1));
  }

  function exportarCSV() {
    const doMes = financas.transacoesDoMes;
    const linhas = [
      ["Data", "Descrição", "Categoria", "Tipo", "Conta", "Valor"],
      ...doMes.map((t) => [
        new Date(t.data).toLocaleDateString("pt-BR"),
        t.descricao,
        t.categoria || "—",
        t.tipo,
        financas.contas.find((c) => c.id === t.contaId)?.nome || "—",
        t.valor.toFixed(2).replace(".", ","),
      ]),
    ];
    const csv = linhas.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extrato-${monthKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportarTudoJSON() {
    const dados = {
      contas: financas.contas,
      transacoes: financas.transacoes,
      recorrencias: financas.recorrencias,
      metas: financas.metas,
      investimentos: financas.investimentos,
      apostas: financas.apostas,
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "caderno-financeiro-completo.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function abrirSeletorImportacao() {
    setErroImportacao(null);
    inputImportacaoRef.current?.click();
  }

  async function importarTudoJSON(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;

    let dados: Record<string, unknown>;
    try {
      dados = JSON.parse(await arquivo.text());
    } catch {
      setErroImportacao("Esse arquivo não é um JSON válido.");
      return;
    }

    const chavesEsperadas = ["contas", "transacoes", "recorrencias", "metas", "investimentos", "apostas"] as const;
    const chavesLista = ["contas", "transacoes", "recorrencias", "investimentos", "apostas"];
    const valido =
      chavesEsperadas.every((c) => c in dados) &&
      chavesLista.every((c) => Array.isArray(dados[c])) &&
      typeof dados.metas === "object" && dados.metas !== null && !Array.isArray(dados.metas);
    if (!valido) {
      setErroImportacao("Esse arquivo não parece ser um backup do Nightfolio (Exportar JSON).");
      return;
    }

    const confirmado = window.confirm(
      "Importar vai substituir TODOS os dados salvos neste navegador pelos dados desse arquivo. Essa ação não pode ser desfeita. Continuar?"
    );
    if (!confirmado) return;

    for (const chave of chavesEsperadas) {
      await setItem(chave, dados[chave]);
    }
    window.location.reload();
  }

  return (
    <div className="app-shell">
      <div className="cosmic-foto" />
      <div className="cosmic-tint" />
      <div className="cosmic-vinheta" />
      <CosmicBackground />
      <FinanceHud />
      <Sidebar pagina={pagina} setPagina={setPagina} />
      <div className="conteudo">
        <header className="cabecalho">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div className="eyebrow">Nightfolio</div>
              <h1>Clareza total sobre suas finanças.</h1>
            </div>
            <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="cf-icone-decorativo" title="Notificações">
                <IconeSino />
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="cf-avatar" title="Gustavo Vinicius">
                  GV
                </span>
                <span style={{ color: "var(--ink-soft)", fontSize: 10 }}>⌄</span>
              </span>
            </div>
          </div>
        </header>

        <TopTabs
          pagina={pagina}
          setPagina={setPagina}
          right={
            pagina === "dashboard" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14, rowGap: 10, flexWrap: "wrap" }}>
                <SeletorMes refDate={refDate} mudarMes={mudarMes} semMargem />
                <button onClick={exportarCSV} className="cf-focus" style={{ ...botaoSecundario, fontSize: 12, display: "flex", alignItems: "center", gap: 7 }}>
                  <IconeDownload /> Exportar CSV
                </button>
                <button onClick={exportarTudoJSON} className="cf-focus" style={{ ...botaoSecundario, fontSize: 12, display: "flex", alignItems: "center", gap: 7 }}>
                  <IconeDownload /> Exportar JSON
                </button>
                <button onClick={abrirSeletorImportacao} className="cf-focus" style={{ ...botaoSecundario, fontSize: 12, display: "flex", alignItems: "center", gap: 7 }}>
                  <IconeUpload /> Importar JSON
                </button>
                <input
                  ref={inputImportacaoRef}
                  type="file"
                  accept="application/json"
                  onChange={importarTudoJSON}
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
            ) : undefined
          }
        />

        {financas.erro && <div className="erro">{financas.erro}</div>}
        {erroImportacao && <div className="erro">{erroImportacao}</div>}

        {financas.primeiroAcesso && !avisoOrigemDispensado && (
          <div
            style={{
              ...cartaoEstilo,
              padding: "12px 16px",
              borderColor: "var(--rust)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
              fontSize: 13.5,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--rust)", flex: "0 0 auto" }} />
            <span style={{ flex: 1 }}>
              Não encontramos nenhum dado salvo neste endereço. Se você já usou o app antes, confira se está no mesmo
              navegador e na mesma URL de sempre (<span className="cf-num">http://localhost:5173</span>) — o
              histórico fica salvo só ali, não sincroniza entre navegadores nem portas diferentes.
            </span>
            <button
              onClick={() => setAvisoOrigemDispensado(true)}
              className="cf-focus"
              aria-label="Dispensar aviso"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", flex: "0 0 auto", display: "flex" }}
            >
              <IconeX />
            </button>
          </div>
        )}

        {financas.carregando ? (
          <div className="carregando">carregando seus dados…</div>
        ) : (
          <Suspense fallback={<div className="carregando">carregando…</div>}>
            {pagina === "dashboard" ? (
              <Dashboard
                refDate={refDate}
                resumoMes={financas.resumoMes}
                resumoMesAnterior={financas.resumoMesAnterior}
                historicoMensal={financas.historicoMensal}
                transacoesDoMes={financas.transacoesDoMes}
                insights={financas.insights}
                resumoApostas={financas.resumoApostas}
                metas={financas.metas}
                setPagina={setPagina}
              />
            ) : pagina === "extrato" ? (
              <Extrato
                refDate={refDate}
                mudarMes={mudarMes}
                monthKey={monthKey}
                transacoesDoMes={financas.transacoesDoMes}
                contas={financas.contas}
                recorrencias={financas.recorrencias}
                adicionarTransacao={financas.adicionarTransacao}
                removerTransacao={financas.removerTransacao}
                editarTransacao={financas.editarTransacao}
                adicionarConta={financas.adicionarConta}
                removerConta={financas.removerConta}
                adicionarRecorrencia={financas.adicionarRecorrencia}
                toggleRecorrencia={financas.toggleRecorrencia}
                removerRecorrencia={financas.removerRecorrencia}
                gerarLancamentosDoMes={financas.gerarLancamentosDoMes}
              />
            ) : pagina === "investimentos" ? (
              <Investimentos
                investimentos={financas.investimentos}
                adicionarInvestimento={financas.adicionarInvestimento}
                removerInvestimento={financas.removerInvestimento}
                atualizarInvestimento={financas.atualizarInvestimento}
              />
            ) : pagina === "apostas" ? (
              <Apostas
                refDate={refDate}
                mudarMes={mudarMes}
                apostasDoMes={financas.apostasDoMes}
                resumoApostas={financas.resumoApostas}
                adicionarAposta={financas.adicionarAposta}
                resolverAposta={financas.resolverAposta}
                reabrirAposta={financas.reabrirAposta}
                removerAposta={financas.removerAposta}
              />
            ) : pagina === "simulador" ? (
              <Simulador />
            ) : pagina === "metas" ? (
              <Metas
                metas={financas.metas}
                setMetaCategoria={financas.setMetaCategoria}
                resumoMes={financas.resumoMes}
                refDate={refDate}
              />
            ) : (
              <Insights
                resumoMes={financas.resumoMes}
                resumoMesAnterior={financas.resumoMesAnterior}
                historicoMensal={financas.historicoMensal}
                metas={financas.metas}
                resumoApostas={financas.resumoApostas}
              />
            )}
          </Suspense>
        )}
      </div>
    </div>
  );
}
