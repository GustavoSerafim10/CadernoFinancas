import { useState } from "react";
import { Nav } from "./components/Nav";
import { useFinancas } from "./hooks/useFinancas";
import { chaveDoMes } from "./utils/date";
import { PaginaId } from "./constants";
import { Dashboard } from "./pages/Dashboard";
import { Extrato } from "./pages/Extrato";
import { Investimentos } from "./pages/Investimentos";
import { Metas } from "./pages/Metas";

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
      <div className="margem-vermelha" />
      <div className="conteudo">
        <header className="cabecalho">
          <div className="eyebrow">caderno financeiro</div>
          <h1>controle completo das suas finanças</h1>
        </header>

        <Nav pagina={pagina} setPagina={setPagina} />

        {financas.erro && <div className="erro">{financas.erro}</div>}

        {financas.carregando ? (
          <div className="carregando">carregando seus dados…</div>
        ) : pagina === "dashboard" ? (
          <Dashboard
            refDate={refDate}
            mudarMes={mudarMes}
            resumoMes={financas.resumoMes}
            historicoMensal={financas.historicoMensal}
            insights={financas.insights}
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
        ) : (
          <Metas
            metas={financas.metas}
            setMetaCategoria={financas.setMetaCategoria}
            resumoMes={financas.resumoMes}
            refDate={refDate}
          />
        )}
      </div>
    </div>
  );
}
