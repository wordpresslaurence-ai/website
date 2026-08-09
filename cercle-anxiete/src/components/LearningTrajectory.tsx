import { useEffect, useRef, useState } from 'react';
import { SCENARIOS } from '../data/scenarios';
import { answerCategory } from '../utils/scoring';
import type { Category } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Props {
  answers: (number | null)[];
}

const CAT_COLOR: Record<Category, string> = {
  evitement: '#A3543D',
  securite: '#D49A89',
  progression: '#6F8876',
};

// Hauteur (Y) associée à chaque catégorie : plus bas = se resserre, plus haut = s'ouvre.
const CAT_Y: Record<Category, number> = {
  evitement: 150,
  securite: 105,
  progression: 55,
};

const W = 640;
const H = 200;
const PADDING = 40;

export function LearningTrajectory({ answers }: Props) {
  const reduced = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [dash, setDash] = useState<number>(reduced ? 0 : 1);

  const points = SCENARIOS.map((s, i) => {
    const cat = answerCategory(answers, i) ?? 'securite';
    const x =
      PADDING + (i * (W - 2 * PADDING)) / (SCENARIOS.length - 1);
    const y = CAT_Y[cat];
    return { x, y, cat, index: s.index };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Tracé progressif de la trajectoire.
  useEffect(() => {
    if (reduced) {
      setDash(0);
      return;
    }
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = t * t * (3 - 2 * t);
      el.style.strokeDashoffset = `${len * (1 - eased)}`;
      if (t < 1) raf = requestAnimationFrame(animate);
      else setDash(0);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [reduced, linePath]);

  // Description textuelle de la trajectoire (accessibilité).
  const textual = points
    .map((p) => {
      const label =
        p.cat === 'evitement'
          ? 'évitement'
          : p.cat === 'securite'
            ? 'sécurité'
            : 'progression';
      return `situation ${p.index} : ${label}`;
    })
    .join(' ; ');

  return (
    <div className="trajectory-panel">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Trajectoire de tes choix — ${textual}.`}>
        {/* Repères horizontaux discrets. */}
        {(['progression', 'securite', 'evitement'] as Category[]).map((c) => (
          <line
            key={c}
            x1={PADDING}
            x2={W - PADDING}
            y1={CAT_Y[c]}
            y2={CAT_Y[c]}
            stroke="#ECD6C5"
            strokeWidth={1}
            strokeDasharray="4 6"
            aria-hidden="true"
          />
        ))}
        <path
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke="#E7D6CC"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={dash === 0 ? undefined : { opacity: 1 }}
          aria-hidden="true"
        />
        {points.map((p, i) => (
          <g key={i} aria-hidden="true">
            <circle cx={p.x} cy={p.y} r={9} fill="#fff" stroke={CAT_COLOR[p.cat]} strokeWidth={3} />
            <text
              x={p.x}
              y={H - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#7D675F"
              fontFamily="var(--font-alt)"
            >
              {p.index}
            </text>
          </g>
        ))}
      </svg>

      <div className="legend">
        <span>
          <span className="dot" style={{ background: CAT_COLOR.evitement }} />
          terracotta : le cercle tend à se resserrer
        </span>
        <span>
          <span className="dot" style={{ background: CAT_COLOR.securite }} />
          rose poudré : recherche de sécurité
        </span>
        <span>
          <span className="dot" style={{ background: CAT_COLOR.progression }} />
          vert sauge : nouvel apprentissage progressif
        </span>
      </div>

      <p className="disclaimer-inline">
        Cette représentation illustre un mécanisme général. Elle ne prédit pas
        l’évolution réelle de ton anxiété.
      </p>
    </div>
  );
}
