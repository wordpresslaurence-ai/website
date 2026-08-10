# Studio Horizon

Assistant de recherche personnel, **guidé par copier-coller avec ChatGPT** — sans API, sans frais, données locales.

## Idée

Studio Horizon n'appelle aucune API et ne dépense rien. Il te fait gagner du temps en préparant les bonnes consignes pour ChatGPT, puis en rangeant les réponses :

1. Tu écris ta question → l'application prépare une **consigne complète** (recherche Web + citations + format structuré).
2. Un bouton **copie la consigne et ouvre ChatGPT**. Tu la colles, tu lances la recherche.
3. Tu recolles la réponse → Studio Horizon en fait une **fiche** (titre, résumé, points clés, sources, mots-clés) **enregistrée sur ton appareil**.

## Les quatre espaces

- **Parcours** *(page d'accueil)* — le plan d'étude « Construire l'app Prana & les cinq Vayus », module par module, avec suivi de progression, statut des vidéos et consignes prêtes à copier.
- **Assistant** — préparer une recherche et créer une fiche.
- **Mes fiches** — retrouver, rechercher, copier, exporter/importer tes fiches. Chaque fiche est **repliée par défaut** (titre + ~3 lignes avec un fondu) et se déplie au clic.
- **Veille du vendredi** — préparer une consigne pour te faire recommander 3 vidéos (apprendre / pratiquer / ouvrir) et enregistrer le résultat. Le vendredi, un **rappel** apparaît automatiquement.

## Application installable (PWA)

Le site est une **Progressive Web App** : sur mobile (Android/Chrome) un bouton « Installer l'app » apparaît, et l'application s'ajoute à l'écran d'accueil avec son icône, en plein écran, et s'ouvre même hors connexion. Sur iPhone : *Partager → Sur l'écran d'accueil*.

## Contenu du dépôt

- `index.html` — la page unique de l'application (4 espaces).
- `css/style.css` — la feuille de style (verre dépoli sur crème chaud, soleil orange ; thème clair + sombre automatique).
- `js/app.js` — toute la logique (aucune dépendance, aucun outil de build).
- `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-maskable.svg` — les fichiers de la PWA.

Il suffit d'ouvrir `index.html` dans un navigateur, ou de déposer les fichiers chez n'importe quel hébergeur statique (Netlify, Cloudflare Pages, GitHub Pages…). L'installation PWA et la copie automatique nécessitent que le site soit servi en **HTTPS**.

## Où sont mes données ?

Tout est stocké dans le `localStorage` de ton navigateur (rien n'est envoyé sur Internet). Utilise **Exporter** dans « Mes fiches » pour en garder une sauvegarde, et **Réinitialiser** en bas de page pour tout effacer.
