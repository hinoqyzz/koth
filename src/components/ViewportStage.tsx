import { useEffect, useState } from "react";
import { frames, type FrameId } from "../data/services";
import { useWireframe } from "../context/WireframeContext";
import "./ViewportStage.css";

export function ViewportStage() {
  const { palcoOpen, setPalcoOpen, copyId, grid, notes } = useWireframe();
  const [frameId, setFrameId] = useState<FrameId>("m390");
  const [scale, setScale] = useState(1);
  const frame = frames.find((item) => item.id === frameId) ?? frames[4];

  useEffect(() => {
    if (!palcoOpen) return;
    const update = () => {
      const availableW = window.innerWidth - 32;
      const availableH = window.innerHeight - 132;
      const next = Math.min(availableW / frame.w, availableH / frame.h, 1);
      setScale(Math.max(0.18, next));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [palcoOpen, frame.w, frame.h]);

  if (!palcoOpen) return null;

  const src = `/?embed=1&copy=${copyId}&grid=${grid ? "1" : "0"}&notas=${notes ? "1" : "0"}`;

  return (
    <div className="palco" role="dialog" aria-modal="true" aria-labelledby="palco-titulo">
      <div className="palco-bar">
        <div>
          <p className="palco-kicker">Enquadramentos</p>
          <h2 id="palco-titulo">
            {frame.label} · {frame.w} × {frame.h}
          </h2>
        </div>
        <button type="button" className="palco-close" onClick={() => setPalcoOpen(false)}>
          Fechar
        </button>
      </div>
      <div className="palco-choices" role="tablist" aria-label="Tamanhos de tela">
        {frames.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === frame.id}
            onClick={() => setFrameId(item.id)}
          >
            {item.label}
            <span>
              {item.w}×{item.h}
            </span>
          </button>
        ))}
      </div>
      <div className="palco-stage">
        <div
          className="palco-frame"
          style={{ width: frame.w * scale, height: frame.h * scale }}
        >
          <iframe
            key={`${frame.id}-${src}`}
            title={`Pré-visualização ${frame.w} por ${frame.h}`}
            src={src}
            style={{
              width: frame.w,
              height: frame.h,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
