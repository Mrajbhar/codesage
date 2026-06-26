
export interface RepoActivity {
  name: string;
  fullName: string;
  language?: string | null;
  stars: number;
  url: string;
  updatedAt?: string | null;
  weeks: number[];
  commits: number;
}
export interface LangSlice { name: string; pct: number }
export interface Overview {
  repos: RepoActivity[];
  languages: LangSlice[];
  totals: { repos: number; languages: number; commitsThisWeek: number };
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6", JavaScript: "#F1E05A", Python: "#3572A5",
  "C#": "#178600", Java: "#B07219", Go: "#00ADD8", Rust: "#DEA584",
  Ruby: "#701516", PHP: "#4F5D95", "C++": "#F34B7D", HTML: "#E34C26",
  CSS: "#563D7C", Shell: "#89E051", Kotlin: "#A97BFF", Swift: "#F05138",
  Vue: "#41B883", Dart: "#00B4AB",
};
const langColor = (l?: string | null) => (l && LANG_COLORS[l]) || "#2DD4BF";

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return Math.round(s / 60) + "m";
  if (s < 86400) return Math.round(s / 3600) + "h";
  if (s < 604800) return Math.round(s / 86400) + "d";
  if (s < 2629800) return Math.round(s / 604800) + "w";
  return Math.round(s / 2629800) + "mo";
}

export default function CodebaseMap({ overview, login }: { overview: Overview; login?: string | null }) {
  const repos = overview.repos;
  const nodes = repos.slice(0, 8);
  const cx = 140, cy = 84, R = 60;
  const pts = nodes.map((r, i) => {
    const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { ...r, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });

  return (
    <div className="cm">
      <div className="cm__top">
        <div className="cm__card">
          <div className="cm__cap">repository graph</div>
          <svg viewBox="0 0 280 168" width="100%" role="img"
            aria-label="Repositories arranged around your account, coloured by language">
            {pts.map((p, i) => (
              <line key={"e" + i} stroke="#22324A" strokeWidth={1.2} x1={cx} y1={cy} x2={p.x} y2={p.y} />
            ))}
            {pts.map((p, i) => (
              <circle key={"n" + i} cx={p.x} cy={p.y} r={6} style={{ fill: langColor(p.language) }} />
            ))}
            <circle cx={cx} cy={cy} r={9} style={{ fill: "#2DD4BF" }} />
            {login && (
              <text x={cx} y={cy + 26} textAnchor="middle"
                fill="#2DD4BF" fontFamily="var(--font-mono)" fontSize="9">@{login}</text>
            )}
          </svg>
        </div>

        <div className="cm__card">
          <div className="cm__metrics">
            <div className="cm__metric"><div className="cm__v">{overview.totals.repos}</div><div className="cm__k">repositories</div></div>
            <div className="cm__metric"><div className="cm__v">{overview.totals.languages}</div><div className="cm__k">languages</div></div>
            <div className="cm__metric"><div className="cm__v cm__v--t">{overview.totals.commitsThisWeek}</div><div className="cm__k">commits this week</div></div>
          </div>
          <div className="cm__cap">language composition</div>
          <div className="cm__langbar">
            {overview.languages.map((l) => (
              <div key={l.name} style={{ width: l.pct + "%", background: langColor(l.name) }} />
            ))}
          </div>
          <div className="cm__lg">
            {overview.languages.map((l) => (
              <span key={l.name}><i className="cm__dot" style={{ background: langColor(l.name) }} />{l.name} {l.pct}%</span>
            ))}
          </div>
        </div>
      </div>

      <div className="cm__rows">
        {repos.map((r) => {
          const max = Math.max(1, ...r.weeks);
          return (
            <a className="cm__row" key={r.fullName} href={r.url} target="_blank" rel="noreferrer">
              <div className="cm__name">
                <i className="cm__dot" style={{ background: langColor(r.language) }} />
                <span className="cm__nm">{r.name}</span>
                <span className="cm__ln">{r.language ?? "—"}</span>
              </div>
              <div className="cm__spark" aria-hidden="true">
                {r.weeks.map((v, i) => (
                  <i key={i} style={{ height: Math.round((v / max) * 100) + "%" }} />
                ))}
              </div>
              <div className="cm__commits"><b>{r.commits}</b> commits</div>
              <div className="cm__time">{timeAgo(r.updatedAt)}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}