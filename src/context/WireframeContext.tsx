import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCopy, isCopyId, type CopyId, type HeroCopy } from "../data/heroCopy";

type WireframeContextValue = {
  embed: boolean;
  copyId: CopyId;
  copy: HeroCopy;
  setCopyId: (id: CopyId) => void;
  grid: boolean;
  setGrid: (value: boolean) => void;
  notes: boolean;
  setNotes: (value: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  preloaderOpen: boolean;
  setPreloaderOpen: (value: boolean) => void;
  palcoOpen: boolean;
  setPalcoOpen: (value: boolean) => void;
  notice: string;
  announce: (message: string) => void;
  reduced: boolean;
  revealKey: number;
  replayReveal: () => void;
};

const WireframeContext = createContext<WireframeContextValue | null>(null);

function readFlags() {
  const params = new URLSearchParams(window.location.search);
  const copyParam = params.get("copy");
  return {
    embed: params.get("embed") === "1",
    copyId: isCopyId(copyParam) ? copyParam : ("a" as CopyId),
    grid: params.get("grid") === "1",
    notes: params.get("notas") === "1",
  };
}

export function WireframeProvider({ children }: { children: ReactNode }) {
  const initial = readFlags();
  const [copyId, setCopyId] = useState<CopyId>(initial.copyId);
  const [grid, setGrid] = useState(initial.grid);
  const [notes, setNotes] = useState(initial.notes);
  const [menuOpen, setMenuOpen] = useState(false);
  const [preloaderOpen, setPreloaderOpen] = useState(false);
  const [palcoOpen, setPalcoOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [reduced, setReduced] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const embed = initial.embed;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.copy = copyId;
    document.documentElement.dataset.annotate = notes ? "on" : "off";
    document.documentElement.dataset.embed = embed ? "on" : "off";
  }, [copyId, notes, embed]);

  useEffect(() => {
    document.body.classList.toggle(
      "is-scroll-locked",
      menuOpen || preloaderOpen || palcoOpen,
    );
  }, [menuOpen, preloaderOpen, palcoOpen]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 4800);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (embed) return;
    const url = new URL(window.location.href);
    url.searchParams.set("copy", copyId);
    if (grid) url.searchParams.set("grid", "1");
    else url.searchParams.delete("grid");
    if (notes) url.searchParams.set("notas", "1");
    else url.searchParams.delete("notas");
    url.searchParams.delete("embed");
    window.history.replaceState(null, "", url);
  }, [copyId, grid, notes, embed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select")
      ) {
        return;
      }
      if (event.key === "Escape") {
        setMenuOpen(false);
        setPreloaderOpen(false);
        setPalcoOpen(false);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "1") setCopyId("a");
      if (event.key === "2") setCopyId("b");
      if (event.key === "3") setCopyId("c");
      if (event.key === "g" || event.key === "G") setGrid((value) => !value);
      if (event.key === "n" || event.key === "N") setNotes((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<WireframeContextValue>(
    () => ({
      embed,
      copyId,
      copy: getCopy(copyId),
      setCopyId,
      grid,
      setGrid,
      notes,
      setNotes,
      menuOpen,
      setMenuOpen,
      preloaderOpen,
      setPreloaderOpen,
      palcoOpen,
      setPalcoOpen,
      notice,
      announce: setNotice,
      reduced,
      revealKey,
      replayReveal: () => setRevealKey((key) => key + 1),
    }),
    [
      embed,
      copyId,
      grid,
      notes,
      menuOpen,
      preloaderOpen,
      palcoOpen,
      notice,
      reduced,
      revealKey,
    ],
  );

  return (
    <WireframeContext.Provider value={value}>{children}</WireframeContext.Provider>
  );
}

export function useWireframe() {
  const context = useContext(WireframeContext);
  if (!context) {
    throw new Error("useWireframe precisa do WireframeProvider");
  }
  return context;
}
