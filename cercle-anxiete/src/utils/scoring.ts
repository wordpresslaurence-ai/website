import type { AppState, Category } from '../types';
import { SCENARIOS } from '../data/scenarios';
import type { Dominant } from '../data/content';

/** Renvoie la catégorie du choix retenu pour une situation, ou null. */
export function answerCategory(
  answers: (number | null)[],
  index: number,
): Category | null {
  const choiceIndex = answers[index];
  if (choiceIndex === null || choiceIndex === undefined) return null;
  return SCENARIOS[index].choices[choiceIndex].category;
}

export interface Counts {
  evitement: number;
  securite: number;
  progression: number;
  answered: number;
}

/** Comptage déterministe des trois catégories. */
export function countCategories(answers: (number | null)[]): Counts {
  const counts: Counts = {
    evitement: 0,
    securite: 0,
    progression: 0,
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
    ['progression', counts.progression],
  ];
  const max = Math.max(...entries.map(([, n]) => n));
  const leaders = entries.filter(([, n]) => n === max);
  if (max === 0 || leaders.length !== 1) return 'equilibre';
  return leaders[0][0];
}

/**
 * Position pédagogique du cercle sur l'axe « se resserre / en observation / s'ouvre ».
 * Renvoie une valeur de 0 (se resserre) à 1 (s'ouvre), 0,5 = en observation.
 * Déterministe : progression tire vers l'ouverture, évitement/sécurité vers le resserrement.
 */
export function opennessRatio(counts: Counts): number {
  if (counts.answered === 0) return 0.5;
  const net = counts.progression - (counts.evitement + counts.securite);
  const ratio = 0.5 + net / (2 * counts.answered);
  return Math.min(1, Math.max(0, ratio));
}

/** Intensité pédagogique du « soulagement immédiat recherché » pour une catégorie. */
export function immediateReliefLevel(category: Category | null): number {
  switch (category) {
    case 'evitement':
      return 0.9;
    case 'securite':
      return 0.78;
    case 'progression':
      return 0.28;
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
