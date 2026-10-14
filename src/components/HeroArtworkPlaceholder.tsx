import "./HeroArtworkPlaceholder.css";

type Volume = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotate: number;
  face: string;
  edge: string;
};

const volumes: Volume[] = [
  {
    x: 188,
    y: 48,
    width: 268,
    height: 660,
    radius: 78,
    rotate: -12,
    face: "#2c2c2c",
    edge: "#101010",
  },
  {
    x: 286,
    y: 392,
    width: 560,
    height: 168,
    radius: 74,
    rotate: 14,
    face: "#4a4a4a",
    edge: "#161616",
  },
  {
    x: 492,
    y: 548,
    width: 400,
    height: 330,
    radius: 96,
    rotate: -7,
    face: "#1a1a1a",
    edge: "#080808",
  },
];

export function HeroArtworkPlaceholder() {
  return (
    <div className="art" aria-hidden="true">
      <div className="art-stage">
        <svg className="art-svg" viewBox="120 0 860 1040" role="presentation">
          {volumes.map((volume) => {
            const cx = volume.x + volume.width / 2;
            const cy = volume.y + volume.height / 2;
            return (
              <g key={`${volume.x}-${volume.y}`} transform={`rotate(${volume.rotate} ${cx} ${cy})`}>
                <rect
                  x={volume.x + 22}
                  y={volume.y + 18}
                  width={volume.width}
                  height={volume.height}
                  rx={volume.radius}
                  fill={volume.edge}
                />
                <rect
                  x={volume.x}
                  y={volume.y}
                  width={volume.width}
                  height={volume.height}
                  rx={volume.radius}
                  fill={volume.face}
                  stroke="#9a9a9a"
                  strokeWidth="2"
                />
                <rect
                  x={volume.x + 22}
                  y={volume.y + 22}
                  width={volume.width - 44}
                  height={volume.height - 44}
                  rx={Math.max(volume.radius - 22, 12)}
                  fill="none"
                  stroke="#6a6a6a"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
        <div className="art-guide">
          <span className="anno">Proporção da arte 16:9</span>
        </div>
      </div>
    </div>
  );
}
