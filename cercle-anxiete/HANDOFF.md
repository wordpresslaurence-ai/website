# Fiche de passation — « Le cercle de l'anxiété »

Ce document permet à toute personne (ou à un assistant comme ChatGPT / Codex) de
**comprendre et modifier** l'application sans contexte préalable. Lis-le en
entier avant de toucher au code.

---

## 1. En une phrase

Application web interactive, en français, de **Marjorie Goubin** (thérapeute
spécialisée en gestion de l'anxiété). Elle remplace un mini-guide PDF par un
**simulateur** : l'utilisateur traverse 8 situations, choisit à chaque fois la
réaction qui lui ressemble, et reçoit un débrief pédagogique et bienveillant.

> Application **informative** : aucun diagnostic, ne remplace pas une thérapie.
> **Aucune donnée n'est envoyée en ligne** — tout reste dans le navigateur.

---

## 2. Où se trouve le projet

- **Dépôt GitHub** : `wordpresslaurence-ai/website`
- **Branche** : `claude/cercle-anxiete-app-fq6qd4`
- **Sous-dossier** : `cercle-anxiete/` (le reste du dépôt est un autre site,
  « Home Harmony », **sans aucun lien** avec cette app — ne pas y toucher)
- **Pull request** : #1

Tout ce qui concerne cette application est **exclusivement** dans
`cercle-anxiete/`.

---

## 3. Pile technique

- **React 18** + **TypeScript**
- **Vite** (build) — voir `package.json`
- **CSS moderne** écrit à la main (aucune librairie de composants ni de graphes)
- Visualisation (trajectoire des choix) en **SVG** fait main
- **localStorage** pour la mémoire du parcours — pas de base de données, pas
  d'API, pas de clé, pas d'authentification, pas de collecte de données

### Lancer le projet

```bash
cd cercle-anxiete
npm install
npm run dev       # http://localhost:5173 (développement)
npm run build     # build de production dans dist/
npm run preview   # prévisualise le build
```

`vite.config.ts` fixe `base: './'` : le dossier `dist/` est **relatif** et se
dépose tel quel chez n'importe quel hébergeur statique.

---

## 4. Le parcours de l'utilisateur (machine à états)

Géré dans `src/App.tsx` via un `useReducer` (`src/state/appState.ts`).
La phase courante est l'une de : `welcome` → `intro` → `simulator` → `debrief`.

1. **Welcome** (`Welcome.tsx`) — écran d'accueil : titre, cercle ouvert
   décoratif, bouton « Commencer l'expérience ». Si une partie est en cours
   (localStorage), propose de **reprendre** ou **recommencer**.
2. **Introduction** (`Introduction.tsx`) — accueil guidé en **2 étapes** :
   « Pourquoi la peur persiste-t-elle ? » puis « Deux habitudes à observer »
   (évitement / sécurité, avec exemples). Bouton final « J'ai compris, commencer ».
3. **Simulator** (`AnxietySimulator.tsx`) — le cœur. Pour chacune des **8
   situations** :
   - à gauche : l'énoncé, **2 choix** (A = évitement, B = sécurité), puis le
     **feedback pédagogique** après le choix ;
   - à droite : **2 indicateurs** (`Indicators.tsx`) — « Soulagement immédiat »
     (selon le choix courant) et « Anxiété de fond (long terme) » (jauge qui
     augmente avec le nombre d'habitudes accumulées) ;
   - navigation : « Situation précédente » (modifiable) / « Situation suivante ».
4. **Debrief** (composé dans `App.tsx`) — enchaîne :
   `PersonalizedDebrief` (2 cartes + synthèse) → `LearningTrajectory` (courbe
   SVG des 8 choix) → `BeforeAfter` → `FirstSmallStep` (choisir une habitude à
   observer) → `PrintableSummary` (récapitulatif imprimable) → `AboutMarjorie`
   → `ProgramCTA` → et, en pied de page permanent, `SafetyNotice`.

---

## 5. Modèle de données et contenu (LE PLUS IMPORTANT)

Presque tout le **texte** vit dans deux fichiers de données — pas dans les
composants.

### `src/data/scenarios.ts`
Les **8 situations**. Chaque situation a :
- `title`, `situation` (l'énoncé) ;
- `note` (optionnelle) : message de **sécurité** affiché sous l'énoncé
  (symptôme médical, traitement prescrit, sécurité routière, relaxation) ;
- `choices` : **exactement 2** — index `0` = évitement, index `1` = sécurité.
  Chaque choix a `text`, un `habit` (intitulé court, utilisé plus tard), et un
  `feedback` en 3 lignes : `shortTerm`, `brainLearning`, `nuance`.

### `src/data/content.ts`
- `CATEGORY_CARD` : titres/explications des cartes du débrief.
- `DOMINANT_MESSAGE` : messages de synthèse selon la tendance
  (`evitement` / `securite` / `equilibre`).
- `BEFORE_AFTER` : les lignes « Aujourd'hui → Progressivement ».
- `FIRST_STEP_GOALS` / `FIRST_STEP_SUGGESTIONS` : options du « premier petit pas ».

### `src/config.ts`
Constantes faciles à modifier :
```ts
export const PROGRAM_URL = 'https://marjorie-goubin.com/mes-programmes/';
export const WEBSITE_URL = 'https://www.marjorie-goubin.com';
export const STORAGE_KEY = 'cercle-anxiete:v2';
```

### `src/types.ts`
Les types. **`Category = 'evitement' | 'securite'`** (deux catégories
uniquement). `CATEGORY_META` fait le lien catégorie → libellé, intitulé du
choix, couleur.

### `src/utils/scoring.ts`
Tous les calculs, **strictement déterministes** (deux parcours identiques
donnent le même résultat) : comptages, tendance dominante, niveau de
soulagement immédiat, jauge d'anxiété de fond.

---

## 6. Règles et décisions à respecter absolument

Ces choix sont volontaires ; ne pas les casser sans raison.

1. **Deux choix seulement** par situation : évitement et sécurité. *(Il y avait
   au départ une 3ᵉ voie « réponse progressive » ; elle a été retirée pour
   coller au PDF. Ne pas la réintroduire sans demande explicite.)*
2. **Aucun score clinique.** Les indicateurs sont pédagogiques et portent
   toujours la mention « ce n'est pas une mesure de ton niveau d'anxiété ».
3. **Sécurité médicale.** Ne jamais suggérer d'arrêter un traitement, de
   conduire dans un état dangereux, de considérer un symptôme comme forcément
   anxieux, etc. Les `note` des situations 3, 4, 7, 8 portent ces garde-fous —
   les conserver.
4. **Ton bienveillant**, sans vocabulaire de victoire/échec, sans culpabilisation.
   Le vert n'est pas « la bonne réponse », le terracotta n'est pas une faute.
5. **Respiration / méditation / soutien** ne sont pas présentés comme mauvais :
   c'est leur caractère *automatique, rigide, indispensable* qui est observé.
6. **Tout en local** (localStorage), aucune donnée envoyée en ligne, aucun e-mail
   demandé pour le récapitulatif.
7. **Déterminisme** : pas de hasard dans les calculs.
8. **Accessibilité** : texte ≥ 16 px, contraste AA, cibles ≥ 44 px, navigation
   clavier, focus visible, `prefers-reduced-motion` respecté, équivalents
   textuels des visuels.

---

## 7. Charte graphique

Définie en variables CSS dans `src/styles/global.css` (`:root`). Palette :
crème, pêche, **terracotta** (évitement), **rose** (sécurité), sauge, etc.
Pas de mode sombre automatique ; pas de rouge vif.

Typographies (`src/styles/fonts.css`) : `Nourd` (corps/titres), `Mistrully`
(manuscrit), `TT Norms Pro` (petits éléments). Les fichiers de police ne sont
**pas** fournis : des polices de repli sont utilisées automatiquement
(Nourd → Nunito Sans, Mistrully → Caveat, TT Norms Pro → Manrope), **sans aucune
requête externe**. Pour installer les vraies polices : déposer les `.woff2` dans
`src/fonts/` et décommenter les `@font-face`.

---

## 8. Recettes d'édition courantes

- **Changer le lien des programmes** → `src/config.ts` (`PROGRAM_URL`).
- **Modifier une situation / un feedback** → `src/data/scenarios.ts`.
- **Modifier les textes du débrief / avant-après** → `src/data/content.ts`.
- **Changer les couleurs** → variables dans `:root` de `src/styles/global.css`.
- **Modifier l'accueil / l'intro** → `src/components/Welcome.tsx` /
  `Introduction.tsx`.
- **Modifier la présentation de Marjorie** → `src/components/AboutMarjorie.tsx`
  (contient un portrait de remplacement à remplacer par une vraie photo).
- **Ajouter les vraies polices** → voir §7.

Après toute modification : `npm run build` doit passer sans erreur (le
TypeScript strict + `tsc` valident le tout).

---

## 9. Limitations connues

- Le **récapitulatif** s'obtient via la **fonction d'impression du navigateur**
  (→ « Enregistrer en PDF »). Dans un **aperçu intégré (iframe)**, le navigateur
  bloque l'impression et les téléchargements — c'est normal ; sur le site
  déployé, le bouton fonctionne. Une note ne s'affiche que dans ce cas
  d'aperçu (voir `PrintableSummary.tsx`).
- Les fichiers de police réels ne sont pas inclus (repli automatique).
- Le portrait de Marjorie est un placeholder SVG.

---

## 10. Carte des fichiers

```
cercle-anxiete/
├── index.html                 # point d'entrée Vite
├── package.json               # scripts & dépendances
├── vite.config.ts             # base: './'
├── tsconfig*.json             # TypeScript strict
├── README.md                  # démarrage rapide
├── HANDOFF.md                 # ce document
└── src/
    ├── main.tsx               # montage React + import des CSS
    ├── App.tsx                # machine à états (phases) + persistance
    ├── config.ts              # PROGRAM_URL, WEBSITE_URL, clé localStorage
    ├── types.ts               # types + métadonnées des catégories
    ├── data/
    │   ├── scenarios.ts       # LES 8 SITUATIONS (2 choix chacune)
    │   └── content.ts         # débrief, avant/après, premier petit pas
    ├── state/appState.ts      # reducer + load/save localStorage (garde-fous)
    ├── utils/scoring.ts       # calculs déterministes
    ├── hooks/useReducedMotion.ts
    ├── styles/                # global.css (charte), print.css, fonts.css
    └── components/
        ├── Welcome.tsx            AnxietySimulator.tsx   ScenarioCard.tsx
        ├── ResponseChoice.tsx     EducationalFeedback.tsx  Indicators.tsx
        ├── Introduction.tsx       PersonalizedDebrief.tsx  LearningTrajectory.tsx
        ├── BeforeAfter.tsx        FirstSmallStep.tsx       PrintableSummary.tsx
        ├── AboutMarjorie.tsx      ProgramCTA.tsx           SafetyNotice.tsx
```

---

## 11. À copier-coller si tu confies l'app à un assistant

> Voici une application web React + TypeScript (Vite) nommée « Le cercle de
> l'anxiété », de la thérapeute Marjorie Goubin. Tout le code est dans le
> dossier `cercle-anxiete/`. Lis d'abord `cercle-anxiete/HANDOFF.md` : il
> décrit le but, l'architecture, le modèle de données et les règles à
> respecter (2 choix par situation — évitement/sécurité, aucun score clinique,
> garde-fous médicaux, ton bienveillant, tout en localStorage). Le texte des
> situations est dans `src/data/scenarios.ts`, les autres contenus dans
> `src/data/content.ts`, les liens dans `src/config.ts`. Pour lancer :
> `cd cercle-anxiete && npm install && npm run dev`. Ne modifie pas le reste du
> dépôt (site « Home Harmony », sans rapport). Voici ma demande : …
