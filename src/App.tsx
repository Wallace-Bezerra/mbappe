import { useEffect, useRef, useState } from "react";
import { MousePointer2, Star, Globe, ChevronDown, Check } from "lucide-react";

// ── Assets locais (troque estes 2 arquivos em /public pelas suas fotos) ──
const BASE_IMAGE = "/mbappe-base.png";
const REVEAL_IMAGE = "/mbappe-reveal.png";

// ── Constants ──
const SPOTLIGHT_R = 260;
const GRID_CELL = 48;

// ── i18n ──
type Lang = "en" | "fr" | "pt";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const T: Record<Lang, {
  career: string;
  trophies: string;
  contact: string;
  badge: string;
  eyebrow: string;
  subtitle: string;
  hint: string;
}> = {
  en: {
    career: "Career",
    trophies: "Trophies",
    contact: "Contact",
    badge: "No. 10 · France",
    eyebrow: "Les Bleus · The Dictator",
    subtitle:
      "Speed, composure and an iron will. Move your mouse to reveal the dictator behind the number 10.",
    hint: "Move your mouse to reveal",
  },
  fr: {
    career: "Carrière",
    trophies: "Palmarès",
    contact: "Contact",
    badge: "N° 10 · France",
    eyebrow: "Les Bleus · Le Dictateur",
    subtitle:
      "Vitesse, sang-froid et une volonté de fer. Déplacez la souris pour révéler le dictateur derrière le numéro 10.",
    hint: "Déplacez la souris pour révéler",
  },
  pt: {
    career: "Carreira",
    trophies: "Títulos",
    contact: "Contato",
    badge: "Nº 10 · França",
    eyebrow: "Les Bleus · O Ditador",
    subtitle:
      "Velocidade, frieza e um punho de ferro. Passe o mouse e revele o ditador por trás do camisa 10.",
    hint: "Passe o mouse para revelar",
  },
};

/** Seletor de idioma — dropdown de vidro escuro com bandeiras. */
function LanguageSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = LANGS.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 backdrop-blur transition-colors hover:border-[#d4af37]/50 hover:text-white"
      >
        <Globe size={15} className="text-[#d4af37]" />
        <span className="text-base leading-none">{current.flag}</span>
        <span className="font-semibold tracking-wide">{current.code.toUpperCase()}</span>
        <ChevronDown size={14} className={`text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`absolute right-0 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-200 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <p className="border-b border-white/5 px-4 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
          Language
        </p>
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => {
              setLang(l.code);
              setOpen(false);
            }}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
              l.code === lang ? "text-[#d4af37]" : "text-white/80"
            }`}
          >
            <span className="text-lg leading-none">{l.flag}</span>
            <span className="flex-1 text-left font-medium">{l.label}</span>
            {l.code === lang && <Check size={15} />}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * RevealLayer — canvas escondido desenha um holofote na posição do cursor,
 * usado como máscara CSS sobre a REVEAL_IMAGE. Redesenha a cada render.
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
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("lang");
    return saved === "fr" || saved === "pt" || saved === "en" ? saved : "en";
  });

  const t = T[lang];

  useEffect(() => {
    window.localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

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

        <div className="hidden items-center gap-6 text-sm font-medium text-white/70 lg:flex">
          <a href="#" className="transition-colors hover:text-white">{t.career}</a>
          <a href="#" className="transition-colors hover:text-white">{t.trophies}</a>
          <a href="#" className="transition-colors hover:text-white">{t.contact}</a>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs font-semibold tracking-wide text-[#d4af37] sm:flex">
            <Star size={12} className="fill-[#d4af37]" />
            {t.badge}
          </span>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </div>
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
            {t.eyebrow}
          </p>
          <h1 className="text-5xl font-black leading-[0.9] tracking-tight text-white sm:text-6xl md:text-7xl">
            KYLIAN
            <br />
            MBAPPÉ
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70 sm:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* 6. Dica de interação (some ao mover o mouse) */}
        <div
          className={`absolute bottom-10 right-6 z-50 hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur transition-opacity duration-700 md:flex ${
            moved ? "opacity-0" : "opacity-100"
          }`}
        >
          <MousePointer2 size={14} className="text-[#d4af37]" />
          {t.hint}
        </div>
      </section>
    </div>
  );
}
