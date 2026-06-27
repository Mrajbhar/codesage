import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import api from "../api/axios";

interface Comment { file: string | null; severity: string; comment: string }
interface ReviewDetail {
  id: string; repoFullName: string; pullNumber: number; title: string; summary: string;
  commentCount: number; criticalCount: number; ranByName: string; createdAt: string; comments: Comment[];
}

const order: Record<string, number> = { critical: 0, warning: 1, suggestion: 2, info: 3 };

export default function ReviewDetailPage() {
  const { id } = useParams();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/reviews/${id}`)
      .then((r) => setReview(r.data))
      .catch(() => setNotFound(true));
  }, [id]);

  const sorted = review ? [...review.comments].sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9)) : [];

  return (
    <AppShell>
      <header className="topbar">
        <div>
          <div className="eyebrow"><Link to="/dashboard">← Back to dashboard</Link></div>
          <h1 className="page__title">{review?.title ?? "Review"}</h1>
        </div>
      </header>

      {notFound && <div className="empty"><p>This review couldn't be found.</p></div>}
      {!review && !notFound && <p className="muted">Loading…</p>}

      {review && (
        <>
          <section className="panel">
            <div className="panel__head">
              <h3>Summary</h3>
              <span className="panel__hint">{review.repoFullName} #{review.pullNumber}</span>
            </div>
            <div className="panel__body">
              <p>{review.summary || "No summary was produced."}</p>
              <div className="review-meta">
                <span className="badge">{review.commentCount} finding{review.commentCount === 1 ? "" : "s"}</span>
                {review.criticalCount > 0 && <span className="badge badge--critical">{review.criticalCount} critical</span>}
                <span className="muted">by {review.ranByName}</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel__head"><h3>Findings</h3><span className="panel__hint">{sorted.length}</span></div>
            <div className="panel__body">
              {sorted.length === 0 ? (
                <p className="muted">No issues were flagged. Clean pull request.</p>
              ) : (
                <div className="findings">
                  {sorted.map((c, i) => (
                    <div className={"finding finding--" + c.severity} key={i}>
                      <div className="finding__head">
                        <span className={"sev sev--" + c.severity}>{c.severity}</span>
                        {c.file && <code className="finding__file">{c.file}</code>}
                      </div>
                      <div className="finding__body">{c.comment}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}