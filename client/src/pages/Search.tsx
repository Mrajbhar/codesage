import { useEffect, useState } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { SearchIcon, SparklesIcon } from "../components/icons";

interface Repo { fullName: string }
interface Result { path: string; repoFullName: string; score: number }

export default function Search() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repo, setRepo] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/github/repos").then((r) => {
      setRepos(r.data);
      if (r.data.length) setRepo(r.data[0].fullName);
    }).catch(() => {});
  }, []);

  async function index() {
    if (!repo) return;
    setError(""); setNote("");
    try {
      const r = await api.post("/search/index", { fullName: repo });
      setNote(r.data.message);
    } catch (e: any) { setError(e?.response?.data?.message ?? "Couldn't start indexing."); }
  }

  async function search() {
    if (!repo || !q.trim()) return;
    setError(""); setBusy(true); setResults(null);
    try {
      const r = await api.get("/search", { params: { fullName: repo, q } });
      setResults(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Search failed.");
    } finally { setBusy(false); }
  }

  return (
    <AppShell>
      <header className="topbar">
        <div><div className="eyebrow">Search</div><h1 className="page__title">Semantic code search</h1></div>
      </header>

      {error && <div className="alert">{error}</div>}
      {note && <div className="alert alert--ok">{note}</div>}

      <section className="panel">
        <div className="panel__body">
          <div className="searchbar">
            <select className="input" value={repo} onChange={(e) => setRepo(e.target.value)}>
              {repos.map((r) => <option key={r.fullName} value={r.fullName}>{r.fullName}</option>)}
            </select>
            <button className="btn btn--ghost" onClick={index} title="Build the semantic index for this repo"><SparklesIcon /> Index repo</button>
          </div>
          <div className="searchbar" style={{ marginTop: 10 }}>
            <input className="input" placeholder="Describe what you're looking for — e.g. 'where we verify the webhook signature'"
              value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} />
            <button className="btn btn--primary" onClick={search} disabled={busy || !q.trim()}>
              <SearchIcon /> {busy ? "Searching…" : "Search"}
            </button>
          </div>
          <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
            Index a repo once (runs in the background — you'll get a notification when it's ready), then search by meaning rather than exact text.
          </p>
        </div>
      </section>

      {results && (
        <section className="panel">
          <div className="panel__head"><h3>Results</h3><span className="panel__hint">{results.length}</span></div>
          {results.length === 0 ? (
            <div className="panel__body"><p className="muted">No matches. Has this repo been indexed yet?</p></div>
          ) : (
            <div className="srlist">
              {results.map((r) => (
                <div className="sritem" key={r.path}>
                  <span className="sritem__path mono">{r.path}</span>
                  <span className="sritem__score">{(r.score * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}