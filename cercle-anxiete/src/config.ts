// -----------------------------------------------------------------------------
// Constantes facilement modifiables
// -----------------------------------------------------------------------------
// Lien vers les programmes en ligne de Marjorie.
export const PROGRAM_URL = 'https://marjorie-goubin.com/mes-programmes/';
export const WEBSITE_URL = 'https://www.marjorie-goubin.com';

// Clé de stockage local (aucune donnée n'est envoyée en ligne).
// v2 : le modèle de données est passé à 2 choix par situation (évitement /
// sécurité). Le changement de clé neutralise toute partie enregistrée avec
// l'ancien modèle à 3 choix, qui ferait planter la lecture des réponses.
export const STORAGE_KEY = 'cercle-anxiete:v2';
