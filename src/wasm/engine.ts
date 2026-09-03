/**
 * Ponte para o motor de simulação escrito em Rust, compilado direto pra
 * wasm32-unknown-unknown via `cargo build` (sem wasm-pack/wasm-bindgen —
 * ver README). O .wasm é servido estático de /public/wasm e lido aqui à
 * mão via WebAssembly.instantiate + leitura direta da memória linear.
 */

export const MAX_MESES = 360;

interface NightfolioEngineExports {
  memory: WebAssembly.Memory;
  buffer_ptr: () => number;
  simular: (valorInicial: number, aporteMensal: number, taxaAnualPct: number, meses: number) => number;
}

let enginePromise: Promise<NightfolioEngineExports> | null = null;

async function carregarEngine(): Promise<NightfolioEngineExports> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const url = `${import.meta.env.BASE_URL}wasm/nightfolio-engine.wasm`;
      let resultado: WebAssembly.WebAssemblyInstantiatedSource;
      try {
        resultado = await WebAssembly.instantiateStreaming(fetch(url));
      } catch {
        const bytes = await (await fetch(url)).arrayBuffer();
        resultado = await WebAssembly.instantiate(bytes);
      }
      return resultado.instance.exports as unknown as NightfolioEngineExports;
    })();
  }
  return enginePromise;
}

/**
 * Simula o saldo mês a mês de um investimento com aporte mensal fixo e
 * juros compostos (cálculo real acontece em Rust/WASM). Retorna a lista de
 * saldos mensais, já copiada pra fora da memória do wasm.
 */
export async function simular(
  valorInicial: number,
  aporteMensal: number,
  taxaAnualPct: number,
  meses: number
): Promise<number[]> {
  if (
    !Number.isFinite(valorInicial) ||
    !Number.isFinite(aporteMensal) ||
    !Number.isFinite(taxaAnualPct) ||
    valorInicial < 0 ||
    aporteMensal < 0 ||
    taxaAnualPct < 0
  ) {
    return [];
  }

  const engine = await carregarEngine();
  const n = engine.simular(valorInicial, aporteMensal, taxaAnualPct, Math.floor(meses));
  if (n <= 0) return [];

  const ptr = engine.buffer_ptr();
  const view = new Float64Array(engine.memory.buffer, ptr, n);
  return Array.from(view);
}
