import { useEffect, useState } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useAuth } from "../auth/AuthContext";

interface AdminUser {
  id: string; email: string; displayName: string; role: string;
  gitHubConnected: boolean; createdAt: string;
}

export default function Admin() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/users")
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false));
  }, []);

  async function setRole(u: AdminUser, role: string) {
    setError(""); setBusyId(u.id);
    try {
      const r = await api.put(`/admin/users/${u.id}/role`, { role });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? r.data : x)));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't update role.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell>
      <header className="topbar">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="page__title">Users</h1>
        </div>
      </header>

      <section className="panel">
        <div className="panel__head">
          <h3>All users</h3>
          <span className="panel__hint">{users.length} total</span>
        </div>

        {error && <div className="alert" style={{ margin: "14px 18px 0" }}>{error}</div>}

        {loading ? (
          <div className="panel__body"><p className="muted">Loading…</p></div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>GitHub</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.displayName}{me?.id === u.id && <span className="muted"> (you)</span>}</td>
                    <td className="mono-cell">{u.email}</td>
                    <td>
                      <div className="role-cell">
                        <span className={"badge" + (u.role === "Admin" ? " badge--admin" : "")}>{u.role}</span>
                        <button
                          className="btn btn--ghost btn--xs"
                          disabled={busyId === u.id}
                          onClick={() => setRole(u, u.role === "Admin" ? "User" : "Admin")}
                        >
                          {busyId === u.id ? "…" : u.role === "Admin" ? "Demote" : "Promote"}
                        </button>
                      </div>
                    </td>
                    <td>{u.gitHubConnected ? "Connected" : "—"}</td>
                    <td className="mono-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}