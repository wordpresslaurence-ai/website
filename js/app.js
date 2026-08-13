/* =========================================================
   App Builder — logique de l'application
   Tout se passe dans le navigateur : aucune donnée n'est envoyée
   sur Internet. Les fiches, veilles et progression sont stockées
   dans le localStorage de l'appareil.
   ========================================================= */

'use strict';

/* ------------------------- Petits utilitaires ------------------------- */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const CHATGPT_URL = 'https://chatgpt.com/';

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// Copie un texte dans le presse-papiers, avec repli pour les contextes
// non sécurisés (fichier ouvert en local, par exemple).
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* on tente le repli ci-dessous */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) { return false; }
}

async function copyAndOpenChatGPT(text) {
  const ok = await copyText(text);
  toast(ok ? 'Consigne copiée — ouverture de ChatGPT…' : 'Copie impossible : sélectionne le texte et fais Ctrl+C.');
  window.open(CHATGPT_URL, '_blank', 'noopener');
}

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('sh.' + key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('sh.' + key, JSON.stringify(value)); }
    catch (e) { toast("Impossible d'enregistrer (stockage plein ou bloqué)."); }
  },
  remove(key) { try { localStorage.removeItem('sh.' + key); } catch (e) {} }
};

function todayLabel() {
  return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* ------------------------- Navigation entre vues ------------------------- */

function showView(name) {
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + name));
  $$('.nav-link').forEach(b => b.classList.toggle('is-active', b.dataset.view === name));
  $('#gearBtn')?.classList.toggle('is-active', name === 'parametres');
  const active = $('#view-' + name);
  if (active) { active.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  $('#mainNav').classList.remove('open');
  $('#navToggle').setAttribute('aria-expanded', 'false');
  // Les fiches ne peuvent être mesurées que lorsqu'elles deviennent visibles.
  if (name === 'fiches') measureFiches();
}

