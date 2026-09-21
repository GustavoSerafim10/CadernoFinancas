import { useEffect, useRef, useState } from "react";
import { IconeSeta } from "./Icones";
import { campoInput } from "./estilosComuns";

interface Opcao {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  opcoes: Opcao[];
  ariaLabel: string;
  maxWidth?: number;
}

export function SeletorLista({ value, onChange, opcoes, ariaLabel, maxWidth }: Props) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const selecionado = opcoes.find((o) => o.value === value);

  useEffect(() => {
    if (!aberto) return;
    function fora(e: MouseEvent) {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const item = listaRef.current?.children[ativo] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [aberto, ativo]);

  function abrir() {
    setAtivo(Math.max(0, opcoes.findIndex((o) => o.value === value)));
    setAberto(true);
  }

  function escolher(v: string) {
    onChange(v);
    setAberto(false);
  }

  function aoTeclar(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setAberto(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!aberto) return abrir();
      const passo = e.key === "ArrowDown" ? 1 : -1;
      setAtivo((i) => Math.min(opcoes.length - 1, Math.max(0, i + passo)));
    } else if ((e.key === "Enter" || e.key === " ") && aberto) {
      e.preventDefault();
      escolher(opcoes[ativo].value);
    }
  }

  return (
    <div ref={raiz} style={{ position: "relative", flex: "0 1 auto", width: "100%", maxWidth }}>
      <button
        type="button"
        className="cf-focus"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={aoTeclar}
        style={{
          ...campoInput,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>{selecionado?.label}</span>
        <span style={{ display: "inline-flex", transform: aberto ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.15s ease" }}>
          <IconeSeta dir="right" />
        </span>
      </button>
      {aberto && (
        <ul
          ref={listaRef}
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            minWidth: "100%",
            margin: "4px 0 0",
            padding: 4,
            listStyle: "none",
            maxHeight: 280,
            overflowY: "auto",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            borderRadius: 8,
            boxShadow: "0 12px 30px rgba(0,0,0,0.55)",
            zIndex: 30,
          }}
        >
          {opcoes.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => escolher(o.value)}
              onMouseEnter={() => setAtivo(i)}
              style={{
                padding: "7px 10px",
                borderRadius: 6,
                fontSize: 13.5,
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: o.value === value ? "var(--ink)" : "var(--ink-soft)",
                fontWeight: o.value === value ? 600 : 400,
                background: i === ativo ? "var(--surface-glass-hover)" : "transparent",
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
