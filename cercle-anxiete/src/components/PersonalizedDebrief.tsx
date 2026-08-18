import type { Category } from '../types';
import { SCENARIOS } from '../data/scenarios';
import {
  CATEGORY_CARD,
  DOMINANT_MESSAGE,
} from '../data/content';
import {
  answerCategory,
  countCategories,
  dominantCategory,
  plural,
} from '../utils/scoring';

interface Props {
  answers: (number | null)[];
}

const CAT_COLOR: Record<Category, string> = {
  evitement: 'var(--terracotta)',
  securite: 'var(--rose)',
};

const ORDER: Category[] = ['evitement', 'securite'];

function examplesFor(answers: (number | null)[], category: Category): string[] {
  const out: string[] = [];
  SCENARIOS.forEach((s, i) => {
    if (answerCategory(answers, i) === category) out.push(s.title);
  });
  return out;
}

export function PersonalizedDebrief({ answers }: Props) {
  const counts = countCategories(answers);
  const dominant = dominantCategory(counts);

  const restitution = `Dans ces situations fictives, tu as choisi ${plural(
    counts.evitement,
    'réaction d’évitement',
    'réactions d’évitement',
  )} et ${plural(
    counts.securite,
    'comportement de sécurité',
    'comportements de sécurité',
  )}.`;

  return (
    <section aria-labelledby="debrief-title">
      <div className="section-head">
        <p className="eyebrow">Ce que tu viens d’observer</p>
        <h2 id="debrief-title">Ton cercle aujourd’hui</h2>
        <p>
          {restitution} Cela ne mesure pas ton niveau d’anxiété. Cela met
          simplement en lumière les stratégies vers lesquelles tu sembles te
          tourner spontanément.
        </p>
      </div>

      <div className="debrief-cards">
        {ORDER.map((cat) => {
          const examples = examplesFor(answers, cat);
          return (
            <article
              key={cat}
              className="debrief-card"
              style={{ ['--card-color' as string]: CAT_COLOR[cat] }}
            >
              <p className="count">
                {counts[cat]}
                <small> / 8</small>
              </p>
              <h3>{CATEGORY_CARD[cat].title}</h3>
              <p>{CATEGORY_CARD[cat].explanation}</p>
              {examples.length > 0 && (
                <ul className="example-list">
                  {examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>

      <div className="synthesis">
        <p style={{ margin: 0 }}>{DOMINANT_MESSAGE[dominant]}</p>
      </div>
    </section>
  );
}
