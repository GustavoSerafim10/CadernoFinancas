import { useEffect, useRef } from "react";

interface Estrela {
  x: number;
  y: number;
  raio: number;
  fase: number;
  velocidadeFase: number;
}

interface Particula {
  x: number;
  y: number;
  raio: number;
  vx: number;
  vy: number;
  opacidade: number;
}

interface Meteoro {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  vidaMax: number;
  comprimento: number;
}

type TipoNave = "foguete" | "caca" | "disco";

interface NaveSolo {
  ativa: boolean;
  tipo: TipoNave;
  x: number;
  y: number;
  vx: number;
  angulo: number;
  vida: number;
  vidaMax: number;
}

interface Combatente {
  tipo: TipoNave;
  x: number;
  y: number;
  vx: number;
  viva: boolean;
}

interface Tiro {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface ParticulaExplosao {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Explosao {
  x: number;
  y: number;
  vida: number;
  particulas: ParticulaExplosao[];
}

interface Batalha {
  fase: "aproximando" | "atirando" | "explodindo" | "encerrando";
  a: Combatente;
  b: Combatente;
  vencedorIdx: 0 | 1;
  tiro: Tiro | null;
  atrasoTiro: number;
  explosao: Explosao | null;
}

const COR_ESTRELA = "244, 244, 248";
const COR_PARTICULA = "158, 141, 255";
const COR_ACCENT = "124, 108, 246";
const COR_TIRO = "255, 130, 90";

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduzMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let largura = window.innerWidth;
    let altura = window.innerHeight;

    let estrelas: Estrela[] = [];
    let particulas: Particula[] = [];
    let meteoros: Meteoro[] = [];
    let proximoMeteoro = tempoAleatorio(4, 11);
    let proximoEvento = tempoAleatorio(28, 55);
    const naveSolo: NaveSolo = { ativa: false, tipo: "foguete", x: 0, y: 0, vx: 0, angulo: 0, vida: 0, vidaMax: 1 };
    let batalha: Batalha | null = null;

    const mouse = { x: 0, y: 0 };
    const parallax = { x: 0, y: 0 };

    function tempoAleatorio(minSeg: number, maxSeg: number) {
      return minSeg + Math.random() * (maxSeg - minSeg);
    }

    function gerarCena() {
      const qtdEstrelas = Math.min(220, Math.round((largura * altura) / 7500));
      estrelas = Array.from({ length: qtdEstrelas }, () => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        raio: Math.random() * 1.3 + 0.3,
        fase: Math.random() * Math.PI * 2,
        velocidadeFase: 0.35 + Math.random() * 0.75,
      }));