function initNav() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-view]');
    if (trigger) { e.preventDefault(); showView(trigger.dataset.view); }
  });
  const toggle = $('#navToggle');
  toggle.addEventListener('click', () => {
    const open = $('#mainNav').classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

/* ============================ ASSISTANT ============================ */

function buildResearchPrompt(question, type) {
  const consignes = {
    documentaire: "Cherche à comprendre le sujet en profondeur et donne une explication claire et neutre.",
    comparatif:   "Compare les principales options du sujet (avantages, limites, coût si pertinent) et dis laquelle convient à quel besoin.",
    pratique:     "Propose un guide « comment faire », en étapes concrètes et réalisables.",
    actualite:    "Concentre-toi sur ce qui est récent et sur ce qui a changé dernièrement ; date tes informations."
  };
  return (
`Tu es mon assistant de recherche. Effectue une recherche sur le Web public à jour au sujet ci-dessous, en t'appuyant sur des sources fiables et vérifiables — ne devine pas, cite tes sources.

SUJET :
« ${question} »

ORIENTATION :
${consignes[type] || consignes.documentaire}

CONSIGNES :
- Réponds en français, de façon claire, honnête et neutre.
- Appuie-toi sur des sources réelles et donne leurs liens complets.
- Si une information peut dater, précise-le.

FORMAT DE RÉPONSE — respecte EXACTEMENT ces étiquettes (une application va relire ta réponse) :
TITRE: <un titre court et parlant>
RESUME: <3 à 6 phrases qui résument l'essentiel>
POINTS CLES:
- <point 1>
- <point 2>
- <point 3>
SOURCES:
- <titre de la source> — <URL complète>
- <titre de la source> — <URL complète>
MOTS-CLES: <5 à 8 mots-clés séparés par des virgules>`);
}

function detectLabel(line) {
  const l = line.trim().toLowerCase().replace(/[*_`#]/g, '');
  if (/^titre\s*:/.test(l))                 return 'titre';
  if (/^r[ée]sum[ée]\s*:/.test(l))          return 'resume';
  if (/^points?\s*cl[ée]s?\s*:/.test(l))    return 'points';
  if (/^sources?\s*:/.test(l))              return 'sources';
  if (/^mots?[-\s]*cl[ée]s?\s*:/.test(l))   return 'motscles';
  return null;
}
function inlineValue(line) {
  const i = line.indexOf(':');
  return i === -1 ? '' : line.slice(i + 1).trim().replace(/^\*+|\*+$/g, '').trim();
}
function stripBullet(line) {
  return line.trim().replace(/^[-*•·]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
}
function splitKeywords(str) {
  return str.split(/[,;·•]/).map(s => s.trim().replace(/^[-*]\s*/, '')).filter(Boolean);
}
function addSource(f, line) {
  if (!line) return;
  const urlMatch = line.match(/https?:\/\/[^\s)>\]]+/);
  const url = urlMatch ? urlMatch[0] : '';
  let titre = line.replace(url, '').replace(/[—–\-:]\s*$/, '').replace(/^[—–\-:]\s*/, '').trim();
  if (!titre) titre = url ? new URL(url).hostname.replace(/^www\./, '') : line;
  f.sources.push({ titre, url });
}

// Analyse la réponse de ChatGPT et en extrait les champs d'une fiche.
function parseFiche(text) {
  const clean = text.replace(/\r/g, '').trim();
  const lines = clean.split('\n');
  const f = { titre: '', resume: '', points: [], sources: [], motsCles: [] };
  let section = null;
  const resumeLines = [];

  for (const rawLine of lines) {
    const label = detectLabel(rawLine);
    if (label) {
      section = label;
      const val = inlineValue(rawLine);
      if (label === 'titre') f.titre = val;
      else if (label === 'resume' && val) resumeLines.push(val);
      else if (label === 'motscles' && val) f.motsCles = splitKeywords(val);
      else if (label === 'points' && val) f.points.push(val);
      else if (label === 'sources' && val) addSource(f, val);
      continue;
    }
    if (!rawLine.trim()) { if (section === 'resume') resumeLines.push(''); continue; }
    if (section === 'resume') resumeLines.push(rawLine.trim());
    else if (section === 'points') f.points.push(stripBullet(rawLine));
    else if (section === 'sources') addSource(f, stripBullet(rawLine));
    else if (section === 'motscles') f.motsCles.push(...splitKeywords(rawLine));
  }

  f.resume = resumeLines.join('\n').trim();
  f.points = f.points.filter(Boolean);
  f.motsCles = f.motsCles.filter(Boolean);
  if (!f.titre) f.titre = (clean.split('\n').find(l => l.trim()) || 'Fiche sans titre').slice(0, 90);
  if (!f.resume && !f.points.length) f.resume = clean.slice(0, 600);
  return f;
}

function initAssistant() {
  $('#prepareBtn').addEventListener('click', () => {
    const q = $('#questionInput').value.trim();
    if (!q) { toast('Écris d\'abord ta question.'); $('#questionInput').focus(); return; }
    $('#promptOutput').value = buildResearchPrompt(q, $('#researchType').value);
    $('#promptPanel').hidden = false;
    $('#pastePanel').hidden = false;
    $('#promptPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  $('#copyOpenBtn').addEventListener('click', () => copyAndOpenChatGPT($('#promptOutput').value));
  $('#copyOnlyBtn').addEventListener('click', async () => {
    const ok = await copyText($('#promptOutput').value);
    toast(ok ? 'Consigne copiée.' : 'Copie impossible : sélectionne le texte et fais Ctrl+C.');
  });
  $('#createFicheBtn').addEventListener('click', () => {
    const answer = $('#answerInput').value.trim();
    if (!answer) { toast('Colle d\'abord la réponse de ChatGPT.'); $('#answerInput').focus(); return; }
    const fiche = { id: uid(), date: Date.now(), dateLabel: todayLabel(), raw: answer, ...parseFiche(answer) };
    const fiches = store.get('fiches', []);
    fiches.unshift(fiche);
    store.set('fiches', fiches);
    renderFiches();
    $('#answerInput').value = '';
    toast('Fiche créée et enregistrée.');
    showView('fiches');
  });
  $('#clearAssistantBtn').addEventListener('click', () => {
    $('#questionInput').value = ''; $('#answerInput').value = ''; $('#promptOutput').value = '';
    $('#promptPanel').hidden = true; $('#pastePanel').hidden = true;
  });
}

/* ============================ FICHES ============================ */

// Mesure chaque fiche (une seule fois, quand elle est visible) pour savoir
// si son contenu dépasse ~3 lignes : sinon on retire le repli et le fondu.
function measureFiches() {
  $$('#fichesList .fiche').forEach(card => {
    if (card.dataset.measured || card.offsetParent === null) return;
    const body = $('.fiche-body', card);
    const wasCollapsed = card.classList.contains('collapsed');
    if (!wasCollapsed) card.classList.add('collapsed');
    const overflow = body.scrollHeight - body.clientHeight;
    if (!wasCollapsed) card.classList.remove('collapsed');
    if (overflow < 6) { card.classList.add('is-short'); card.classList.remove('collapsed'); }
    card.dataset.measured = '1';
  });
}

function renderFiches() {
  const fiches = store.get('fiches', []);
  const query = ($('#ficheSearch').value || '').trim().toLowerCase();
  const list = $('#fichesList');
  const filtered = !query ? fiches : fiches.filter(f => {
    const hay = [f.titre, f.resume, (f.motsCles || []).join(' '), (f.points || []).join(' ')].join(' ').toLowerCase();
    return hay.includes(query);
  });

  const badge = $('#fichesCount');
  badge.textContent = fiches.length;
  badge.hidden = fiches.length === 0;

  $('#fichesEmpty').hidden = fiches.length !== 0;
  list.innerHTML = filtered.map(ficheHTML).join('');
  if (fiches.length && !filtered.length) {
    list.innerHTML = '<p class="empty-state">Aucune fiche ne correspond à cette recherche.</p>';
  }

  $$('.fiche', list).forEach(card => {
    const id = card.dataset.id;
    const toggle = $('.fiche-toggle', card);
    toggle.addEventListener('click', () => {
      if (card.classList.contains('is-short')) return;
      const collapsed = card.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
    });
    $('.js-copy', card)?.addEventListener('click', () => copyFiche(id));
    $('.js-del', card)?.addEventListener('click', () => deleteFiche(id));
  });
  measureFiches();
  markAndObserveReveals();
}

function ficheHTML(f) {
  const sources = (f.sources || []).map(s =>
    s.url
      ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.titre || s.url)}</a></li>`
      : `<li>${esc(s.titre)}</li>`
  ).join('');
  const points = (f.points || []).length
    ? `<ul class="fiche-points">${f.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : '';
  const tags = (f.motsCles || []).length
    ? `<div class="tags">${f.motsCles.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : '';
  const resume = f.resume ? `<p class="fiche-resume">${esc(f.resume)}</p>` : '';

  return (
`<article class="fiche collapsed" data-id="${f.id}">
  <button class="fiche-toggle" type="button" aria-expanded="false">
    <span class="fiche-titles"><span class="fiche-title">${esc(f.titre)}</span><span class="fiche-date">${esc(f.dateLabel || '')}</span></span>
    <span class="chevron" aria-hidden="true">›</span>
  </button>
  <div class="fiche-body">
    ${tags}${resume}${points}${sources ? `<ul class="fiche-sources">${sources}</ul>` : ''}
    <details class="raw"><summary>Voir la réponse brute</summary><pre>${esc(f.raw || '')}</pre></details>
  </div>
  <div class="fiche-actions">
    <button class="btn btn-ghost btn-sm js-copy" type="button">Copier</button>
    <button class="btn btn-danger btn-sm js-del" type="button">Supprimer</button>
  </div>
</article>`);
}

function ficheToText(f) {
  let out = `# ${f.titre}\n(${f.dateLabel})\n\n`;
  if (f.resume) out += f.resume + '\n\n';
  if ((f.points || []).length) out += f.points.map(p => '- ' + p).join('\n') + '\n\n';
  if ((f.sources || []).length) out += 'Sources :\n' + f.sources.map(s => `- ${s.titre}${s.url ? ' — ' + s.url : ''}`).join('\n') + '\n\n';
  if ((f.motsCles || []).length) out += 'Mots-clés : ' + f.motsCles.join(', ') + '\n';
  return out.trim();
}

async function copyFiche(id) {
  const f = store.get('fiches', []).find(x => x.id === id);
  if (!f) return;
  const ok = await copyText(ficheToText(f));
  toast(ok ? 'Fiche copiée.' : 'Copie impossible.');
}

function deleteFiche(id) {
  if (!confirm('Supprimer cette fiche ? Cette action est définitive.')) return;
  store.set('fiches', store.get('fiches', []).filter(x => x.id !== id));
  renderFiches();
  toast('Fiche supprimée.');
}

// Tente le téléchargement d'un fichier de sauvegarde (peut être bloqué dans
// certains environnements verrouillés — dans ce cas, on a la copie en secours).
function downloadBackup(data) {
  try {
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `app-builder-fiches-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
    toast('Téléchargement lancé (si ton navigateur l\'autorise).');
  } catch (e) {
    toast('Téléchargement bloqué ici — utilise « Copier la sauvegarde ».');
  }
}

// Importe des fiches à partir d'un texte JSON (fichier ou texte collé).
function importFromString(str) {
  try {
    const parsed = JSON.parse(str);
    const incoming = Array.isArray(parsed) ? parsed : parsed.fiches;
    if (!Array.isArray(incoming)) throw new Error('format');
    const current = store.get('fiches', []);
    const known = new Set(current.map(f => f.id));
    const added = incoming.filter(f => f && !known.has(f.id));
    store.set('fiches', current.concat(added));
    renderFiches();
    toast(`${added.length} fiche(s) importée(s).`);
    $('#backupPanel').hidden = true;
  } catch (e) {
    toast('Texte illisible : ce n\'est pas une sauvegarde valide.');
  }
}

// Ouvre le panneau de sauvegarde en mode « export » ou « import ».
function openBackup(mode) {
  const panel = $('#backupPanel');
  const text = $('#backupText');
  const actions = $('#backupActions');
  panel.hidden = false;
  actions.innerHTML = '';

  if (mode === 'export') {
    $('#backupTitle').textContent = 'Exporter mes fiches';
    $('#backupHint').textContent = "Copie ce texte et garde-le en lieu sûr (ou télécharge-le). Pour restaurer plus tard, reviens ici, clique « Importer » et colle-le.";
    const data = JSON.stringify({ type: 'app-builder-fiches', version: 1, fiches: store.get('fiches', []) }, null, 2);
    text.value = data; text.readOnly = true;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-primary'; copyBtn.type = 'button'; copyBtn.textContent = 'Copier la sauvegarde';
    copyBtn.addEventListener('click', async () => {
      const ok = await copyText(text.value);
      toast(ok ? 'Sauvegarde copiée.' : 'Copie impossible : sélectionne le texte et fais Ctrl+C.');
    });
    const dlBtn = document.createElement('button');
    dlBtn.className = 'btn btn-ghost'; dlBtn.type = 'button'; dlBtn.textContent = 'Télécharger un fichier';
    dlBtn.addEventListener('click', () => downloadBackup(data));
    actions.append(copyBtn, dlBtn);
    text.focus(); text.select();
  } else {
    $('#backupTitle').textContent = 'Importer des fiches';
    $('#backupHint').textContent = "Choisis un fichier de sauvegarde, ou colle son contenu ci-dessous, puis clique « Importer ».";
    text.value = ''; text.readOnly = false;
    text.placeholder = 'Colle ici ta sauvegarde (le texte JSON exporté)…';

    const fileBtn = document.createElement('button');
    fileBtn.className = 'btn btn-ghost'; fileBtn.type = 'button'; fileBtn.textContent = 'Choisir un fichier…';
    fileBtn.addEventListener('click', () => $('#importFile').click());
    const impBtn = document.createElement('button');
    impBtn.className = 'btn btn-primary'; impBtn.type = 'button'; impBtn.textContent = 'Importer';
    impBtn.addEventListener('click', () => importFromString(text.value));
    actions.append(fileBtn, impBtn);
    text.focus();
  }
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function initFiches() {
  $('#ficheSearch').addEventListener('input', renderFiches);
  $('#exportBtn').addEventListener('click', () => openBackup('export'));
  $('#importBtn').addEventListener('click', () => openBackup('import'));
  $('#backupClose').addEventListener('click', () => { $('#backupPanel').hidden = true; });
  $('#importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { $('#backupText').value = reader.result; importFromString(reader.result); e.target.value = ''; };
    reader.readAsText(file);
  });
}

/* ============================ VEILLE ============================ */

const VEILLE_PROMPT =
`Tu es mon assistant de veille hebdomadaire sur la création de sites et d'applications avec l'IA.

Recommande-moi EXACTEMENT TROIS vidéos récentes et de qualité (de préférence en français, sinon en anglais clair), une par catégorie. Cherche sur Internet et vérifie que chaque lien existe vraiment.

1. APPRENDRE : une vidéo pour apprendre à créer des sites/applications avec ChatGPT ou Claude.
2. PRATIQUER : une vidéo de réalisation guidée (on construit quelque chose pas à pas).
3. OUVRIR : une vidéo qui ouvre vers un autre usage (automatisation, design, organisation…).

FORMAT — respecte EXACTEMENT ces étiquettes (une application relit ta réponse) :
VIDEO 1 - APPRENDRE
TITRE: <titre de la vidéo>
CHAINE: <nom de la chaîne>
DUREE: <durée approximative>
LIEN: <URL complète>
POURQUOI: <une phrase>

VIDEO 2 - PRATIQUER
TITRE: ...
CHAINE: ...
DUREE: ...
LIEN: ...
POURQUOI: ...

VIDEO 3 - OUVRIR
TITRE: ...
CHAINE: ...
DUREE: ...
LIEN: ...
POURQUOI: ...`;

function parseVeille(text) {
  const clean = text.replace(/\r/g, '').trim();
  const blocks = clean.split(/(?=^\s*VID[EÉ]O\s*\d)/im).map(b => b.trim()).filter(Boolean);
  const videos = [];
  for (const b of blocks) {
    const cat = (b.match(/^\s*VID[EÉ]O\s*\d\s*[-–—:]?\s*(APPRENDRE|PRATIQUER|OUVRIR)/im) || [])[1] || '';
    const get = (label) => (b.match(new RegExp('^\\s*' + label + '\\s*:\\s*(.+)$', 'im')) || [])[1]?.trim() || '';
    const v = {
      cat: cat.toUpperCase(), titre: get('TITRE'), chaine: get('CHAINE'), duree: get('DUREE'),
      lien: (b.match(/https?:\/\/[^\s)>\]]+/) || [])[0] || '', pourquoi: get('POURQUOI')
    };
    if (v.titre || v.lien) videos.push(v);
  }
  return videos;
}

function renderVeilleList() {
  const veilles = store.get('veilles', []);
  const list = $('#veilleList');
  $('#veilleEmpty').hidden = veilles.length !== 0;
  list.innerHTML = veilles.map(veilleHTML).join('');
  $$('.veille-entry', list).forEach(card => {
    $('.js-del-veille', card)?.addEventListener('click', () => {
      if (!confirm('Supprimer cette veille ?')) return;
      store.set('veilles', store.get('veilles', []).filter(v => v.id !== card.dataset.id));
      renderVeilleList();
      toast('Veille supprimée.');
    });
  });
  markAndObserveReveals();
}

function veilleHTML(v) {
  const body = (v.videos && v.videos.length)
    ? v.videos.map(vid => `
      <div class="video-card">
        ${vid.cat ? `<span class="cat">${esc(vid.cat)}</span>` : ''}
        <div class="vtitle">${vid.lien ? `<a href="${esc(vid.lien)}" target="_blank" rel="noopener">${esc(vid.titre || vid.lien)}</a>` : esc(vid.titre)}</div>
        <div class="vmeta">${[vid.chaine, vid.duree].filter(Boolean).map(esc).join(' · ')}</div>
        ${vid.pourquoi ? `<div class="vmeta">${esc(vid.pourquoi)}</div>` : ''}
      </div>`).join('')
    : `<div class="veille-raw">${esc(v.raw || '')}</div>`;
  return (
`<article class="veille-entry" data-id="${v.id}">
  <header>
    <h3>Veille du ${esc(v.dateLabel)}</h3>
    <button class="btn btn-danger btn-sm js-del-veille" type="button">Supprimer</button>
  </header>
  ${body}
</article>`);
}

function initVeille() {
  $('#veillePrompt').value = VEILLE_PROMPT;
  $('#veilleCopyOpenBtn').addEventListener('click', () => copyAndOpenChatGPT(VEILLE_PROMPT));
  $('#veilleCopyBtn').addEventListener('click', async () => {
    const ok = await copyText(VEILLE_PROMPT);
    toast(ok ? 'Consigne copiée.' : 'Copie impossible.');
  });
  $('#veilleSaveBtn').addEventListener('click', () => {
    const answer = $('#veilleAnswer').value.trim();
    if (!answer) { toast('Colle d\'abord les recommandations.'); $('#veilleAnswer').focus(); return; }
    const entry = { id: uid(), date: Date.now(), dateLabel: todayLabel(), raw: answer, videos: parseVeille(answer) };
    const veilles = store.get('veilles', []);
    veilles.unshift(entry);
    store.set('veilles', veilles);
    $('#veilleAnswer').value = '';
    renderVeilleList();
    toast('Veille enregistrée.');
  });
}

// Rappel du vendredi : bannière + pastille sur l'onglet Veille, le vendredi.
function initFriday() {
  if (new Date().getDay() !== 5) return; // 5 = vendredi
  $('#fridayNote').hidden = false;
  document.querySelector('.nav-link[data-view="veille"]').classList.add('friday');
  $('#fridayGoBtn')?.addEventListener('click', () => {
    showView('veille');
    $('#veillePrompt').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ============================ PARCOURS ============================ */

const MODULES = [
  {
    num: 0, title: 'Le cadrage', goal: 'Décider le fond avant de toucher à un outil',
    intro: "Le module que tout le monde saute et qui fait perdre le plus de temps. L'IA construit vite ce qu'on décrit mal.",
    tasks: [
      'Définir le visiteur : qui est-il (praticien, curieux, ton audience) ?',
      "Définir l'action principale : il fait le quiz, puis quoi ?",
      'Rédiger un paragraphe par vayu (signes de déséquilibre, ressenti, ce qu\'on propose)',
      'Rassembler les 20 questions du questionnaire',
      'Écrire le scoring noir sur blanc (chaque question → 1 vayu, échelle 1–5, plus haut score = dominant, égalité → 2 profils)',
      'Lister 2 à 3 exercices par vayu (durée + instruction courte)',
      'Décrire le ton : ta voix, pas celle de ChatGPT'
    ],
    resources: [], prompts: [],
    livrable: 'Un fichier brief.md rempli, compréhensible par une autre personne. Tant qu\'il ne l\'est pas, ne passe pas au module 1.'
  },
  {
    num: 1, title: 'Installer et paramétrer Claude Code', goal: 'Claude Code tourne et a de la mémoire',
    intro: 'Objectif : avoir Claude Code qui fonctionne, et comprendre comment lui donner une mémoire permanente (CLAUDE.md).',
    tasks: [
      'Installer Node.js, puis Claude Code via npm',
      'Créer un dossier prana-vayus',
      'Lancer « claude » puis taper /init pour générer CLAUDE.md',
      'Réécrire CLAUDE.md à la main (mémoire permanente du projet)',
      'Créer une branche Git de travail : git checkout -b claude-edits'
    ],
    resources: [
      { titre: 'Claude Code : le guide complet pour les non-devs (2026)', meta: 'YouTube · français', url: 'https://www.youtube.com/watch?v=_pW-kUBo7AU', flag: true },
      { titre: 'Full Claude Code Tutorial for Non-Technical Beginners', meta: 'Futurepedia · anglais, pas-à-pas', url: 'https://www.youtube.com/watch?v=bqJzIWAEn40' },
      { titre: 'Claude IA : le tutoriel facile pour débutant', meta: 'YouTube · français, survol', url: 'https://www.youtube.com/watch?v=nHXND_R4Jy8', flag: true },
      { titre: 'Guide écrit — Claude Code pour débutants (2026)', meta: 'nxcode.io · français, à garder ouvert', url: 'https://www.nxcode.io/fr/resources/news/claude-code-tutorial-beginners-guide-2026' }
    ],
    prompts: [
      { label: 'Modèle de CLAUDE.md', text:
`# Projet : App Prana & les cinq Vayus

## Ce que c'est
Application web pédagogique sur le prana et les cinq vayus.
Quiz de 20 questions → profil de déséquilibre → exercices personnalisés.
Public : praticiens et personnes en épuisement énergétique.

## Stack
HTML / CSS / JavaScript. Pas de framework, pas de dépendances inutiles.

## Règles de style
- Français, tutoiement, ton posé et incarné. Jamais de jargon marketing.
- Sanskrit en italique, avec traduction française à la première occurrence.
- Palette : [tes couleurs de charte]
- Typo : [ta typo]

## Règles de code
- Commente en français.
- Un fichier = une responsabilité.
- Ne jamais modifier /contenus/ sans me demander.
- Avant toute modification, dis-moi ce que tu vas changer et attends mon accord.

## Vocabulaire du projet
- vayu : mouvement du prana. Cinq : prana, apana, samana, udana, vyana.
- profil : résultat du quiz, un vayu dominant.` }
    ],
    livrable: 'Un CLAUDE.md que Claude relit correctement. Test : nouvelle session → « résume-moi ce projet ». S\'il répond juste, c\'est gagné.'
  },
  {
    num: 2, title: 'Organiser les fichiers de travail', goal: 'Contenus séparés du code',
    intro: 'Que tes textes, questions et exercices soient séparés du code : tu pourras modifier un exercice sans casser l\'app.',
    tasks: [
      'Créer l\'arborescence (CLAUDE.md, brief.md, .claude/rules/, contenus/, design/, site/)',
      'Remplir contenus/questions.md avec les 20 questions + le mapping vayu',
      'Créer contenus/profils.md (les 5 textes de résultat)',
      'Créer contenus/exercices.md (les pratiques par vayu)',
      'Créer design/charte.md (couleurs, typo, références visuelles)'
    ],
    resources: [],
    prompts: [
      { label: 'Modèle de design/charte.md (à remplir)', text:
`# Charte graphique — App Prana & les cinq Vayus

## Ambiance générale
- Trois mots qui décrivent le ressenti visuel : [ex. calme, incarné, épuré]
- Ce qu'on veut éviter : [ex. clinquant, agressif, « corporate »]

## Couleurs
- Fond principal : [#______]
- Texte principal : [#______]
- Couleur d'accent (boutons, liens) : [#______]
- Accent secondaire : [#______]
- Couleurs des cinq vayus (facultatif) :
  - Prana  : [#______]
  - Apana  : [#______]
  - Samana : [#______]
  - Udana  : [#______]
  - Vyana  : [#______]

## Typographie
- Titres : [nom de la police] — [poids / style]
- Texte courant : [nom de la police] — [taille de base, ex. 16px]
- Sanskrit : en italique, avec traduction à la première occurrence

## Espacements et formes
- Coins arrondis : [ex. 12px]
- Respiration : beaucoup d'espace blanc, lecture calme

## Références visuelles
- [lien ou description d'une inspiration 1]
- [lien ou description d'une inspiration 2]
- [captures d'écran de sites/apps que tu aimes]

## À ne pas faire
- [ex. pas plus de deux polices]
- [ex. pas de rouge vif]` }
    ],
    livrable: 'L\'arborescence créée et questions.md rempli avec les 20 questions et leur mapping vayu.'
  },
  {
    num: 3, title: 'Le premier minisite (ChatGPT Sites)', goal: 'Un site en ligne, sans quiz',
    intro: 'Un site en ligne, avec une vraie URL, qui présente le prana et les cinq vayus. Sans quiz pour l\'instant.',
    tasks: [
      'Dans ChatGPT (onglet Work), écrire @Sites dans le prompt',
      'Itérer une demande à la fois (jamais dix)',
      'Sauvegarder une version avant de déployer',
      'Télécharger le code source (un seul fichier HTML)',
      'Tester le rendu sur ton téléphone'
    ],
    resources: [
      { titre: 'Guide officiel OpenAI — Sites', meta: 'learn.chatgpt.com · référence', url: 'https://learn.chatgpt.com/docs/sites' },
      { titre: 'Créer et gérer un Site (centre d\'aide)', meta: 'help.openai.com', url: 'https://help.openai.com/en/articles/20001339-creating-and-managing-chatgpt-sites' },
      { titre: 'OpenAI Academy — ChatGPT Sites (exemples de prompts)', meta: 'openai.com/academy', url: 'https://openai.com/academy/chatgpt-sites/' },
      { titre: 'Tutoriel pas-à-pas (bon prompt de brief UX)', meta: 'theaibreak.substack.com', url: 'https://theaibreak.substack.com/p/tutorial-build-and-publish-a-website' },
      { titre: 'Mini-app en 10 minutes', meta: 'therundown.ai', url: 'https://app.therundown.ai/guides/deploy-a-mini-saas-in-10-minutes-with-chatgpt-sites' }
    ],
    prompts: [
      { label: 'Prompt de départ — minisite', text:
`@Sites
Construis un minisite pédagogique en français sur le prana et les cinq vayus.

PUBLIC : praticiens de yoga et personnes en épuisement énergétique.
ACTION PRINCIPALE : arriver en bas de page prêt à faire un quiz.

STRUCTURE :
1. Hero : titre, sous-titre, un bouton "Découvrir mon terrain énergétique"
2. Section "Qu'est-ce que le prana" — texte ci-dessous
3. Section "Les cinq vayus" — 5 cartes, une par vayu, qui se déplient au clic
4. Section finale : invitation au quiz

CONTENU : [colle tes textes ici]

DESIGN :
- Palette : [tes couleurs]
- Typo : [ta typo]
- Beaucoup d'espace blanc, lecture calme, rien de clinquant
- Animations discrètes : apparition en fondu au défilement, dépliement fluide des cartes
- Mobile d'abord : la majorité de mes visiteurs sont sur téléphone

CONTRAINTES :
- Français, tutoiement
- Sanskrit en italique avec traduction
- Utilise la structure la plus simple et maintenable possible

Avant de construire, propose-moi la structure de page et pose-moi
les questions dont tu as besoin.` }
    ],
    livrable: 'Le minisite en ligne, testé sur ton téléphone.'
  },
  {
    num: 4, title: 'Le quiz interactif', goal: 'Questions, calcul du profil, écran de résultat',
    intro: 'Les 20 questions, le calcul du profil, l\'écran de résultat avec exercices. La partie la plus importante du plan.',
    tasks: [
      'Tester : que se passe-t-il si on ne répond pas et qu\'on clique « suivant » ?',
      'Tester : égalité parfaite entre deux vayus',
      'Tester : cohérence si on répond 5 partout ? 1 partout ?',
      'Tester : rendu sur un petit écran de téléphone',
      'Faire tester le quiz par 3 personnes réelles'
    ],
    resources: [],
    prompts: [
      { label: 'Prompt — quiz interactif', text:
`@Sites
Ajoute au site un quiz interactif de 20 questions.

DÉROULÉ :
- Une question à la fois, avec une barre de progression
- Réponse sur une échelle de 1 à 5
- Bouton "précédent" pour revenir en arrière
- Transition en fondu entre les questions

QUESTIONS ET SCORING :
[colle ici ton fichier questions.md, avec le mapping vayu de chaque question]

CALCUL :
Chaque question ajoute ses points au vayu correspondant.
Le vayu au score le plus élevé est le profil dominant.
En cas d'égalité, afficher les deux profils.

ÉCRAN DE RÉSULTAT :
- Nom du vayu dominant + sa traduction
- Le texte du profil : [colle profils.md]
- Une visualisation simple des 5 scores (barres horizontales)
- 2 à 3 exercices personnalisés : [colle exercices.md]
- Un bouton "recommencer"

PERSISTANCE :
Sauvegarde la progression dans localStorage, pour que le visiteur
qui ferme son onglet retrouve son avancement.

IMPORTANT : ne modifie pas le contenu ni la formulation de mes questions
et de mes textes de profil. Reprends-les mot pour mot.
Gère proprement le cas où le visiteur ne répond pas à une question.` }
    ],
    livrable: 'Quiz fonctionnel, testé avec 3 personnes réelles.'
  },
  {
    num: 5, title: 'Back-office et base de données (facultatif)', goal: 'Capturer emails et résultats',
    intro: 'Capturer les emails et les résultats, et pouvoir les consulter. Étape avancée : à faire seulement si le besoin est confirmé.',
    tasks: [
      'Choisir le niveau : localStorage (simple) ou base de données Sites (D1/R2, persistée côté serveur)',
      'Rendre le résultat visible AVANT de proposer l\'email (email facultatif, non bloquant)',
      'Ne jamais coller de clé d\'API dans le code du site (tout le côté navigateur est lisible)',
      'Prévoir une page de politique de confidentialité (RGPD si visiteurs européens)',
      'Vérifier l\'export CSV depuis le back-office'
    ],
    resources: [],
    prompts: [
      { label: 'Prompt — capture des résultats', text:
`@Sites
Ajoute la capture des résultats.

FORMULAIRE :
Après avoir affiché le résultat, propose (de façon facultative) le prénom
et l'email. Une phrase d'explication : ce qu'on en fait, pourquoi.
Case à cocher de consentement, non pré-cochée.

STOCKAGE :
Enregistre en base de données : prénom, email, date, les 5 scores,
le vayu dominant.

BACK-OFFICE :
Crée une page /admin, protégée par mot de passe, qui affiche :
- le tableau de toutes les réponses, triable par date
- le nombre total de réponses
- la répartition des profils dominants (combien d'Apana, de Prana, etc.)
- un bouton d'export CSV
Le back-office doit être en français.` }
    ],
    livrable: 'Un email de test capturé, visible dans le back-office, exportable en CSV.'
  },
  {
    num: 6, title: 'Finition, PWA, publication', goal: 'App installable + sauvegarde',
    intro: 'Finition visuelle avec Claude Code (qui a la mémoire de CLAUDE.md), puis transformation en PWA installable sur téléphone.',
    tasks: [
      'Passe accessibilité (contrastes, taille de texte, navigation clavier)',
      'Passe vitesse de chargement',
      'Passe comportement sur petit écran',
      'Passe cohérence des espacements',
      'Télécharger le code source complet et le garder (sauvegarde non négociable)'
    ],
    resources: [
      { titre: 'Playlist « Claude Code Tutorial for Beginners (2026) »', meta: 'YouTube · anglais', url: 'https://www.youtube.com/playlist?list=PL4HikwTaYE0ETMaJqnNvm_2I3NEbexMDZ', flag: true },
      { titre: 'Ce que Sites sait faire et où il s\'arrête', meta: 'stacktr.ee · analyse', url: 'https://stacktr.ee/blog/what-is-chatgpt-sites' },
      { titre: 'Limites et contournements de Sites', meta: 'mindstudio.ai', url: 'https://www.mindstudio.ai/blog/chatgpt-sites-build-host-web-apps' }
    ],
    prompts: [
      { label: 'Prompt — transformer en PWA', text:
`Transforme ce site en Progressive Web App installable :
- ajoute un manifest.json (nom, icônes 192px et 512px, couleur de thème,
  affichage plein écran)
- ajoute un service worker minimal pour que l'app s'ouvre hors connexion
- ajoute une invitation discrète à "ajouter à l'écran d'accueil" sur mobile
Explique-moi chaque fichier que tu crées, en français.` }
    ],
    livrable: 'Une PWA installable sur iPhone et Android, et le code source sauvegardé.'
  }
];

function moduleHTML(m) {
  const state = store.get('parcours', {});
  const tasks = m.tasks.map((t, i) => {
    const id = `m${m.num}-t${i}`;
    return `<li>
      <input type="checkbox" id="${id}" data-task="${id}" ${state[id] ? 'checked' : ''}>
      <label for="${id}">${esc(t)}</label>
    </li>`;
  }).join('');

  const resources = m.resources.length ? `
    <h4>Ressources</h4>
    <ul class="res-list">
      ${m.resources.map((r, i) => {
        const id = `m${m.num}-r${i}`;
        const st = state[id] || 'a-regarder';
        const opt = (v, label) => `<option value="${v}" ${st === v ? 'selected' : ''}>${label}</option>`;
        return `<li><div class="res-line">
          <div class="res-main">
            <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.titre)}</a>
            <span class="res-meta">${esc(r.meta)}${r.flag ? ' · <span class="flag-check">lien à vérifier</span>' : ''}</span>
          </div>
          <select class="res-status" data-res="${id}" aria-label="Statut : ${esc(r.titre)}">
            ${opt('a-regarder', 'À regarder')}${opt('commence', 'Commencé')}${opt('termine', 'Terminé')}${opt('archive', 'Archivé')}
          </select>
        </div></li>`;
      }).join('')}
    </ul>` : '';

  const prompts = m.prompts.length ? `
    <h4>Consignes prêtes à copier</h4>
    ${m.prompts.map(p => `<div class="prompt-block">
      <button class="btn btn-ghost btn-sm copy-prompt" type="button">Copier</button>
      <pre>${esc(p.text)}</pre>
    </div>`).join('')}` : '';

  return `
  <details class="module" ${m.num === 0 ? 'open' : ''}>
    <summary>
      <span class="module-num">${m.num}</span>
      <span class="module-titles"><strong>${esc(m.title)}</strong><span class="m-goal">${esc(m.goal)}</span></span>
    </summary>
    <div class="module-body">
      ${m.intro ? `<p class="panel-hint">${esc(m.intro)}</p>` : ''}
      <h4>À faire</h4>
      <ul class="task-list">${tasks}</ul>
      ${resources}
      ${prompts}
      <div class="livrable"><strong>Livrable :</strong> ${esc(m.livrable)}</div>
    </div>
  </details>`;
}

function updateProgress() {
  const boxes = $$('#parcoursModules input[type="checkbox"]');
  const done = boxes.filter(b => b.checked).length;
  const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
  $('#progressFill').style.width = pct + '%';
  $('#progressText').textContent = pct + ' %';
}

function initParcours() {
  const wrap = $('#parcoursModules');
  wrap.innerHTML = MODULES.map(moduleHTML).join('');
  updateProgress();
  markAndObserveReveals();

  wrap.addEventListener('change', (e) => {
    const state = store.get('parcours', {});
    if (e.target.matches('[data-task]')) {
      state[e.target.dataset.task] = e.target.checked;
      store.set('parcours', state);
      updateProgress();
    } else if (e.target.matches('[data-res]')) {
      state[e.target.dataset.res] = e.target.value;
      store.set('parcours', state);
    }
  });

  wrap.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-prompt');
    if (!btn) return;
    const ok = await copyText(btn.parentElement.querySelector('pre').textContent);
    toast(ok ? 'Consigne copiée.' : 'Copie impossible.');
  });
}

/* ============================ PWA (installation) ============================ */

function initPWA() {
  // Enregistre le service worker (offline). Seulement en contexte sécurisé.
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* silencieux */ });
    });
  }
  // Bouton « Installer l'app » : n'apparaît que si le navigateur le propose.
  let deferredPrompt = null;
  const btn = $('#installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btn) btn.hidden = false;
  });
  btn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btn.hidden = true;
  });
  window.addEventListener('appinstalled', () => {
    if (btn) btn.hidden = true;
    toast('App Builder est installé.');
  });
}

/* ============================ Thème jour / nuit ============================ */

function currentTheme() {
  const saved = store.get('theme', null);
  if (saved === 'light' || saved === 'dark') return saved;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeToggle(theme) {
  $('#dayNightToggle')?.setAttribute('aria-checked', String(theme === 'dark'));
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  store.set('theme', theme);
  updateThemeToggle(theme);
}

function initTheme() {
  updateThemeToggle(currentTheme());
  $('#dayNightToggle')?.addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
}

/* ============================ Réinitialisation ============================ */

function initReset() {
  $('#resetAllBtn').addEventListener('click', () => {
    if (!confirm('Effacer TOUTES tes données (fiches, veilles, progression) sur cet appareil ? Cette action est définitive.')) return;
    ['fiches', 'veilles', 'parcours'].forEach(k => store.remove(k));
    renderFiches();
    renderVeilleList();
    initParcours();
    toast('Toutes les données ont été effacées.');
  });
}

/* ============================ Apparition au défilement ============================ */

// Les blocs se révèlent en fondu + léger glissement quand ils entrent à l'écran.
const REVEAL_SEL = '.panel, .callout, .progress-wrap, .friday-note, .steps-inline, .module, .fiche, .veille-entry';
let revealObserver = null;

function observeReveal() {
  $$('.reveal:not(.is-visible)').forEach(el => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add('is-visible');
  });
}

// Marque les blocs à révéler (avec un léger décalage en cascade dans les listes),
// puis les met sous observation. Sans effet tant que reveal-ready n'est pas prêt.
function markAndObserveReveals() {
  if (!document.body.classList.contains('reveal-ready')) return;
  $$(REVEAL_SEL).forEach(el => { if (!el.classList.contains('reveal')) el.classList.add('reveal'); });
  ['#parcoursModules .module', '#fichesList .fiche', '#veilleList .veille-entry'].forEach(sel => {
    $$(sel).forEach((el, i) => { if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i, 5) * 60 + 'ms'; });
  });
  observeReveal();
}

function initReveal() {
  document.body.classList.add('reveal-ready');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }
  markAndObserveReveals();
}

/* ============================ Démarrage ============================ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initAssistant();
  initFiches();
  initVeille();
  initFriday();
  initParcours();
  initPWA();
  initReset();
  renderFiches();
  renderVeilleList();
  initReveal();
});
