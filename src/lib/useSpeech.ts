import { useCallback, useEffect, useRef, useState } from "react";

export interface SpeechApi {
  supported: boolean;
  isRecording: boolean;
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/**
 * Escucha continua en español con la Web Speech API.
 * Devuelve fragmentos finales por callback y mantiene el texto interino visible.
 */
export function useSpeech(onFinalChunk: (chunk: string) => void): SpeechApi {
  const [supported] = useState<boolean>(() => {
    const w = window as unknown as Record<string, unknown>;
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  });
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<null | {
    start: () => void;
    stop: () => void;
    abort?: () => void;
  }>(null);
  const shouldListen = useRef(false);
  const onChunk = useRef(onFinalChunk);
  onChunk.current = onFinalChunk;

  const create = useCallback(() => {
    const w = window as unknown as Record<string, new () => SpeechRecognitionLike>;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = "es-AR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: SpeechResultEvent) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      setInterim(interimText);
      const clean = finalText.trim();
      if (clean) onChunk.current(clean + ". ");
    };
    rec.onend = () => {
      setInterim("");
      // los navegadores cortan tras silencios: reiniciamos si seguimos en ronda
      if (shouldListen.current) {
        window.setTimeout(() => {
          if (shouldListen.current) {
            try {
              rec.start();
            } catch {
              /* ya estaba corriendo */
            }
          }
        }, 250);
      }
    };
    rec.onerror = (e: { error?: string }) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        shouldListen.current = false;
        setIsRecording(false);
        setError("denied");
      }
    };
    return rec;
  }, []);

  const start = useCallback(() => {
    if (!supported) return;
    if (isRecording) return;
    setError(null);
    let rec: SpeechRecognitionLike | null = recRef.current as SpeechRecognitionLike | null;
    if (!rec) {
      rec = create();
      recRef.current = rec;
    }
    if (!rec) return;
    shouldListen.current = true;
    setIsRecording(true);
    try {
      rec.start();
    } catch {
      /* doble start */
    }
  }, [supported, isRecording, create]);

  const stop = useCallback(() => {
    shouldListen.current = false;
    setIsRecording(false);
    setInterim("");
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    return () => {
      shouldListen.current = false;
      try {
        recRef.current?.abort?.();
      } catch {
        /* noop */
      }
    };
  }, []);

  return { supported, isRecording, interim, error, start, stop };
}

/* ---- tipos mínimos para no depender de lib.dom de Chrome ---- */
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}
interface SpeechResultEvent {
  resultIndex: number;
  results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } };
}
