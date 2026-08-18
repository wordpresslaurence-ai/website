import { useEffect } from 'react';
import type { Category } from '../types';
import { SCENARIOS, TOTAL_SCENARIOS } from '../data/scenarios';
import { ScenarioCard } from './ScenarioCard';
import { Indicators } from './Indicators';

interface Props {
  currentIndex: number;
  answers: (number | null)[];
  onSelect: (index: number, choiceIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AnxietySimulator({
  currentIndex,
  answers,
  onSelect,
  onNext,
  onPrev,
}: Props) {
  const scenario = SCENARIOS[currentIndex];
  const selectedChoice = answers[currentIndex];
  const answered = selectedChoice !== null && selectedChoice !== undefined;
  const isLast = currentIndex === TOTAL_SCENARIOS - 1;

  // Focus déplacé sur l'énoncé à chaque changement de situation.
  useEffect(() => {
    document.getElementById('current-situation')?.focus();
  }, [currentIndex]);

  const currentCategory: Category | null = answered
    ? scenario.choices[selectedChoice].category
    : null;

  const handleSelect = (choiceIndex: number) => {
    onSelect(currentIndex, choiceIndex);
  };

  return (
    <section className="simulator" aria-labelledby="sim-title">
      <h1 id="sim-title" className="visually-hidden">
        Simulateur du cercle de l’anxiété
      </h1>

      {/* Annonce du statut de progression aux lecteurs d'écran. */}
      <p className="visually-hidden" aria-live="polite">
        Situation {scenario.index} sur {TOTAL_SCENARIOS}.
      </p>

      <div className="sim-grid">
        <ScenarioCard
          scenario={scenario}
          selectedChoice={answered ? selectedChoice : null}
          onSelect={handleSelect}
        />

        <Indicators answers={answers} currentCategory={currentCategory} />

        <div className="zone-next">
          {currentIndex > 0 && (
            <button type="button" className="btn btn-secondary" onClick={onPrev}>
              ← Situation précédente
            </button>
          )}
          <span className="spacer" />
          {answered && (
            <button type="button" className="btn" onClick={onNext}>
              {isLast ? 'Découvrir mon débrief' : 'Situation suivante'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
