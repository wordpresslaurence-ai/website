# AGENTS.md — App Builder

Instructions pour tout assistant (Codex, ChatGPT, Claude…) amené à lire ou modifier ce projet.

## Le projet
**App Builder** : un assistant de recherche personnel, **guidé par copier-coller avec ChatGPT**. Aucune API, aucun coût. Les données sont stockées **localement** dans le navigateur (localStorage). C'est un **site web statique** doublé d'une **PWA** installable.

## Comment ça tourne (aucun build)
- Ouvrir `index.html` dans un navigateur **ou** déposer le dossier tel quel sur un hébergeur statique (Cloudflare Pages / Netlify / GitHub Pages).
- **Aucune dépendance, aucune étape de compilation.**
- HTTPS requis pour l'installation PWA et la copie dans le presse-papiers.

## Carte des fichiers
- `index.html` — page unique, 5 espaces : **Parcours** (accueil), **Assistant**, **Mes fiches**, **Veille**, **Paramètres**.
- `css/style.css` — styles + variables de couleur (thèmes clair et sombre).
- `js/app.js` — toute la logique (navigation, génération des consignes, fiches, veille, parcours, thème jour/nuit, PWA).
- `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-maskable.svg` — fichiers de la PWA.
- `README.md` — présentation.

## Conventions
- **Français partout** : interface **et** commentaires de code.
- **JavaScript "vanilla"**, pas de framework. Un fichier = une responsabilité.
- Données locales sous des clés localStorage préfixées **`sh.`** : `sh.fiches`, `sh.veilles`, `sh.parcours`, `sh.theme`.
- Couleurs via **variables CSS** (`--cream`, `--ink`, `--sun-*`, `--eau`, `--lavande`, `--menu-bg`, `--breath`…), déclinées en clair et en sombre. Ne pas coder une couleur en dur dans un composant.
- Accessibilité : respecter `prefers-reduced-motion`, garder des focus visibles et les attributs `aria`.

## Concept clé — l'assistant copier-coller
1. L'utilisateur écrit une question.
2. L'app génère une **consigne** pour ChatGPT (recherche Web + sources + **format à étiquettes** : `TITRE:` / `RESUME:` / `POINTS CLES:` / `SOURCES:` / `MOTS-CLES:`).
3. L'utilisateur colle la réponse de ChatGPT.
4. La fonction `parseFiche()` en extrait une **fiche** structurée.

⚠️ **Ne pas casser ce format d'étiquettes** : le parseur (`parseFiche`, `parseVeille` dans `js/app.js`) en dépend.

## Règles de modification (important)
- **Ne pas réécrire ni redessiner** sans demande explicite : préserver le design, la structure et le contenu.
- Conserver l'arborescence et les chemins (`css/…`, `js/…`).
- Garder la **PWA fonctionnelle** (`manifest.webmanifest` + `sw.js`).
- Avant une modification structurante, **expliquer ce qui va changer** et attendre l'accord.
- **Tester après modification** : ouvrir `index.html`, vérifier la navigation entre les 5 espaces, créer une fiche (coller un texte au format à étiquettes ci-dessus), basculer **jour/nuit** dans Paramètres.
