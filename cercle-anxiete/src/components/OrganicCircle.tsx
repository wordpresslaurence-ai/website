import { useEffect, useMemo, useRef, useState } from 'react';
import type { Category } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Props {
  /** Catégorie du dernier choix, ou null (observation). */
  category: Category | null;
  /** S'incrémente à chaque sélection : relance l'animation. */
  tick: number;
}

// Couleurs clés (interpolées selon un « mix » 0 → 1).
// 0 = terracotta (le cercle se resserre) · 0,5 = neutre rose · 1 = sauge (s'ouvre).
const STOPS: [number, [number, number, number]][] = [
  [0, [163, 84, 61]], // terracotta
  [0.5, [212, 154, 137]], // rose
  [1, [111, 136, 118]], // sage
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixToRgb(mix: number): string {
  const m = Math.min(1, Math.max(0, mix));
  let lo = STOPS[0];
  let hi = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (m >= STOPS[i][0] && m <= STOPS[i + 1][0]) {
      lo = STOPS[i];
      hi = STOPS[i + 1];
      break;
    }
  }
  const span = hi[0] - lo[0] || 1;
  const t = (m - lo[0]) / span;
  const r = Math.round(lerp(lo[1][0], hi[1][0], t));
  const g = Math.round(lerp(lo[1][1], hi[1][1], t));
  const b = Math.round(lerp(lo[1][2], hi[1][2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

interface Keyframe {
  t: number; // secondes depuis le début
  r: number; // rayon relatif
  mix: number; // couleur
  amp: number; // amplitude d'ondulation
  speed: number; // vitesse d'ondulation
}

// Séquences déterministes décrivant le comportement demandé.
function timelineFor(category: Category | null): Keyframe[] {
  switch (category) {
    case 'evitement':
    case 'securite':
      // Se resserre, devient terracotta, brève accélération puis mouvement lent.
      return [
        { t: 0, r: 1, mix: 0.5, amp: 0.05, speed: 0.7 },
        { t: 0.35, r: 0.8, mix: 0.16, amp: 0.09, speed: 1.7 },
        { t: 0.7, r: 0.85, mix: 0.18, amp: 0.05, speed: 0.9 },
        { t: 1.6, r: 0.88, mix: 0.22, amp: 0.035, speed: 0.5 },
      ];
    case 'progression':
      // Contraction d'inconfort, puis élargissement progressif vers le sauge.
      return [
        { t: 0, r: 1, mix: 0.5, amp: 0.05, speed: 0.75 },
        { t: 0.4, r: 0.9, mix: 0.38, amp: 0.07, speed: 1.05 },
        { t: 1.0, r: 1.03, mix: 0.72, amp: 0.05, speed: 0.6 },
        { t: 1.8, r: 1.08, mix: 0.92, amp: 0.04, speed: 0.42 },
      ];
    default:
      // Observation : large, lent, teinte neutre.
      return [{ t: 0, r: 1, mix: 0.5, amp: 0.05, speed: 0.5 }];
  }
}

function sampleTimeline(tl: Keyframe[], elapsed: number): Keyframe {
  if (elapsed <= tl[0].t) return tl[0];
  const last = tl[tl.length - 1];
  if (elapsed >= last.t) return last;
  for (let i = 0; i < tl.length - 1; i++) {
    const a = tl[i];
    const b = tl[i + 1];
    if (elapsed >= a.t && elapsed <= b.t) {
      const span = b.t - a.t || 1;
      const raw = (elapsed - a.t) / span;
      const t = raw * raw * (3 - 2 * raw); // smoothstep
      return {
        t: elapsed,
        r: lerp(a.r, b.r, t),
        mix: lerp(a.mix, b.mix, t),
        amp: lerp(a.amp, b.amp, t),
        speed: lerp(a.speed, b.speed, t),
      };
    }
  }
  return last;
}

const CX = 100;
const CY = 100;
const BASE = 66;
const POINTS = 8;

// Décalages de phase fixes pour une ondulation organique reproductible.
const PHASES = Array.from({ length: POINTS }, (_, i) => (i * 1.7) % (Math.PI * 2));

function buildPath(radius: number, amp: number, phase: number): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < POINTS; i++) {
    const a = (i / POINTS) * Math.PI * 2;
    const wobble = 1 + amp * Math.sin(phase + PHASES[i]);
    const rr = radius * wobble;
    pts.push([CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]);
  }
  // Courbe fermée lissée par des points médians (quadratiques).
  let d = '';
  for (let i = 0; i < POINTS; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % POINTS];
    const mid: [number, number] = [
      (cur[0] + next[0]) / 2,
      (cur[1] + next[1]) / 2,
    ];
    if (i === 0) d += `M ${mid[0].toFixed(2)} ${mid[1].toFixed(2)} `;
    const following = pts[(i + 1) % POINTS];
    const nextMid: [number, number] = [
      (following[0] + pts[(i + 2) % POINTS][0]) / 2,
      (following[1] + pts[(i + 2) % POINTS][1]) / 2,
    ];
    d += `Q ${next[0].toFixed(2)} ${next[1].toFixed(2)} ${nextMid[0].toFixed(
      2,
    )} ${nextMid[1].toFixed(2)} `;
  }
  return d + 'Z';
}

const LABELS: Record<'observation' | Category, { title: string; sub: string }> =
  {
    observation: { title: 'Observation', sub: 'Un moment pour regarder ce qui se passe.' },
    evitement: {
      title: 'Soulagement immédiat',
      sub: 'Le cercle se resserre : apaisement rapide, peur entretenue.',
    },
    securite: {
      title: 'Soulagement immédiat',
      sub: 'Le cercle se resserre : réassurance rapide, peur entretenue.',
    },
    progression: {
      title: 'Inconfort, puis ouverture',
      sub: 'Le cercle se contracte, puis s’élargit : nouvel apprentissage.',
    },
  };

export function OrganicCircle({ category, tick }: Props) {
  const reduced = useReducedMotion();
  const timeline = useMemo(() => timelineFor(category), [category]);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [path, setPath] = useState<string>(() => buildPath(BASE, 0.05, 0));
  const [fill, setFill] = useState<string>(() => mixToRgb(0.5));
  const [scaleR, setScaleR] = useState<number>(BASE);

  // Réinitialise le chrono à chaque nouvelle sélection.
  useEffect(() => {
    startRef.current = performance.now();
  }, [tick, category]);

  useEffect(() => {
    if (reduced) {
      // Sans animation : on affiche directement l'état final de la séquence.
      const last = timeline[timeline.length - 1];
      setPath(buildPath(BASE * last.r, 0, 0));
      setFill(mixToRgb(last.mix));
      setScaleR(BASE * last.r);
      return;
    }
    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      const elapsed = (now - startRef.current) / 1000;
      const kf = sampleTimeline(timeline, elapsed);
      // Phase d'ondulation dépendante de la vitesse courante.
      const phase = (now / 1000) * kf.speed * Math.PI;
      const radius = BASE * kf.r;
      setPath(buildPath(radius, kf.amp, phase));
      setFill(mixToRgb(kf.mix));
      setScaleR(radius);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [timeline, reduced]);

  const key = (category ?? 'observation') as 'observation' | Category;
  const label = LABELS[key];

  return (
    <div className="circle-panel">
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`Cercle de l’anxiété : ${label.title}. ${label.sub}`}
      >
        <defs>
          <radialGradient id="halo" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={86} fill="rgba(212,154,137,0.10)" aria-hidden="true" />
        <path
          d={path}
          fill={fill}
          opacity={0.9}
          style={{ transition: reduced ? 'fill 0.4s ease, d 0.4s ease' : undefined }}
          aria-hidden="true"
        />
        <path d={path} fill="url(#halo)" aria-hidden="true" />
        {/* Anneau intérieur qui matérialise le resserrement / l'ouverture. */}
        <circle
          cx={CX}
          cy={CY}
          r={Math.max(6, scaleR - 26)}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </svg>
      <p className="circle-caption" aria-live="polite">
        <strong>{label.title}</strong>
        {label.sub}
      </p>
    </div>
  );
}
