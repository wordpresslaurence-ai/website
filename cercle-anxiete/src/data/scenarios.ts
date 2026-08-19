import type { Scenario } from '../types';

// -----------------------------------------------------------------------------
// Les huit situations.
// Ordre des choix toujours identique : A = évitement, B = sécurité.
// Contenus rédigés, sans texte de remplissage. Calculs entièrement déterministes.
// -----------------------------------------------------------------------------

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    index: 1,
    title: 'Le métro fréquenté',
    situation: 'Tu dois prendre un métro assez fréquenté.',
    choices: [
      {
        category: 'evitement',
        text: 'Je renonce au trajet ou je cherche immédiatement un autre moyen de transport.',
        habit: 'Éviter le métro et les transports fréquentés',
        feedback: {
          shortTerm:
            'Renoncer au trajet peut faire retomber rapidement la tension.',
          brainLearning:
            '« Le métro devait vraiment être évité pour que je me sente en sécurité. »',
          nuance:
            'Éviter une fois n’a rien de grave. C’est la répétition systématique qui peut, peu à peu, réduire ton champ d’action.',
        },
      },
      {
        category: 'securite',
        text: 'Je monte uniquement si quelqu’un m’accompagne ou si je reste près de la sortie.',
        habit: 'Prendre le métro seulement bien accompagné·e ou près de la sortie',
        feedback: {
          shortTerm:
            'Cette précaution peut te permettre de prendre le métro malgré la tension.',
          brainLearning:
            '« Je n’aurais pas pu prendre le métro sans cette protection. »',
          nuance:
            'Une précaution n’est pas mauvaise en soi. Observe simplement si elle est devenue indispensable pour oser y aller.',
        },
      },
    ],
  },

  {
    id: 2,
    index: 2,
    title: 'L’invitation au restaurant',
    situation: 'Une amie t’invite au restaurant ce soir.',
    choices: [
      {
        category: 'evitement',
        text: 'J’annule par peur de ressentir une crise.',
        habit: 'Annuler les invitations par peur d’une crise',
        feedback: {
          shortTerm:
            'Annuler soulage sur le moment : la source d’inquiétude disparaît.',
          brainLearning:
            '« Cette soirée représentait un vrai danger pour moi. »',
          nuance:
            'Décliner ponctuellement est humain. Observe si l’annulation devient ta réponse automatique à chaque invitation.',
        },
      },
      {
        category: 'securite',
        text: 'J’accepte seulement si je peux partir immédiatement ou être constamment rassuré·e.',
        habit: 'Sortir seulement avec une porte de sortie permanente',
        feedback: {
          shortTerm:
            'Garder une porte de sortie peut rendre la soirée possible.',
          brainLearning:
            '« Je ne tiendrais pas sans pouvoir partir à tout instant. »',
          nuance:
            'Ces aménagements peuvent être utiles au début. Surveille surtout s’ils deviennent une condition obligatoire.',
        },
      },
    ],
  },

  {
    id: 3,
    index: 3,
    title: 'Le cœur qui s’accélère',
    situation: 'Tu sens ton cœur s’accélérer.',
    note: 'Si une sensation est nouvelle, inhabituelle ou médicalement préoccupante, il est légitime de demander un avis médical. Cette expérience ne permet pas de déterminer l’origine d’un symptôme.',
    choices: [
      {
        category: 'evitement',
        text: 'J’arrête immédiatement ce que je suis en train de faire.',
        habit: 'Tout arrêter dès que le cœur s’accélère',
        feedback: {
          shortTerm:
            'Tout arrêter fait souvent redescendre la sensation rapidement.',
          brainLearning:
            '« Cette accélération était le signe qu’il fallait vite tout stopper. »',
          nuance:
            'S’arrêter est parfois nécessaire. Observe si c’est la seule réponse possible dès que ton cœur s’emballe.',
        },
      },
      {
        category: 'securite',
        text: 'Je vérifie plusieurs fois mon pouls, ma respiration ou mes symptômes.',
        habit: 'Surveiller mon pouls, ma respiration ou mes symptômes',
        feedback: {
          shortTerm:
            'Vérifier peut apaiser un court instant en donnant une impression de contrôle.',
          brainLearning:
            '« Sans cette surveillance, quelque chose de grave pourrait m’échapper. »',
          nuance:
            'Une vérification ponctuelle est logique. La surveillance répétée, elle, entretient souvent l’attention portée aux sensations.',
        },
      },
    ],
  },

  {
    id: 4,
    index: 4,
    title: 'Le week-end loin de chez toi',
    situation: 'Tu prépares un week-end loin de chez toi.',
    note: 'Emporter un traitement prescrit n’est pas un comportement problématique. Ne modifie jamais un traitement sans avis médical.',
    choices: [
      {
        category: 'evitement',
        text: 'Je renonce au voyage ou je reste très près de chez moi.',
        habit: 'Renoncer aux voyages ou rester près de chez moi',
        feedback: {
          shortTerm:
            'Rester près de chez toi fait retomber l’appréhension liée à l’éloignement.',
          brainLearning:
            '« M’éloigner de chez moi était réellement risqué. »',
          nuance:
            'Choisir la proximité de temps en temps est légitime. Observe si l’éloignement devient impossible à envisager.',
        },
      },
      {
        category: 'securite',
        text: 'Je prépare de nombreuses solutions « au cas où » pour essayer d’éliminer toute incertitude.',
        habit: 'Multiplier les précautions « au cas où »',
        feedback: {
          shortTerm:
            'Multiplier les précautions peut apaiser en donnant l’impression de tout maîtriser.',
          brainLearning:
            '« Je ne peux partir que si j’ai éliminé le moindre imprévu. »',
          nuance:
            'Se préparer est utile. C’est la quête d’une certitude totale qui peut, elle, entretenir l’inquiétude.',
        },
      },
    ],
  },

  {
    id: 5,
    index: 5,
    title: 'Seul·e à la maison',
    situation: 'Tu es seul·e à la maison et tu sens l’angoisse monter.',
    choices: [
      {
        category: 'evitement',
        text: 'Je quitte immédiatement la maison ou j’évite de rester seul·e.',
        habit: 'Éviter de rester seul·e à la maison',
        feedback: {
          shortTerm:
            'Sortir ou ne pas rester seul·e fait souvent baisser la tension rapidement.',
          brainLearning:
            '« Rester seul·e avec ces sensations était dangereux. »',
          nuance:
            'Chercher de la compagnie n’a rien de problématique. Observe si la solitude devient impossible à traverser.',
        },
      },
      {
        category: 'securite',
        text: 'J’appelle systématiquement quelqu’un pour qu’il me rassure jusqu’à ce que la sensation disparaisse.',
        habit: 'Appeler quelqu’un jusqu’à ce que la sensation passe',
        feedback: {
          shortTerm:
            'Être rassuré·e par un proche peut apaiser sur le moment.',
          brainLearning:
            '« Sans l’intervention de quelqu’un, la sensation ne s’arrêterait pas. »',
          nuance:
            'S’appuyer sur un proche est précieux. Surveille si l’appel devient le seul moyen de faire redescendre chaque sensation.',
        },
      },
    ],
  },

  {
    id: 6,
    index: 6,
    title: 'Une pensée anxieuse',
    situation: 'Une pensée anxieuse surgit brusquement.',
    choices: [
      {
        category: 'evitement',
        text: 'J’évite tout ce qui pourrait me rappeler cette pensée.',
        habit: 'Éviter tout ce qui rappelle une pensée anxieuse',
        feedback: {
          shortTerm:
            'Éviter les déclencheurs éloigne la pensée pour un temps.',
          brainLearning:
            '« Cette pensée était trop dangereuse pour être simplement là. »',
          nuance:
            'S’éloigner ponctuellement d’un sujet est normal. L’évitement large, lui, peut réduire ce que tu t’autorises à faire.',
        },
      },
      {
        category: 'securite',
        text: 'Je prends immédiatement mon téléphone ou je cherche une certitude pour faire disparaître la pensée.',
        habit: 'Chercher une certitude immédiate pour chasser une pensée',
        feedback: {
          shortTerm:
            'Chercher une certitude soulage brièvement en occupant l’esprit.',
          brainLearning:
            '« Je dois obtenir une réponse immédiate pour que cette pensée s’arrête. »',
          nuance:
            'Se renseigner peut être utile. La recherche répétée de certitude, elle, tend souvent à nourrir le doute.',
        },
      },
    ],
  },

  {
    id: 7,
    index: 7,
    title: 'Conduire sur un trajet qui inquiète',
    situation: 'Tu dois conduire sur un trajet qui t’inquiète.',
    note: 'La sécurité routière reste prioritaire. Ne conduis pas si ton état ou un traitement rend la conduite dangereuse.',
    choices: [
      {
        category: 'evitement',
        text: 'J’évite complètement le trajet.',
        habit: 'Éviter les trajets en voiture qui m’inquiètent',
        feedback: {
          shortTerm:
            'Renoncer au trajet supprime immédiatement l’appréhension.',
          brainLearning:
            '« Ce trajet était réellement au-dessus de mes capacités. »',
          nuance:
            'Renoncer une fois est parfois raisonnable. Observe si l’évitement s’étend peu à peu à d’autres trajets.',
        },
      },
      {
        category: 'securite',
        text: 'Je conduis uniquement si certaines conditions rassurantes sont réunies.',
        habit: 'Conduire seulement sous conditions rassurantes',
        feedback: {
          shortTerm:
            'Réunir des conditions rassurantes peut rendre le trajet possible.',
          brainLearning:
            '« Je ne pourrais pas conduire sans que tout soit parfaitement réuni. »',
          nuance:
            'Des conditions favorables sont utiles. Surveille si elles deviennent des exigences sans lesquelles tu ne prends plus le volant.',
        },
      },
    ],
  },

  {
    id: 8,
    index: 8,
    title: 'La peur d’avoir peur',
    situation: 'L’angoisse monte et la peur d’avoir peur revient.',
    note: 'Respirer, méditer ou chercher du soutien ne sont pas de mauvaises réactions. L’objectif est d’observer si ces ressources t’aident avec souplesse ou si elles sont devenues indispensables pour éliminer chaque sensation.',
    choices: [
      {
        category: 'evitement',
        text: 'Je quitte immédiatement la situation.',
        habit: 'Quitter immédiatement une situation quand la peur monte',
        feedback: {
          shortTerm:
            'Partir met fin à la montée de la vague presque aussitôt.',
          brainLearning:
            '« Je n’aurais pas tenu face à cette vague si j’étais resté·e. »',
          nuance:
            'Se retirer d’une situation est parfois nécessaire. Observe si c’est devenu ta seule réponse à la peur d’avoir peur.',
        },
      },
      {
        category: 'securite',
        text: 'Je répète compulsivement des phrases ou des techniques jusqu’à obtenir la certitude que tout va bien.',
        habit: 'Répéter des techniques jusqu’à être certain·e que tout va bien',
        feedback: {
          shortTerm:
            'Répéter une technique peut apaiser tant qu’on la maintient.',
          brainLearning:
            '« La vague ne s’arrêtera que si j’applique parfaitement mes techniques. »',
          nuance:
            'Une technique d’apaisement est une ressource. C’est son usage compulsif, pour supprimer chaque sensation, qui mérite d’être observé.',
        },
      },
    ],
  },
];

export const TOTAL_SCENARIOS = SCENARIOS.length;
