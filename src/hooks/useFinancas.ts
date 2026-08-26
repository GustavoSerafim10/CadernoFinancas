import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Conta,
  Transacao,
  Recorrencia,
  Investimento,
  Metas,
  ResumoMes,
  PontoHistorico,
  Aposta,
  ResultadoAposta,
  ResumoApostas,
} from "../types";
import { getItem, setItem } from "../services/storage";
import { gerarId, diasNoMes } from "../utils/date";
import { CATEGORIAS } from "../constants";
import { calcularInsights } from "../utils/insights";

export function useFinancas(monthKey: string) {
  const [contas, setContas] = useState<Conta[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
  const [metas, setMetas] = useState<Metas>({});
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [apostas, setApostas] = useState<Aposta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setCarregando(true);
      try {
        let contasCarregadas = (await getItem<Conta[]>("contas")) || [];
        if (contasCarregadas.length === 0) {
          contasCarregadas = [{ id: "principal", nome: "Conta Principal", cor: "#20303F" }];
          await setItem("contas", contasCarregadas);
        }
        setContas(contasCarregadas);
        setTransacoes((await getItem<Transacao[]>("transacoes")) || []);
        setRecorrencias((await getItem<Recorrencia[]>("recorrencias")) || []);
        setMetas((await getItem<Metas>("metas")) || {});
        setInvestimentos((await getItem<Investimento[]>("investimentos")) || []);
        setApostas((await getItem<Aposta[]>("apostas")) || []);
      } catch {
        setErro("Não consegui carregar seus dados agora.");
      } finally {
        setCarregando(false);
      }
    }
    init();
  }, []);

  const persistir = useCallback(async <T,>(chave: string, dado: T, anterior: T, setState: (v: T) => void) => {
    setState(dado);
    try {
      await setItem(chave, dado);
    } catch {
      setState(anterior);
      setErro("Não consegui salvar agora. Tenta de novo em instantes.");
    }
  }, []);

  const salvarTransacoes = useCallback(
    (n: Transacao[]) => persistir("transacoes", n, transacoes, setTransacoes),
    [persistir, transacoes]
  );
  const salvarContas = useCallback((n: Conta[]) => persistir("contas", n, contas, setContas), [persistir, contas]);
  const salvarRecorrencias = useCallback(
    (n: Recorrencia[]) => persistir("recorrencias", n, recorrencias, setRecorrencias),
    [persistir, recorrencias]
  );
  const salvarMetas = useCallback((n: Metas) => persistir("metas", n, metas, setMetas), [persistir, metas]);
  const salvarInvestimentos = useCallback(
    (n: Investimento[]) => persistir("investimentos", n, investimentos, setInvestimentos),
    [persistir, investimentos]
  );
  const salvarApostas = useCallback(
    (n: Aposta[]) => persistir("apostas", n, apostas, setApostas),
    [persistir, apostas]
  );

  const adicionarTransacao = useCallback(
    (dados: Omit<Transacao, "id" | "recorrenciaId">) => {
      salvarTransacoes([{ id: gerarId("t"), recorrenciaId: null, ...dados }, ...transacoes]);
    },
    [transacoes, salvarTransacoes]
  );

  const removerTransacao = useCallback(
    (id: string) => salvarTransacoes(transacoes.filter((t) => t.id !== id)),
    [transacoes, salvarTransacoes]
  );

  const editarTransacao = useCallback(
    (id: string, dados: Omit<Transacao, "id" | "recorrenciaId">) =>
      salvarTransacoes(transacoes.map((t) => (t.id === id ? { ...t, ...dados } : t))),
    [transacoes, salvarTransacoes]
  );

  const adicionarConta = useCallback(
    (nome: string, cor: string) => salvarContas([...contas, { id: gerarId("c"), nome, cor }]),
    [contas, salvarContas]
  );

  const removerConta = useCallback(
    (id: string) => {
      const emUso = transacoes.some((t) => t.contaId === id) || recorrencias.some((r) => r.contaId === id);
      if (emUso) return false;
      salvarContas(contas.filter((c) => c.id !== id));
      return true;
    },
    [contas, transacoes, recorrencias, salvarContas]
  );

  const adicionarRecorrencia = useCallback(
    (r: Omit<Recorrencia, "id" | "ativa">) => {
      salvarRecorrencias([{ id: gerarId("r"), ativa: true, ...r }, ...recorrencias]);
    },
    [recorrencias, salvarRecorrencias]
  );

  const toggleRecorrencia = useCallback(
    (id: string) => salvarRecorrencias(recorrencias.map((r) => (r.id === id ? { ...r, ativa: !r.ativa } : r))),
    [recorrencias, salvarRecorrencias]
  );

  const removerRecorrencia = useCallback(
    (id: string) => salvarRecorrencias(recorrencias.filter((r) => r.id !== id)),
    [recorrencias, salvarRecorrencias]
  );

  const gerarLancamentosDoMes = useCallback(() => {
    const ativas = recorrencias.filter((r) => r.ativa);
    const novos: Transacao[] = [];
    ativas.forEach((r) => {
      const genId = `${r.id}-${monthKey}`;
      if (!transacoes.some((t) => t.id === genId)) {
        const dia = String(Math.min(r.diaDoMes, diasNoMes(monthKey))).padStart(2, "0");
        novos.push({
          id: genId,
          descricao: r.descricao,
          valor: r.valor,
          categoria: r.categoria,
          tipo: r.tipo,
          contaId: r.contaId,
          data: `${monthKey}-${dia}T12:00:00.000Z`,
          recorrenciaId: r.id,
        });
      }
    });
    if (novos.length > 0) salvarTransacoes([...novos, ...transacoes]);
    return novos.length;
  }, [recorrencias, transacoes, monthKey, salvarTransacoes]);

  const setMetaCategoria = useCallback(
    (catId: string, limite: number) => salvarMetas({ ...metas, [catId]: limite }),
    [metas, salvarMetas]
  );

  const adicionarInvestimento = useCallback(
    (inv: Omit<Investimento, "id">) => salvarInvestimentos([{ id: gerarId("i"), ...inv }, ...investimentos]),
    [investimentos, salvarInvestimentos]
  );

  const removerInvestimento = useCallback(
    (id: string) => salvarInvestimentos(investimentos.filter((i) => i.id !== id)),
    [investimentos, salvarInvestimentos]
  );

  const atualizarInvestimento = useCallback(
    (id: string, campos: Partial<Investimento>) =>
      salvarInvestimentos(investimentos.map((i) => (i.id === id ? { ...i, ...campos } : i))),
    [investimentos, salvarInvestimentos]
  );

  const adicionarAposta = useCallback(
    (descricao: string, valorApostado: number, data: string) => {
      salvarApostas([
        { id: gerarId("ap"), descricao, valorApostado, resultado: "pendente", retorno: 0, data },
        ...apostas,
      ]);
    },
    [apostas, salvarApostas]
  );

  const resolverAposta = useCallback(
    (id: string, resultado: "ganhou" | "perdeu", retorno: number) =>
      salvarApostas(
        apostas.map((a) => (a.id === id ? { ...a, resultado, retorno: resultado === "ganhou" ? retorno : 0 } : a))
      ),
    [apostas, salvarApostas]
  );

  const reabrirAposta = useCallback(
    (id: string) =>
      salvarApostas(apostas.map((a) => (a.id === id ? { ...a, resultado: "pendente" as ResultadoAposta, retorno: 0 } : a))),
    [apostas, salvarApostas]
  );

  const removerAposta = useCallback(
    (id: string) => salvarApostas(apostas.filter((a) => a.id !== id)),
    [apostas, salvarApostas]
  );

  const transacoesDoMes = useMemo(
    () => transacoes.filter((t) => t.data.startsWith(monthKey)),
    [transacoes, monthKey]
  );

  const apostasDoMes = useMemo(
    () => apostas.filter((a) => a.data.startsWith(monthKey)),
    [apostas, monthKey]
  );

  function lucroAposta(a: Aposta): number {
    if (a.resultado === "ganhou") return a.retorno - a.valorApostado;
    if (a.resultado === "perdeu") return -a.valorApostado;
    return 0;
  }

  const resumoApostas: ResumoApostas = useMemo(() => {
    const apostado = apostasDoMes.reduce((s, a) => s + a.valorApostado, 0);
    const retorno = apostasDoMes.filter((a) => a.resultado === "ganhou").reduce((s, a) => s + a.retorno, 0);
    const lucro = apostasDoMes.reduce((s, a) => s + lucroAposta(a), 0);
    const ganhas = apostasDoMes.filter((a) => a.resultado === "ganhou").length;
    const perdidas = apostasDoMes.filter((a) => a.resultado === "perdeu").length;
    const pendentes = apostasDoMes.filter((a) => a.resultado === "pendente").length;
    const taxaAcerto = ganhas + perdidas > 0 ? (ganhas / (ganhas + perdidas)) * 100 : 0;
    return { apostado, retorno, lucro, ganhas, perdidas, pendentes, taxaAcerto };
  }, [apostasDoMes]);

  const resumoMes: ResumoMes = useMemo(() => {
    const receita = transacoesDoMes.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
    const gastos = transacoesDoMes.filter((t) => t.tipo === "gasto").reduce((s, t) => s + t.valor, 0);
    const investido = transacoesDoMes.filter((t) => t.tipo === "investimento").reduce((s, t) => s + t.valor, 0);
    const porCategoria = CATEGORIAS.map((c) => ({
      ...c,
      total: transacoesDoMes
        .filter((t) => t.tipo === "gasto" && t.categoria === c.id)
        .reduce((s, t) => s + t.valor, 0),
    })).filter((c) => c.total > 0);
    return { receita, gastos, investido, saldo: receita - gastos - investido + resumoApostas.lucro, porCategoria };
  }, [transacoesDoMes, resumoApostas.lucro]);

  const historicoMensal: PontoHistorico[] = useMemo(() => {
    const chaves = Array.from(new Set(transacoes.map((t) => t.data.slice(0, 7)))).sort().slice(-6);
    return chaves.map((mk) => {
      const doMes = transacoes.filter((t) => t.data.startsWith(mk));
      const apostasMes = apostas.filter((a) => a.data.startsWith(mk));
      return {
        chave: mk,
        receita: doMes.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0),
        gastos: doMes.filter((t) => t.tipo === "gasto").reduce((s, t) => s + t.valor, 0),
        investido: doMes.filter((t) => t.tipo === "investimento").reduce((s, t) => s + t.valor, 0),
        lucroApostas: apostasMes.reduce((s, a) => s + lucroAposta(a), 0),
      };
    });
  }, [transacoes, apostas]);

  const insights = useMemo(() => calcularInsights(transacoes, monthKey), [transacoes, monthKey]);

  return {
    contas, transacoes, recorrencias, metas, investimentos, apostas, carregando, erro,
    transacoesDoMes, resumoMes, historicoMensal, insights,
    apostasDoMes, resumoApostas,
    adicionarTransacao, removerTransacao, editarTransacao,
    adicionarConta, removerConta,
    adicionarRecorrencia, toggleRecorrencia, removerRecorrencia, gerarLancamentosDoMes,
    setMetaCategoria,
    adicionarInvestimento, removerInvestimento, atualizarInvestimento,
    adicionarAposta, resolverAposta, reabrirAposta, removerAposta,
  };
}

export type UseFinancasReturn = ReturnType<typeof useFinancas>;
