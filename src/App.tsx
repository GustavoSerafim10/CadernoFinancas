import { useState, Suspense, lazy } from "react";
import { Nav } from "./components/Nav";
import { CosmicBackground } from "./components/CosmicBackground";
import { useFinancas } from "./hooks/useFinancas";
import { chaveDoMes } from "./utils/date";
import { PaginaId } from "./constants";
import { Extrato } from "./pages/Extrato";
import { Apostas } from "./pages/Apostas";
import { Metas } from "./pages/Metas";

const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const Investimentos = lazy(() => import("./pages/Investimentos").then((m) => ({ default: m.Investimentos })));
const Simulador = lazy(() => import("./pages/Simulador").then((m) => ({ default: m.Simulador })));

export default function App() {
  const [refDate, setRefDate] = useState(new Date());
  const [pagina, setPagina] = useState<PaginaId>("dashboard");
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

  return (
    <div className="app-shell">
      <div className="cosmic-foto" />
      <div className="cosmic-tint" />
      <div className="cosmic-vinheta" />
      <CosmicBackground />
      <div className="conteudo">
        <header className="cabecalho">
          <div className="eyebrow">Nightfolio</div>
          <h1>Clareza total sobre suas finanças.</h1>
        </header>

        <Nav pagina={pagina} setPagina={setPagina} />

        {financas.erro && <div className="erro">{financas.erro}</div>}

        {financas.carregando ? (
          <div className="carregando">carregando seus dados…</div>
        ) : (
          <Suspense fallback={<div className="carregando">carregando…</div>}>
            {pagina === "dashboard" ? (
              <Dashboard
                refDate={refDate}
                mudarMes={mudarMes}
                resumoMes={financas.resumoMes}
                historicoMensal={financas.historicoMensal}
                insights={financas.insights}
                resumoApostas={financas.resumoApostas}
                exportarCSV={exportarCSV}
                exportarTudoJSON={exportarTudoJSON}
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
            ) : (
              <Metas
                metas={financas.metas}
                setMetaCategoria={financas.setMetaCategoria}
                resumoMes={financas.resumoMes}
                refDate={refDate}
              />
            )}
          </Suspense>
        )}
      </div>
    </div>
  );
}
