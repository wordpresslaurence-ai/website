export type Category = 'evitement' | 'securite';

export type Phase = 'welcome' | 'intro' | 'simulator' | 'debrief';

export interface Feedback {
  /** « À court terme : … » */
  shortTerm: string;
  /** « Ce que ton cerveau pourrait apprendre : … » */
  brainLearning: string;
  /** « Une nuance importante : … » */
  nuance: string;
}

export interface Choice {
  category: Category;
  /** Texte concret de l'option proposée. */
  text: string;
  /** Intitulé court de l'habitude, pour les comportements d'évitement / de sécurité. */
  habit?: string;
  feedback: Feedback;
}

export interface Scenario {
  id: number;
  /** Numéro affiché (1 à 8). */
  index: number;
  /** Titre court, utilisé dans les récapitulatifs. */
  title: string;
  /** Énoncé de la situation. */
  situation: string;
  /** Note de sécurité (médicale, routière…) affichée sous la situation. */
  note?: string;
  /** Ordre fixe : A = évitement, B = sécurité. */
  choices: [Choice, Choice];
}

export interface FirstStepData {
  /** Id du scénario dont l'habitude a été choisie à observer. */
  habitScenarioId: number | null;
  situationText: string;
  goal: string;
  goalOther: string;
  step: string;
}

export interface AppState {
  phase: Phase;
  currentIndex: number;
  /** Index du choix retenu par situation (0 = A, 1 = B, 2 = C), ou null. */
  answers: (number | null)[];
  firstStep: FirstStepData;
  prenom: string;
}

export interface CategoryMeta {
  label: string;
  /** Intitulé générique du type de réaction. */
  kind: string;
  colorVar: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  evitement: {
    label: 'évitement',
    kind: 'Je cherche à éviter',
    colorVar: 'var(--terracotta)',
  },
  securite: {
    label: 'sécurité',
    kind: 'Je cherche à me rassurer',
    colorVar: 'var(--rose)',
  },
};
