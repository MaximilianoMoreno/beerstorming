import { useEffect, useMemo, useRef, useState } from "react";
import {
  MicIcon, StopIcon, FilledMug, PlusIcon, NoteIcon, ReceiptIcon,
  ArrowIcon, ClockIcon, MugIcon, WaveIcon, SparkIcon,
} from "./icons";

export interface TranscriptLine {
  id: number;
  text: string;
  source: "voz" | "servilleta";
}

export interface HistoryEntry {
  date: string;
  beers: number;
  topIdea: string;
  ideas: number;
}

interface Props {
  isRecording: boolean;
  supported: boolean;
  micError: string | null;
  interim: string;
  lines: TranscriptLine[];
  seconds: number;
  beers: number;
  round: number;
  history: HistoryEntry[];
  wordCount: number;
  onToggleRecord: () => void;
  onAddBeer: () => void;
  onNapkin: (text: string) => void;
  onFinish: () => void;
  onDemo: () => void;
}

const CURDA_LABELS = [
  "sobrio total", "entrando en calor", "en confianza", "modo visionario",
  "modo visionario", "CEO espiritual", "CEO espiritual", "leyenda del bar", "leyenda del bar",
];

const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

export default function SessionView(p: Props) {
  const [napkin, setNapkin] = useState("");
  const tapeRef = useRef<HTMLDivElement>(null);
  const [beerPop, setBeerPop] = useState(0);

  useEffect(() => {
    const el = tapeRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [p.lines.length, p.interim]);

  const bars = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        h: 18 + ((i * 37) % 60),
        d: 0.55 + ((i * 13) % 40) / 60,
        delay: ((i * 7) % 30) / 60,
      })),
    []
  );

  const curda = Math.min(p.beers, 8);
  const anyText = p.lines.length > 0 || p.interim.length > 0;

  const submitNapkin = () => {
    const t = napkin.trim();
    if (!t) return;
    p.onNapkin(t);
    setNapkin("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] items-start fade-up">
      {/* ================= LA MESA ================= */}
      <div className="space-y-5">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="font-mono-r text-[11px] tracking-[0.3em] text-mut uppercase">Mesa #{p.round} · la ronda está abierta</p>
            <h2 className="font-display text-3xl sm:text-4xl text-foam leading-tight mt-1">
              Largá el plan.<br />
              <span className="text-amber">Nosotros anotamos.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono-r text-xs text-mut border border-[#3d2c12] bg-[#221809] px-3 py-2">
            <ClockIcon className="w-4 h-4 text-amber" />
            <span className="tabular-nums text-base text-foam">{fmt(p.seconds)}</span>
            <span className={p.isRecording ? "led text-danger" : "text-mut"}>{p.isRecording ? "● REC" : "○ EN PAUSA"}</span>
          </div>
        </div>

        {/* consola principal */}
        <div className="relative border border-[#3d2c12] bg-[linear-gradient(160deg,#261b0c,#1f1508)] p-5 sm:p-7 halftone overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* botón coaster */}
            <div className="relative shrink-0">
              {p.isRecording && (
                <>
                  <span className="pulse-ring absolute inset-0 rounded-full border-2 border-danger" />
                  <span className="pulse-ring absolute inset-0 rounded-full border border-danger" style={{ animationDelay: "0.5s" }} />
                </>
              )}
              <button
                onClick={p.onToggleRecord}
                className={`coaster relative w-40 h-40 sm:w-44 sm:h-44 rounded-full border-2 border-dashed ${
                  p.isRecording ? "border-[#ffb3a6]/60 coaster-rec" : "border-amber/50"
                } flex flex-col items-center justify-center gap-2 cursor-pointer`}
                aria-label={p.isRecording ? "Detener escucha" : "Empezar a escuchar"}
              >
                <span className="absolute inset-3 rounded-full border border-[rgba(255,220,160,0.25)]" />
                {p.isRecording ? (
                  <StopIcon className="w-9 h-9 text-[#ffe1d9]" />
                ) : (
                  <MicIcon className="w-9 h-9 text-[#ffe9bd]" />
                )}
                <span className="font-display text-[13px] tracking-wide text-[#ffe9bd] px-6 text-center leading-tight">
                  {p.isRecording ? "CORTAR" : "EMPEZAR LA RONDA"}
                </span>
              </button>
            </div>

            <div className="flex-1 w-full min-w-0">
              {/* onda */}
              <div className="flex items-end justify-between gap-[3px] h-16 mb-3" aria-hidden>
                {bars.map((b, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-sm ${p.isRecording ? "wave-bar bg-amber" : "wave-idle bg-[#4a3413]"}`}
                    style={{
                      height: `${b.h}px`,
                      animationDuration: `${b.d}s`,
                      animationDelay: `${b.delay}s`,
                      opacity: p.isRecording ? 0.5 + (b.h / 78) * 0.5 : 1,
                    }}
                  />
                ))}
              </div>
              <p className="font-mono-r text-xs text-mut leading-relaxed">
                {p.isRecording ? (
                  <span className="text-amber">
                    Escuchando la mesa… decí “una app que…” y dejá que fluya.
                  </span>
                ) : p.micError === "denied" ? (
                  <span className="text-haze">
                    El navegador no prestó el micrófono (permiso denegado). La servilleta de abajo salva la ronda.
                  </span>
                ) : p.supported ? (
                  "Tocá el botón y empezá a tirar ideas en voz alta. Chrome o Edge andan de diez."
                ) : (
                  <span className="text-haze">
                    Tu navegador no presta el micrófono (probá Chrome/Edge). La servilleta de abajo salva la noche.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* acciones de cierre */}
          <div className="mt-6 pt-5 border-t border-dashed border-[#3d2c12] flex flex-wrap gap-3">
            <button
              onClick={p.onFinish}
              disabled={!anyText}
              className={`btn-press flex items-center gap-2 px-5 py-3 font-display text-sm tracking-wide ${
                anyText
                  ? "bg-amber text-[#241503] shadow-[0_8px_24px_rgba(255,181,46,0.25)] hover:bg-[#ffc34e]"
                  : "bg-panel2 text-[#6b5630] cursor-not-allowed"
              }`}
            >
              <ReceiptIcon className="w-4.5 h-4.5" />
              CERRAR LA NOCHE Y PEDIR LA CUENTA
              <ArrowIcon className="w-4 h-4" />
            </button>
            <button
              onClick={p.onDemo}
              className="btn-press flex items-center gap-2 px-5 py-3 font-mono-r text-xs border border-[#4a3413] text-chalk/80 hover:text-foam hover:border-amber/50 bg-[#221809]"
            >
              <SparkIcon className="w-4 h-4 text-amber" />
              sin birras a mano → ronda demo
            </button>
          </div>
        </div>

        {/* fila inferior: jarra + servilleta */}
        <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-stretch">
          {/* jarra */}
          <div className="border border-[#3d2c12] bg-[#221809] p-5 flex flex-col items-center justify-between min-w-[220px]">
            <div className="flex items-center gap-2 self-start mb-2">
              <MugIcon className="w-4 h-4 text-amber" />
              <span className="font-mono-r text-[11px] tracking-[0.25em] text-mut uppercase">Birras de la noche</span>
            </div>
            <FilledMug fill={curda / 8} className="w-24 h-24 drop-shadow-[0_0_18px_rgba(245,166,35,0.25)]" />
            <div key={beerPop} className={beerPop ? "pop-in" : ""}>
              <div className="font-display text-4xl text-amber text-center leading-none mt-2 tabular-nums">{p.beers}</div>
              <div className="font-mono-r text-[11px] text-mut text-center mt-1">
                nivel de curda: <span className="text-haze">{CURDA_LABELS[curda]}</span>
              </div>
            </div>
            <button
              onClick={() => { p.onAddBeer(); setBeerPop((v) => v + 1); }}
              className="btn-press mt-4 w-full flex items-center justify-center gap-2 border border-amber/40 text-amber px-4 py-2.5 font-display text-xs tracking-widest hover:bg-amber/10 bg-[#241a0b]"
            >
              <PlusIcon className="w-4 h-4" /> PEDIR OTRA
            </button>
            <p className="font-mono-r text-[10px] text-[#6b5630] mt-3 leading-snug text-center">
              Cada birra sube el índice de fumada del análisis. Es ciencia.
            </p>
          </div>

          {/* servilleta */}
          <div className="border border-[#3d2c12] bg-[#221809] p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <NoteIcon className="w-4 h-4 text-amber" />
              <span className="font-mono-r text-[11px] tracking-[0.25em] text-mut uppercase">Servilleta de respaldo</span>
            </div>
            <p className="text-xs text-mut mb-3">
              ¿El micrófono no da más o la idea llegó en silencio? Anotala igual: entra al análisis.
            </p>
            <textarea
              value={napkin}
              onChange={(e) => setNapkin(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitNapkin();
              }}
              rows={3}
              placeholder="Ej: una app que avise cuándo está listo el asado…"
              className="flex-1 w-full bg-[#1b1207] border border-[#3d2c12] focus:border-amber/60 outline-none p-3 text-sm text-foam placeholder-[#6b5630] resize-none font-mono-r"
            />
            <button
              onClick={submitNapkin}
              disabled={!napkin.trim()}
              className={`btn-press mt-3 self-end flex items-center gap-2 px-4 py-2 font-mono-r text-xs ${
                napkin.trim()
                  ? "bg-panel2 text-amber border border-amber/40 hover:bg-[#382812]"
                  : "text-[#6b5630] border border-[#33240f] cursor-not-allowed"
              }`}
            >
              <NoteIcon className="w-3.5 h-3.5" /> anotar en la servilleta
            </button>
          </div>
        </div>
      </div>

      {/* ================= LA CINTA ================= */}
      <div className="lg:sticky lg:top-6 space-y-5">
        <div className="tear-edge-top tear-edge-bottom bg-panel px-5 sm:px-7 py-7 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="font-mono-r text-center">
            <div className="flex items-center justify-center gap-2 text-amber text-xs tracking-[0.35em]">
              <WaveIcon className="w-4 h-4" /> LA CINTA DE LA MESA <WaveIcon className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-mut mt-1">TICKET N° {String(1000 + p.round * 37)} · todo lo que se dice, queda</p>
            <div className="border-t border-dashed border-[#4a3413] my-4" />
          </div>

          <div ref={tapeRef} className="font-mono-r text-[13px] leading-relaxed h-[340px] sm:h-[430px] overflow-y-auto pr-2 space-y-2.5">
            {p.lines.length === 0 && !p.interim && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-[#6b5630]">
                <MicIcon className="w-8 h-8 opacity-50" />
                <p className="max-w-[220px]">Silencio de bar un martes.<br />Tocá el coaster y hablá.</p>
              </div>
            )}
            {p.lines.map((l, i) => (
              <p key={l.id} className={`slide-line ${i === p.lines.length - 1 ? "text-foam" : "text-chalk/70"}`}>
                {l.source === "servilleta" && (
                  <span className="text-haze bg-haze/10 border border-haze/30 px-1 mr-1.5 text-[10px] uppercase tracking-wider">servilleta</span>
                )}
                {l.text}
              </p>
            ))}
            {p.interim && (
              <p className="text-amber italic">
                {p.interim}
                <span className="caret inline-block w-2 h-4 bg-amber align-middle ml-1" />
              </p>
            )}
          </div>

          <div className="border-t border-dashed border-[#4a3413] mt-4 pt-3 grid grid-cols-3 gap-2 font-mono-r text-center">
            <div>
              <div className="text-xl text-foam tabular-nums">{p.wordCount}</div>
              <div className="text-[10px] text-mut uppercase tracking-widest">palabras</div>
            </div>
            <div>
              <div className="text-xl text-foam tabular-nums">{p.lines.length}</div>
              <div className="text-[10px] text-mut uppercase tracking-widest">frases</div>
            </div>
            <div>
              <div className="text-xl text-amber tabular-nums">{p.beers}</div>
              <div className="text-[10px] text-mut uppercase tracking-widest">birras</div>
            </div>
          </div>
        </div>

        {/* historial */}
        {p.history.length > 0 && (
          <div className="border border-[#3d2c12] bg-[#1e1508] p-4">
            <div className="flex items-center gap-2 mb-3">
              <ReceiptIcon className="w-4 h-4 text-amber" />
              <span className="font-mono-r text-[11px] tracking-[0.25em] text-mut uppercase">Otras noches</span>
            </div>
            <ul className="space-y-2">
              {p.history.slice(0, 4).map((h, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 text-xs font-mono-r">
                  <span className="text-chalk/75 truncate">“{h.topIdea}”</span>
                  <span className="text-mut shrink-0">{h.beers} <MugIcon className="w-3 h-3 inline -mt-0.5 text-amber" /> · {h.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
