import { useEffect, useRef, useState } from "react";
import { preloaderActs, type ShardBox } from "../data/preloader";
import { useWireframe } from "../context/WireframeContext";
import "./PreloaderStoryboard.css";

function Shard({ box }: { box: ShardBox }) {
  return (
    <span
      className={`shard tone-${box.tone}`}
      style={{
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        borderRadius: box.radius,
      }}
    />
  );
}

export function PreloaderStoryboard() {
  const { preloaderOpen, setPreloaderOpen, reduced, replayReveal } = useWireframe();
  const [mode, setMode] = useState<"board" | "play" | "still">("board");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preloaderOpen) {
      setMode("board");
      return;
    }
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    return () => previous?.focus();
  }, [preloaderOpen]);

  if (!preloaderOpen) return null;

  const close = () => setPreloaderOpen(false);

  const finishPlay = () => {
    replayReveal();
    close();
  };

  return (
    <div
      className="pre"
      role="dialog"
      aria-modal="true"
      aria-label="Preloader Assemble Koth"
      ref={dialogRef}
    >
      {mode === "board" ? (
        <div className="pre-board">
          <div className="pre-board-head">
            <div>
              <p className="pre-kicker">Assemble / Koth</p>
              <h2 id="pre-titulo">Storyboard do preloader</h2>
            </div>
            <button type="button" className="pre-text-btn" onClick={close}>
              Fechar
            </button>
          </div>
          <p className="pre-intro">
            Sequência cinematográfica esquemática. Não é o preloader de produção e não
            bloqueia a primeira dobra.
          </p>
          <ol className="pre-frames">
            {preloaderActs.map((act) => (
              <li key={act.index}>
                <div className="frame">
                  {act.shards.map((shard) => (
                    <Shard key={`${act.index}-${shard.tone}`} box={shard} />
                  ))}
                  {act.showLogo ? (
                    <img
                      className="frame-logo"
                      src="/brand/koth_logo_paper.svg"
                      alt=""
                      width={120}
                      height={39}
                    />
                  ) : null}
                  {act.index === "04" ? <span className="frame-window">Hero</span> : null}
                </div>
                <p className="frame-index">
                  Ato {act.index} · {act.time}
                </p>
                <h3>{act.title}</h3>
                <p>{act.text}</p>
              </li>
            ))}
          </ol>
          <div className="pre-board-actions">
            <button
              type="button"
              className="pre-play-btn"
              onClick={() => setMode(reduced ? "still" : "play")}
            >
              {reduced ? "Ver composição final" : "Reproduzir sequência"}
            </button>
          </div>
          <details className="pre-rules">
            <summary>Regras para a implementação futura</summary>
            <ul>
              <li>Revelar o hero quando os recursos críticos da primeira dobra estiverem prontos.</li>
              <li>Não esperar imagens de seções distantes nem impor duração mínima.</li>
              <li>Prever fallback de asset e nunca deixar a tela bloqueada.</li>
              <li>Respeitar prefers-reduced-motion e manter o conteúdo acessível.</li>
              <li>O logo oficial entra na forma original, sem reconstrução.</li>
            </ul>
          </details>
        </div>
      ) : null}

      {mode === "still" ? (
        <div className="pre-still">
          <h2 id="pre-titulo">Movimento reduzido</h2>
          <p>
            A sequência não é reproduzida. O conteúdo da primeira dobra permanece
            acessível, e o logo oficial segue intacto.
          </p>
          <img src="/brand/koth_logo_paper.svg" alt="Koth" width={160} height={53} />
          <button type="button" className="pre-play-btn" onClick={close}>
            Voltar ao wireframe
          </button>
        </div>
      ) : null}

      {mode === "play" ? (
        <div
          className="pre-play"
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.animationName !== "pre-reveal") return;
            finishPlay();
          }}
        >
          <span className="play-shard play-a" />
          <span className="play-shard play-b" />
          <span className="play-shard play-c" />
          <img
            className="play-logo"
            src="/brand/koth_logo_paper.svg"
            alt=""
            width={168}
            height={55}
          />
          <button type="button" className="pre-skip" onClick={finishPlay}>
            Pular
          </button>
        </div>
      ) : null}
    </div>
  );
}
