import { RefObject, useEffect } from "react";

/**
 * Recharts injeta <title></title>/<desc></desc> vazios em todo <svg> que
 * renderiza, o que leitores de tela interpretam como uma imagem sem nome
 * acessível. Quando o container já tem role="img" + aria-label próprio
 * (resumindo o gráfico em texto), o <svg> em si deve ficar aria-hidden —
 * mas ele só existe depois que o ResponsiveContainer mede o container
 * (via ResizeObserver) e renderiza de fato, daí o MutationObserver em vez
 * de só rodar uma vez no mount.
 */
export function useOcultarSvgDecorativo(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ocultarSvgs = () => node.querySelectorAll("svg").forEach((svg) => svg.setAttribute("aria-hidden", "true"));
    ocultarSvgs();
    const observer = new MutationObserver(ocultarSvgs);
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ref]);
}
