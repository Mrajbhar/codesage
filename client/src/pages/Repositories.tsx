import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { startGitHubLink } from "../auth/oauth";
import { GitHubIcon, StarIcon, ExternalIcon } from "../components/icons";

interface Repo {
  name: string; fullName: string; private: boolean; description?: string | null;
  language?: string | null; stars: number; url: string; updatedAt?: string | null;
}

type Sort = "recent" | "stars" | "name";

export default function Repositories() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("");
  const [sort, setSort] = useState<Sort>("recent");

  useEffect(() => {
    api.get("/github/repos")
      .then((r) => setRepos(r.data))
      .catch((e) => { if (e?.response?.status === 409) setConnected(false); })
      .finally(() => setLoading(false));
  }, []);

  const languages = useMemo(
    () => Array.from(new Set((repos ?? []).map((r) => r.language).filter(Boolean))) as string[],
    [repos]
  );

  const shown = useMemo(() => {
    let list = repos ?? [];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) =>
      r.fullName.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q));
    if (lang) list = list.filter((r) => r.language === lang);
    list = [...list].sort((a, b) => {
      if (sort === "stars") return b.stars - a.stars;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime();
    });
    return list;
  }, [repos, query, lang, sort]);

  return (
    <AppShell>
      <header className="topbar">
        <div>
          <div className="eyebrow">Repositories</div>
          <h1 className="page__title">Your repositories</h1>
        </div>
      </header>

      {loading && <p className="muted">Loading repositories…</p>}

      {!loading && !connected && (
        <section className="connect">
          <div className="connect__icon"><GitHubIcon /></div>
          <div className="connect__text">
            <h3>Connect GitHub to see your repositories</h3>
            <p>We'll pull the repositories you own or collaborate on.</p>
          </div>
          <button className="btn btn--primary" onClick={startGitHubLink}><GitHubIcon /> Connect GitHub</button>
        </section>
      )}

      {!loading && connected && repos && (
        <>
          <div className="repofilters">
            <input className="input" placeholder="Search repositories…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="input" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="">All languages</option>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="recent">Recently updated</option>
              <option value="stars">Most stars</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>

          <div className="repolist">
            {shown.length === 0 && <p className="muted">No repositories match your filters.</p>}
            {shown.map((r) => (
              <a className="repo" key={r.fullName} href={r.url} target="_blank" rel="noreferrer">
                <div className="repo__main">
                  <div className="repo__name">{r.fullName} {r.private && <span className="pill">private</span>}</div>
                  {r.description && <div className="repo__desc">{r.description}</div>}
                  <div className="repo__meta">
                    {r.language && <span><span className="lang-dot" /> {r.language}</span>}
                    <span><StarIcon className="ic" /> {r.stars}</span>
                  </div>
                </div>
                <ExternalIcon className="repo__ext" />
              </a>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}