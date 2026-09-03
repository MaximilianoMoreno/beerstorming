interface P {
  className?: string;
}
const base = "inline-block shrink-0";

export const MicIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <rect x="9" y="2.5" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M12 18v3.5M8.5 21.5h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M11 6h2M11 8.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
  </svg>
);

export const StopIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" />
  </svg>
);

export const MugIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M5 8.5h11v10a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 5 18.5v-10Z" stroke="currentColor" strokeWidth="1.7" />
    <path d="M16 10.5h2.2a2.3 2.3 0 0 1 0 4.6H16" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4.6 8.5c-.9-2.6 1-4.9 3.1-4.4.6-1.5 3.5-1.9 4.6-.5 1.4-1 3.9-.2 4 .9 1.9 0 2.8 2.3 1.9 4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M8 12.5v5M11 12.5v5M14 12.5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
  </svg>
);

/** Jarra con nivel de líquido (0..1) */
export const FilledMug = ({ fill = 0, className = "w-16 h-16" }: P & { fill?: number }) => (
  <svg viewBox="0 0 80 90" fill="none" className={`${base} ${className}`} aria-hidden>
    <defs>
      <clipPath id="mugclip">
        <path d="M16 26h42v46a9 9 0 0 1-9 9H25a9 9 0 0 1-9-9V26Z" />
      </clipPath>
    </defs>
    <g clipPath="url(#mugclip)">
      <g className="slosh" style={{ transformBox: "fill-box" }}>
        <rect x="10" y={76 - 52 * Math.min(fill, 1)} width="54" height="60" fill="#f5a623" opacity="0.9" />
        <rect x="10" y={76 - 52 * Math.min(fill, 1)} width="54" height="7" fill="#ffd884" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={24 + i * 9} cy={70 - i * 8} r={2.4 - i * 0.3} fill="#ffe2a1" opacity="0.7" />
      ))}
    </g>
    <path d="M16 26h42v46a9 9 0 0 1-9 9H25a9 9 0 0 1-9-9V26Z" stroke="#e8b45a" strokeWidth="3" />
    <path d="M58 34h7a8 8 0 0 1 0 16h-7" stroke="#e8b45a" strokeWidth="3" />
    <path d="M14.5 26C11 16.5 18 9.5 25.5 11.5 28 6.5 38 5 41.5 10c5-3.5 13.5-1 13 3 6 0 8.5 7.5 5.5 13" stroke="#f3ddb0" strokeWidth="3" strokeLinejoin="round" fill="rgba(247,232,201,0.12)" />
    <path d="M27 40v26M37 40v26M47 40v26" stroke="#e8b45a" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
  </svg>
);

export const FlameIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path
      d="M12 2.8s1 2.6-.4 5C10 10.5 8 11.7 8 15a4 4 0 0 0 8 0c0-1.5-.6-2.6-1.2-3.6 1.9.4 3.2 2 3.2 4.1a6.5 6.5 0 1 1-13 0C5 10.4 9.6 8.6 12 2.8Z"
      stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
    />
    <path d="M12 21.5a2.8 2.8 0 0 1-2.8-2.8c0-1.6 1.4-2.4 2.8-4 1.4 1.6 2.8 2.4 2.8 4A2.8 2.8 0 0 1 12 21.5Z" fill="currentColor" opacity="0.5" />
  </svg>
);

export const GavelIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="m13.2 6.2 4.6 4.6M8.6 10.8l4.6 4.6M11 3.9l9.1 9.1M9.6 12 3.4 18.2a1.6 1.6 0 0 0 2.4 2.3l6-6.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 21.5h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const CrownIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="m4 8 3.6 3.4L12 5.5l4.4 5.9L20 8l-1.4 9.5H5.4L4 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M5.4 20.5h13.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="3.4" r="1.1" fill="currentColor" />
  </svg>
);

export const GhostIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M12 3.5a6.5 6.5 0 0 1 6.5 6.5v9.5l-2.2-1.8-2.1 1.8-2.2-1.8-2.1 1.8-2.2-1.8L5.5 19.5V10A6.5 6.5 0 0 1 12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="9.6" cy="10.5" r="1.15" fill="currentColor" />
    <circle cx="14.4" cy="10.5" r="1.15" fill="currentColor" />
    <path d="M10.5 14c.9.7 2.1.7 3 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const ReceiptIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M6 3h12v18l-2.4-1.6L13.2 21l-2.4-1.6L8.4 21 6 19.4V3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M9 7.5h6M9 11h6M9 14.5h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CopyIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M15.5 5.5v-.7A2.3 2.3 0 0 0 13.2 2.5H5.8a2.3 2.3 0 0 0-2.3 2.3v7.4a2.3 2.3 0 0 0 2.3 2.3h.7" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

export const CheckIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="m5 12.8 4.5 4.7L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ClockIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 7.5V12l3.2 2.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const PlusIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ScaleIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M12 4v16M8 20h8M12 4l-6 2.5M12 4l6 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M6 6.5 3.5 12a2.7 2.7 0 0 0 5 0L6 6.5ZM18 6.5 15.5 12a2.7 2.7 0 0 0 5 0L18 6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const AlertIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M12 3.6 2.8 19.5h18.4L12 3.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M12 9.5v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.8" r="1.1" fill="currentColor" />
  </svg>
);

export const SparkIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M12 3.5c.7 4.2 2.2 5.7 6.5 6.5-4.3.8-5.8 2.3-6.5 6.5-.7-4.2-2.2-5.7-6.5-6.5 4.3-.8 5.8-2.3 6.5-6.5Z" fill="currentColor" opacity="0.9" />
    <path d="M18.8 14.5c.35 2.1 1.1 2.85 3.2 3.2-2.1.35-2.85 1.1-3.2 3.2-.35-2.1-1.1-2.85-3.2-3.2 2.1-.35 2.85-1.1 3.2-3.2Z" fill="currentColor" opacity="0.6" />
  </svg>
);

export const CoinIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <ellipse cx="12" cy="7" rx="7.5" ry="3.4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4.5 7v5c0 1.9 3.4 3.4 7.5 3.4s7.5-1.5 7.5-3.4V7" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4.5 12v5c0 1.9 3.4 3.4 7.5 3.4s7.5-1.5 7.5-3.4v-5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const ArrowIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M4 12h15M13.5 5.5 20 12l-6.5 6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const NoteIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M4.5 5.5 8 4l11.5 3-1.3 4.8-3.4-.9L13 17.5l-8.5-2.2v-9.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M8 8.5l6 1.5M8 12l4 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const WaveIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
    <path d="M3 12h2.4l2-5 3 10 2.8-13 2.6 11 1.8-5H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
