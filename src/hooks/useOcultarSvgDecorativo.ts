import { useCallback, useRef } from "react";

/**
 * Recharts injeta <title></title>/<desc></desc> vazios em todo <svg> que
 * renderiza, o que leitores de tela interpretam como uma imagem sem nome
 * acessível. Quando o container já tem role="img" + aria-label próprio
 * (resumindo o gráfico em texto), o <svg> em si deve ficar aria-hidden.
 *
 * É um callback ref (não um RefObject + useEffect) de propósito: o
 * container costuma estar atrás de uma renderização condicional (ex: só
 * aparece depois que há dado suficiente pro gráfico fazer sentido), então
 * o nó pode não existir ainda no mount do componente e só aparecer bem
 * depois, numa re-renderização — um useEffect com `[ref]` como dependência
 * nunca dispara de novo nesse caso (a identidade do RefObject não muda), e
 * o MutationObserver nunca chega a ser criado. Um callback ref roda de
 * novo toda vez que o nó de fato monta ou desmonta, então sempre encontra o
 * <svg>, não importa quando ele aparece.
 */
export function useOcultarSvgDecorativo() {
  const observerRef = useRef<MutationObserver | null>(null);

  return useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    const ocultarSvgs = () => node.querySelectorAll("svg").forEach((svg) => svg.setAttribute("aria-hidden", "true"));
    ocultarSvgs();
    const observer = new MutationObserver(ocultarSvgs);
    observer.observe(node, { childList: true, subtree: true });
    observerRef.current = observer;
  }, []);
}
