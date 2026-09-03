const COR_MONO = "'JetBrains Mono', monospace";

interface GaugeProps {
  valor: number;
  label: string;
}

function Gauge({ valor, label }: GaugeProps) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={48} height={48} style={{ transform: "rotate(-90deg)", flex: "0 0 auto" }}>
        <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={2} />
        <circle
          cx={24}
          cy={24}
          r={r}
          fill="none"
          stroke="rgba(124,108,246,0.45)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - valor / 100)}
        />
      </svg>
      <div>
        <div style={{ fontFamily: COR_MONO, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{valor}%</div>
        <div
          style={{
            fontFamily: COR_MONO,
            fontSize: 9,
            color: "rgba(255,255,255,0.24)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function Candlestick() {
  const barras = [12, 18, 14, 22, 19, 27, 23, 31, 26, 36, 33, 41];
  const largura = 10;
  const gap = 5;
  const alturaMax = 76;
  const w = barras.length * (largura + gap);
  return (
    <svg width={w} height={alturaMax + 8} style={{ opacity: 0.4 }}>
      <polyline
        points={barras.map((v, i) => `${i * (largura + gap) + largura / 2},${alturaMax - v}`).join(" ")}
        fill="none"
        stroke="rgba(45,212,191,0.65)"
        strokeWidth={1.3}
      />
      {barras.map((v, i) => (
        <rect
          key={i}
          x={i * (largura + gap)}
          y={alturaMax - v}
          width={largura}
          height={v}
          fill={i % 2 === 0 ? "rgba(45,212,191,0.18)" : "rgba(124,108,246,0.18)"}
          stroke={i % 2 === 0 ? "rgba(45,212,191,0.45)" : "rgba(124,108,246,0.45)"}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

export function FinanceHud() {
  return (
    <div aria-hidden="true" className="cf-finance-hud" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "clamp(24px, 16vw, 260px)",
          bottom: "18%",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <Gauge valor={38} label="orçado" />
        <Gauge valor={72} label="economia" />
        <Gauge valor={91} label="futuro" />
      </div>

      <div style={{ position: "absolute", left: 28, bottom: "9%", fontFamily: COR_MONO }}>
        <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(147,197,253,0.4)" }}>PORTFÓLIO</div>
        <div style={{ fontSize: 16, color: "rgba(53,208,127,0.5)" }}>
          +12.4% <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>YTD</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 22,
          transform: "translateX(-50%)",
          fontFamily: COR_MONO,
          fontSize: 10,
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.16)",
          whiteSpace: "nowrap",
        }}
      >
        23.5505° S · 46.6333° W
      </div>

      <div
        style={{
          position: "absolute",
          right: "clamp(48px, 8vw, 120px)",
          bottom: "24%",
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "1px solid rgba(45,212,191,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: COR_MONO,
          fontSize: 14,
          color: "rgba(45,212,191,0.4)",
        }}
      >
        $
      </div>

      <div style={{ position: "absolute", right: "clamp(24px, 6vw, 80px)", bottom: "6%" }}>
        <Candlestick />
      </div>
    </div>
  );
}
