import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SessionView, { type HistoryEntry, type TranscriptLine } from "./components/SessionView";
import ResultsView from "./components/ResultsView";
import { analyzeSession, DEMO_TRANSCRIPT, type SessionReport } from "./lib/analyzer";
import { useSpeech } from "./lib/useSpeech";
import { MugIcon } from "./components/icons";

type Phase = "session" | "results";

const TICKER = [
  "«Escuchame, es un Uber pero de…»",
  "«Con una app lo solucionás»",
  "«Te juro que no falla»",
  "«Mi cuñado lo arma en un finde»",
  "«Esto vale millones, hermano»",
  "«Anotalo en la servilleta»",
  "«¿Y si le metemos IA?»",
  "«La birra no miente»",
];

const HISTORY_KEY = "beerstorming-history";

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("session");
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [beers, setBeers] = useState(0);
  const [round, setRound] = useState(1);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const lineId = useRef(0);

  const pushToast = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const addLine = useCallback((text: string, source: "voz" | "servilleta") => {
    lineId.current += 1;
    setLines((prev) => [...prev, { id: lineId.current, text: text.trim(), source }]);
  }, []);

  const speech = useSpeech((chunk) => addLine(chunk, "voz"));

  // reloj de la mesa
  useEffect(() => {
    if (phase !== "session") return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  const buildTranscript = useCallback(
    (ls: TranscriptLine[]) =>
      ls.map((l) => (l.source === "servilleta" ? `[servilleta] ${l.text}` : l.text)).join("\n"),
    []
  );

  const closeNight = useCallback(
    (ls: TranscriptLine[], finalBeers: number, finalSeconds: number) => {
      speech.stop();
      const rep = analyzeSession(buildTranscript(ls), finalBeers, finalSeconds);
      setReport(rep);
      setPhase("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
      const entry: HistoryEntry = {
        date: new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
        beers: finalBeers,
        topIdea: rep.bestPick?.name ?? rep.ideas[0]?.name ?? "mesa silenciosa",
        ideas: rep.stats.ideasCount,
      };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 8);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {
          /* sin memoria, sin drama */
        }
        return next;
      });
    },
    [speech, buildTranscript]
  );

  const handleFinish = () => {
    if (lines.length === 0) return;
    closeNight(lines, beers, seconds);
  };

  const handleDemo = () => {
    speech.stop();
    const demoLines: TranscriptLine[] = DEMO_TRANSCRIPT.split("\n").map((text, i) => ({
      id: ++lineId.current + i,
      text,
      source: "voz" as const,
    }));
    setLines(demoLines);
    setBeers(4);
    closeNight(demoLines, 4, 22 * 60 + 47);
  };

  const handleNewRound = () => {
    setLines([]);
    setSeconds(0);
    setBeers(0);
    setReport(null);
    setRound((r) => r + 1);
    setPhase("session");
    window.scrollTo({ top: 0, behavior: "smooth" });
    pushToast("Mesa limpia, jarras frías. Dale nomás.");
  };

  const wordCount = useMemo(
    () => lines.join(" ").split(/\s+/).filter(Boolean).length,
    [lines]
  );

  const bubbles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: (i * 53) % 100,
        size: 5 + ((i * 29) % 14),
        dur: 10 + ((i * 17) % 12),
        delay: (i * 31) % 14,
        bx: ((i % 2 ? 1 : -1) * (10 + ((i * 7) % 26))).toString() + "px",
        bo: (0.25 + ((i * 11) % 40) / 100).toFixed(2),
      })),
    []
  );

  return (
    <div className="bar-bg min-h-screen relative">
      {/* fondo vivo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              ["--bx" as never]: b.bx,
              ["--bo" as never]: b.bo,
            }}
          />
        ))}
      </div>
      <div className="noise-layer" />

      {/* ticker de frases de bar */}
      <div className="relative z-10 border-b border-amber/20 bg-[#1c1207] overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap w-max">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex">
              {TICKER.map((t, i) => (
                <span key={i} className="font-mono-r text-[11px] text-amber/70 px-6 py-1.5 flex items-center gap-6">
                  {t} <span className="text-amber/30">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* header: el cartel */}
      <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <MugIcon className="w-7 h-7 text-amber drop-shadow-[0_0_10px_rgba(255,181,46,0.6)]" />
            <h1 className="neon-sign font-display text-3xl sm:text-5xl tracking-wide leading-none">BEERSTORMING</h1>
          </div>
          <p className="font-mono-r text-xs sm:text-sm text-chalk/70 mt-2.5 max-w-xl leading-relaxed">
            La app que hace apps mientras tomás cervezas: escucha los planes locos de la mesa y al cierre te presenta{" "}
            <span className="text-amber">la cuenta</span> — viabilidad, rentabilidad, fumadas épicas y planes ilegales{" "}
            <span className="text-haze">(anotados, no descartados)</span>.
          </p>
        </div>
        <div className="flex items-center gap-2.5 border border-[#3d2c12] bg-[#1e1508] px-4 py-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${speech.isRecording ? "bg-danger led" : "bg-mint"}`} />
          <span className="font-mono-r text-[11px] uppercase tracking-[0.2em] text-mut">
            {phase === "session" ? (speech.isRecording ? "mesa en vivo" : "mesa abierta") : "cuenta servida"}
          </span>
        </div>
      </header>

      {/* contenido */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {phase === "session" ? (
          <SessionView
            isRecording={speech.isRecording}
            supported={speech.supported}
            micError={speech.error}
            interim={speech.interim}
            lines={lines}
            seconds={seconds}
            beers={beers}
            round={round}
            history={history}
            wordCount={wordCount}
            onToggleRecord={() => (speech.isRecording ? speech.stop() : speech.start())}
            onAddBeer={() => setBeers((b) => b + 1)}
            onNapkin={(t) => addLine(t, "servilleta")}
            onFinish={handleFinish}
            onDemo={handleDemo}
          />
        ) : report ? (
          <ResultsView report={report} onNewRound={handleNewRound} toast={pushToast} />
        ) : null}
      </main>

      {/* footer */}
      <footer className="relative z-10 border-t border-[#3d2c12] bg-[#160e06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-3 flex-wrap">
          <p className="font-mono-r text-[11px] text-mut">
            Ninguna idea fue ejecutada durante la grabación. El barman no se hace responsable por dominios comprados a las 3 AM.
          </p>
          <p className="font-mono-r text-[11px] text-mut flex items-center gap-1.5">
            hecho con <MugIcon className="w-3.5 h-3.5 text-amber" /> y dudas legales
          </p>
        </div>
      </footer>

      {/* toast */}
      {toast && (
        <div key={toast.id} className="toast-in fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-amber text-[#241503] px-5 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)] font-mono-r text-sm max-w-[90vw]">
          <MugIcon className="w-4 h-4" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
