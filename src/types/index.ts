export type TipoTransacao = "receita" | "gasto" | "investimento";

export interface Conta {
  id: string;
  nome: string;
  cor: string;
}

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  categoria: string | null;
  tipo: TipoTransacao;
  contaId: string;
  data: string; // ISO 8601
  recorrenciaId: string | null;
}

export interface Recorrencia {
  id: string;
  descricao: string;
  valor: number;
  categoria: string | null;
  tipo: TipoTransacao;
  contaId: string;
  diaDoMes: number;
  ativa: boolean;
}

export interface Investimento {
  id: string;
  nome: string;
  tipo: string;
  valorAportado: number;
  valorAtual: number;
  data: string; // ISO 8601
}

export type Metas = Record<string, number>;

export type ResultadoAposta = "pendente" | "ganhou" | "perdeu";

export interface Aposta {
  id: string;
  descricao: string;
  valorApostado: number;
  resultado: ResultadoAposta;
  retorno: number;
  data: string; // ISO 8601
}

export interface ResumoApostas {
  apostado: number;
  retorno: number;
  lucro: number;
  ganhas: number;
  perdidas: number;
  pendentes: number;
  taxaAcerto: number;
}

export interface ResumoMes {
  receita: number;
  gastos: number;
  investido: number;
  saldo: number;
  porCategoria: Array<{ id: string; label: string; cor: string; total: number }>;
}

export interface PontoHistorico {
  chave: string;
  receita: number;
  gastos: number;
  investido: number;
  lucroApostas: number;
}

export interface Insight {
  categoria: string;
  pct: number;
  val: number;
  media: number;
}
