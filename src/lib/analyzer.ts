/* ============================================================
   BeerStorming — motor de análisis de rondas
   NLP-lite de bar: segmenta la charla, detecta temas, puntúa
   viabilidad / rentabilidad / fumada y marca la legalidad.
   ============================================================ */

export type Legality = "legal" | "gris" | "ilegal";
export type Category = "joya" | "solida" | "fumada" | "ilegal";

export interface IdeaAnalysis {
  id: number;
  text: string;
  name: string;
  theme: string;
  viability: number;
  profitability: number;
  fumada: number;
  legality: Legality;
  illegalReasons: string[];
  category: Category;
  verdict: string;
  investment: string;
  effort: string;
  score: number;
  source: "voz" | "servilleta";
}

export interface SessionReport {
  id: string;
  ideas: IdeaAnalysis[];
  murmullos: number;
  stats: {
    words: number;
    ideasCount: number;
    beers: number;
    seconds: number;
    wordOfNight: string;
    wordOfNightCount: number;
    fumadasPerMinute: number;
  };
  bestPick: IdeaAnalysis | null;
  bestIllegal: IdeaAnalysis | null;
  bartender: string[];
}

/* ---------- utilidades ---------- */

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1 estable por texto
};

const clamp = (n: number, min = 4, max = 97) => Math.round(Math.max(min, Math.min(max, n)));
const countHits = (text: string, words: string[]) =>
  words.reduce((acc, w) => (text.includes(w) ? acc + 1 : acc), 0);

/* ---------- diccionarios ---------- */

const IDEA_MARKERS = [
  "app", "aplicacion", "plataforma", "web", "sistema", "servicio", "negocio",
  "emprend", "startup", "y si", "imaginate", "idea", "te digo", "hacer plata",
  "vender", "alquil", "marketplace", "suscripci", "automatiz", "creamos",
  "armamos", "hacemos una", "hacemos un", "lanzo", "lanzar", "uber de",
  "tinder de", "airbnb de", "proyecto", "sitio", "portal", "saas",
];

const VIABILITY_PLUS = [
  "turno", "reserva", "agenda", "delivery", "pago", "cobr", "factur", "stock",
  "inventario", "clase", "curso", "receta", "mapa", "cerca", "barrio",
  "kiosco", "farmacia", "veterinari", "peluquer", "gimnasio", "club",
  "consorcio", "expensa", "taxi", "remis", "comida", "menu", "pedido",
  "cliente", "pyme", "monotribut", "facil", "simple", "recordatorio",
  "historia clinica", "gestion", "calendario", "chat", "comunidad",
];

const IMPOSSIBLE = [
  "teletransport", "viajar en el tiempo", "leer la mente", "clonar",
  "inmortal", "hablar con los muertos", "energia libre", "gravedad",
  "marte", "dinosaurio", "controlar el clima", "telequinesis",
  "sueno de la gente", "detener el tiempo", "maquina del tiempo",
  "ovni", "alien", "zombie",
];

const PROFIT_PLUS = [
  "suscripci", "abono", "comision", "freemium", "premium", "publicidad",
  "sponsor", "auspici", "cripto", "crypto", "nft", "fintech", "seguro",
  "inversi", "inversor", "b2b", "empresa", "exportar", "dolar",
  "franquicia", "dato", "api", "white label", "e-commerce", "venta",
  "margen", "escal", "cobrar", "mensual", "anual", "por pedido",
];

const PROFIT_MINUS = [
  "gratis", "hobby", "joda", "para mis amigos", "sin cobrar", "regalo",
  "sin fines", "de onda",
];

const FUMADA_WORDS = [
  "literal", "en serio", "confia", "escuchame", "te juro", "posta",
  "hermano", "mira,", "no falla", "millonario", "millones", "billon",
  "cambiar el mundo", "disruptiv", "revolucionari", "unicornio", "viral",
  "todos van a", "nadie lo hizo", "cohete", "metaverso", "con ia hace todo",
  "ia que", "gpt pero", "traccion a sangre", "caballo",
];

const EMPHASIS = ["escuchame", "te juro", "confia", "posta", "literal", "en serio", "hermano", "boludo"];

