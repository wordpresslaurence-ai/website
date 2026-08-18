import type { AppState, Category } from '../types';
import { SCENARIOS, TOTAL_SCENARIOS } from '../data/scenarios';
import type { Dominant } from '../data/content';

/** Renvoie la catégorie du choix retenu pour une situation, ou null. */
export function answerCategory(
  answers: (number | null)[],
  index: number,
): Category | null {
  const choiceIndex = answers[index];
  if (choiceIndex === null || choiceIndex === undefined) return null;
  const choice = SCENARIOS[index]?.choices[choiceIndex];
  // Garde-fou : un index de choix hors limites (ancien enregistrement) est ignoré.
  return choice ? choice.category : null;
}

export interface Counts {
  evitement: number;
  securite: number;
  answered: number;
}

/** Comptage déterministe des deux catégories. */
export function countCategories(answers: (number | null)[]): Counts {
  const counts: Counts = {
    evitement: 0,
    securite: 0,
    answered: 0,
  };
  answers.forEach((_, i) => {
    const cat = answerCategory(answers, i);
    if (cat) {
      counts[cat] += 1;
      counts.answered += 1;
    }
  });
  return counts;
}

/**
 * Tendance dominante — strictement déterministe.
 * Une catégorie ne « domine » que si elle est seule en tête ; sinon « équilibre ».
 */
export function dominantCategory(counts: Counts): Dominant {
  const entries: [Category, number][] = [
    ['evitement', counts.evitement],
    ['securite', counts.securite],
  ];
  const max = Math.max(...entries.map(([, n]) => n));
  const leaders = entries.filter(([, n]) => n === max);
  if (max === 0 || leaders.length !== 1) return 'equilibre';
  return leaders[0][0];
}

/**
 * Indicateur pédagogique « anxiété de fond (long terme) ».
 * Renvoie une valeur de 0 à 1 : plus l'utilisateur accumule d'habitudes
 * (évitement + sécurité), plus le cercle a tendance à se maintenir.
 * Déterministe, rapporté au nombre total de situations.
 */
export function maintenanceRatio(counts: Counts): number {
  const protective = counts.evitement + counts.securite;
  return Math.min(1, Math.max(0, protective / TOTAL_SCENARIOS));
}

/** Intensité pédagogique du « soulagement immédiat recherché » pour une catégorie. */
export function immediateReliefLevel(category: Category | null): number {
  switch (category) {
    case 'evitement':
      return 0.9;
    case 'securite':
      return 0.78;
    default:
      return 0;
  }
}

/** Accord singulier / pluriel pour les restitutions. */
export function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n > 1 ? plural : singular}`;
}

export function allAnswered(state: AppState): boolean {
  return state.answers.every((a) => a !== null);
}
