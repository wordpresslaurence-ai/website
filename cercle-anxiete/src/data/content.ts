import type { Category } from '../types';

// -----------------------------------------------------------------------------
// Explications par catégorie (cartes du débrief).
// -----------------------------------------------------------------------------
export const CATEGORY_CARD: Record<
  Category,
  { title: string; explanation: string }
> = {
  evitement: {
    title: 'Réactions d’évitement',
    explanation:
      'L’évitement fait retomber la tension en s’éloignant de la situation. Utile ponctuellement, il peut réduire peu à peu ton champ d’action s’il devient systématique.',
  },
  securite: {
    title: 'Réactions de sécurité',
    explanation:
      'Les comportements de sécurité rendent une situation possible grâce à une précaution ou une réassurance. Ils méritent d’être observés lorsqu’ils semblent devenir indispensables.',
  },
};

// -----------------------------------------------------------------------------
// Message de synthèse selon la tendance dominante (déterministe).
// -----------------------------------------------------------------------------
export type Dominant = Category | 'equilibre';

export const DOMINANT_MESSAGE: Record<Dominant, string> = {
  evitement:
    'L’évitement semble être une stratégie importante pour toi. C’est compréhensible : il permet souvent de faire retomber rapidement la tension. Tu pourrais commencer par observer les situations que tu évites et le soulagement que tu ressens juste après.',
  securite:
    'Tu sembles souvent chercher à te rassurer ou à garder une solution de secours. Ces stratégies peuvent être utiles ponctuellement. Observe surtout si elles sont devenues indispensables pour te sentir capable d’avancer.',
  equilibre:
    'Tes réactions varient selon les situations : tu évites certaines expériences et cherches à te rassurer dans d’autres. C’est souvent le cas — ces deux stratégies soulagent sur le moment, tout en pouvant entretenir la peur sur le long terme.',
};

// -----------------------------------------------------------------------------
// Section « À quoi pourrait ressembler une vie moins dirigée par la peur ? »
// -----------------------------------------------------------------------------
export const BEFORE_AFTER: { before: string; after: string }[] = [
  {
    before: 'Tu évites les lieux fréquentés',
    after:
      'Tu retrouves progressivement davantage de liberté dans tes déplacements.',
  },
  {
    before: 'Tu déclines des invitations',
    after:
      'Tu peux accepter certaines sorties sans attendre de ne plus rien ressentir.',
  },
  {
    before: 'Voyager t’inquiète',
    after: 'Tu peux préparer un séjour avec davantage d’enthousiasme.',
  },
  {
    before: 'Tu redoutes de conduire',
    after: 'Tu reconstruis progressivement ta confiance sur certains trajets.',
  },
  {
    before: 'Être seul·e t’inquiète',
    after:
      'Tu développes une plus grande confiance dans ta capacité à traverser un moment difficile.',
  },
  {
    before: 'Tu surveilles constamment ton état',
    after:
      'Tu apprends progressivement à laisser certaines sensations évoluer sans les contrôler.',
  },
  {
    before: 'Tu vis sur le qui-vive',
    after: 'Tu retrouves davantage d’espace, de calme et de spontanéité.',
  },
];

// -----------------------------------------------------------------------------
// Section « Mon premier petit pas ».
// -----------------------------------------------------------------------------
export const FIRST_STEP_GOALS: string[] = [
  'faire baisser immédiatement une sensation',
  'éviter une crise',
  'être certain·e d’être en sécurité',
  'ne pas être seul·e',
  'contrôler l’imprévu',
  'autre',
];

export const FIRST_STEP_SUGGESTIONS: string[] = [
  'Simplement noter quand cette habitude apparaît',
  'Attendre quelques instants avant d’y recourir automatiquement',
  'Distinguer ce qui est réellement nécessaire de ce qui sert principalement à obtenir une certitude',
  'En parler avec un thérapeute',
  'Construire une progression adaptée avec un professionnel',
];
