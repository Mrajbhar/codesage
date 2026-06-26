import { useEffect, useState } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useAuth } from "../auth/AuthContext";
import { BuildingIcon, MailIcon, TrashIcon } from "../components/icons";

interface OrgDto { id: string; name: string; slug: string; plan: string; myRole: string; memberCount: number; createdAt: string }
interface Member { userId: string; email: string; displayName: string; role: string; joinedAt: string }
interface Invite { email: string; role: string; token: string; createdAt: string }
interface OrgDetail { id: string; name: string; slug: string; plan: string; myRole: string; members: Member[]; invitations: Invite[] }
interface PendingInvite { orgId: string; orgName: string; role: string; token: string; invitedBy: string; createdAt: string }

export default function Team() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<OrgDto[] | null>(null);
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<OrgDetail | null>(null);
  const [newName, setNewName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [pending, setPending] = useState<PendingInvite[]>([]);

  useEffect(() => { loadOrgs(); loadPending(); }, []);
  useEffect(() => { if (selected) loadDetail(selected); else setDetail(null); }, [selected]);

  function loadPending() {
    api.get("/orgs/invites/pending").then((r) => setPending(r.data)).catch(() => setPending([]));
  }

  async function acceptPending(token: string) {
    setError("");
    try {
      const r = await api.post("/orgs/invites/accept", { token });
      await loadOrgs();
      loadPending();
      setSelected(r.data.id);
    } catch (e: any) { setError(e?.response?.data?.message ?? "Couldn't accept the invitation."); }
  }

  function loadOrgs() {
    api.get("/orgs").then((r) => {
      setOrgs(r.data);
      if (r.data.length && !selected) setSelected(r.data[0].id);
    });
  }
  function loadDetail(id: string) {
    api.get(`/orgs/${id}`).then((r) => setDetail(r.data)).catch(() => setError("Couldn't load that organization."));
  }

  async function createOrg() {
    if (!newName.trim()) return;
    setError("");
    try {
      const r = await api.post("/orgs", { name: newName });
      setNewName("");
      await loadOrgs();
      setSelected(r.data.id);
    } catch { setError("Couldn't create the organization."); }
  }

  async function invite() {
    if (!inviteEmail.trim() || !detail) return;
    setError("");
    try {
      await api.post(`/orgs/${detail.id}/invites`, { email: inviteEmail, role: inviteRole });
      setInviteEmail("");
      loadDetail(detail.id);
    } catch (e: any) { setError(e?.response?.data?.message ?? "Couldn't send the invite."); }
  }

  async function cancelInvite(token: string) {
    if (!detail) return;
    await api.delete(`/orgs/${detail.id}/invites/${token}`);
    loadDetail(detail.id);
  }

  async function changeRole(userId: string, role: string) {
    if (!detail) return;
    setError("");
    try {
      const r = await api.put(`/orgs/${detail.id}/members/${userId}/role`, { role });
      setDetail(r.data);
    } catch (e: any) { setError(e?.response?.data?.message ?? "Couldn't change role."); }
  }

  async function removeMember(userId: string) {
    if (!detail) return;
    setError("");
    try {
      await api.delete(`/orgs/${detail.id}/members/${userId}`);
      if (userId === user?.id) { await loadOrgs(); setSelected(""); }
      else loadDetail(detail.id);
    } catch (e: any) { setError(e?.response?.data?.message ?? "Couldn't remove member."); }
  }

  function copyLink(token: string) {
    const link = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard?.writeText(link);
    setCopied(token);
    setTimeout(() => setCopied(""), 1500);
  }

  const canManage = detail?.myRole === "Owner" || detail?.myRole === "Admin";

  return (
    <AppShell>
      <header className="topbar">
        <div><div className="eyebrow">Team</div><h1 className="page__title">Organizations</h1></div>
      </header>

      {error && <div className="alert">{error}</div>}

      {pending.length > 0 && (
        <section className="panel invites-panel">
          <div className="panel__head"><h3>Invitations for you</h3><span className="panel__hint">{pending.length}</span></div>
          <div className="invites">
            {pending.map((p) => (
              <div className="inviterow" key={p.token}>
                <MailIcon className="ic" />
                <span className="inviterow__email"><b>{p.orgName}</b> · invited by {p.invitedBy}</span>
                <span className="badge">{p.role}</span>
                <button className="btn btn--primary btn--xs" onClick={() => acceptPending(p.token)}>Accept</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel__head"><h3>Your organizations</h3>{orgs && <span className="panel__hint">{orgs.length}</span>}</div>
        <div className="panel__body">
          <div className="orglist">
            {orgs?.map((o) => (
              <button key={o.id} className={"orgitem" + (o.id === selected ? " orgitem--active" : "")} onClick={() => setSelected(o.id)}>
                <BuildingIcon className="orgitem__ic" />
                <div>
                  <div className="orgitem__name">{o.name}</div>
                  <div className="orgitem__meta">{o.memberCount} member{o.memberCount === 1 ? "" : "s"} · {o.myRole} · {o.plan}</div>
                </div>
              </button>
            ))}
            {orgs && orgs.length === 0 && <p className="muted">You're not in any organization yet. Create one below.</p>}
          </div>
          <div className="invite-form" style={{ marginTop: 14 }}>
            <input className="input" placeholder="New organization name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="btn btn--primary" onClick={createOrg} disabled={!newName.trim()}>Create</button>
          </div>
        </div>
      </section>

      {detail && (
        <>
          <section className="panel">
            <div className="panel__head"><h3>Members</h3><span className="panel__hint">{detail.members.length}</span></div>
            <div className="table-scroll">
              <table className="table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
                <tbody>
                  {detail.members.map((m) => (
                    <tr key={m.userId}>
                      <td>{m.displayName}{m.userId === user?.id && <span className="muted"> (you)</span>}</td>
                      <td className="mono-cell">{m.email}</td>
                      <td>
                        {canManage && !(m.role === "Owner") ? (
                          <select className="input role-select" value={m.role} onChange={(e) => changeRole(m.userId, e.target.value)}>
                            <option>Member</option><option>Admin</option><option>Owner</option>
                          </select>
                        ) : (
                          <span className={"badge" + (m.role === "Owner" ? " badge--admin" : "")}>{m.role}</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {(canManage || m.userId === user?.id) && (
                          <button className="disc__del" onClick={() => removeMember(m.userId)} aria-label="Remove member">
                            <TrashIcon />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {canManage && (
            <section className="panel">
              <div className="panel__head"><h3>Invite a teammate</h3></div>
              <div className="panel__body">
                <div className="invite-form">
                  <input className="input" type="email" placeholder="teammate@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                  <select className="input role-select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                    <option>Member</option><option>Admin</option>
                  </select>
                  <button className="btn btn--primary" onClick={invite} disabled={!inviteEmail.trim()}><MailIcon /> Invite</button>
                </div>

                {detail.invitations.length > 0 && (
                  <div className="invites">
                    {detail.invitations.map((i) => (
                      <div className="inviterow" key={i.token}>
                        <MailIcon className="ic" />
                        <span className="inviterow__email">{i.email}</span>
                        <span className="badge">{i.role}</span>
                        <button className="btn btn--ghost btn--xs" onClick={() => copyLink(i.token)}>{copied === i.token ? "Copied ✓" : "Copy link"}</button>
                        <button className="btn btn--ghost btn--xs" onClick={() => cancelInvite(i.token)}>Cancel</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}