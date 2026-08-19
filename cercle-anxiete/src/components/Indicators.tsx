import type { Category } from '../types';
import {
  countCategories,
  immediateReliefLevel,
  maintenanceRatio,
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

function maintenanceWord(ratio: number): string {
  if (ratio >= 0.66) return 'le cercle a nettement tendance à se maintenir';
  if (ratio >= 0.33) return 'le cercle a tendance à se maintenir';
  if (ratio > 0) return 'quelques habitudes commencent à l’entretenir';
  return 'aucune habitude repérée pour l’instant';
}

export function Indicators({ answers, currentCategory }: Props) {
  const counts = countCategories(answers);
  const relief = immediateReliefLevel(currentCategory);
  const maintenance = maintenanceRatio(counts);

  return (
    <div className="panel indicators zone-indic" aria-label="Indicateurs pédagogiques">
      <div className="indicator">
        <h3>Soulagement immédiat</h3>
        <div
          className="meter"
          role="img"
          aria-label={`Soulagement immédiat recherché : ${reliefWord(relief)}.`}
        >
          <div className="meter-fill" style={{ width: `${relief * 100}%` }} />
        </div>
        <p className="meter-note">
          {currentCategory
            ? 'Un apaisement rapide est recherché sur le moment.'
            : 'Sélectionne une réaction pour voir son effet immédiat.'}
        </p>
      </div>

      <div className="indicator">
        <h3>Anxiété de fond (long terme)</h3>
        <div
          className="meter"
          role="img"
          aria-label={`Anxiété de fond sur le long terme : ${maintenanceWord(
            maintenance,
          )}.`}
        >
          <div
            className="meter-fill"
            style={{ width: `${maintenance * 100}%` }}
          />
        </div>
        <p className="meter-note">
          Répétées, ces habitudes ont tendance à entretenir le cercle sur le long
          terme.
        </p>

        <div className="tally">
          <span className="tally-chip">
            Évitement <b>{counts.evitement}</b>
          </span>
          <span className="tally-chip">
            Sécurité <b>{counts.securite}</b>
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
