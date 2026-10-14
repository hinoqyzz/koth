import { heroCopies } from "../data/heroCopy";
import { useWireframe } from "../context/WireframeContext";
import "./ReviewDock.css";
import { useEffect, useState } from "react";

export function ReviewDock() {
  const {
    copyId,
    setCopyId,
    grid,
    setGrid,
    notes,
    setNotes,
    setPreloaderOpen,
    setPalcoOpen,
  } = useWireframe();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!open) {
    return (
      <button
        type="button"
        className="dock-tab"
        aria-expanded={false}
        onClick={() => setOpen(true)}
      >
        Revisão · {copyId.toUpperCase()}
      </button>
    );
  }

  return (
    <aside className="dock-panel" aria-label="Controles do wireframe">
      <div className="dock-head">
        <p className="dock-kicker">Protótipo</p>
        <button type="button" className="dock-close" onClick={() => setOpen(false)}>
          Fechar
        </button>
      </div>
      <p className="dock-lead">
        Controles de revisão. Não fazem parte do site.
      </p>

      <fieldset className="dock-set">
        <legend>Variação de texto</legend>
        <div className="dock-choices">
          {heroCopies.map((item) => (
            <label key={item.id} className={item.id === copyId ? "is-selected" : ""}>
              <input
                type="radio"
                name="copy"
                value={item.id}
                checked={item.id === copyId}
                onChange={() => setCopyId(item.id)}
              />
              <span>
                {item.label} · {item.name}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="dock-toggles">
        <button type="button" aria-pressed={grid} onClick={() => setGrid(!grid)}>
          Grade {grid ? "ligada" : "desligada"}
        </button>
        <button type="button" aria-pressed={notes} onClick={() => setNotes(!notes)}>
          Anotações {notes ? "ligadas" : "desligadas"}
        </button>
      </div>

      <div className="dock-actions">
        <button type="button" onClick={() => setPreloaderOpen(true)}>
          Ver preloader
        </button>
        <button type="button" onClick={() => setPalcoOpen(true)}>
          Enquadramentos
        </button>
      </div>

      <p className="dock-meta">
        Janela {size.w} × {size.h}. Atalhos: 1 2 3 trocam o texto, G a grade, N as
        anotações, Esc fecha painéis.
      </p>
    </aside>
  );
}
