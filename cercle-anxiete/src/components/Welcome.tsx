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
      {/* Spirale ouverte : le cercle ne se referme pas complètement. */}
      <path
        d="M188 150
           C 214 118, 208 60, 158 40
           C 104 18, 44 44, 36 100
           C 30 146, 70 182, 120 178
           C 150 176, 176 160, 182 138"
        fill="none"
        stroke="url(#welcomeArc)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Petite flèche manuscrite d'ouverture. */}
      <path
        d="M182 138 l 14 -6 M182 138 l 8 12"
        fill="none"
        stroke="#6F8876"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="188" cy="150" r="6" fill="#A3543D" />
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
