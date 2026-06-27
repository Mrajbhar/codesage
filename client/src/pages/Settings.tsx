import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import api from "../api/axios";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../auth/AuthContext";
import { tokenStore } from "../auth/tokenStore";
import { orgStore } from "../auth/orgStore";

export default function Settings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // change password
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // change email
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // delete account
  const [confirm, setConfirm] = useState("");
  const [delMsg, setDelMsg] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function changePassword(e: FormEvent) {
    e.preventDefault(); setPwMsg(null);
    try {
      const r = await api.post("/users/me/change-password", { currentPassword: curPw, newPassword: newPw });
      setPwMsg({ ok: true, text: r.data.message }); setCurPw(""); setNewPw("");
    } catch (e: any) { setPwMsg({ ok: false, text: e?.response?.data?.message ?? "Couldn't change password." }); }
  }

  async function changeEmail(e: FormEvent) {
    e.preventDefault(); setEmailMsg(null);
    try {
      const r = await api.post("/users/me/change-email", { newEmail: email });
      setUser(r.data); setEmailMsg({ ok: true, text: "Email updated." });
    } catch (e: any) { setEmailMsg({ ok: false, text: e?.response?.data?.message ?? "Couldn't change email." }); }
  }

  async function disconnect(provider: "github" | "google") {
    try { const r = await api.delete(`/users/me/${provider}`); setUser(r.data); }
    catch (e: any) { alert(e?.response?.data?.message ?? "Couldn't disconnect."); }
  }

  async function deleteAccount() {
    if (confirm !== "DELETE") { setDelMsg('Type DELETE to confirm.'); return; }
    setDeleting(true);
    try {
      await api.delete("/users/me");
      tokenStore.clear(); orgStore.clear();
      navigate("/login", { replace: true });
    } catch (e: any) {
      setDelMsg(e?.response?.data?.message ?? "Couldn't delete account."); setDeleting(false);
    }
  }

  return (
    <AppShell>
      <header className="topbar">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="page__title">Settings</h1>
        </div>
      </header>

      {/* Change password */}
      <section className="panel">
        <div className="panel__head"><h3>Password</h3></div>
        <div className="panel__body">
          <form className="stack" onSubmit={changePassword}>
            {user && !("hasPassword" in user) && (
              <p className="muted">Set a password to sign in with email, in addition to your connected accounts.</p>
            )}
            <div className="field">
              <label className="field__label">Current password</label>
              <PasswordInput value={curPw} onChange={setCurPw} placeholder="Leave blank if you signed up with GitHub/Google" autoComplete="current-password" />
            </div>
            <div className="field">
              <label className="field__label">New password</label>
              <PasswordInput value={newPw} onChange={setNewPw} placeholder="At least 8 characters" required autoComplete="new-password" />
            </div>
            {pwMsg && <div className={"alert" + (pwMsg.ok ? " alert--ok" : "")}>{pwMsg.text}</div>}
            <button className="btn btn--primary" style={{ alignSelf: "flex-start" }}>Update password</button>
          </form>
        </div>
      </section>

      {/* Change email */}
      <section className="panel">
        <div className="panel__head"><h3>Email</h3></div>
        <div className="panel__body">
          <form className="stack" onSubmit={changeEmail}>
            <div className="field">
              <label className="field__label">Email address</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {emailMsg && <div className={"alert" + (emailMsg.ok ? " alert--ok" : "")}>{emailMsg.text}</div>}
            <button className="btn btn--primary" style={{ alignSelf: "flex-start" }}>Update email</button>
          </form>
        </div>
      </section>

      {/* Connected accounts */}
      <section className="panel">
        <div className="panel__head"><h3>Connected accounts</h3></div>
        <div className="panel__body stack">
          <div className="setting-row">
            <span>GitHub {user?.gitHubLogin ? <b>· {user.gitHubLogin}</b> : <span className="muted">not connected</span>}</span>
            {user?.gitHubLogin && <button className="btn btn--ghost btn--sm" onClick={() => disconnect("github")}>Disconnect</button>}
          </div>
          <div className="setting-row">
            <span>Google {user?.googleId ? <b>· connected</b> : <span className="muted">not connected</span>}</span>
            {user?.googleId && <button className="btn btn--ghost btn--sm" onClick={() => disconnect("google")}>Disconnect</button>}
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="panel panel--danger">
        <div className="panel__head"><h3>Delete account</h3></div>
        <div className="panel__body stack">
          <p className="muted">This permanently deletes your account, removes you from all organizations, and deletes any organization you solely own. This can't be undone.</p>
          <div className="field">
            <label className="field__label">Type <b>DELETE</b> to confirm</label>
            <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" />
          </div>
          {delMsg && <div className="alert">{delMsg}</div>}
          <button className="btn btn--danger" style={{ alignSelf: "flex-start" }} onClick={deleteAccount} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}