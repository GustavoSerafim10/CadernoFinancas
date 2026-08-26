import { CSSProperties, useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface Props {
  valor: number;
  formatar: (v: number) => string;
  className?: string;
  style?: CSSProperties;
}

export function NumeroAnimado({ valor, formatar, className, style }: Props) {
  const reduzMotion = useReducedMotion();
  const [exibido, setExibido] = useState(valor);
  const anterior = useRef(valor);

  useEffect(() => {
    if (reduzMotion) return;
    const controls = animate(anterior.current, valor, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setExibido(v),
    });
    anterior.current = valor;
    return () => controls.stop();
  }, [valor, reduzMotion]);

  return (
    <span className={className} style={style}>
      {formatar(reduzMotion ? valor : exibido)}
    </span>
  );
}
