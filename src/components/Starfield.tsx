import { useEffect, useRef } from "react";

interface Estrela {
  x: number;
  y: number;
  raio: number;
  fase: number;
  velocidadeFase: number;
}

export function Starfield() {
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

    function gerarEstrelas() {
      const quantidade = Math.min(260, Math.round((largura * altura) / 6500));
      estrelas = Array.from({ length: quantidade }, () => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        raio: Math.random() * 1.3 + 0.3,
        fase: Math.random() * Math.PI * 2,
        velocidadeFase: 0.35 + Math.random() * 0.75,
      }));
    }

    function redimensionar() {
      largura = window.innerWidth;
      altura = window.innerHeight;
      canvas!.width = largura * dpr;
      canvas!.height = altura * dpr;
      canvas!.style.width = `${largura}px`;
      canvas!.style.height = `${altura}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      gerarEstrelas();
    }

    redimensionar();
    window.addEventListener("resize", redimensionar);

    let raf = 0;
    let tempoAnterior = performance.now();

    function desenharEstatico() {
      ctx!.clearRect(0, 0, largura, altura);
      for (const estrela of estrelas) {
        ctx!.beginPath();
        ctx!.arc(estrela.x, estrela.y, estrela.raio, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(244, 244, 248, 0.6)";
        ctx!.fill();
      }
    }

    function desenhar(agora: number) {
      const dt = (agora - tempoAnterior) / 1000;
      tempoAnterior = agora;
      ctx!.clearRect(0, 0, largura, altura);
      for (const estrela of estrelas) {
        estrela.fase += estrela.velocidadeFase * dt;
        const brilho = 0.28 + 0.55 * (0.5 + 0.5 * Math.sin(estrela.fase));
        ctx!.beginPath();
        ctx!.arc(estrela.x, estrela.y, estrela.raio, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(244, 244, 248, ${brilho})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(desenhar);
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
