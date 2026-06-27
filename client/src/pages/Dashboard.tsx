import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { orgStore } from "../auth/orgStore";
import { useAuth } from "../auth/AuthContext";
import AppShell from "../components/AppShell";
import CodebaseGraph from "../components/CodebaseGraph";
import CodebaseMap from "../components/Codebasemap";
import type { Overview } from "../components/Codebasemap";
import { startGitHubLink } from "../auth/oauth";
import { RepoIcon, ReviewIcon, InboxIcon, GitHubIcon, SparklesIcon } from "../components/icons";

interface RecentReview {
  id: string; repoFullName: string; pullNumber: number; title: string; summary: string;
  commentCount: number; criticalCount: number; ranByName: string; createdAt: string;
}

function timeAgo(iso: string) {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return Math.round(s / 60) + "m ago";
  if (s < 86400) return Math.round(s / 3600) + "h ago";
  return Math.round(s / 86400) + "d ago";
}

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [reviews, setReviews] = useState<RecentReview[] | null>(null);

  useEffect(() => {
    if (!user?.gitHubConnected) return;
    setLoadingMap(true);
    api.get("/github/overview")
      .then((r) => setOverview(r.data))
      .catch(() => setOverview(null))
      .finally(() => setLoadingMap(false));
  }, [user?.gitHubConnected]);

  useEffect(() => {
    api.get("/reviews", { params: { limit: 8 } })
      .then((r) => setReviews(r.data))
      .catch(() => setReviews([]));
  }, []);

  const [onboardDismissed, setOnboardDismissed] = useState(false);

  // 7-day review activity for the mini chart
  const spark = (() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i));
      return { date: d, label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()], count: 0 };
    });
    (reviews ?? []).forEach((r) => {
      const rd = new Date(r.createdAt); rd.setHours(0, 0, 0, 0);
      const hit = days.find((d) => d.date.getTime() === rd.getTime());
      if (hit) hit.count++;
    });
    return days;
  })();
  const sparkMax = Math.max(1, ...spark.map((d) => d.count));

  const repoCount = overview ? overview.totals.repos : user?.gitHubConnected ? "…" : "—";
  const hasMap = !!overview && overview.repos.length > 0;

  // First-run guide: complete when GitHub is connected, an org is active, and a review exists.
  const orgId = orgStore.get();
  const steps = [
    { done: !!user?.gitHubConnected, label: "Connect your GitHub account", hint: "So CodeSage can read your repositories and pull requests.", action: !user?.gitHubConnected ? { text: "Connect GitHub", onClick: startGitHubLink } : null },
    { done: !!orgId, label: "Create or select an organization", hint: "Your workspace for members, billing and reviews.", action: !orgId ? { text: "Go to Team", to: "/team" } : null },
    { done: !!(reviews && reviews.length > 0), label: "Run your first review", hint: "Open a repo's pull requests and review one, or turn on auto-review.", action: (reviews && reviews.length === 0) ? { text: "View repositories", to: "/repositories" } : null },
  ];
  const allDone = steps.every((s) => s.done);
  const showOnboarding = !allDone && !onboardDismissed;

  return (
    <AppShell>
      <header className="topbar">
        <div>
          <div className="eyebrow">Overview</div>
          <h1 className="page__title">Good to see you, {firstName}</h1>
        </div>
        {!user?.gitHubConnected && (
          <button className="btn btn--primary" onClick={startGitHubLink}><GitHubIcon /> Connect GitHub</button>
        )}
      </header>

      {showOnboarding && (
        <section className="panel onboard">
          <div className="panel__head">
            <h3>Get started</h3>
            <span className="panel__hint">{steps.filter((s) => s.done).length} of {steps.length}</span>
            <button className="onboard__dismiss" onClick={() => setOnboardDismissed(true)} title="Dismiss">✕</button>
          </div>
          <div className="panel__body onboard__steps">
            {steps.map((s, i) => (
              <div className={"onboard__step" + (s.done ? " is-done" : "")} key={i}>
                <span className="onboard__check">{s.done ? "✓" : i + 1}</span>
                <div className="onboard__text">
                  <div className="onboard__label">{s.label}</div>
                  <div className="onboard__hint">{s.hint}</div>
                </div>
                {s.action && !s.done && (
                  s.action.to
                    ? <Link className="btn btn--ghost btn--sm" to={s.action.to}>{s.action.text}</Link>
                    : <button className="btn btn--ghost btn--sm" onClick={s.action.onClick}>{s.action.text}</button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {user?.gitHubConnected ? (
        <section className="connect">
          <div className="connect__icon"><GitHubIcon /></div>
          <div className="connect__text">
            <h3>GitHub connected as @{user.gitHubLogin}</h3>
            <p>Your repositories are syncing. Open the Repositories tab to pick one to review.</p>
          </div>
          <Link className="btn btn--ghost" to="/repositories"><RepoIcon /> View repositories</Link>
        </section>
      ) : (
        <section className="connect">
          <div className="connect__icon"><GitHubIcon /></div>
          <div className="connect__text">
            <h3>Connect GitHub to map your first repository</h3>
            <p>CodeSage builds the dependency graph, then reviews every pull request against it.</p>
          </div>
          <button className="btn btn--primary" onClick={startGitHubLink}><GitHubIcon /> Connect GitHub</button>
        </section>
      )}

      <div className="stats">
        <div className="stat stat--teal">
          <div className="stat__tile"><RepoIcon /></div>
          <div className="stat__main">
            <div className="stat__value">{repoCount}</div>
            <div className="stat__label">Repositories</div>
            <div className="stat__hint">{user?.gitHubConnected ? "From GitHub" : "Connect to sync"}</div>
          </div>
        </div>
        <div className="stat stat--blue">
          <div className="stat__tile"><ReviewIcon /></div>
          <div className="stat__main">
            <div className="stat__value">{reviews ? reviews.length : 0}</div>
            <div className="stat__label">Reviews run</div>
            <div className="stat__hint">Recent</div>
          </div>
        </div>
        <div className="stat stat--amber">
          <div className="stat__tile"><InboxIcon /></div>
          <div className="stat__main">
            <div className="stat__value">{reviews ? reviews.reduce((n, r) => n + (r.criticalCount ?? 0), 0) : 0}</div>
            <div className="stat__label">Critical findings</div>
            <div className="stat__hint">Across recent reviews</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-main">
      <section className="panel">
        <div className="panel__head">
          <h3>Codebase map</h3>
          <span className="panel__hint">
            {hasMap ? `${overview!.totals.repos} repos · ${overview!.repos.reduce((s, r) => s + r.commits, 0)} commits` : "preview"}
          </span>
        </div>
        <div className="mapwrap">
          {hasMap ? (
            <CodebaseMap overview={overview!} login={user?.gitHubLogin} />
          ) : loadingMap ? (
            <p className="muted" style={{ padding: "20px 0" }}>Building your codebase map…</p>
          ) : (
            <>
              <CodebaseGraph dim animate={false} height={210} />
              <p>Connect a repository and your real codebase map appears here — repositories, languages, and commit activity.</p>
            </>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <h3>Recent reviews</h3>
          {reviews && reviews.length > 0 && <Link className="panel__hint" to="/pulls">View all</Link>}
        </div>
        {reviews === null ? (
          <div className="panel__body"><p className="muted">Loading…</p></div>
        ) : reviews.length === 0 ? (
          <div className="empty">
            <div className="empty__glyph"><InboxIcon /></div>
            <h4 className="empty__title">No reviews yet</h4>
            <p>Open a repository's pull requests, pick a PR, and run an AI review — or turn on auto-review so it happens automatically.</p>
            <Link className="btn btn--primary btn--sm" to="/repositories">Go to repositories →</Link>
          </div>
        ) : (
          <div className="reviewlist">
            {reviews.map((r) => (
              <Link className="reviewitem" key={r.id} to={`/reviews/${r.id}`}>
                <div className="reviewitem__icon"><SparklesIcon /></div>
                <div className="reviewitem__main">
                  <div className="reviewitem__title">{r.title}</div>
                  <div className="reviewitem__summary">{r.summary}</div>
                  <div className="reviewitem__meta">
                    <span className="mono">{r.repoFullName} #{r.pullNumber}</span>
                    <span>· {r.ranByName}</span>
                    <span>· {timeAgo(r.createdAt)}</span>
                  </div>
                </div>
                <div className="reviewitem__counts">
                  {r.criticalCount > 0 && <span className="rc__sev rc__sev--critical">{r.criticalCount} critical</span>}
                  <span className="rc__sev rc__sev--info">{r.commentCount} note{r.commentCount === 1 ? "" : "s"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
        </div>

        <aside className="dash-rail">
          <section className="panel">
            <div className="panel__head"><h3>Review activity</h3><span className="panel__hint">last {spark.length} days</span></div>
            <div className="panel__body">
              {reviews && reviews.length > 0 ? (
                <div className="spark">
                  {spark.map((d, i) => (
                    <div className="spark__col" key={i} title={`${d.label}: ${d.count} review${d.count === 1 ? "" : "s"}`}>
                      <div className="spark__bar" style={{ height: `${d.count === 0 ? 3 : 12 + (d.count / sparkMax) * 76}px` }} />
                      <div className="spark__lbl">{d.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: 13 }}>Run reviews to see your weekly activity here.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel__head"><h3>Quick actions</h3></div>
            <div className="panel__body quick">
              <Link className="quick__row" to="/repositories"><RepoIcon /> <span>Browse repositories</span></Link>
              <Link className="quick__row" to="/pulls"><ReviewIcon /> <span>Review a pull request</span></Link>
              <Link className="quick__row" to="/search"><SparklesIcon /> <span>Search your code</span></Link>
              <Link className="quick__row" to="/billing"><InboxIcon /> <span>Usage & plan</span></Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}