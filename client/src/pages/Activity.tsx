import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { orgStore } from "../auth/orgStore";
import {
  BuildingIcon, MailIcon, UserIcon, SparklesIcon, CardIcon, ClockIcon,
} from "../components/icons";

interface AuditDto { id: string; actorName: string; action: string; target: string; createdAt: string }

// Map each action to an icon and a human sentence.
function describe(a: AuditDto): { icon: ReactNode; text: string } {
  switch (a.action) {
    case "org.created": return { icon: <BuildingIcon />, text: `created the organization` };
    case "member.invited": return { icon: <MailIcon />, text: `invited ${a.target}` };
    case "member.joined": return { icon: <UserIcon />, text: `joined the organization` };
    case "member.role_changed": return { icon: <UserIcon />, text: `changed a role — ${a.target}` };
    case "member.removed": return { icon: <UserIcon />, text: `removed ${a.target}` };
    case "review.ran": return { icon: <SparklesIcon />, text: `ran an AI review on ${a.target}` };
    case "plan.changed": return { icon: <CardIcon />, text: `switched the plan to ${a.target}` };
    default: return { icon: <ClockIcon />, text: `${a.action} ${a.target}` };
  }
}

function when(iso: string) {
  const d = new Date(iso);
  const s = Math.max(1, (Date.now() - d.getTime()) / 1000);
  if (s < 3600) return Math.round(s / 60) + "m ago";
  if (s < 86400) return Math.round(s / 3600) + "h ago";
  if (s < 604800) return Math.round(s / 86400) + "d ago";
  return d.toLocaleDateString();
}

export default function Activity() {
  const orgId = orgStore.get();
  const [logs, setLogs] = useState<AuditDto[] | null>(null);

  useEffect(() => {
    if (!orgId) { setLogs([]); return; }
    api.get("/audit", { params: { limit: 100 } })
      .then((r) => setLogs(r.data))
      .catch(() => setLogs([]));
  }, [orgId]);

  return (
    <AppShell>
      <header className="topbar">
        <div><div className="eyebrow">Activity</div><h1 className="page__title">Audit timeline</h1></div>
      </header>

      {!orgId && <p className="muted">Pick or create an organization to see its activity.</p>}

      {logs === null && <p className="muted">Loading…</p>}

      {logs && logs.length === 0 && orgId && (
        <div className="empty">
          <div className="empty__glyph"><ClockIcon /></div>
          <p>No activity yet. Actions like invites, role changes, plan changes and AI reviews will appear here.</p>
        </div>
      )}

      {logs && logs.length > 0 && (
        <div className="timeline">
          {logs.map((a) => {
            const d = describe(a);
            return (
              <div className="tlrow" key={a.id}>
                <div className="tlrow__icon">{d.icon}</div>
                <div className="tlrow__body">
                  <div className="tlrow__text"><b>{a.actorName}</b> {d.text}</div>
                  <div className="tlrow__time">{when(a.createdAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}