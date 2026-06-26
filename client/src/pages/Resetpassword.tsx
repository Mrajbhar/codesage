import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't reset your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center-screen">
      <form className="card" onSubmit={onSubmit} style={{ maxWidth: 380 }}>
        <div className="card__head">
          <h1 className="card__title">Set a new password</h1>
          <p className="card__sub">
            Choose a strong password you don't use elsewhere.
          </p>
        </div>
        {!token && (
          <div className="alert">This reset link is missing its token.</div>
        )}
        {error && <div className="alert">{error}</div>}
        {done ? (
          <div className="alert alert--ok">
            Password updated. Taking you to sign in…
          </div>
        ) : (
          <>
            <div className="field">
              <label className="field__label" htmlFor="pw">
                New password
              </label>
              <input
                id="pw"
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="btn btn--primary btn--block"
              disabled={busy || !token}
            >
              {busy ? "Updating…" : "Update password"}
            </button>
            <p className="muted" style={{ textAlign: "center" }}>
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
