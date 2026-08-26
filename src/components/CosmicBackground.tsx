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

interface Nave {
  ativa: boolean;
  x: number;
  y: number;
  vx: number;
  angulo: number;
  vida: number;
  vidaMax: number;
}

const COR_ESTRELA = "244, 244, 248";
const COR_PARTICULA = "158, 141, 255";
const COR_ACCENT = "124, 108, 246";

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
    let proximaNave = tempoAleatorio(35, 70);
    const nave: Nave = { ativa: false, x: 0, y: 0, vx: 0, angulo: 0, vida: 0, vidaMax: 1 };

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

    function talvezAtivarNave(dt: number) {
      if (nave.ativa) return;
      proximaNave -= dt;
      if (proximaNave > 0) return;
      proximaNave = tempoAleatorio(50, 100);
      const daEsquerda = Math.random() > 0.5;
      nave.ativa = true;
      nave.vida = 0;
      nave.vidaMax = 14 + Math.random() * 6;
      nave.y = altura * (0.55 + Math.random() * 0.3);
      nave.x = daEsquerda ? -60 : largura + 60;
      nave.vx = ((daEsquerda ? 1 : -1) * largura) / nave.vidaMax;
      nave.angulo = daEsquerda ? 0.06 : Math.PI - 0.06;
    }

    function atualizarEDesenharNave(dt: number) {
      if (!nave.ativa) return;
      nave.vida += dt;
      nave.x += nave.vx * dt;
      nave.y += Math.sin(nave.vida * 0.6) * 6 * dt;
      if (nave.vida >= nave.vidaMax) {
        nave.ativa = false;
        return;
      }
      const progresso = nave.vida / nave.vidaMax;
      const opacidade = progresso < 0.12 ? progresso / 0.12 : progresso > 0.88 ? (1 - progresso) / 0.12 : 1;

      ctx!.save();
      ctx!.translate(nave.x, nave.y);
      ctx!.rotate(nave.angulo);
      ctx!.globalAlpha = opacidade * 0.65;

      // rastro do motor
      const rastro = ctx!.createLinearGradient(-26, 0, -2, 0);
      rastro.addColorStop(0, "rgba(124, 108, 246, 0)");
      rastro.addColorStop(1, `rgba(${COR_ACCENT}, 0.55)`);
      ctx!.fillStyle = rastro;
      ctx!.beginPath();
      ctx!.moveTo(-26, 0);
      ctx!.lineTo(-4, -3.5);
      ctx!.lineTo(-4, 3.5);
      ctx!.closePath();
      ctx!.fill();

      // corpo do foguete (silhueta minimalista)
      ctx!.fillStyle = `rgba(${COR_ESTRELA}, 0.75)`;
      ctx!.beginPath();
      ctx!.moveTo(16, 0);
      ctx!.lineTo(-2, -5);
      ctx!.lineTo(-8, -3.2);
      ctx!.lineTo(-8, 3.2);
      ctx!.lineTo(-2, 5);
      ctx!.closePath();
      ctx!.fill();

      ctx!.restore();
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

      talvezAtivarNave(dt);
      atualizarEDesenharNave(dt);

      raf = requestAnimationFrame(desenhar);
    }

    function desenharEstatico() {
      ctx!.clearRect(0, 0, largura, altura);
      desenharPlaneta();
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
