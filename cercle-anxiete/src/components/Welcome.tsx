interface Props {
  onStart: () => void;
  showResume: boolean;
  onResume: () => void;
  onRestart: () => void;
}

/** Illustration organique : un cercle ouvert dont le trait passe du terracotta au sauge. */
function OpenCircleIllustration() {
  return (
    <svg
      viewBox="0 0 240 200"
      className="welcome-illustration"
      role="img"
      aria-label="Un cercle ouvert dont le trait évolue progressivement du terracotta vers le vert sauge."
    >
      <defs>
        <linearGradient id="welcomeArc" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A3543D" />
          <stop offset="55%" stopColor="#D49A89" />
          <stop offset="100%" stopColor="#6F8876" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="104" rx="96" ry="80" fill="rgba(212,154,137,0.12)" />
      {/* Un cercle simple, ouvert : le trait évolue du terracotta vers le sauge. */}
      <path
        d="M150 178
           C 96 188, 40 156, 34 100
           C 28 44, 84 16, 140 26
           C 196 36, 216 96, 190 140"
        fill="none"
        stroke="url(#welcomeArc)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Welcome({ onStart, showResume, onResume, onRestart }: Props) {
  return (
    <section className="welcome fade-in" aria-labelledby="welcome-title">
      <p className="eyebrow">Expérience interactive</p>
      <OpenCircleIllustration />
      <h1 id="welcome-title">
        Le <span className="accent">cercle</span> de l’anxiété
      </h1>
      <p className="subtitle">
        Découvre comment certaines réactions peuvent te soulager sur le moment
        tout en maintenant la peur sur le long terme.
      </p>
      <p className="meta">
        8 situations · environ 5 minutes · aucune réponse n’est enregistrée en
        ligne
      </p>
      <p className="reassure">
        Il n’y a ni bonne ni mauvaise réponse. Choisis simplement ce qui
        ressemble le plus à ta réaction spontanée.
      </p>

      {showResume && (
        <div className="resume-banner" role="region" aria-label="Reprise de l’expérience">
          <p>
            Tu avais commencé cette expérience. Veux-tu la reprendre ou
            recommencer ?
          </p>
          <div className="resume-actions">
            <button type="button" className="btn btn-sage" onClick={onResume}>
              Reprendre
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onRestart}
            >
              Recommencer
            </button>
          </div>
        </div>
      )}

      <button type="button" className="btn" onClick={onStart}>
        Commencer l’expérience
      </button>
    </section>
  );
}
