import { HeroArtworkPlaceholder } from "./HeroArtworkPlaceholder";
import { HeroServices } from "./HeroServices";
import { useWireframe } from "../context/WireframeContext";
import "./Hero.css";

export function Hero() {
  const { copy, announce, reduced, revealKey } = useWireframe();

  const explore = () => {
    document.getElementById("solucoes")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section className="hero" id="abertura" aria-labelledby="hero-titulo">
      <p className="running">Koth — design e desenvolvimento</p>
      <div className="hero-grid">
        <div className="kicker-wrap">
          <span className="anno">Identificador</span>
          <p className="kicker">
            <span>01</span>
            <span className="kicker-line" aria-hidden="true" />
            <span>Abertura</span>
          </p>
        </div>

        <p className="art-label">3 volumes</p>

        <div className="cluster">
          <div className="title-block" key={`${copy.id}-${revealKey}`}>
            <span className="anno">Headline</span>
            <h1 id="hero-titulo" className="hero-title">
              {copy.lines.map((line) => (
                <span className="line" key={line}>
                  {line}
                </span>
              ))}
            </h1>
            <p className="sr-only">
              Variação {copy.label}, {copy.name}. Área à direita reservada para a
              composição tridimensional, representada aqui por volumes neutros.
            </p>
          </div>

          <div className="body-block" key={`${copy.id}-apoio-${revealKey}`}>
            <span className="anno">Apoio e ações</span>
            <p className="support">{copy.support}</p>
            <div className="cta-row">
              <button
                type="button"
                className="cta-primary"
                onClick={() =>
                  announce(
                    "Conversar sobre projeto marca o chamado principal. O contato ainda não está nesta entrega.",
                  )
                }
              >
                Conversar sobre projeto
              </button>
              <button type="button" className="cta-secondary" onClick={explore}>
                Explorar soluções
              </button>
            </div>
          </div>
        </div>

        <HeroArtworkPlaceholder />

        <div className="rail">
          <div className="rail-services">
            <span className="anno">Índice de serviços</span>
            <HeroServices />
          </div>
          <div className="rail-meta">
            <button type="button" className="continue" onClick={explore}>
              <span>Continuar</span>
              <span className="continue-line" aria-hidden="true" />
            </button>
            <p className="folio">
              <span>01</span>
              <span aria-hidden="true">/</span>
              <span>02</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
