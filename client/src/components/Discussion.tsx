import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { MessageIcon, TrashIcon } from "./icons";

interface CommentDto { id: string; userId: string; userName: string; body: string; createdAt: string }

export default function Discussion({ target }: { target: string }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CommentDto[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get("/comments", { params: { target } })
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [target]);

  async function post() {
    if (!body.trim()) return;
    setPosting(true);
    try {
      const r = await api.post("/comments", { target, body });
      setItems((prev) => [...prev, r.data]);
      setBody("");
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    await api.delete(`/comments/${id}`);
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="disc">
      <div className="disc__head"><MessageIcon /> Discussion <span className="panel__hint">{items.length}</span></div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="disc__list">
          {items.length === 0 && <p className="muted">No comments yet. Start the discussion.</p>}
          {items.map((c) => (
            <div className="disc__item" key={c.id}>
              <div className="disc__avatar">{c.userName.slice(0, 2).toUpperCase()}</div>
              <div className="disc__bubble">
                <div className="disc__meta">
                  <b>{c.userName}</b>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                  {(c.userId === user?.id || user?.role === "Admin") && (
                    <button className="disc__del" onClick={() => remove(c.id)} aria-label="Delete comment"><TrashIcon /></button>
                  )}
                </div>
                <div className="disc__body">{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="disc__compose">
        <textarea className="input disc__ta" placeholder="Write a comment…" rows={2}
          value={body} onChange={(e) => setBody(e.target.value)} />
        <button className="btn btn--primary" onClick={post} disabled={posting || !body.trim()}>
          {posting ? "Posting…" : "Comment"}
        </button>
      </div>
    </div>
  );
}