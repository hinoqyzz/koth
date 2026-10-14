import { GridOverlay } from "./components/GridOverlay";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { PreloaderStoryboard } from "./components/PreloaderStoryboard";
import { ReviewDock } from "./components/ReviewDock";
import { SectionSpoiler } from "./components/SectionSpoiler";
import { ViewportStage } from "./components/ViewportStage";
import { WireframeProvider, useWireframe } from "./context/WireframeContext";

function Notice() {
  const { notice } = useWireframe();
  return (
    <div className={notice ? "toast is-on" : "toast"} role="status" aria-live="polite">
      {notice}
    </div>
  );
}

function Shell() {
  const { embed, menuOpen, preloaderOpen, palcoOpen } = useWireframe();
  const overlayOpen = preloaderOpen || palcoOpen;

  return (
    <>
      <a className="skip" href="#abertura">
        Ir para o conteúdo
      </a>
      <div className="site" inert={overlayOpen ? true : undefined}>
        <Navbar />
        <main inert={menuOpen ? true : undefined}>
          <Hero />
          <SectionSpoiler />
        </main>
      </div>
      <GridOverlay />
      <Notice />
      {embed || menuOpen || preloaderOpen || palcoOpen ? null : <ReviewDock />}
      <PreloaderStoryboard />
      <ViewportStage />
    </>
  );
}

export function App() {
  return (
    <WireframeProvider>
      <Shell />
    </WireframeProvider>
  );
}
