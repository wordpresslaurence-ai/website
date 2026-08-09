import type { Category } from '../types';
import {
  countCategories,
  immediateReliefLevel,
  opennessRatio,
} from '../utils/scoring';

interface Props {
  answers: (number | null)[];
  currentCategory: Category | null;
}

function reliefWord(level: number): string {
  if (level >= 0.75) return 'élevé';
  if (level >= 0.4) return 'modéré';
  if (level > 0) return 'faible';
  return 'en attente d’un choix';
}

function openWord(ratio: number): string {
  if (ratio > 0.62) return 'Le cercle s’ouvre';
  if (ratio < 0.38) return 'Le cercle se resserre';
  return 'En observation';
}

export function Indicators({ answers, currentCategory }: Props) {
  const counts = countCategories(answers);
  const relief = immediateReliefLevel(currentCategory);
  const openness = opennessRatio(counts);

  return (
    <div className="panel indicators zone-indic" aria-label="Indicateurs pédagogiques">
      <div className="indicator">
        <h3>Soulagement recherché maintenant</h3>
        <div
          className="meter"
          role="img"
          aria-label={`Soulagement immédiat recherché : ${reliefWord(relief)}.`}
        >
          <div className="meter-fill" style={{ width: `${relief * 100}%` }} />
        </div>
        <p className="meter-note">
          {currentCategory === 'progression'
            ? 'Moins de soulagement immédiat, davantage de place pour un nouvel apprentissage.'
            : currentCategory
              ? 'Un apaisement rapide est recherché sur le moment.'
              : 'Sélectionne une réaction pour voir son effet immédiat.'}
        </p>
      </div>

      <div className="indicator">
        <h3>Cercle entretenu ou progressivement ouvert</h3>
        <div className="axis">
          <div className="axis-track" aria-hidden="true" />
          <div
            className="axis-marker"
            style={{ left: `${openness * 100}%` }}
            role="img"
            aria-label={`Position actuelle : ${openWord(openness)}.`}
          />
        </div>
        <div className="axis-labels" aria-hidden="true">
          <span>Le cercle se resserre</span>
          <span>En observation</span>
          <span>Le cercle s’ouvre</span>
        </div>

        <div className="tally">
          <span className="tally-chip">
            Évitement <b>{counts.evitement}</b>
          </span>
          <span className="tally-chip">
            Sécurité <b>{counts.securite}</b>
          </span>
          <span className="tally-chip">
            Progression <b>{counts.progression}</b>
          </span>
        </div>
      </div>

      <p className="disclaimer-inline">
        Illustration pédagogique — ce n’est pas une mesure de ton niveau
        d’anxiété.
      </p>
    </div>
  );
}
