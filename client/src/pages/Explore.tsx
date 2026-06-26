import { useEffect, useState } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { startGitHubLink } from "../auth/oauth";
import { GitHubIcon, FileIcon, SparklesIcon } from "../components/icons";

interface Repo { name: string; fullName: string }
interface RepoFile { path: string; size: number }

const EXT_LANG: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
  py: "Python", cs: "C#", go: "Go", rs: "Rust", java: "Java", rb: "Ruby",
  php: "PHP", cpp: "C++", c: "C", html: "HTML", css: "CSS", json: "JSON",
  md: "Markdown", sh: "Shell", yml: "YAML", yaml: "YAML", sql: "SQL", swift: "Swift",
};
const langOf = (path: string) => EXT_LANG[path.split(".").pop()?.toLowerCase() ?? ""] ?? null;

export default function Explore() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [connected, setConnected] = useState(true);
  const [repo, setRepo] = useState("");

  const [tree, setTree] = useState<RepoFile[]>([]);
  const [filter, setFilter] = useState("");
  const [treeLoading, setTreeLoading] = useState(false);

  const [path, setPath] = useState("");
  const [content, setContent] = useState("");
  const [truncated, setTruncated] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/github/repos")
      .then((r) => setRepos(r.data))
      .catch((e) => { if (e?.response?.status === 409) setConnected(false); });
  }, []);

  function pickRepo(fullName: string) {
    setRepo(fullName); setTree([]); setPath(""); setContent(""); setExplanation(""); setError("");
    if (!fullName) return;
    setTreeLoading(true);
    api.get("/github/tree", { params: { fullName } })
      .then((r) => setTree(r.data))
      .catch(() => setError("Couldn't load the file tree."))
      .finally(() => setTreeLoading(false));
  }

  function openFile(p: string) {
    setPath(p); setContent(""); setExplanation(""); setError(""); setFileLoading(true);
    api.get("/github/file", { params: { fullName: repo, path: p } })
      .then((r) => { setContent(r.data.content); setTruncated(r.data.truncated); })
      .catch(() => setError("Couldn't load that file."))
      .finally(() => setFileLoading(false));
  }

  async function explain() {
    setError(""); setExplaining(true); setExplanation("");
    try {
      const r = await api.post("/ai/explain", { code: content, path, language: langOf(path) });
      setExplanation(r.data.explanation);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "The AI request failed.");
    } finally {
      setExplaining(false);
    }
  }

  const shown = tree.filter((f) => f.path.toLowerCase().includes(filter.toLowerCase())).slice(0, 300);

  if (!connected) {
    return (
      <AppShell>
        <header className="topbar"><div><div className="eyebrow">Explore</div><h1 className="page__title">Code explorer</h1></div></header>
        <section className="connect">
          <div className="connect__icon"><GitHubIcon /></div>
          <div className="connect__text"><h3>Connect GitHub to browse code</h3><p>Then pick a repository and ask the AI to explain any file.</p></div>
          <button className="btn btn--primary" onClick={startGitHubLink}><GitHubIcon /> Connect GitHub</button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="topbar">
        <div><div className="eyebrow">Explore</div><h1 className="page__title">Code explorer</h1></div>
        <select className="input ex__repo" value={repo} onChange={(e) => pickRepo(e.target.value)}>
          <option value="">Select a repository…</option>
          {repos?.map((r) => <option key={r.fullName} value={r.fullName}>{r.fullName}</option>)}
        </select>
      </header>

      {error && <div className="alert">{error}</div>}

      <div className="ex">
        <aside className="ex__tree panel">
          <div className="panel__head"><h3>Files</h3>{tree.length > 0 && <span className="panel__hint">{tree.length}</span>}</div>
          <div className="ex__treebody">
            {repo && <input className="input" placeholder="Filter files…" value={filter} onChange={(e) => setFilter(e.target.value)} />}
            {treeLoading && <p className="muted">Loading files…</p>}
            {!repo && <p className="muted">Pick a repository to list its files.</p>}
            <div className="ex__files">
              {shown.map((f) => (
                <button key={f.path} className={"ex__file" + (f.path === path ? " ex__file--active" : "")} onClick={() => openFile(f.path)}>
                  <FileIcon className="ex__fileic" /> <span>{f.path}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="ex__main panel">
          <div className="panel__head">
            <h3>{path || "No file selected"}</h3>
            {path && !truncated && (
              <button className="btn btn--primary btn--xs" onClick={explain} disabled={explaining || !content}>
                <SparklesIcon /> {explaining ? "Explaining…" : "Explain with AI"}
              </button>
            )}
          </div>
          <div className="ex__mainbody">
            {fileLoading && <p className="muted">Loading file…</p>}
            {!path && !fileLoading && <p className="muted">Select a file from the list to view it here.</p>}
            {truncated && path && <p className="muted">This file is too large or binary to display.</p>}
            {content && <pre className="code"><code>{content}</code></pre>}
            {explaining && <div className="ex__explain"><div className="ex__explainhead"><SparklesIcon /> AI explanation</div><p className="muted">Thinking…</p></div>}
            {explanation && (
              <div className="ex__explain">
                <div className="ex__explainhead"><SparklesIcon /> AI explanation</div>
                <div className="ex__explaintext">{explanation}</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}