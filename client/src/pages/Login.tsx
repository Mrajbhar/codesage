import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GitHubIcon, GoogleIcon } from "../components/icons";
import CodebaseGraph from "../components/CodebaseGraph";
import NodeField from "../components/Nodefield";
import { startGitHubLogin, startGoogleLogin } from "../auth/oauth";
import api from "../api/axios";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resent, setResent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setNeedsVerify(false); setResent(false);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      if (err?.response?.status === 403 && err?.response?.data?.needsVerification) {
        setNeedsVerify(true);
        setError("Please verify your email before signing in.");
      } else {
        setError(err?.response?.data?.message ?? "Login failed. Check your details and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    try { await api.post("/auth/resend-verification", { email }); setResent(true); } catch { setResent(true); }
  }

  return (
    <div className="auth">
      <aside className="auth__brand">
        <NodeField density={1.1} />
        <div className="auth__orb auth__orb--1" />
        <div className="auth__orb auth__orb--2" />
        <span className="brandmark"><span className="brandmark__glyph">◇</span> CodeSage</span>

        <div className="brand__pitch">
          <h2 className="brand__title">It sees the whole graph, not just the diff.</h2>
          <p className="brand__sub">
            CodeSage maps how your files connect, so it flags the change three modules away that you'd miss.
          </p>
        </div>

        <div className="graphcard">
          <div className="graphcard__head"><span className="graphcard__dot" /> acme-api · dependency map</div>
          <CodebaseGraph />
        </div>
      </aside>

      <main className="auth__panel">
        <form className="card" onSubmit={onSubmit}>
          <div className="card__head">
            <h1 className="card__title">Welcome back</h1>
            <p className="card__sub">Sign in to keep your reviews moving.</p>
          </div>

          {error && <div className="alert">{error}</div>}
          {needsVerify && (
            <div className="resend-row">
              {resent ? <span className="muted">Verification link sent. Check your email (or the API console in dev).</span>
                      : <button type="button" className="btn btn--ghost btn--sm" onClick={resend}>Resend verification email</button>}
            </div>
          )}

          <div className="field">
            <label className="field__label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" placeholder="you@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">Password</label>
            <PasswordInput id="password" placeholder="••••••••" value={password}
              onChange={setPassword} required autoComplete="current-password" />
          </div>

          <button className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="muted" style={{ textAlign: "right", marginTop: -6 }}><Link to="/forgot-password">Forgot password?</Link></p>

          <div className="divider">or</div>

          <div className="oauth">
            <button type="button" className="btn btn--ghost btn--block" onClick={startGitHubLogin}><GitHubIcon /> Continue with GitHub</button>
            <button type="button" className="btn btn--ghost btn--block" onClick={startGoogleLogin}><GoogleIcon /> Continue with Google</button>
          </div>

          <p className="muted" style={{ textAlign: "center" }}>
            No account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </main>
    </div>
  );
}