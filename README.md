# Studio Horizon

Assistant de recherche personnel, **guidé par copier-coller avec ChatGPT** — sans API, sans frais, données locales.

## Idée

Studio Horizon n'appelle aucune API et ne dépense rien. Il te fait gagner du temps en préparant les bonnes consignes pour ChatGPT, puis en rangeant les réponses :

1. Tu écris ta question → l'application prépare une **consigne complète** (recherche Web + citations + format structuré).
2. Un bouton **copie la consigne et ouvre ChatGPT**. Tu la colles, tu lances la recherche.
3. Tu recolles la réponse → Studio Horizon en fait une **fiche** (titre, résumé, points clés, sources, mots-clés) **enregistrée sur ton appareil**.

## Les quatre espaces

- **Assistant** — préparer une recherche et créer une fiche.
- **Mes fiches** — retrouver, rechercher, copier, exporter/importer tes fiches (stockées en local).
- **Veille du vendredi** — préparer une consigne pour te faire recommander 3 vidéos (apprendre / pratiquer / ouvrir) et enregistrer le résultat.
- **Parcours** — le plan d'étude « Construire l'app Prana & les cinq Vayus », module par module, avec suivi de progression, statut des vidéos et consignes prêtes à copier.

## Contenu du dépôt

- `index.html` — la page unique de l'application (4 espaces).
- `css/style.css` — la feuille de style (ambiance zen, thème clair + sombre automatique).
- `js/app.js` — toute la logique (aucune dépendance, aucun outil de build).

Il suffit d'ouvrir `index.html` dans un navigateur, ou de déposer les fichiers chez n'importe quel hébergeur statique (Netlify, Cloudflare Pages, GitHub Pages…).

## Où sont mes données ?

Tout est stocké dans le `localStorage` de ton navigateur (rien n'est envoyé sur Internet). Utilise **Exporter** dans « Mes fiches » pour en garder une sauvegarde, et **Réinitialiser** en bas de page pour tout effacer.

> Note : la copie automatique dans le presse-papiers et l'ouverture de ChatGPT fonctionnent mieux quand le site est servi en HTTPS (hébergé) qu'ouvert en simple fichier local. En local, si la copie échoue, sélectionne le texte et fais Ctrl+C.
