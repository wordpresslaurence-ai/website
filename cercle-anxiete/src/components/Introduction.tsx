interface Props {
  onContinue: () => void;
}

export function Introduction({ onContinue }: Props) {
  return (
    <section className="intro fade-in panel stack" aria-labelledby="intro-title">
      <span className="hand" id="intro-title">
        Avant de commencer…
      </span>
      <p>
        Certaines réactions apparaissent automatiquement lorsque l’angoisse
        monte. Elles ne disent rien de ta force ou de ta volonté : elles ont
        souvent été apprises pour te protéger.
      </p>
      <p>
        Cette expérience va simplement t’aider à observer ce qui se passe entre
        la situation, le soulagement recherché et la peur qui revient parfois
        ensuite.
      </p>
      <div className="callout">
        Choisis ce que tu ferais spontanément aujourd’hui, et non ce que tu
        penses devoir faire.
      </div>
      <div>
        <button type="button" className="btn" onClick={onContinue}>
          J’ai compris, commencer
        </button>
      </div>
    </section>
  );
}
