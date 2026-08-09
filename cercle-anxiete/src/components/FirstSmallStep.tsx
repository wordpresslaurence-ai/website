import type { FirstStepData } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { answerCategory } from '../utils/scoring';
import { FIRST_STEP_GOALS, FIRST_STEP_SUGGESTIONS } from '../data/content';

interface Props {
  answers: (number | null)[];
  firstStep: FirstStepData;
  onUpdate: (patch: Partial<FirstStepData>) => void;
}

interface HabitOption {
  scenarioId: number;
  label: string;
}

/** Habitudes issues des choix d'évitement / de sécurité de l'utilisateur. */
function habitsFrom(answers: (number | null)[]): HabitOption[] {
  const out: HabitOption[] = [];
  SCENARIOS.forEach((s, i) => {
    const cat = answerCategory(answers, i);
    const choiceIndex = answers[i];
    if (
      (cat === 'evitement' || cat === 'securite') &&
      choiceIndex !== null &&
      choiceIndex !== undefined
    ) {
      const habit = s.choices[choiceIndex].habit;
      if (habit) out.push({ scenarioId: s.id, label: habit });
    }
  });
  return out;
}

export function FirstSmallStep({ answers, firstStep, onUpdate }: Props) {
  const habits = habitsFrom(answers);
  const noHabits = habits.length === 0;

  // Repli bienveillant si l'utilisateur n'a choisi que des réponses progressives.
  const options: HabitOption[] = noHabits
    ? SCENARIOS.map((s) => ({ scenarioId: s.id, label: s.title }))
    : habits;

  return (
    <section aria-labelledby="step-title">
      <div className="section-head">
        <span className="hand" id="step-title" style={{ fontSize: '2.4rem' }}>
          Et maintenant ?
        </span>
        <p>
          Tu n’as pas besoin de tout changer en même temps. Choisis simplement
          une habitude à commencer à observer.
        </p>
      </div>

      {/* Étape 1 */}
      <div className="step-block">
        <h3>
          {noHabits
            ? 'Une situation à continuer d’observer'
            : 'Laquelle aimerais-tu mieux comprendre ?'}
        </h3>
        {noHabits && (
          <p className="text-muted">
            Tu as surtout choisi des réponses progressives. Tu peux tout de même
            choisir une situation que tu aimerais continuer à observer.
          </p>
        )}
        <fieldset className="option-grid">
          <legend className="visually-hidden">
            Choisis une habitude à observer
          </legend>
          {options.map((opt) => {
            const selected = firstStep.habitScenarioId === opt.scenarioId;
            return (
              <button
                key={opt.scenarioId}
                type="button"
                className="option-pill"
                aria-pressed={selected}
                onClick={() => onUpdate({ habitScenarioId: opt.scenarioId })}
              >
                <span className="tick" aria-hidden="true" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </fieldset>
      </div>

      {/* Étape 2 */}
      <div className="step-block">
        <label className="field">
          <span>Dans quelle situation apparaît-elle le plus souvent ?</span>
          <input
            type="text"
            value={firstStep.situationText}
            onChange={(e) => onUpdate({ situationText: e.target.value })}
            placeholder="Facultatif — quelques mots suffisent"
          />
        </label>
      </div>

      {/* Étape 3 */}
      <div className="step-block">
        <h3>Que cherches-tu à obtenir ou à éviter à ce moment-là ?</h3>
        <fieldset className="option-grid">
          <legend className="visually-hidden">Objectif recherché</legend>
          {FIRST_STEP_GOALS.map((goal) => {
            const selected = firstStep.goal === goal;
            return (
              <button
                key={goal}
                type="button"
                className="option-pill"
                aria-pressed={selected}
                onClick={() => onUpdate({ goal })}
              >
                <span className="tick" aria-hidden="true" />
                <span>{goal}</span>
              </button>
            );
          })}
        </fieldset>
        {firstStep.goal === 'autre' && (
          <label className="field">
            <span className="visually-hidden">Précise « autre »</span>
            <input
              type="text"
              value={firstStep.goalOther}
              onChange={(e) => onUpdate({ goalOther: e.target.value })}
              placeholder="Précise si tu le souhaites"
            />
          </label>
        )}
      </div>

      {/* Étape 4 */}
      <div className="step-block">
        <h3>Quel serait un premier pas suffisamment doux ?</h3>
        <fieldset className="option-grid">
          <legend className="visually-hidden">Premier pas</legend>
          {FIRST_STEP_SUGGESTIONS.map((step) => {
            const selected = firstStep.step === step;
            return (
              <button
                key={step}
                type="button"
                className="option-pill"
                aria-pressed={selected}
                onClick={() => onUpdate({ step })}
              >
                <span className="tick" aria-hidden="true" />
                <span>{step}</span>
              </button>
            );
          })}
        </fieldset>
      </div>
    </section>
  );
}
