import { PROGRAM_URL, WEBSITE_URL } from '../config';

export function ProgramCTA() {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <p className="eyebrow">Pour aller plus loin</p>
      <h2 id="cta-title">
        Je me libère des crises d’angoisse et de la peur d’avoir peur
      </h2>
      <p>Dans ce programme en ligne, tu vas apprendre à :</p>
      <ul>
        <li>comprendre les mécanismes de la peur et de l’angoisse ;</li>
        <li>identifier les pièges dans lesquels tu tombes sans le savoir ;</li>
        <li>
          avancer à l’aide d’outils concrets, de séances d’hypnose, de vidéos et
          d’un véritable plan d’action.
        </li>
      </ul>
      <div className="cta-actions">
        <a
          className="btn"
          href={PROGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Découvrir le programme
        </a>
        <a
          className="btn btn-secondary"
          href={WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visiter le site de Marjorie
        </a>
      </div>
      <p className="cta-close">
        Tu peux aussi fermer cette page et conserver uniquement les observations
        qui t’ont été utiles.
      </p>
    </section>
  );
}
