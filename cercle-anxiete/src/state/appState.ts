import type { AppState, FirstStepData } from '../types';
import { STORAGE_KEY } from '../config';
import { SCENARIOS, TOTAL_SCENARIOS } from '../data/scenarios';

export const initialFirstStep: FirstStepData = {
  habitScenarioId: null,
  situationText: '',
  goal: '',
  goalOther: '',
  step: '',
};

export function createInitialState(): AppState {
  return {
    phase: 'welcome',
    currentIndex: 0,
    answers: Array<number | null>(TOTAL_SCENARIOS).fill(null),
    firstStep: { ...initialFirstStep },
    prenom: '',
  };
}

export type Action =
  | { type: 'GO_INTRO' }
  | { type: 'START_SIMULATOR' }
  | { type: 'SELECT_ANSWER'; index: number; choiceIndex: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GO_DEBRIEF' }
  | { type: 'SET_PHASE'; phase: AppState['phase'] }
  | { type: 'UPDATE_FIRST_STEP'; patch: Partial<FirstStepData> }
  | { type: 'SET_PRENOM'; prenom: string }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: AppState };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'GO_INTRO':
      return { ...state, phase: 'intro' };

    case 'START_SIMULATOR':
      return { ...state, phase: 'simulator' };

    case 'SELECT_ANSWER': {
      const answers = state.answers.slice();
      answers[action.index] = action.choiceIndex;
      return { ...state, answers };
    }

    case 'NEXT': {
      if (state.currentIndex >= TOTAL_SCENARIOS - 1) {
        return { ...state, phase: 'debrief' };
      }
      return { ...state, currentIndex: state.currentIndex + 1 };
    }

    case 'PREV':
      return {
        ...state,
        currentIndex: Math.max(0, state.currentIndex - 1),
      };

    case 'GO_DEBRIEF':
      return { ...state, phase: 'debrief' };

    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'UPDATE_FIRST_STEP':
      return {
        ...state,
        firstStep: { ...state.firstStep, ...action.patch },
      };

    case 'SET_PRENOM':
      return { ...state, prenom: action.prenom };

    case 'RESET':
      return createInitialState();

    case 'HYDRATE':
      return action.state;

    default:
      return state;
  }
}

/** Lecture prudente de l'état sauvegardé (localStorage uniquement). */
export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (
      !parsed ||
      !Array.isArray(parsed.answers) ||
      parsed.answers.length !== TOTAL_SCENARIOS
    ) {
      return null;
    }
    const base = createInitialState();
    return {
      ...base,
      ...parsed,
      answers: parsed.answers.map((a, i) => {
        // On n'accepte qu'un index de choix réellement présent dans la situation.
        const nbChoices = SCENARIOS[i]?.choices.length ?? 0;
        return typeof a === 'number' && a >= 0 && a < nbChoices ? a : null;
      }),
      firstStep: { ...base.firstStep, ...(parsed.firstStep ?? {}) },
    };
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* stockage indisponible : on continue sans persistance */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** L'utilisateur a-t-il déjà une progression sauvegardée ? */
export function hasProgress(state: AppState): boolean {
  return state.answers.some((a) => a !== null) || state.phase === 'debrief';
}