interface IllegalRule {
  words: string[];
  reason: string;
  level: "ilegal" | "gris";
}
const ILLEGAL_RULES: IllegalRule[] = [
  { words: ["droga", "cocaina", "merca", "extasis", "lsd", "pastilla"], reason: "narcoemprendimiento", level: "ilegal" },
  { words: ["marihuana", "cannabis", "porro", "cultivo de"], reason: "cannabis (zona gris, depende del código penal y del juez)", level: "gris" },
  { words: ["evadir", "evasion", "sin factura", "en negro", "no declarar", "sin declarar"], reason: "evasión impositiva", level: "ilegal" },
  { words: ["trucha", "truchos", "falsific", "replica", "copia de marca", "pirata", "pirateria"], reason: "falsificación / piratería", level: "ilegal" },
  { words: ["clonar tarjeta", "tarjeta clonada", "clonar las", "hackear", "hackeo", "robar dato", "robar wifi", "clave de otro"], reason: "delito informático", level: "ilegal" },
  { words: ["clandestin", "casino trucho", "juego clandestino"], reason: "juego clandestino", level: "ilegal" },
  { words: ["contrabando", "pasar por la frontera"], reason: "contrabando", level: "ilegal" },
  { words: ["estafa", "ponzi", "piramidal", "esquema piramidal"], reason: "fraude / esquema piramidal", level: "ilegal" },
  { words: ["lavado de dinero", "lavar plata", "cuenta afuera"], reason: "lavado de activos", level: "ilegal" },
  { words: ["arma", "armas"], reason: "venta de armas", level: "ilegal" },
  { words: ["sin registro", "sin habilitacion", "sin autorizacion", "sin patente"], reason: "sin habilitación (ANMAT / CNV mirarían de reojo)", level: "gris" },
  { words: ["soborno", "coima"], reason: "soborno", level: "ilegal" },
  { words: ["organo", "organos"], reason: "tráfico de órganos (ni en joda)", level: "ilegal" },
  { words: ["vender remedios", "medicamento sin receta"], reason: "medicamentos sin registro", level: "gris" },
];

const THEMES: [string, string[]][] = [
  ["Crypto & tokens", ["cripto", "crypto", "nft", "token", "bitcoin", "blockchain", "coin"]],
  ["Fintech", ["pago", "cobro", "cobrar", "billetera", "fintech", "prestamo", "inversi", "plata"]],
  ["Delivery & logística", ["delivery", "reparto", "mandado", "envio", "repartidor"]],
  ["Gastronomía", ["comida", "restaurante", "menu", "receta", "birra", "bar", "pizzer", "hamburgue", "asado", "cocina"]],
  ["Dating & sociales", ["cita", "dating", "match", "soltero", "levante", "tinder"]],
  ["Mascotas", ["perro", "gato", "mascota", "veterinari", "paseo"]],
  ["Inteligencia artificial", ["ia ", " ia", "inteligencia artificial", "gpt", "chatbot", "bot de", "algoritmo"]],
  ["Salud & bienestar", ["salud", "medico", "doctor", "terapia", "gimnasio", "clinica", "resaca"]],
  ["Educación", ["curso", "clase", "escuela", "aprender", "universidad", "facultad", "apuntes"]],
  ["Transporte", ["viaje", "taxi", "remis", "uber", "colectivo", "transporte", "subte"]],
  ["Apuestas & azar", ["apuesta", "casino", "quiniela", "poker", "loteria"]],
  ["Real estate", ["alquiler", "depto", "inmueble", "expensa", "propiedad"]],
  ["Agro & campo", ["campo", "soja", "ganado", "cosecha", "siembra"]],
  ["Música & eventos", ["musica", "banda", "recital", "streaming", "entrada"]],
  ["Moda & streetwear", ["ropa", "moda", "zapatilla", "sneaker", "remera"]],
];

const NAME_SUFFIX = ["Ya", "Go", "24", "Plus", "App", "Hub", "fy", "Club", ".ar", "Bro"];

const STOPWORDS = new Set(
  ("de la que el en y a los se del las un por con no una su para es al lo como mas pero sus le ya o este si porque esta entre cuando muy sin sobre tambien me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mi antes algunos unos yo otro otras otra tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros tu te ti tus ellas os esos esas estoy sera ser son fue han hay tiene pueden vamos voy eso eso").split(/\s+/)
);

/* ---------- extracción ---------- */

