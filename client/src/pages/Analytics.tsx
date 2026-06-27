import { useEffect, useState } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { orgStore } from "../auth/orgStore";
import { SkeletonRows } from "../components/Skeleton";

interface Period { period: string; explain: number; review: number; total: number }
interface Overview { members: number; plan: string; comments: number;
  usage: { period: string; used: number; limit: number; explain: number; review: number };
  history: Period[]; }

export default function Analytics() {
  const orgId = orgStore.get();
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    if (!orgId) return;
    api.get("/analytics/overview", { params: { orgId } }).then((r) => setData(r.data));
  }, [orgId]);

  if (!orgId) return (
    <AppShell>
      <header className="topbar"><div><div className="eyebrow">Analytics</div><h1 className="page__title">Analytics</h1></div></header>
      <p className="muted">Pick or create an organization first.</p>
    </AppShell>
  );

  if (!data) return (
    <AppShell>
      <header className="topbar"><div><div className="eyebrow">Analytics</div><h1 className="page__title">Analytics</h1></div></header>
      <SkeletonRows rows={5} />
    </AppShell>
  );

  const max = Math.max(1, ...data.history.map((h) => h.total));

  return (
    <AppShell>
      <header className="topbar">
        <div><div className="eyebrow">Analytics</div><h1 className="page__title">Workspace analytics</h1></div>
        <span className="badge">{data.plan}</span>
      </header>

      <div className="stats">
        <div className="stat"><div className="stat__label">AI calls this month</div><div className="stat__value">{data.usage.used}</div><div className="stat__hint">of {data.usage.limit}</div></div>
        <div className="stat"><div className="stat__label">Members</div><div className="stat__value">{data.members}</div><div className="stat__hint">in this org</div></div>
        <div className="stat"><div className="stat__label">Discussion comments</div><div className="stat__value">{data.comments}</div><div className="stat__hint">all time</div></div>
      </div>

      <section className="panel">
        <div className="panel__head"><h3>Usage over time</h3><span className="panel__hint">6 months</span></div>
        <div className="panel__body">
          <div className="bars">
            {data.history.map((h) => {
              const ePct = (h.explain / max) * 100;
              const rPct = (h.review / max) * 100;
              return (
                <div className="bar" key={h.period} title={`${h.period}: ${h.total} calls`}>
                  <div className="bar__stack">
                    <div className="bar__r" style={{ height: rPct + "%" }} />
                    <div className="bar__e" style={{ height: ePct + "%" }} />
                  </div>
                  <div className="bar__cap">{h.period.slice(5)}</div>
                </div>
              );
            })}
          </div>
          <div className="bars-legend">
            <span><i className="cm__dot" style={{ background: "#2DD4BF" }} /> explain</span>
            <span><i className="cm__dot" style={{ background: "#7F77DD" }} /> review</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}