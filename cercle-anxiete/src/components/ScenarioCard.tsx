import type { Scenario } from '../types';
import { TOTAL_SCENARIOS } from '../data/scenarios';
import { ResponseChoice } from './ResponseChoice';
import { EducationalFeedback } from './EducationalFeedback';

interface Props {
  scenario: Scenario;
  selectedChoice: number | null;
  onSelect: (choiceIndex: number) => void;
}

const LETTERS = ['A', 'B', 'C'];

export function ScenarioCard({ scenario, selectedChoice, onSelect }: Props) {
  const pct = Math.round((scenario.index / TOTAL_SCENARIOS) * 100);
  const answered = selectedChoice !== null;

  return (
    <div className="panel zone-card">
      <div className="progress sticky">
        <div className="progress-label">
          <span>
            Situation {scenario.index} sur {TOTAL_SCENARIOS}
          </span>
          <span aria-hidden="true">{pct}%</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL_SCENARIOS}
          aria-valuenow={scenario.index}
          aria-valuetext={`Situation ${scenario.index} sur ${TOTAL_SCENARIOS}`}
        >
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <h2 className="visually-hidden">Situation {scenario.index}</h2>
      <p
        className="situation-text"
        id="current-situation"
        tabIndex={-1}
      >
        {scenario.situation}
      </p>

      {scenario.note && <p className="situation-note">{scenario.note}</p>}

      <fieldset className="choices">
        <legend>Choisis la réaction qui te ressemble le plus.</legend>
        {scenario.choices.map((choice, i) => (
          <ResponseChoice
            key={i}
            choice={choice}
            letter={LETTERS[i]}
            selected={selectedChoice === i}
            onSelect={() => onSelect(i)}
          />
        ))}
      </fieldset>

      {answered && (
        <EducationalFeedback choice={scenario.choices[selectedChoice]} />
      )}
    </div>
  );
}
