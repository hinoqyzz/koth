import { useWireframe } from "../context/WireframeContext";
import "./GridOverlay.css";

const columns = Array.from({ length: 12 }, (_, index) => index + 1);

export function GridOverlay() {
  const { grid } = useWireframe();
  if (!grid) return null;

  return (
    <div className="grid-overlay" aria-hidden="true">
      {columns.map((column) => (
        <span key={column}>{String(column).padStart(2, "0")}</span>
      ))}
    </div>
  );
}