function splitFragments(transcript: string): { text: string; source: "voz" | "servilleta" }[] {
  const pieces: { text: string; source: "voz" | "servilleta" }[] = [];
  const lines = transcript.split(/\n+/);
  for (const line of lines) {
    const isNapkin = line.trim().startsWith("[servilleta]");
    const clean = line.replace(/^\[servilleta\]\s*/, "").trim();
    if (!clean) continue;
    const source = isNapkin ? ("servilleta" as const) : ("voz" as const);
    if (isNapkin) {
      pieces.push({ text: clean, source });
      continue;
    }
    const parts = clean
      .split(/(?<=[.!?])\s+/)
      .map((p) => p.trim())
      .filter(Boolean);
    // unir fragmentos cortos al anterior para no perder ideas a medio decir
    for (const p of parts) {
      const last = pieces[pieces.length - 1];
      if (last && last.source === "voz" && p.length < 42 && last.text.length < 260) {
        last.text += " " + p;
      } else {
        pieces.push({ text: p, source });
      }
    }
  }
  return pieces.filter((p) => p.text.length >= 18);
}

/* ---------- scoring ---------- */

function buildName(theme: string, text: string): string {
  const n = hash(text);
  if (theme === "Variedades del bar") {
    const words = norm(text).split(/[^a-z0-9]+/).filter((w) => w.length > 4 && !STOPWORDS.has(w));
    const pick = words.length ? words[Math.floor(n * words.length)] : "birra";
    const cap = pick.charAt(0).toUpperCase() + pick.slice(1);
    return `${cap}${NAME_SUFFIX[Math.floor(n * NAME_SUFFIX.length)]}`;
  }
  const stem = theme.split(" ")[0].replace(/[^a-zA-Z]/g, "");
  const cap = stem.charAt(0).toUpperCase() + stem.slice(1);
  return `${cap}${NAME_SUFFIX[Math.floor(n * NAME_SUFFIX.length)]}`;
}

function detectTheme(t: string): string {
  for (const [name, words] of THEMES) {
    if (words.some((w) => t.includes(w))) return name;
  }
  return "Variedades del bar";
}

function analyzeIdea(text: string, source: "voz" | "servilleta", beers: number, id: number): IdeaAnalysis {
  const t = norm(text);
  const jit = hash(t);

  const viability = clamp(
    52 +
      countHits(t, VIABILITY_PLUS) * 9 -
      countHits(t, IMPOSSIBLE) * 22 -
      beers * 2.5 +
      (jit - 0.5) * 12 +
      (source === "servilleta" ? 6 : 0)
  );

  const profitability = clamp(
    34 +
      countHits(t, PROFIT_PLUS) * 11 -
      countHits(t, PROFIT_MINUS) * 18 +
      (t.includes("comision") || t.includes("suscripci") || t.includes("abono") ? 8 : 0) +
      (hash(t + "p") - 0.5) * 14
  );

  const emphasisHits = EMPHASIS.reduce((a, w) => (t.includes(w) ? a + 1 : a), 0);
  const fumada = clamp(
    10 +
      beers * 8 +
      countHits(t, FUMADA_WORDS) * 13 +
      countHits(t, IMPOSSIBLE) * 24 +
      emphasisHits * 5 +
      (t.length > 220 ? 8 : 0) +
      jit * 8,
    3,
    98
  );

  const illegalReasons: string[] = [];
  let legality: Legality = "legal";
  for (const rule of ILLEGAL_RULES) {
    if (rule.words.some((w) => t.includes(w))) {
      illegalReasons.push(rule.reason);
      if (rule.level === "ilegal") legality = "ilegal";
      else if (legality !== "ilegal") legality = "gris";
    }
  }

  const theme = detectTheme(t);

  let category: Category;
  if (legality !== "legal") category = "ilegal";
  else if (fumada >= 62 || viability <= 24) category = "fumada";
  else if (viability >= 58 && profitability >= 52) category = "joya";
  else category = "solida";

  const score =
    viability * 0.4 + profitability * 0.4 + (100 - fumada) * 0.2 - (legality === "ilegal" ? 18 : legality === "gris" ? 8 : 0);

  const verdicts: Record<Category, string[]> = {
    joya: [
      "El barman serviría esta idea en vaso de vidrio: tiene futuro real.",
      "Se podría estar facturando en 60 días. Alguien que programe, por favor.",
      "Modelo de negocio claro. La birra no la arruinó, la afinó.",
    ],
    solida: [
      "Camina. Le falta una pizca de foco y un desarrollador sobrio.",
      "Idea noble. Con dos iteraciones pasa de 'y si…' a 'mirá cómo anda'.",
      "Aceptable. El barman asiente sin demasiado entusiasmo, pero asiente.",
    ],
    fumada: [
      "Hermosa. Imposible. Enmarcala al lado de la barra.",
      "Física, economía y buen gusto dicen que no. La madrugada dice que sí.",
      "Nivel de fumada crítico: imprimir y colgar en la heladera.",
    ],
    ilegal: [
      "Rentable hasta que golpea la puerta la gente de traje. No la descartamos: la anotamos en rojo.",
      "El plan existe, el riesgo también. Consultar abogado antes de registrar dominio.",
      "Brillante y penada por el código penal. El barman guarda el ticket como evidencia.",
    ],
  };

  const effortWeeks = Math.max(1, Math.round((100 - viability) / 9));
  const investments = [
    "2 birras y un dominio de 10 dólares",
    "Un finde y medio de código + yerba",
    "Fe, una notebook y un cuñado disponible",
    "Capital semilla: la vuelta de fernet que sobró",
  ];

  return {
    id,
    text: text.replace(/\s+/g, " ").trim(),
    name: buildName(theme, t),
    theme,
    viability,
    profitability,
    fumada,
    legality,
    illegalReasons: [...new Set(illegalReasons)],
    category,
    verdict: verdicts[category][Math.floor(jit * 3) % 3],
    investment: investments[Math.floor(hash(t + "i") * investments.length)],
    effort: `${effortWeeks} finde${effortWeeks > 1 ? "s" : ""} de developer`,
    score: Math.round(score * 10) / 10,
    source,
  };
}

