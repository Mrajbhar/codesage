import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GitHubIcon, GoogleIcon } from "../components/icons";
import CodebaseGraph from "../components/CodebaseGraph";
import { startGitHubLogin, startGoogleLogin } from "../auth/oauth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(email, password, displayName);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not create your account. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <aside className="auth__brand">
        <span className="brandmark"><span className="brandmark__glyph">◇</span> CodeSage</span>

        <div className="brand__pitch">
          <h2 className="brand__title">Map your codebase. Review every change.</h2>
          <p className="brand__sub">
            Connect a repository and CodeSage builds its dependency graph, then reviews each pull request against it.
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
            <h1 className="card__title">Create your account</h1>
            <p className="card__sub">Free while you set up your first repository.</p>
          </div>

          {error && <div className="alert">{error}</div>}

          <div className="field">
            <label className="field__label" htmlFor="name">Display name</label>
            <input id="name" className="input" type="text" placeholder="Ada Lovelace"
              value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" placeholder="you@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">Password</label>
            <input id="password" className="input" type="password" placeholder="At least 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>

          <button className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? "Creating…" : "Create account"}
          </button>

          <div className="divider">or</div>

          <div className="oauth">
            <button type="button" className="btn btn--ghost btn--block" onClick={startGitHubLogin}><GitHubIcon /> Sign up with GitHub</button>
            <button type="button" className="btn btn--ghost btn--block" onClick={startGoogleLogin}><GoogleIcon /> Sign up with Google</button>
          </div>

          <p className="muted" style={{ textAlign: "center" }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
