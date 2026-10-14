import { useWireframe } from "../context/WireframeContext";
import "./SectionSpoiler.css";

export function SectionSpoiler() {
  const { copy } = useWireframe();

  return (
    <section className="spoiler" id="solucoes" aria-labelledby="solucoes-titulo">
      <div className="spoiler-kicker">
        <span>02 / Soluções</span>
        <span>Próxima narrativa</span>
      </div>
      <span className="anno">Spoiler da segunda seção</span>
      <h2 id="solucoes-titulo" className="spoiler-title" key={copy.id}>
        {copy.spoiler}
      </h2>
      <p className="spoiler-note">
        A seção de soluções começa neste corte. O conteúdo completo fica fora desta
        entrega.
      </p>
    </section>
  );
}
