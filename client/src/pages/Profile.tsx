import { useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useAuth } from "../auth/AuthContext";
import { startGitHubLink } from "../auth/oauth";
import { GitHubIcon } from "../components/icons";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [status, setStatus] = useState<"" | "saving" | "saved">("");
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(""); setStatus("saving");
    try {
      const r = await api.put("/users/me", { displayName });
      setUser(r.data);
      setStatus("saved");
      setTimeout(() => setStatus(""), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not save changes.");
      setStatus("");
    }
  }

  async function disconnectGitHub() {
    const r = await api.delete("/users/me/github");
    setUser(r.data);
  }

  return (
    <AppShell>
      <header className="topbar">
        <div>
          <div className="eyebrow">Account</div>
          <h1 className="page__title">Profile</h1>
        </div>
      </header>

      <section className="panel">
        <div className="panel__head"><h3>Details</h3></div>
        <form className="panel__body" onSubmit={save}>
          {error && <div className="alert">{error}</div>}
          <div className="field">
            <label className="field__label">Display name</label>
            <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field__label">Email</label>
            <input className="input" value={user?.email ?? ""} disabled />
          </div>
          <div className="field">
            <label className="field__label">Role</label>
            <div><span className={"badge" + (user?.role === "Admin" ? " badge--admin" : "")}>{user?.role}</span></div>
          </div>
          <button className="btn btn--primary" style={{ alignSelf: "flex-start" }} disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save changes"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel__head"><h3>Connected accounts</h3></div>
        <div className="panel__body">
          <div className="gh-row">
            <div className="gh-row__left"><GitHubIcon /> <span>GitHub</span></div>
            {user?.gitHubConnected ? (
              <div className="gh-row__right">
                <span className="pill pill--ok">Connected as @{user.gitHubLogin}</span>
                <button className="btn btn--ghost" onClick={disconnectGitHub}>Disconnect</button>
              </div>
            ) : (
              <button className="btn btn--primary" onClick={startGitHubLink}>Connect</button>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
