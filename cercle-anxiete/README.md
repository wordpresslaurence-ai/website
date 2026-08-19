# Le cercle de l’anxiété

Expérience web interactive, en français, de **Marjorie Goubin** — thérapeute
spécialisée en gestion de l’anxiété ([marjorie-goubin.com](https://www.marjorie-goubin.com)).

Elle remplace le mini-guide PDF *« Ces habitudes qui entretiennent les
angoisses »* par un simulateur : l’utilisateur traverse huit situations
concrètes, choisit à chaque fois la réaction qui lui ressemble le plus, et voit
en direct l’effet de ce choix sur une visualisation du « cercle de l’anxiété ».

> Application **informative**. Elle ne pose aucun diagnostic et ne remplace pas
> une thérapie. Aucune donnée n’est envoyée en ligne : tout reste dans le
> navigateur (`localStorage`).

## Pile technique

- React 18 + TypeScript
- Vite
- CSS moderne (aucune bibliothèque de composants)
- Visualisations en **SVG** animé (aucune librairie graphique lourde)
- `localStorage` pour la mémoire du parcours — aucune base de données, aucune
  API, aucune clé, aucune authentification, aucune collecte de données

## Démarrer

```bash
cd cercle-anxiete
npm install
npm run dev      # serveur de développement
npm run build    # build de production dans dist/
npm run preview  # prévisualise le build
```

Le build (`base: './'`) est **relatif** : le dossier `dist/` peut être déposé
tel quel chez n’importe quel hébergeur statique, y compris dans un sous-dossier.

## À personnaliser

- **Lien du programme** : dans `src/config.ts`, remplace
  `PROGRAM_URL = "URL_DU_PROGRAMME"` par l’URL réelle.
  `WEBSITE_URL` pointe déjà vers le site de Marjorie.
- **Polices** : les déclarations `@font-face` sont préparées dans
  `src/styles/fonts.css`. Dépose les fichiers dans `src/fonts/`
  (`Nourd-Regular`, `Nourd-Bold`, `Mistrully-Regular`, `TTNormsPro-Bold`,
  format `.woff2` recommandé) puis décommente les blocs correspondants.
  En attendant, des polices de repli sont utilisées automatiquement
  (Nourd → Nunito Sans, Mistrully → Caveat, TT Norms Pro → Manrope), sans
  aucune requête externe.
- **Portrait de Marjorie** : `src/components/AboutMarjorie.tsx` contient un
  visuel de remplacement ; remplace le bloc `.portrait` par une balise `<img>`.

## Structure

```
src/
  config.ts                 # PROGRAM_URL, WEBSITE_URL, clé localStorage
  types.ts                  # types + métadonnées des catégories
  data/scenarios.ts         # les 8 situations et leurs retours pédagogiques
  data/content.ts           # débrief, avant/après, premier petit pas
  state/appState.ts         # reducer + persistance localStorage
  utils/scoring.ts          # calculs déterministes (comptages, tendances)
  hooks/useReducedMotion.ts # respect de prefers-reduced-motion
  styles/                   # charte graphique + feuille d'impression
  components/               # Welcome, Introduction, AnxietySimulator,
                            # ScenarioCard, ResponseChoice, EducationalFeedback,
                            # OrganicCircle, Indicators, LearningTrajectory,
                            # PersonalizedDebrief, BeforeAfter, FirstSmallStep,
                            # PrintableSummary, AboutMarjorie, ProgramCTA,
                            # SafetyNotice
```

## Accessibilité

Corps de texte ≥ 16 px, contraste AA, zones tactiles ≥ 44 px, navigation
clavier complète, focus visible, statut de progression annoncé aux lecteurs
d’écran, équivalents textuels de toutes les informations graphiques,
`prefers-reduced-motion` respecté, animations décoratives `aria-hidden`.
