import { useEffect, useRef } from "react";
import { useWireframe } from "../context/WireframeContext";
import "./Navbar.css";

const provisionalLinks = [
  { index: "01", label: "Serviços" },
  { index: "02", label: "Projetos" },
  { index: "03", label: "Sobre" },
];

export function Navbar() {
  const { menuOpen, setMenuOpen, announce } = useWireframe();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const header = headerRef.current;
    if (!header) return;
    const previous = document.activeElement as HTMLElement | null;
    const items = () =>
      Array.from(header.querySelectorAll<HTMLElement>("button, a[href]"));
    header.querySelector<HTMLElement>(".menu-link")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = items();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    header.addEventListener("keydown", onKey);
    return () => {
      header.removeEventListener("keydown", onKey);
      if (previous && previous !== toggleRef.current) previous.focus();
      else toggleRef.current?.focus();
    };
  }, [menuOpen]);

  const explain = (label: string) => {
    announce(
      `${label} é navegação provisória. A seção correspondente ainda não faz parte desta entrega.`,
    );
    setMenuOpen(false);
  };

  return (
    <header className="site-header" ref={headerRef}>
      <nav className="nav" aria-label="Principal">
        <a className="brand" href="#abertura" onClick={() => setMenuOpen(false)}>
          <img
            src="/brand/koth_logo_paper.svg"
            alt="Koth"
            width={132}
            height={43}
          />
        </a>

        <div className="nav-links">
          {provisionalLinks.map((item) => (
            <button
              key={item.label}
              type="button"
              className="nav-link"
              aria-label={`${item.label}, navegação provisória`}
              onClick={() => explain(item.label)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="nav-cta"
          aria-label="Vamos conversar, ação provisória"
          onClick={() =>
            announce(
              "Vamos conversar marca a posição do contato. O canal ainda não está implementado.",
            )
          }
        >
          Vamos conversar
        </button>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Fechar" : "Menu"}
        </button>
      </nav>

      {menuOpen ? (
        <div className="menu" id="menu-mobile">
          <p className="menu-note">Navegação provisória. As seções ainda não existem.</p>
          <div className="menu-list">
            {provisionalLinks.map((item) => (
              <button
                key={item.label}
                type="button"
                className="menu-link"
                onClick={() => explain(item.label)}
              >
                <span className="menu-index">{item.index}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="nav-cta menu-cta"
            onClick={() =>
              announce(
                "Vamos conversar marca a posição do contato. O canal ainda não está implementado.",
              )
            }
          >
            Vamos conversar
          </button>
        </div>
      ) : null}
    </header>
  );
}
