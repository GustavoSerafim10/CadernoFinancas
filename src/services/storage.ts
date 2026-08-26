/**
 * Persistência local dos dados do app, via localStorage do navegador.
 *
 * Fica isolada aqui de propósito: se um dia você quiser trocar por uma API
 * própria (Node, Supabase, Firebase etc.) ou por IndexedDB, só precisa
 * reescrever este arquivo — o resto do app usa apenas getItem/setItem.
 *
 * Importante: localStorage é por navegador/dispositivo. Os dados não
 * sincronizam entre computador e celular, por exemplo.
 */

const PREFIXO = "caderno-financeiro:";

export async function getItem<T>(chave: string): Promise<T | null> {
  try {
    const raw = localStorage.getItem(PREFIXO + chave);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setItem<T>(chave: string, valor: T): Promise<void> {
  localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
}
