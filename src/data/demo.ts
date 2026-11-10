/**
 * Dados de demonstração 100% fictícios.
 *
 * Usados pelo botão "Carregar dados de demonstração", para quem abre o app
 * publicado pela primeira vez (ex.: recrutadores) ver os gráficos preenchidos.
 * As datas são geradas a partir do mês atual, então a demo nunca fica velha.
 */
import type { Aposta, Conta, Investimento, Metas, Recorrencia, Transacao } from "../types";

function dataNoMes(mesesAtras: number, dia: number): string {
  const hoje = new Date();
  const d = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, 1, 12);
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  // No mês atual, não cria lançamentos no futuro.
  const limite = mesesAtras === 0 ? Math.min(ultimoDia, hoje.getDate()) : ultimoDia;
  d.setDate(Math.min(dia, limite));
  return d.toISOString();
}

function chaveMes(mesesAtras: number): string {
  const hoje = new Date();
  const d = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function gerarDadosDemo() {
  const contas: Conta[] = [
    { id: "principal", nome: "Conta Principal", cor: "#20303F" },
    { id: "cartao", nome: "Cartão de Crédito", cor: "#7C3AED" },
  ];

  const recorrencias: Recorrencia[] = [
    { id: "demo-rec-salario", descricao: "Salário", valor: 5200, categoria: null, tipo: "receita", contaId: "principal", diaDoMes: 5, ativa: true },
    { id: "demo-rec-aluguel", descricao: "Aluguel", valor: 1400, categoria: "moradia", tipo: "gasto", contaId: "principal", diaDoMes: 10, ativa: true },
    { id: "demo-rec-streaming", descricao: "Streaming", valor: 45.9, categoria: "assinaturas", tipo: "gasto", contaId: "cartao", diaDoMes: 15, ativa: true },
  ];

  // [descrição, valor base, categoria, dia, conta]
  const gastosMensais: [string, number, string, number, string][] = [
    ["Mercado", 780, "alimentacao", 8, "cartao"],
    ["Restaurantes", 240, "alimentacao", 18, "cartao"],
    ["Combustível", 320, "transporte", 12, "cartao"],
    ["Internet e celular", 129.9, "telefonia", 20, "principal"],
    ["Academia", 110, "saude", 6, "principal"],
    ["Cinema e passeios", 160, "lazer", 22, "cartao"],
    ["Curso online", 89.9, "educacao", 3, "cartao"],
  ];

  const transacoes: Transacao[] = [];
  for (let m = 5; m >= 0; m--) {
    const variacao = 1 + ((m * 7) % 5 - 2) / 20; // ±10%, determinístico
    transacoes.push(
      { id: `demo-rec-salario-${chaveMes(m)}`, descricao: "Salário", valor: 5200, categoria: null, tipo: "receita", contaId: "principal", data: dataNoMes(m, 5), recorrenciaId: "demo-rec-salario" },
      { id: `demo-rec-aluguel-${chaveMes(m)}`, descricao: "Aluguel", valor: 1400, categoria: "moradia", tipo: "gasto", contaId: "principal", data: dataNoMes(m, 10), recorrenciaId: "demo-rec-aluguel" },
      { id: `demo-rec-streaming-${chaveMes(m)}`, descricao: "Streaming", valor: 45.9, categoria: "assinaturas", tipo: "gasto", contaId: "cartao", data: dataNoMes(m, 15), recorrenciaId: "demo-rec-streaming" },
      { id: `demo-inv-${m}`, descricao: "Aporte mensal", valor: 600, categoria: null, tipo: "investimento", contaId: "principal", data: dataNoMes(m, 7), recorrenciaId: null },
    );
    if (m % 2 === 0) {
      transacoes.push({ id: `demo-free-${m}`, descricao: "Freela de site", valor: 900, categoria: null, tipo: "receita", contaId: "principal", data: dataNoMes(m, 25), recorrenciaId: null });
    }
    gastosMensais.forEach(([descricao, valor, categoria, dia, contaId], i) => {
      transacoes.push({
        id: `demo-g${i}-${m}`,
        descricao,
        valor: Math.round(valor * variacao * 100) / 100,
        categoria,
        tipo: "gasto",
        contaId,
        data: dataNoMes(m, dia),
        recorrenciaId: null,
      });
    });
  }

  const metas: Metas = {
    alimentacao: 1100,
    transporte: 350,
    lazer: 200,
    assinaturas: 60,
  };

  const investimentos: Investimento[] = [
    { id: "demo-invest-1", nome: "Reserva de emergência", tipo: "Caixinha", valorAportado: 3000, valorAtual: 3000, data: dataNoMes(5, 7), taxaMensal: 0.85, instituicao: "Banco Exemplo" },
    { id: "demo-invest-2", nome: "Tesouro Selic", tipo: "Tesouro Direto", valorAportado: 2400, valorAtual: 2510, data: dataNoMes(4, 7) },
    { id: "demo-invest-3", nome: "Fundo imobiliário", tipo: "FIIs", valorAportado: 1200, valorAtual: 1265, data: dataNoMes(2, 7) },
  ];

  const apostas: Aposta[] = [];

  return { contas, transacoes, recorrencias, metas, investimentos, apostas };
}
