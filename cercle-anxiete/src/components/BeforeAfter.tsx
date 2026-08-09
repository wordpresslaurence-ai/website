import { BEFORE_AFTER } from '../data/content';

export function BeforeAfter() {
  return (
    <section aria-labelledby="ba-title">
      <div className="section-head">
        <h2 id="ba-title">
          À quoi pourrait ressembler une vie moins dirigée par la peur ?
        </h2>
        <p className="text-muted">
          Aujourd’hui, à gauche · progressivement, à droite.
        </p>
      </div>
      <div className="beforeafter">
        {BEFORE_AFTER.map((row, i) => (
          <div className="ba-row" key={i}>
            <span className="ba-before">{row.before}</span>
            <span className="ba-arrow" aria-hidden="true">
              ⟶
            </span>
            <span className="ba-after">{row.after}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
