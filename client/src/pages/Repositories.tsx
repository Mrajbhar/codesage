import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { startGitHubLink } from "../auth/oauth";
import { GitHubIcon, StarIcon } from "../components/icons";

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

  const [watched, setWatched] = useState<Set<string>>(new Set());
  useEffect(() => {
    api.get("/github/watched").then((r) => setWatched(new Set(r.data))).catch(() => {});
  }, []);
  async function toggleWatch(fullName: string) {
    const on = watched.has(fullName);
    const next = new Set(watched);
    if (on) next.delete(fullName); else next.add(fullName);
    setWatched(next);
    try {
      if (on) await api.delete("/github/watch", { params: { fullName } });
      else await api.post("/github/watch", { fullName });
    } catch { setWatched(watched); }   // revert on failure
  }

  interface RepoSettings { repoFullName: string; minSeverity: string; ignorePaths: string[]; fileTypes: string[]; postToGitHub: boolean }
  const [settingsFor, setSettingsFor] = useState("");
  const [settings, setSettings] = useState<RepoSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  async function openSettings(fullName: string) {
    if (settingsFor === fullName) { setSettingsFor(""); return; }
    setSettingsFor(fullName); setSettings(null);
    try {
      const r = await api.get("/github/watch/settings", { params: { fullName } });
      setSettings({
        repoFullName: r.data.repoFullName, minSeverity: r.data.minSeverity ?? "info",
        ignorePaths: r.data.ignorePaths ?? [], fileTypes: r.data.fileTypes ?? [],
        postToGitHub: r.data.postToGitHub ?? true,
      });
    } catch {
      setSettings({ repoFullName: fullName, minSeverity: "info", ignorePaths: [], fileTypes: [], postToGitHub: true });
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setSavingSettings(true);
    try { await api.put("/github/watch/settings", settings); setSettingsFor(""); }
    catch { /* keep panel open on failure */ }
    finally { setSavingSettings(false); }
  }

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
              <div className="repo-wrap" key={r.fullName}>
                <div className="repo">
                  <a className="repo__main" href={r.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="repo__name">{r.fullName} {r.private && <span className="pill">private</span>}</div>
                    {r.description && <div className="repo__desc">{r.description}</div>}
                    <div className="repo__meta">
                      {r.language && <span><span className="lang-dot" /> {r.language}</span>}
                      <span><StarIcon className="ic" /> {r.stars}</span>
                    </div>
                  </a>
                  <button
                    className={"watchbtn" + (watched.has(r.fullName) ? " watchbtn--on" : "")}
                    onClick={() => toggleWatch(r.fullName)}
                    title={watched.has(r.fullName) ? "Auto-review is on — click to turn off" : "Turn on automatic review when PRs open"}
                  >
                    {watched.has(r.fullName) ? "Auto-review on" : "Auto-review off"}
                  </button>
                  {watched.has(r.fullName) && (
                    <button className="watchbtn watchbtn--gear" onClick={() => openSettings(r.fullName)} title="Review settings">⚙</button>
                  )}
                </div>
                {settingsFor === r.fullName && settings && (
                  <div className="reposettings">
                    <div className="reposettings__row">
                      <label>Minimum severity</label>
                      <select className="input" value={settings.minSeverity}
                        onChange={(e) => setSettings({ ...settings, minSeverity: e.target.value })}>
                        <option value="info">Info and above (all)</option>
                        <option value="suggestion">Suggestion and above</option>
                        <option value="warning">Warning and above</option>
                        <option value="critical">Critical only</option>
                      </select>
                    </div>
                    <div className="reposettings__row">
                      <label>Ignore paths <span className="muted">(comma-separated)</span></label>
                      <input className="input" placeholder="test/, .md, docs/"
                        value={settings.ignorePaths.join(", ")}
                        onChange={(e) => setSettings({ ...settings, ignorePaths: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
                    </div>
                    <div className="reposettings__row">
                      <label>Only these file types <span className="muted">(comma-separated, blank = all)</span></label>
                      <input className="input" placeholder=".cs, .ts, .tsx"
                        value={settings.fileTypes.join(", ")}
                        onChange={(e) => setSettings({ ...settings, fileTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
                    </div>
                    <label className="reposettings__check">
                      <input type="checkbox" checked={settings.postToGitHub}
                        onChange={(e) => setSettings({ ...settings, postToGitHub: e.target.checked })} />
                      Post findings as a comment on the GitHub PR
                    </label>
                    <div className="reposettings__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => setSettingsFor("")}>Cancel</button>
                      <button className="btn btn--primary btn--sm" onClick={saveSettings} disabled={savingSettings}>
                        {savingSettings ? "Saving…" : "Save settings"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}