import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import AppShell from "../components/AppShell";
import CodebaseGraph from "../components/CodebaseGraph";
import CodebaseMap from "../components/Codebasemap";
import type { Overview } from "../components/Codebasemap";
import { startGitHubLink } from "../auth/oauth";
import { RepoIcon, ReviewIcon, InboxIcon, GitHubIcon } from "../components/icons";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {
    if (!user?.gitHubConnected) return;
    setLoadingMap(true);
    api.get("/github/overview")
      .then((r) => setOverview(r.data))
      .catch(() => setOverview(null))
      .finally(() => setLoadingMap(false));
  }, [user?.gitHubConnected]);

  const repoCount = overview ? overview.totals.repos : user?.gitHubConnected ? "…" : "—";
  const hasMap = !!overview && overview.repos.length > 0;

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
        <div className="stat">
          <div className="stat__label"><RepoIcon /> Repositories</div>
          <div className="stat__value">{repoCount}</div>
          <div className="stat__hint">{user?.gitHubConnected ? "From GitHub" : "Connect to sync"}</div>
        </div>
        <div className="stat">
          <div className="stat__label"><ReviewIcon /> Reviews run</div>
          <div className="stat__value">0</div>
          <div className="stat__hint">All time</div>
        </div>
        <div className="stat">
          <div className="stat__label"><InboxIcon /> Issues found</div>
          <div className="stat__value">0</div>
          <div className="stat__hint">All time</div>
        </div>
      </div>

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
        <div className="panel__head"><h3>Recent reviews</h3></div>
        <div className="empty">
          <div className="empty__glyph"><InboxIcon /></div>
          <p>No reviews yet. They'll show up here once you connect a repository and open a pull request.</p>
        </div>
      </section>
    </AppShell>
  );
}