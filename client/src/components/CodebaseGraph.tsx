
type RepoNode = { name: string; language?: string | null };
type Props = {
  dim?: boolean;
  animate?: boolean;
  height?: number;
  repos?: RepoNode[];
  centerLabel?: string;
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6", JavaScript: "#F1E05A", Python: "#3572A5",
  "C#": "#178600", Java: "#B07219", Go: "#00ADD8", Rust: "#DEA584",
  Ruby: "#701516", PHP: "#4F5D95", "C++": "#F34B7D", HTML: "#E34C26",
  CSS: "#563D7C", Shell: "#89E051", Kotlin: "#A97BFF", Swift: "#F05138",
  Vue: "#41B883", Dart: "#00B4AB",
};
const langColor = (l?: string | null) => (l && LANG_COLORS[l]) || "#2DD4BF";
const truncate = (s: string, n = 13) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

// ----- static placeholder -----
const NODES = [
  { x: 60, y: 70, label: "auth.ts" },
  { x: 180, y: 45, label: "api.ts" },
  { x: 120, y: 160, label: "utils.ts" },
  { x: 250, y: 180, label: "payments.ts" },
  { x: 340, y: 190, label: "index.ts" },
];
const EDGES = [
  [60, 70, 180, 45], [180, 45, 300, 90], [180, 45, 120, 160],
  [120, 160, 250, 180], [300, 90, 250, 180], [250, 180, 340, 190], [300, 90, 340, 190],
];
const HUB = { x: 300, y: 90, label: "db.ts · reviewing" };

export default function CodebaseGraph({ dim = false, animate = true, height, repos, centerLabel }: Props) {
  // ===== real repositories: radial map =====
  if (repos && repos.length > 0) {
    const shown = repos.slice(0, 8);
    const cx = 200, cy = 150, R = 100;
    const pts = shown.map((repo, i) => {
      const a = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
      return { ...repo, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
    });

    return (
      <svg className="graph" viewBox="0 0 400 300" width="100%" height={height}
        role="img" aria-label="A map of your GitHub repositories">
        {pts.map((p, i) => (
          <line key={"e" + i} className="graph__edge" x1={cx} y1={cy} x2={p.x} y2={p.y} />
        ))}
        {pts.map((p, i) => (
          <g key={"n" + i}>
            <circle cx={p.x} cy={p.y} r={7} style={{ fill: langColor(p.language) }} />
            <text className="graph__label" x={p.x} y={p.y < cy ? p.y - 12 : p.y + 18} textAnchor="middle">
              {truncate(p.name)}
            </text>
          </g>
        ))}
        {animate && <circle className="graph__pulse" cx={cx} cy={cy} r={9} />}
        <circle className="graph__hub" cx={cx} cy={cy} r={9} />
        {centerLabel && (
          <text className="graph__hublabel" x={cx} y={cy + 28} textAnchor="middle">{centerLabel}</text>
        )}
        {repos.length > 8 && (
          <text className="graph__label" x={cx} y={294} textAnchor="middle">
            +{repos.length - 8} more
          </text>
        )}
      </svg>
    );
  }

  // ===== placeholder =====
  return (
    <svg className={"graph" + (dim ? " graph--dim" : "")} viewBox="0 0 400 240" width="100%" height={height}
      role="img" aria-label="A dependency graph of source files">
      {EDGES.map(([x1, y1, x2, y2], i) => (
        <line key={i} className="graph__edge" x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
      {NODES.map((n) => (
        <g key={n.label}>
          <circle className="graph__node" cx={n.x} cy={n.y} r={6} />
          <text className="graph__label" x={n.x} y={n.y - 14} textAnchor="middle">{n.label}</text>
        </g>
      ))}
      {animate && !dim && <circle className="graph__pulse" cx={HUB.x} cy={HUB.y} r={8} />}
      <circle className="graph__hub" cx={HUB.x} cy={HUB.y} r={7} />
      <text className="graph__hublabel" x={HUB.x} y={HUB.y - 14} textAnchor="middle">{HUB.label}</text>
    </svg>
  );
}