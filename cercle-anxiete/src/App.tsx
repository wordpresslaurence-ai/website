import { useEffect, useReducer, useRef, useState } from 'react';
import type { AppState } from './types';
import {
  reducer,
  createInitialState,
  loadState,
  saveState,
  clearState,
  hasProgress,
} from './state/appState';
import { Welcome } from './components/Welcome';
import { Introduction } from './components/Introduction';
import { AnxietySimulator } from './components/AnxietySimulator';
import { PersonalizedDebrief } from './components/PersonalizedDebrief';
import { LearningTrajectory } from './components/LearningTrajectory';
import { BeforeAfter } from './components/BeforeAfter';
import { FirstSmallStep } from './components/FirstSmallStep';
import { PrintableSummary } from './components/PrintableSummary';
import { AboutMarjorie } from './components/AboutMarjorie';
import { ProgramCTA } from './components/ProgramCTA';
import { SafetyNotice } from './components/SafetyNotice';

function initState(): {
  state: AppState;
  resumePhase: AppState['phase'] | null;
} {
  const saved = loadState();
  if (saved && hasProgress(saved)) {
    // On revient à l'accueil mais on propose de reprendre là où on en était.
    const resumePhase =
      saved.phase === 'welcome' ? 'simulator' : saved.phase;
    return { state: { ...saved, phase: 'welcome' }, resumePhase };
  }
  return { state: saved ?? createInitialState(), resumePhase: null };
}

export function App() {
  const bootstrap = useRef(initState());
  const [state, dispatch] = useReducer(reducer, bootstrap.current.state);
  const [resumePhase, setResumePhase] = useState<AppState['phase'] | null>(
    bootstrap.current.resumePhase,
  );

  // Persistance locale (aucune donnée envoyée en ligne).
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Remonte en haut de page à chaque changement de phase.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [state.phase]);

  const handleRestart = () => {
    clearState();
    setResumePhase(null);
    dispatch({ type: 'RESET' });
    dispatch({ type: 'GO_INTRO' });
  };

  const handleResume = () => {
    setResumePhase(null);
    dispatch({ type: 'SET_PHASE', phase: resumePhase ?? 'simulator' });
  };

  const handleStart = () => {
    setResumePhase(null);
    dispatch({ type: 'GO_INTRO' });
  };

  return (
    <div className="app">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>

      <main className="app-main" id="contenu">
        {state.phase === 'welcome' && (
          <Welcome
            onStart={handleStart}
            showResume={resumePhase !== null}
            onResume={handleResume}
            onRestart={handleRestart}
          />
        )}

        {state.phase === 'intro' && (
          <Introduction
            onContinue={() => dispatch({ type: 'START_SIMULATOR' })}
          />
        )}

        {state.phase === 'simulator' && (
          <AnxietySimulator
            currentIndex={state.currentIndex}
            answers={state.answers}
            onSelect={(index, choiceIndex) =>
              dispatch({ type: 'SELECT_ANSWER', index, choiceIndex })
            }
            onNext={() => dispatch({ type: 'NEXT' })}
            onPrev={() => dispatch({ type: 'PREV' })}
          />
        )}

        {state.phase === 'debrief' && (
          <div className="debrief fade-in">
            <PersonalizedDebrief answers={state.answers} />

            <section aria-labelledby="traj-title">
              <div className="section-head">
                <h2 id="traj-title">La trajectoire créée par tes choix</h2>
              </div>
              <LearningTrajectory answers={state.answers} />
            </section>

            <BeforeAfter />

            <FirstSmallStep
              answers={state.answers}
              firstStep={state.firstStep}
              onUpdate={(patch) =>
                dispatch({ type: 'UPDATE_FIRST_STEP', patch })
              }
            />

            <PrintableSummary
              state={state}
              onPrenomChange={(prenom) =>
                dispatch({ type: 'SET_PRENOM', prenom })
              }
            />

            <AboutMarjorie />

            <ProgramCTA />

            <div className="no-print" style={{ marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRestart}
              >
                Recommencer l’expérience
              </button>
            </div>
          </div>
        )}
      </main>

      <SafetyNotice />

      <p className="site-credit no-print">
        Une expérience de{' '}
        <a
          href="https://www.marjorie-goubin.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Marjorie Goubin
        </a>{' '}
        · thérapeute spécialisée en gestion de l’anxiété.
      </p>
    </div>
  );
}
