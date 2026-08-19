/**
 * Portrait de Marjorie.
 * Ajoute une vraie photo en déposant un fichier dans src/fonts/ ou public/
 * et en remplaçant le bloc <div className="portrait"> par une balise <img>.
 */
export function AboutMarjorie() {
  return (
    <section className="about" aria-labelledby="about-title">
      <div className="portrait" aria-hidden="true">
        <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Portrait de Marjorie">
          <circle cx="60" cy="46" r="22" fill="#E7D6CC" />
          <path d="M22 108 C 26 78, 94 78, 98 108 Z" fill="#E7D6CC" />
        </svg>
      </div>
      <div>
        <span className="hand" id="about-title">
          Hello
        </span>
        <p>
          Je m’appelle Marjorie et je suis thérapeute spécialisée en gestion de
          l’anxiété.
        </p>
        <p>
          Pendant plus de 20 ans, j’ai vécu avec une anxiété intense, marquée par
          des périodes de stress chronique et les séquelles d’un traumatisme.
        </p>
        <p>
          Depuis bientôt 5 ans, j’accompagne des personnes qui vivent avec des
          crises d’angoisse, des troubles anxieux et la peur d’avoir peur à
          retrouver progressivement davantage de liberté.
        </p>
      </div>
    </section>
  );
}
