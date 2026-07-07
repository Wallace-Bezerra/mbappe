import { useEffect, useRef, useState } from "react";
import { MousePointer2, Star } from "lucide-react";

// ── Assets locais (troque estes 2 arquivos em /public pelas suas fotos) ──
// BASE = Mbappé normal (camisa da França) · REVEAL = Mbappé "general" (aparece sob o mouse)
const BASE_IMAGE = "/mbappe-base.webp";
const REVEAL_IMAGE = "/mbappe-reveal.webp";

// ── Constants ──
const SPOTLIGHT_R = 260;
const GRID_CELL = 48;

/**
 * RevealLayer — um canvas escondido desenha um gradiente radial (holofote) na
 * posição do cursor e é usado como máscara CSS sobre um div com a REVEAL_IMAGE,
 * revelando-a só sob o holofote. Redesenha a cada render.
 */
function RevealLayer({ cursorX, cursorY }: { cursorX: number; cursorY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const mask = maskRef.current;
    if (!canvas || !mask) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const g = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,1)");
    g.addColorStop(0.6, "rgba(255,255,255,0.75)");
    g.addColorStop(0.75, "rgba(255,255,255,0.4)");
    g.addColorStop(0.88, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const url = canvas.toDataURL();
    mask.style.setProperty("mask-image", `url(${url})`);
    mask.style.setProperty("-webkit-mask-image", `url(${url})`);
    mask.style.setProperty("mask-size", "100% 100%");
    mask.style.setProperty("-webkit-mask-size", "100% 100%");
    mask.style.setProperty("mask-repeat", "no-repeat");
    mask.style.setProperty("-webkit-mask-repeat", "no-repeat");
  });

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div
        ref={maskRef}
        className="absolute inset-0 z-30 bg-center bg-cover bg-no-repeat pointer-events-none"
        style={{ width: "100%", height: "100%", backgroundImage: `url('${REVEAL_IMAGE}')` }}
      />
    </>
  );
}

export default function App() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [moved, setMoved] = useState(false);

  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const gridOffset = useRef({ x: 0, y: 0 });
  const patternRef = useRef<SVGPatternElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const cx0 = window.innerWidth / 2;
    const cy0 = window.innerHeight / 2;
    mouse.current = { x: cx0, y: cy0 };
    smooth.current = { x: cx0, y: cy0 };
    setCursorPos({ x: cx0, y: cy0 });

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      setMoved(true);
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const loop = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;

      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect && rect.width && rect.height) {
        const cx = (smooth.current.x - rect.left) / rect.width - 0.5;
        const cy = (smooth.current.y - rect.top) / rect.height - 0.5;
        gridOffset.current.x += (cx * 16 - gridOffset.current.x) * 0.06;
        gridOffset.current.y += (cy * 16 - gridOffset.current.y) * 0.06;
        if (patternRef.current) {
          patternRef.current.setAttribute("x", String(gridOffset.current.x));
          patternRef.current.setAttribute("y", String(gridOffset.current.y));
        }
      }

      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ── Navegação ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">
        <span className="text-xl font-black tracking-[0.2em] text-white">MBAPPÉ</span>
        <div className="hidden items-center gap-6 text-sm font-medium text-white/70 sm:flex">
          <a href="#" className="transition-colors hover:text-white">Carreira</a>
          <a href="#" className="transition-colors hover:text-white">Títulos</a>
          <a href="#" className="transition-colors hover:text-white">Contato</a>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs font-semibold tracking-wide text-[#d4af37]">
          <Star size={12} className="fill-[#d4af37]" />
          Nº 10 · FRANCE
        </span>
      </nav>

      {/* ── Hero ── */}
      <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ height: "100vh" }}>
        {/* 1. Grade */}
        <svg
          className="absolute inset-0 z-0 h-full w-full pointer-events-none"
          style={{ opacity: 0.12 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" ref={patternRef} width={GRID_CELL} height={GRID_CELL} patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#d4af37" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* 2. Imagem base (Mbappé normal) */}
        <div
          className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url('${BASE_IMAGE}')` }}
        />

        {/* 3. Camada de revelação (Mbappé "general" sob o holofote) */}
        <RevealLayer cursorX={cursorPos.x} cursorY={cursorPos.y} />

        {/* 4. Véus para legibilidade */}
        <div aria-hidden className="absolute inset-0 z-40 bg-gradient-to-t from-black via-black/10 to-black/30 pointer-events-none" />
        <div aria-hidden className="absolute inset-0 z-40 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* 5. Texto */}
        <div className="absolute bottom-10 left-5 z-50 max-w-md sm:bottom-14 sm:left-8 md:left-12">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4af37]">
            Les Bleus · O Fenômeno
          </p>
          <h1 className="text-5xl font-black leading-[0.9] tracking-tight text-white sm:text-6xl md:text-7xl">
            KYLIAN
            <br />
            MBAPPÉ
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70 sm:text-base">
            Velocidade, frieza e uma coroa invisível. Passe o mouse e revele o
            imperador por trás do camisa 10.
          </p>
        </div>

        {/* 6. Dica de interação (some ao mover o mouse) */}
        <div
          className={`absolute bottom-10 right-6 z-50 hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur transition-opacity duration-700 md:flex ${
            moved ? "opacity-0" : "opacity-100"
          }`}
        >
          <MousePointer2 size={14} className="text-[#d4af37]" />
          Mova o mouse para revelar
        </div>
      </section>
    </div>
  );
}
