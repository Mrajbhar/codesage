import { useEffect, useState } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import Discussion from "../components/Discussion";
import { startGitHubLink } from "../auth/oauth";
import { GitHubIcon, SparklesIcon, ExternalIcon } from "../components/icons";

interface Repo { name: string; fullName: string }
interface Pull { number: number; title: string; author: string; url: string; createdAt: string }
interface ReviewComment { file?: string | null; severity: string; comment: string }
interface ReviewResult { summary: string; comments: ReviewComment[] }

export default function PullRequests() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [connected, setConnected] = useState(true);
  const [repo, setRepo] = useState("");
  const [pulls, setPulls] = useState<Pull[] | null>(null);
  const [pullsLoading, setPullsLoading] = useState(false);
  const [active, setActive] = useState<Pull | null>(null);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/github/repos")
      .then((r) => setRepos(r.data))
      .catch((e) => { if (e?.response?.status === 409) setConnected(false); });
  }, []);

  function pickRepo(fullName: string) {
    setRepo(fullName); setPulls(null); setActive(null); setReview(null); setError("");
    if (!fullName) return;
    setPullsLoading(true);
    api.get("/github/pulls", { params: { fullName } })
      .then((r) => setPulls(r.data))
      .catch(() => setError("Couldn't load pull requests."))
      .finally(() => setPullsLoading(false));
  }

  async function runReview() {
    if (!active) return;
    setReviewing(true); setReview(null); setError("");
    try {
      const r = await api.post("/ai/review", { fullName: repo, number: active.number });
      setReview(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "The AI review failed.");
    } finally {
      setReviewing(false);
    }
  }

  if (!connected) {
    return (
      <AppShell>
        <header className="topbar"><div><div className="eyebrow">Reviews</div><h1 className="page__title">Pull requests</h1></div></header>
        <section className="connect">
          <div className="connect__icon"><GitHubIcon /></div>
          <div className="connect__text"><h3>Connect GitHub to review pull requests</h3><p>Then pick a repository and let the AI review open PRs.</p></div>
          <button className="btn btn--primary" onClick={startGitHubLink}><GitHubIcon /> Connect GitHub</button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="topbar">
        <div><div className="eyebrow">Reviews</div><h1 className="page__title">Pull requests</h1></div>
        <select className="input ex__repo" value={repo} onChange={(e) => pickRepo(e.target.value)}>
          <option value="">Select a repository…</option>
          {repos?.map((r) => <option key={r.fullName} value={r.fullName}>{r.fullName}</option>)}
        </select>
      </header>

      {error && <div className="alert">{error}</div>}

      <div className="ex">
        <aside className="ex__tree panel">
          <div className="panel__head"><h3>Open PRs</h3>{pulls && <span className="panel__hint">{pulls.length}</span>}</div>
          <div className="ex__treebody">
            {!repo && <p className="muted">Pick a repository to list its open pull requests.</p>}
            {pullsLoading && <p className="muted">Loading pull requests…</p>}
            {pulls && pulls.length === 0 && <p className="muted">No open pull requests.</p>}
            <div className="prlist">
              {pulls?.map((p) => (
                <button key={p.number} className={"pritem" + (active?.number === p.number ? " pritem--active" : "")}
                  onClick={() => { setActive(p); setReview(null); setError(""); }}>
                  <div className="pritem__title">{p.title}</div>
                  <div className="pritem__meta">#{p.number} · @{p.author}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="ex__main panel">
          <div className="panel__head">
            <h3>{active ? `#${active.number} ${active.title}` : "No pull request selected"}</h3>
            {active && (
              <button className="btn btn--primary btn--xs" onClick={runReview} disabled={reviewing}>
                <SparklesIcon /> {reviewing ? "Reviewing…" : "AI review"}
              </button>
            )}
          </div>
          <div className="ex__mainbody">
            {!active && <p className="muted">Select a pull request to review it and discuss with your team.</p>}

            {active && (
              <p className="muted" style={{ marginTop: 0 }}>
                opened by @{active.author} ·{" "}
                <a href={active.url} target="_blank" rel="noreferrer">open on GitHub <ExternalIcon className="ic" /></a>
              </p>
            )}

            {reviewing && <div className="ex__explain"><div className="ex__explainhead"><SparklesIcon /> AI review</div><p className="muted">Analysing the diff…</p></div>}

            {review && (
              <div className="ex__explain">
                <div className="ex__explainhead"><SparklesIcon /> AI review</div>
                <div className="ex__explaintext">{review.summary}</div>
                {review.comments.length > 0 && (
                  <div className="rc">
                    {review.comments.map((c, i) => (
                      <div className={"rc__item rc__item--" + (c.severity || "info")} key={i}>
                        <div className="rc__head">
                          <span className={"rc__sev rc__sev--" + (c.severity || "info")}>{c.severity || "info"}</span>
                          {c.file && <span className="rc__file">{c.file}</span>}
                        </div>
                        <div className="rc__body">{c.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {active && <Discussion target={`pr:${repo}#${active.number}`} />}
          </div>
        </section>
      </div>
    </AppShell>
  );
}