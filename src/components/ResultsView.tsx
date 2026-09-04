import { useEffect, useState } from "react";
import type { IdeaAnalysis, SessionReport } from "../lib/analyzer";
import { buildSummary } from "../lib/analyzer";
import {
  CrownIcon, GavelIcon, GhostIcon, ScaleIcon, MugIcon, ReceiptIcon,
  CopyIcon, CheckIcon, FlameIcon, CoinIcon, SparkIcon, ArrowIcon, AlertIcon,
} from "./icons";

interface Props {
  report: SessionReport;
  onNewRound: () => void;
  toast: (msg: string) => void;
}

const fmt = (s: number) => `${Math.floor(s / 60)}m ${String(Math.floor(s % 60)).padStart(2, "0")}s`;

/* ---------- gauge con llenado líquido ---------- */
function Gauge({ label, value, color, icon }: { label: string; value: number; color: string; icon?: React.ReactNode }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setW(value), 120);
    return () => window.clearTimeout(t);
  }, [value]);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5 font-mono-r text-[10px] uppercase tracking-[0.18em] text-mut">
          {icon}
          {label}
        </span>
        <span className="font-mono-r text-xs tabular-nums" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 bg-[#171008] border border-[#3d2c12] overflow-hidden">
        <div
          className="gauge-fill h-full relative overflow-hidden"
          style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        >
          <span className="gauge-shine absolute inset-0" />
        </div>
      </div>
    </div>
  );
}

/* ---------- badge por categoría ---------- */
const BADGE: Record<IdeaAnalysis["category"], { label: string; cls: string; Icon: (p: { className?: string }) => JSX.Element }> = {
  joya: { label: "PARA HACER YA", cls: "bg-amber text-[#241503]", Icon: CrownIcon },
  solida: { label: "SÓLIDA · CAMINA", cls: "bg-mint/90 text-[#12230a]", Icon: ScaleIcon },
  fumada: { label: "PURA FUMADA", cls: "bg-haze text-[#2a1503]", Icon: GhostIcon },
  ilegal: { label: "LEGALIDAD DUDOSA", cls: "bg-danger text-[#2b0a04]", Icon: GavelIcon },
};

/* ---------- tarjeta de idea ---------- */
function IdeaCard({ idea, featured = false, delay = 0 }: { idea: IdeaAnalysis; featured?: boolean; delay?: number }) {
  const b = BADGE[idea.category];
  const illegal = idea.legality !== "legal";
  return (
    <article
      className={`idea-card fade-up relative border ${illegal ? "border-danger/50" : "border-[#4a3413]"} ${
        featured ? "bg-[linear-gradient(150deg,#2c1f0c,#221607)] p-6 sm:p-7" : "bg-[#221809] p-5"
      } ${illegal ? "danger-stripes" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-display text-foam ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}>{idea.name}™</h3>
            {idea.source === "servilleta" && (
              <span className="font-mono-r text-[9px] uppercase tracking-widest text-haze border border-haze/40 px-1.5 py-0.5">servilleta</span>
            )}
          </div>
          <p className="font-mono-r text-[10px] uppercase tracking-[0.22em] text-mut mt-1">{idea.theme}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-1.5 font-display text-[10px] tracking-wider ${b.cls}`}>
          <b.Icon className="w-3.5 h-3.5" /> {b.label}
        </span>
      </div>

      <blockquote className={`mt-4 font-mono-r italic leading-relaxed ${featured ? "text-[15px] text-chalk" : "text-[13px] text-chalk/85"}`}>
        “{idea.text}”
      </blockquote>

      {illegal && (
        <div className="mt-4 flex items-start gap-2.5 border border-danger/40 bg-danger/10 px-3 py-2.5">
          <AlertIcon className="w-4 h-4 text-danger mt-0.5" />
          <p className="text-xs leading-relaxed text-[#ffc9c0]">
            <span className="font-bold text-danger uppercase tracking-wider font-mono-r text-[10px]">Ojo al piojo:</span>{" "}
            {idea.illegalReasons.join(" · ")}. <span className="text-chalk/70">No la descartamos — queda en la cuenta—, pero hablalo con alguien que tenga matrícula, no con el barman.</span>
          </p>
        </div>
      )}

      <div className={`grid gap-3 mt-5 ${featured ? "sm:grid-cols-3" : ""}`}>
        <Gauge label="Viabilidad" value={idea.viability} color="#8fd064" icon={<ScaleIcon className="w-3 h-3" />} />
        <Gauge label="Rentabilidad" value={idea.profitability} color="#ffb52e" icon={<CoinIcon className="w-3 h-3" />} />
        <Gauge label="Índ. de fumada" value={idea.fumada} color="#ff9d47" icon={<FlameIcon className="w-3 h-3" />} />
      </div>

      <div className="mt-4 pt-3 border-t border-dashed border-[#3d2c12] flex flex-wrap gap-x-5 gap-y-1 font-mono-r text-[11px] text-mut">
        <span>Inversión inicial: <span className="text-chalk/80">{idea.investment}</span></span>
        <span>Esfuerzo: <span className="text-chalk/80">{idea.effort}</span></span>
      </div>
      <p className="mt-2 text-[13px] text-chalk/70 leading-relaxed flex gap-2">
        <MugIcon className="w-4 h-4 text-amber mt-0.5" />
        {idea.verdict}
      </p>
    </article>
  );
}

