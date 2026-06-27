import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AuthBackdrop from "../components/AuthBackdrop";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try { await api.post("/auth/forgot-password", { email }); setSent(true); }
    catch { setSent(true); }   // same message regardless, to avoid leaking which emails exist
    finally { setBusy(false); }
  }

  return (
    <div className="center-screen">
      <AuthBackdrop />
      <form className="card" onSubmit={onSubmit} style={{ maxWidth: 380 }}>
        <div className="card__head">
          <h1 className="card__title">Reset your password</h1>
          <p className="card__sub">We'll email you a link to set a new one.</p>
        </div>
        {sent ? (
          <>
            <div className="alert alert--ok">If that email is registered, a reset link is on its way. Check your inbox.</div>
            <Link className="btn btn--primary btn--block" to="/login">Back to sign in</Link>
          </>
        ) : (
          <>
            <div className="field">
              <label className="field__label" htmlFor="email">Email</label>
              <input id="email" className="input" type="email" placeholder="you@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn--primary btn--block" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <p className="muted" style={{ textAlign: "center" }}><Link to="/login">Back to sign in</Link></p>
          </>
        )}
      </form>
    </div>
  );
}