/* ---------- informe completo ---------- */

export function analyzeSession(transcript: string, beers: number, seconds: number): SessionReport {
  const fragments = splitFragments(transcript);
  const allWords = norm(transcript).split(/[^a-z0-9áéíóúñü]+/).filter(Boolean);

  // candidatas: las que huelen a idea
  const candidates = fragments
    .map((f) => ({ f, n: norm(f.text), marker: countHits(norm(f.text), IDEA_MARKERS) }))
    .map((c) => ({ ...c, weight: c.marker * 3 + Math.min(c.n.length / 40, 4) + hash(c.n) * 2 }))
    .filter((c) => c.marker > 0 || c.n.length >= 70)
    .sort((a, b) => b.weight - a.weight);

  const picked = (candidates.length ? candidates : fragments.map((f) => ({ f, n: norm(f.text), marker: 0, weight: 1 })))
    .slice(0, 8)
    .map((c, i) => analyzeIdea(c.f.text, c.f.source, beers, i + 1));

  const murmullos = Math.max(0, fragments.length - picked.length);

  const ranked = [...picked].sort((a, b) => b.score - a.score);
  const legalPool = ranked.filter((i) => i.legality === "legal");
  const bestPick = legalPool[0] ?? ranked[0] ?? null;
  const illegalPool = ranked.filter((i) => i.legality !== "legal").sort((a, b) => b.profitability - a.profitability);
  const bestIllegal = illegalPool[0] ?? null;

  // palabra de la noche
  const freq = new Map<string, number>();
  for (const w of allWords) {
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  let wordOfNight = "birra";
  let wordOfNightCount = 0;
  for (const [w, c] of freq) {
    if (c > wordOfNightCount) {
      wordOfNight = w;
      wordOfNightCount = c;
    }
  }

  const fumadas = picked.filter((i) => i.category === "fumada").length;
  const ilegales = picked.filter((i) => i.category === "ilegal").length;
  const minutes = Math.max(seconds / 60, 1);

  const stats = {
    words: allWords.length,
    ideasCount: picked.length,
    beers,
    seconds,
    wordOfNight,
    wordOfNightCount,
    fumadasPerMinute: Math.round((fumadas / minutes) * 10) / 10,
  };

  const bartender: string[] = [];
  if (beers === 0) bartender.push("Cero birras registradas y así y todo salieron estas ideas. Imaginate con dos.");
  else if (beers <= 2) bartender.push(`Con ${beers} birra${beers > 1 ? "s" : ""} el promedio es aceptable. El barman cree que con una más aparece el unicornio.`);
  else if (beers <= 4) bartender.push(`${beers} birras: el punto justo. Lo suficientemente sueltos para imaginar, lo suficientemente lúcidos para tipear.`);
  else bartender.push(`Después de la quinta birra ya no se entiende bien el pitch, pero la pasión es innegable. Se respeta.`);

  if (bestPick) {
    if (bestPick.category === "joya")
      bartender.push(`«${bestPick.name}» se puede armar en ${bestPick.effort}. El único riesgo es el lunes a la mañana.`);
    else if (bestPick.category === "fumada")
      bartender.push(`La mejor idea de la noche es una fumada de proporciones épicas. Como corresponde.`);
    else bartender.push(`«${bestPick.name}» es lo más sólido que se escuchó. Que alguien anote el dominio antes de que se enfríe.`);
  }
  if (bestIllegal)
    bartender.push(
      `El plan B (${bestIllegal.name}) necesita un estudio jurídico, no un desarrollador. Igualmente quedó en la cuenta: acá no se descarta nada.`
    );
  if (wordOfNightCount >= 2) bartender.push(`Se dijo «${wordOfNight}» ${wordOfNightCount} veces. Preocupante, pero revelador.`);
  bartender.push(
    `${fumadas} fumada${fumadas !== 1 ? "s" : ""} y ${ilegales} plan${ilegales !== 1 ? "es" : ""} al límite de la ley sobre ${picked.length} idea${picked.length !== 1 ? "s" : ""}. Promedio de una buena noche.`
  );

  return {
    id: Math.random().toString(36).slice(2, 7).toUpperCase(),
    ideas: ranked,
    murmullos,
    stats,
    bestPick,
    bestIllegal,
    bartender,
  };
}

/* ---------- resumen copiable ---------- */

export function buildSummary(r: SessionReport): string {
  const fmt = (s: number) => `${Math.floor(s / 60)}m ${String(Math.floor(s % 60)).padStart(2, "0")}s`;
  const cat = (c: Category) =>
    c === "joya" ? "JOYA DE LA NOCHE" : c === "solida" ? "SÓLIDA" : c === "fumada" ? "PURA FUMADA" : "LEGALIDAD DUDOSA";
  const lines: string[] = [
    "BEERSTORMING — LA CUENTA",
    `Mesa #${r.id} · ${fmt(r.stats.seconds)} · ${r.stats.beers} birra(s) · ${r.stats.words} palabras · palabra de la noche: "${r.stats.wordOfNight}"`,
    "----------------------------------------",
  ];
  r.ideas.forEach((i, idx) => {
    lines.push(
      `${idx + 1}. ${i.name} [${cat(i.category)}] · ${i.theme}`,
      `   "${i.text}"`,
      `   Viabilidad ${i.viability}% · Rentabilidad ${i.profitability}% · Fumada ${i.fumada}%` +
        (i.legality !== "legal" ? ` · OJO: ${i.illegalReasons.join(", ")}` : ""),
      ""
    );
  });
  lines.push("Veredicto del barman:", ...r.bartender.map((b) => ` - ${b}`));
  lines.push("----------------------------------------", "Ninguna idea fue ejecutada durante la grabación.");
  return lines.join("\n");
}

/* ---------- ronda demo ---------- */

export const DEMO_TRANSCRIPT = `Escuchame, una app que te reserve el turno en la peluquería del barrio, con recordatorios y todo, y les cobramos una suscripción mensual a los locales, es facilísimo, nadie lo hizo bien todavía.
Y si hacemos un Uber pero de caballos, tipo delivery a tracción a sangre, cero emisiones, ecológico posta, los caballos van trotando por el barrio, literal no falla.
Te digo una plataforma para vender apuntes truchos de la facultad, todo sin factura, en negro, y la plata va a una cuenta afuera, te juro que es un negocio redondo.
Imaginate un marketplace de comida casera, las abuelas del barrio cocinan y reparten, cobramos comisión del quince por ciento por pedido, con abono premium para los que quieren delivery todos los días.
Una criptomoneda que sube solamente cuando llueve, la RainCoin, con NFT de paraguas, vamos a ser millonarios hermano, te juro que no falla, todos van a comprar.
Una app para pasear perros con seguimiento GPS y abono semanal, los dueños pagan premium por recibir fotos del paseo, la veterinaria del barrio puede ser sponsor.
Y si hackeamos las maquinitas del subte para viajar gratis y vendemos el truco por Telegram.
Un Tinder pero para encontrar compañeros de asado, match por gusto de carne, obvio, con suscripción para los que quieren asador a domicilio.
Vender remedios para la resaca sin registro, directamente en la puerta de los boliches, sin habilitación de nada, plata en efectivo.
Una plataforma de turnos para veterinarias con historia clínica compartida entre clínicas, pagan un abono mensual por local, con recordatorios de vacunas.`;
