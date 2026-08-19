import { useEffect, useState } from 'react';

interface Props {
  onContinue: () => void;
}

const TOTAL_STEPS = 2;

export function Introduction({ onContinue }: Props) {
  const [step, setStep] = useState(0);

  // Focus déplacé sur le titre de l'étape à chaque changement.
  useEffect(() => {
    document.getElementById('intro-step-title')?.focus();
  }, [step]);

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else onContinue();
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <section className="intro-steps" aria-labelledby="intro-step-title">
      <div className="intro-dots" aria-hidden="true">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`intro-dot${i === step ? ' active' : ''}`}
          />
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        Étape {step + 1} sur {TOTAL_STEPS}.
      </p>

      <div className="panel stack fade-in" key={step}>
        {step === 0 && (
          <>
            <h2 id="intro-step-title" tabIndex={-1}>
              Pourquoi la peur persiste-t-elle ?
            </h2>
            <p>
              Tu te demandes peut-être pourquoi les crises d’angoisse et la peur
              d’avoir peur persistent, malgré tous tes efforts ?
            </p>
            <p>
              Il est possible que certaines habitudes — mises en place pour te
              rassurer ou éviter l’anxiété — fassent en réalité l’effet inverse.
              Ces comportements sont souvent invisibles et presque automatiques.
              Et pourtant, ils peuvent entretenir la peur d’avoir peur et
              alimenter le cercle de l’anxiété.
            </p>
            <div className="callout">
              Prendre conscience de leur impact est une première étape pour t’en
              libérer.
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 id="intro-step-title" tabIndex={-1}>
              Deux habitudes à observer
            </h2>
            <p>
              Au fil des situations, tu vas explorer deux grandes familles de
              réactions.
            </p>

            <div className="primer">
              <div
                className="primer-card"
                style={{ ['--pc' as string]: 'var(--terracotta)' }}
              >
                <h3>Les comportements d’évitement</h3>
                <p style={{ margin: 0 }}>
                  Des actions pour éviter ce qui déclenche l’anxiété. Elles
                  soulagent sur le moment… mais peuvent renforcer la peur sur le
                  long terme.
                </p>
                <p className="ex">
                  Par exemple : éviter les transports ou les lieux bondés,
                  annuler des sorties, ou se distraire dès qu’une sensation
                  apparaît.
                </p>
              </div>

              <div
                className="primer-card"
                style={{ ['--pc' as string]: 'var(--rose)' }}
              >
                <h3>Les comportements sécuritaires</h3>
                <p style={{ margin: 0 }}>
                  Des « béquilles » pour te rassurer quand l’anxiété monte. Elles
                  rassurent sur le moment… mais peuvent amplifier la peur sur le
                  long terme.
                </p>
                <p className="ex">
                  Par exemple : garder un médicament « au cas où », vérifier son
                  pouls, appeler un proche, ou recourir sans cesse à une technique
                  de relaxation pour faire disparaître chaque sensation.
                </p>
              </div>
            </div>

            <div className="callout">
              Choisis ce que tu ferais spontanément aujourd’hui, et non ce que tu
              penses devoir faire.
            </div>
          </>
        )}

        <div className="intro-nav">
          {step > 0 ? (
            <button type="button" className="btn btn-secondary" onClick={prev}>
              ← Précédent
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="btn" onClick={next}>
            {step < TOTAL_STEPS - 1 ? 'Suivant' : 'J’ai compris, commencer'}
          </button>
        </div>
      </div>
    </section>
  );
}