/* ---------- vista completa ---------- */
export default function ResultsView({ report, onNewRound, toast }: Props) {
  const [copied, setCopied] = useState(false);
  const r = report;
  const rest = r.ideas.filter((i) => i !== r.bestPick && i !== r.bestIllegal);

  const copy = async () => {
    const text = buildSummary(r);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    toast("La cuenta quedó copiada. El barman asiente.");
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="space-y-8 fade-up">
      {/* ---------- ticket de stats ---------- */}
      <div className="tear-edge-top bg-panel px-5 sm:px-8 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-mono-r text-[11px] tracking-[0.35em] text-mut uppercase">Mesa #{r.id} · cierre de la noche</p>
            <h2 className="font-display text-3xl sm:text-5xl text-foam mt-1">
              LA <span className="text-amber">CUENTA</span>
            </h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={copy}
              className="btn-press flex items-center gap-2 px-4 py-2.5 bg-amber text-[#241503] font-display text-xs tracking-wide"
            >
              {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
              {copied ? "¡COPIADA!" : "COPIAR LA CUENTA"}
            </button>
            <button
              onClick={onNewRound}
              className="btn-press flex items-center gap-2 px-4 py-2.5 border border-amber/40 text-amber font-display text-xs tracking-wide hover:bg-amber/10"
            >
              <MugIcon className="w-4 h-4" /> NUEVA RONDA
            </button>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[#3d2c12] border border-[#3d2c12]">
          {[
            { k: "duración", v: fmt(r.stats.seconds) },
            { k: "palabras dichas", v: String(r.stats.words) },
            { k: "birras", v: String(r.stats.beers) },
            { k: "ideas al pizarrón", v: String(r.stats.ideasCount) },
            { k: "fumadas/min", v: String(r.stats.fumadasPerMinute) },
            { k: "palabra de la noche", v: `“${r.stats.wordOfNight}”` },
          ].map((s) => (
            <div key={s.k} className="bg-panel px-4 py-4 text-center hover:bg-[#2a1e0d] transition-colors">
              <div className="font-display text-xl sm:text-2xl text-amber truncate">{s.v}</div>
              <div className="font-mono-r text-[10px] uppercase tracking-[0.18em] text-mut mt-1">{s.k}</div>
            </div>
          ))}
        </div>
        {r.murmullos > 0 && (
          <p className="font-mono-r text-[11px] text-mut mt-3">
            + {r.murmullos} murmullo{r.murmullos !== 1 ? "s" : ""} inentendible{r.murmullos !== 1 ? "s" : ""} quedaron fuera del pizarrón. Cosas del hielo en el vaso.
          </p>
        )}
      </div>

      {/* ---------- la joya ---------- */}
      {r.bestPick && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <CrownIcon className="w-5 h-5 text-amber" />
            <h3 className="font-display text-xl text-foam tracking-wide">LA JOYA DE LA NOCHE</h3>
            <span className="flex-1 border-t border-dashed border-[#4a3413]" />
            <span className="font-mono-r text-[10px] text-mut uppercase tracking-widest">score {r.bestPick.score}</span>
          </div>
          <IdeaCard idea={r.bestPick} featured />
        </section>
      )}

      {/* ---------- el plan B ---------- */}
      {r.bestIllegal && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <GavelIcon className="w-5 h-5 text-danger" />
            <h3 className="font-display text-lg sm:text-xl text-foam tracking-wide">EL PLAN B — NO DESCARTADO, ANOTADO EN ROJO</h3>
            <span className="flex-1 border-t border-dashed border-[#4a3413]" />
            <span className="font-mono-r text-[10px] text-mut uppercase tracking-widest">rentabilidad {r.bestIllegal.profitability}%</span>
          </div>
          <IdeaCard idea={r.bestIllegal} delay={80} />
        </section>
      )}

      {/* ---------- el resto ---------- */}
      {rest.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <SparkIcon className="w-5 h-5 text-amber" />
            <h3 className="font-display text-xl text-foam tracking-wide">EL RESTO DEL PIZARRÓN</h3>
            <span className="flex-1 border-t border-dashed border-[#4a3413]" />
            <span className="font-mono-r text-[10px] text-mut uppercase tracking-widest">{rest.length} idea{rest.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {rest.map((idea, i) => (
              <IdeaCard key={idea.id} idea={idea} delay={120 + i * 70} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- veredicto del barman ---------- */}
      <section className="border-[1.5px] dashed border-chalk/30 bg-[#1c1309] px-6 sm:px-8 py-7 fade-up" style={{ animationDelay: "250ms" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <MugIcon className="w-5 h-5 text-amber" />
          <h3 className="font-display text-xl text-foam tracking-wide">VEREDICTO DEL BARMAN</h3>
        </div>
        <ul className="space-y-2.5">
          {r.bartender.map((line, i) => (
            <li key={i} className="flex gap-3 items-start text-[15px] leading-relaxed text-chalk/85 slide-line" style={{ animationDelay: `${300 + i * 120}ms` }}>
              <span className="text-amber font-mono-r mt-0.5">—</span>
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t border-dashed border-[#3d2c12] flex items-center justify-between flex-wrap gap-3">
          <p className="font-mono-r text-[11px] text-mut">Gracias por su visita. Vuelvan mañana, que las ideas maduran con la resaca.</p>
          <button
            onClick={onNewRound}
            className="btn-press flex items-center gap-2 text-amber font-mono-r text-xs hover:text-foam"
          >
            otra ronda <ArrowIcon className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