      const qtdParticulas = Math.min(36, Math.round((largura * altura) / 45000));
      particulas = Array.from({ length: qtdParticulas }, () => criarParticula());
    }

    function criarParticula(): Particula {
      return {
        x: Math.random() * largura,
        y: Math.random() * altura,
        raio: Math.random() * 1.8 + 0.8,
        vx: (Math.random() - 0.5) * 6,
        vy: -4 - Math.random() * 6,
        opacidade: 0.15 + Math.random() * 0.25,
      };
    }

    function redimensionar() {
      largura = window.innerWidth;
      altura = window.innerHeight;
      canvas!.width = largura * dpr;
      canvas!.height = altura * dpr;
      canvas!.style.width = `${largura}px`;
      canvas!.style.height = `${altura}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      gerarCena();
    }

    function aoMoverMouse(e: MouseEvent) {
      mouse.x = e.clientX / largura - 0.5;
      mouse.y = e.clientY / altura - 0.5;
    }

    redimensionar();
    window.addEventListener("resize", redimensionar);
    if (!reduzMotion) window.addEventListener("mousemove", aoMoverMouse);

    function desenharPlaneta() {
      const cx = largura - 70;
      const cy = 120;
      const raio = 92;
      const gradiente = ctx!.createRadialGradient(cx - raio * 0.35, cy - raio * 0.35, raio * 0.1, cx, cy, raio);
      gradiente.addColorStop(0, "rgba(168, 139, 250, 0.32)");
      gradiente.addColorStop(0.6, "rgba(99, 82, 196, 0.18)");
      gradiente.addColorStop(1, "rgba(99, 82, 196, 0)");
      ctx!.save();
      ctx!.translate(parallax.x * 0.15, parallax.y * 0.15);
      ctx!.beginPath();
      ctx!.arc(cx, cy, raio, 0, Math.PI * 2);
      ctx!.fillStyle = gradiente;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.ellipse(cx, cy, raio * 1.7, raio * 0.32, -0.35, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(192, 132, 252, 0.22)";
      ctx!.lineWidth = 2;
      ctx!.stroke();
      ctx!.restore();
    }

    function desenharPlanetaSecundario() {
      const cx = 80;
      const cy = altura - 100;
      const raio = 140;
      ctx!.save();
      ctx!.translate(parallax.x * 0.1, parallax.y * 0.1);

      const base = ctx!.createRadialGradient(cx, cy, raio * 0.15, cx, cy, raio);
      base.addColorStop(0, "rgba(59, 100, 190, 0.1)");
      base.addColorStop(0.6, "rgba(49, 90, 180, 0.2)");
      base.addColorStop(1, "rgba(30, 58, 138, 0.26)");
      ctx!.beginPath();
      ctx!.arc(cx, cy, raio, 0, Math.PI * 2);
      ctx!.fillStyle = base;
      ctx!.fill();

      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, raio, 0, Math.PI * 2);
      ctx!.clip();
      const limbo = ctx!.createRadialGradient(
        cx + raio * 0.5,
        cy - raio * 0.5,
        0,
        cx + raio * 0.5,
        cy - raio * 0.5,
        raio * 0.95
      );
      limbo.addColorStop(0, "rgba(147, 197, 253, 0.45)");
      limbo.addColorStop(1, "rgba(147, 197, 253, 0)");
      ctx!.fillStyle = limbo;
      ctx!.fillRect(cx - raio, cy - raio, raio * 2, raio * 2);
      ctx!.restore();

      ctx!.restore();
    }

    function atualizarEDesenharParticulas(dt: number) {
      for (const p of particulas) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y < -20) Object.assign(p, criarParticula(), { y: altura + 10 });
        if (p.x < -20) p.x = largura + 20;
        if (p.x > largura + 20) p.x = -20;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${COR_PARTICULA}, ${p.opacidade})`;
        ctx!.shadowBlur = 6;
        ctx!.shadowColor = `rgba(${COR_PARTICULA}, 0.5)`;
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }
    }

    function atualizarEDesenharEstrelas(dt: number) {
      for (const e of estrelas) {
        e.fase += e.velocidadeFase * dt;
        const brilho = 0.28 + 0.55 * (0.5 + 0.5 * Math.sin(e.fase));
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, e.raio, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${COR_ESTRELA}, ${brilho})`;
        ctx!.fill();
      }
    }

    function talvezCriarMeteoro(dt: number) {
      proximoMeteoro -= dt;
      if (proximoMeteoro > 0) return;
      proximoMeteoro = tempoAleatorio(6, 16);
      const partindoDaEsquerda = Math.random() > 0.5;
      const velocidade = 520 + Math.random() * 260;
      meteoros.push({
        x: partindoDaEsquerda ? -40 : largura + 40,
        y: Math.random() * altura * 0.5,
        vx: (partindoDaEsquerda ? 1 : -1) * velocidade,
        vy: velocidade * 0.45,
        vida: 0,
        vidaMax: 1.1,
        comprimento: 90 + Math.random() * 40,
      });
    }

    function atualizarEDesenharMeteoros(dt: number) {
      meteoros = meteoros.filter((m) => m.vida < m.vidaMax);
      for (const m of meteoros) {
        m.vida += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const progresso = m.vida / m.vidaMax;
        const opacidade = progresso < 0.15 ? progresso / 0.15 : 1 - (progresso - 0.15) / 0.85;
        const angulo = Math.atan2(m.vy, m.vx);
        const cauda = {
          x: m.x - Math.cos(angulo) * m.comprimento,
          y: m.y - Math.sin(angulo) * m.comprimento,
        };
        const gradiente = ctx!.createLinearGradient(m.x, m.y, cauda.x, cauda.y);
        gradiente.addColorStop(0, `rgba(${COR_ESTRELA}, ${Math.max(0, opacidade)})`);
        gradiente.addColorStop(1, `rgba(${COR_ESTRELA}, 0)`);
        ctx!.strokeStyle = gradiente;
        ctx!.lineWidth = 1.6;
        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(cauda.x, cauda.y);
        ctx!.stroke();
      }
    }

    function tipoAleatorio(): TipoNave {
      const r = Math.random();
      return r < 0.45 ? "foguete" : r < 0.75 ? "caca" : "disco";
    }

    function desenharSilhuetaNave(tipo: TipoNave, escala: number) {
      ctx!.save();
      ctx!.scale(escala, escala);

      if (tipo === "disco") {
        ctx!.beginPath();
        ctx!.ellipse(0, 3, 15, 3.4, 0, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${COR_ACCENT}, 0.55)`;
        ctx!.lineWidth = 1.4;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.ellipse(0, 1, 20, 6.5, 0, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${COR_ESTRELA}, 0.8)`;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.ellipse(0, -3.5, 8, 7, 0, Math.PI, 0);
        ctx!.fillStyle = `rgba(${COR_ACCENT}, 0.55)`;
        ctx!.fill();
      } else if (tipo === "caca") {
        const rastro = ctx!.createLinearGradient(-22, 0, -6, 0);
        rastro.addColorStop(0, `rgba(${COR_ACCENT}, 0)`);
        rastro.addColorStop(1, `rgba(${COR_ACCENT}, 0.6)`);
        ctx!.fillStyle = rastro;
        ctx!.beginPath();
        ctx!.moveTo(-22, -2);
        ctx!.lineTo(-6, -1.2);
        ctx!.lineTo(-6, 1.2);
        ctx!.lineTo(-22, 2);
        ctx!.closePath();
        ctx!.fill();

        // silhueta delta solida (tipo stealth), nao pontas finas
        ctx!.fillStyle = `rgba(${COR_ESTRELA}, 0.85)`;
        ctx!.beginPath();
        ctx!.moveTo(21, 0);
        ctx!.lineTo(-7, -13);
        ctx!.lineTo(-3, -3.5);
        ctx!.lineTo(-15, -3.5);
        ctx!.lineTo(-15, 3.5);
        ctx!.lineTo(-3, 3.5);
        ctx!.lineTo(-7, 13);
        ctx!.closePath();
        ctx!.fill();
      } else {
        const rastro = ctx!.createLinearGradient(-30, 0, -5, 0);
        rastro.addColorStop(0, `rgba(${COR_ACCENT}, 0)`);
        rastro.addColorStop(1, `rgba(${COR_ACCENT}, 0.6)`);
        ctx!.fillStyle = rastro;
        ctx!.beginPath();
        ctx!.moveTo(-30, 0);
        ctx!.lineTo(-5, -4);
        ctx!.lineTo(-5, 4);
        ctx!.closePath();
        ctx!.fill();

        ctx!.fillStyle = `rgba(${COR_ESTRELA}, 0.85)`;
        ctx!.beginPath();
        ctx!.moveTo(20, 0);
        ctx!.lineTo(-2.5, -6);
        ctx!.lineTo(-10, -4);
        ctx!.lineTo(-10, 4);
        ctx!.lineTo(-2.5, 6);
        ctx!.closePath();
        ctx!.fill();
      }
      ctx!.restore();
    }

    function eventoEspacialAtivo() {
      return naveSolo.ativa || batalha !== null;
    }

    function talvezIniciarEvento(dt: number) {
      if (eventoEspacialAtivo()) return;
      proximoEvento -= dt;
      if (proximoEvento > 0) return;
      proximoEvento = tempoAleatorio(28, 55);
      if (Math.random() < 0.4) {
        iniciarBatalha();
      } else {
        iniciarNaveSolo();
      }
    }

    function iniciarNaveSolo() {
      const daEsquerda = Math.random() > 0.5;
      naveSolo.ativa = true;
      naveSolo.tipo = tipoAleatorio();
      naveSolo.vida = 0;
      naveSolo.vidaMax = 13 + Math.random() * 6;
      naveSolo.y = altura * (0.5 + Math.random() * 0.32);
      naveSolo.x = daEsquerda ? -80 : largura + 80;
      naveSolo.vx = ((daEsquerda ? 1 : -1) * largura) / naveSolo.vidaMax;
      naveSolo.angulo = daEsquerda ? 0.06 : Math.PI - 0.06;
    }

    function atualizarEDesenharNaveSolo(dt: number) {
      if (!naveSolo.ativa) return;
      naveSolo.vida += dt;
      naveSolo.x += naveSolo.vx * dt;
      naveSolo.y += Math.sin(naveSolo.vida * 0.6) * 6 * dt;
      if (naveSolo.vida >= naveSolo.vidaMax) {
        naveSolo.ativa = false;
        return;
      }
      const progresso = naveSolo.vida / naveSolo.vidaMax;
      const opacidade = progresso < 0.12 ? progresso / 0.12 : progresso > 0.88 ? (1 - progresso) / 0.12 : 1;

      ctx!.save();
      ctx!.translate(naveSolo.x, naveSolo.y);
      ctx!.rotate(naveSolo.angulo);
      ctx!.globalAlpha = opacidade * 0.7;
      desenharSilhuetaNave(naveSolo.tipo, 2);
      ctx!.restore();
    }

    function iniciarBatalha() {
      const y = altura * (0.22 + Math.random() * 0.4);
      const velocidade = 80 + Math.random() * 30;
      batalha = {
        fase: "aproximando",
        a: { tipo: tipoAleatorio(), x: -90, y, vx: velocidade, viva: true },
        b: { tipo: tipoAleatorio(), x: largura + 90, y: y + (Math.random() - 0.5) * 70, vx: -velocidade, viva: true },
        vencedorIdx: Math.random() > 0.5 ? 0 : 1,
        tiro: null,
        atrasoTiro: 0,
        explosao: null,
      };
    }

    function atualizarEDesenharBatalha(dt: number) {
      if (!batalha) return;
      const b = batalha;
      const combatentes: [Combatente, Combatente] = [b.a, b.b];
      const vencedor = combatentes[b.vencedorIdx];
      const perdedor = combatentes[b.vencedorIdx === 0 ? 1 : 0];

      if (b.fase === "aproximando") {
        b.a.x += b.a.vx * dt;
        b.b.x += b.b.vx * dt;
        if (Math.abs(b.a.x - b.b.x) < 280) {
          b.fase = "atirando";
          b.atrasoTiro = 0.25;
        }
      } else if (b.fase === "atirando") {
        b.a.x += b.a.vx * dt * 0.35;
        b.b.x += b.b.vx * dt * 0.35;
        if (!b.tiro) {
          b.atrasoTiro -= dt;
          if (b.atrasoTiro <= 0) {
            const dx = perdedor.x - vencedor.x;
            const dy = perdedor.y - vencedor.y;
            const dist = Math.hypot(dx, dy) || 1;
            const vTiro = 640;
            b.tiro = { x: vencedor.x, y: vencedor.y, vx: (dx / dist) * vTiro, vy: (dy / dist) * vTiro };
          }
        } else {
          b.tiro.x += b.tiro.vx * dt;
          b.tiro.y += b.tiro.vy * dt;
          if (Math.hypot(b.tiro.x - perdedor.x, b.tiro.y - perdedor.y) < 18) {
            perdedor.viva = false;
            b.tiro = null;
            b.explosao = {
              x: perdedor.x,
              y: perdedor.y,
              vida: 0,
              particulas: Array.from({ length: 26 }, () => {
                const ang = Math.random() * Math.PI * 2;
                const spd = 60 + Math.random() * 170;
                return { x: 0, y: 0, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd };
              }),
            };
            b.fase = "explodindo";
          }
        }
      } else if (b.fase === "explodindo") {
        if (b.explosao) {
          b.explosao.vida += dt;
          for (const p of b.explosao.particulas) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          }
          if (b.explosao.vida > 0.9) b.fase = "encerrando";
        }
        vencedor.x += vencedor.vx * dt;
      } else if (b.fase === "encerrando") {
        vencedor.x += vencedor.vx * dt;
        if (vencedor.x < -120 || vencedor.x > largura + 120) {
          batalha = null;
          return;
        }
      }

      for (const c of combatentes) {
        if (!c.viva) continue;
        ctx!.save();
        ctx!.translate(c.x, c.y);
        ctx!.rotate(c.vx > 0 ? 0.05 : Math.PI - 0.05);
        ctx!.globalAlpha = 0.75;
        desenharSilhuetaNave(c.tipo, 1.7);
        ctx!.restore();
      }

      if (b.tiro) {
        const t = b.tiro;
        const ang = Math.atan2(t.vy, t.vx);
        const comp = 22;
        const cauda = { x: t.x - Math.cos(ang) * comp, y: t.y - Math.sin(ang) * comp };
        const grad = ctx!.createLinearGradient(t.x, t.y, cauda.x, cauda.y);
        grad.addColorStop(0, `rgba(${COR_TIRO}, 0.95)`);
        grad.addColorStop(1, `rgba(${COR_TIRO}, 0)`);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 2.4;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(t.x, t.y);
        ctx!.lineTo(cauda.x, cauda.y);
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(t.x, t.y, 1.8, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255, 225, 190, 0.95)";
        ctx!.fill();
      }

      if (b.explosao) {
        const progresso = Math.min(1, b.explosao.vida / 0.9);
        const raioFlash = 6 + progresso * 48;
        const opFlash = Math.max(0, 1 - progresso * 1.5);
        if (opFlash > 0) {
          const g = ctx!.createRadialGradient(b.explosao.x, b.explosao.y, 0, b.explosao.x, b.explosao.y, raioFlash);
          g.addColorStop(0, `rgba(255, 235, 200, ${opFlash})`);
          g.addColorStop(0.4, `rgba(255, 150, 90, ${opFlash * 0.7})`);
          g.addColorStop(1, "rgba(255, 90, 60, 0)");
          ctx!.beginPath();
          ctx!.arc(b.explosao.x, b.explosao.y, raioFlash, 0, Math.PI * 2);
          ctx!.fillStyle = g;
          ctx!.fill();
        }
        const opParticulas = Math.max(0, 1 - progresso);
        for (const p of b.explosao.particulas) {
          ctx!.beginPath();
          ctx!.arc(b.explosao.x + p.x, b.explosao.y + p.y, 1.6, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255, 175, 100, ${opParticulas})`;
          ctx!.fill();
        }
      }
    }

    let raf = 0;
    let tempoAnterior = performance.now();

    function desenhar(agora: number) {
      const dt = Math.min((agora - tempoAnterior) / 1000, 0.1);
      tempoAnterior = agora;

      parallax.x += (mouse.x * -24 - parallax.x) * 0.04;
      parallax.y += (mouse.y * -24 - parallax.y) * 0.04;

      ctx!.clearRect(0, 0, largura, altura);

      desenharPlaneta();
      desenharPlanetaSecundario();

      ctx!.save();
      ctx!.translate(parallax.x * 0.35, parallax.y * 0.35);
      atualizarEDesenharEstrelas(dt);
      ctx!.restore();

      ctx!.save();
      ctx!.translate(parallax.x, parallax.y);
      atualizarEDesenharParticulas(dt);
      ctx!.restore();

      talvezCriarMeteoro(dt);
      atualizarEDesenharMeteoros(dt);

      talvezIniciarEvento(dt);
      atualizarEDesenharNaveSolo(dt);
      atualizarEDesenharBatalha(dt);

      raf = requestAnimationFrame(desenhar);
    }

    function desenharEstatico() {
      ctx!.clearRect(0, 0, largura, altura);
      desenharPlaneta();
      desenharPlanetaSecundario();
      for (const e of estrelas) {
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, e.raio, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${COR_ESTRELA}, 0.55)`;
        ctx!.fill();
      }
    }

    function aoVisibilidade() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduzMotion) {
        tempoAnterior = performance.now();
        raf = requestAnimationFrame(desenhar);
      }
    }

    if (reduzMotion) {
      desenharEstatico();
    } else {
      raf = requestAnimationFrame(desenhar);
      document.addEventListener("visibilitychange", aoVisibilidade);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", redimensionar);
      window.removeEventListener("mousemove", aoMoverMouse);
      document.removeEventListener("visibilitychange", aoVisibilidade);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
