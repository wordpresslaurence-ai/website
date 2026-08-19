import type { AppState, Category } from '../types';
import { CATEGORY_META } from '../types';
import { SCENARIOS } from '../data/scenarios';
import {
  answerCategory,
  countCategories,
  dominantCategory,
  plural,
} from '../utils/scoring';
import { DOMINANT_MESSAGE } from '../data/content';

interface Props {
  state: AppState;
  onPrenomChange: (value: string) => void;
}

const CAT_BG: Record<Category, string> = {
  evitement: '#A3543D',
  securite: '#D49A89',
};

// Vrai lorsque l'app est affichée dans un cadre intégré (aperçu),
// où l'impression et les téléchargements peuvent être bloqués par le navigateur.
const isEmbedded = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true; // accès inter-frame refusé = on est bien intégré
  }
};

export function PrintableSummary({ state, onPrenomChange }: Props) {
  const { answers, firstStep, prenom } = state;
  const counts = countCategories(answers);
  const dominant = dominantCategory(counts);
  const embedded = isEmbedded();

  const handleDownload = () => {
    try {
      window.print();
    } catch {
      /* impression indisponible dans certains contextes intégrés */
    }
  };
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const habitScenario = SCENARIOS.find(
    (s) => s.id === firstStep.habitScenarioId,
  );
  const habitChoiceIndex = habitScenario
    ? answers[habitScenario.index - 1]
    : null;
  const habitLabel =
    habitScenario && habitChoiceIndex !== null && habitChoiceIndex !== undefined
      ? habitScenario.choices[habitChoiceIndex].habit ?? habitScenario.title
      : habitScenario?.title ?? '—';

  const goalLabel =
    firstStep.goal === 'autre'
      ? firstStep.goalOther || 'autre'
      : firstStep.goal || '—';

  return (
    <section aria-labelledby="summary-title" className="printable-region">
      <div className="section-head no-print">
        <p className="eyebrow">À conserver</p>
        <h2 id="summary-title">Ton récapitulatif</h2>
        <p className="text-muted">
          Aucune adresse e-mail n’est demandée. Le récapitulatif reste sur ton
          appareil ; tu peux l’imprimer ou l’enregistrer en PDF.
        </p>
        <label className="field" style={{ maxWidth: 320 }}>
          <span>Ton prénom (facultatif)</span>
          <input
            type="text"
            value={prenom}
            onChange={(e) => onPrenomChange(e.target.value)}
            placeholder="Uniquement si tu le souhaites"
            autoComplete="given-name"
          />
        </label>
      </div>

      <div className="summary-card printable">
        <p className="print-only" style={{ fontWeight: 700 }}>
          Le cercle de l’anxiété — récapitulatif personnel
        </p>

        <div className="summary-line">
          <span className="q">Date : </span>
          {dateStr}
          {prenom.trim() && (
            <>
              {' · '}
              <span className="q">Prénom : </span>
              {prenom.trim()}
            </>
          )}
        </div>

        <div className="summary-line">
          <span className="q">Tes huit réponses</span>
          <ul className="summary-answers">
            {SCENARIOS.map((s, i) => {
              const cat = answerCategory(answers, i);
              const choiceIndex = answers[i];
              const meta = cat ? CATEGORY_META[cat] : null;
              return (
                <li key={s.id}>
                  {meta && (
                    <span
                      className="cat"
                      style={{ background: CAT_BG[cat as Category] }}
                    >
                      {meta.label}
                    </span>
                  )}
                  <strong>{s.title}</strong>
                  {' — '}
                  {choiceIndex !== null && choiceIndex !== undefined
                    ? s.choices[choiceIndex].text
                    : 'sans réponse'}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="summary-line">
          <span className="q">Tendances observées : </span>
          {plural(counts.evitement, 'évitement', 'évitements')} et{' '}
          {plural(
            counts.securite,
            'comportement de sécurité',
            'comportements de sécurité',
          )}
          .
          <p style={{ margin: '0.5rem 0 0' }}>{DOMINANT_MESSAGE[dominant]}</p>
        </div>

        <div className="summary-line">
          <span className="q">Habitude choisie à observer : </span>
          {habitLabel}
        </div>

        {(firstStep.situationText.trim() || firstStep.goal) && (
          <div className="summary-line">
            {firstStep.situationText.trim() && (
              <>
                <span className="q">Situation la plus fréquente : </span>
                {firstStep.situationText.trim()}
                <br />
              </>
            )}
            {firstStep.goal && (
              <>
                <span className="q">Ce que je cherche : </span>
                {goalLabel}
              </>
            )}
          </div>
        )}

        <div className="summary-line">
          <span className="q">Mon premier petit pas : </span>
          {firstStep.step || '—'}
        </div>

        <div className="summary-line">
          <em>
            Ce récapitulatif fournit des informations générales et ne constitue
            ni un diagnostic ni une recommandation médicale personnalisée. Il ne
            remplace pas une consultation ou un accompagnement professionnel.
          </em>
        </div>
      </div>

      <div className="no-print" style={{ marginTop: '1.2rem' }}>
        <button type="button" className="btn" onClick={handleDownload}>
          Télécharger mon récapitulatif
        </button>
        {embedded && (
          <p
            className="text-muted"
            style={{ fontSize: '0.85rem', marginTop: '0.6rem', maxWidth: '48ch' }}
          >
            Astuce : dans cet aperçu intégré, l’impression peut être bloquée par
            le navigateur. Sur le site en ligne, ce bouton ouvre la fenêtre
            d’impression pour enregistrer ton récapitulatif en PDF.
          </p>
        )}
      </div>
    </section>
  );
}
