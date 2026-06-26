import { useEffect, useState } from "react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { orgStore } from "../auth/orgStore";
import { CardIcon } from "../components/icons";

interface Plan { id: string; name: string; priceCents: number; aiCallsPerMonth: number; memberLimit: number; features: string[] }
interface UsageDto { period: string; used: number; limit: number; explain: number; review: number }
interface UsagePeriodDto { period: string; explain: number; review: number; total: number }
interface BillingEventDto { type: string; plan: string; amountCents: number; note?: string | null; createdAt: string }
interface Summary { plan: string; usage: UsageDto; history: UsagePeriodDto[]; events: BillingEventDto[]; billingLive: boolean }
interface BillingConfig { keyId: string; live: boolean }

// Prices are stored in paise (1/100 of INR); show as rupees.
const money = (paise: number) => paise === 0 ? "Free" : `₹${(paise / 100).toLocaleString("en-IN")}/mo`;

// Razorpay Checkout is loaded from their CDN. Avoids bundling and works in dev or prod.
function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load Razorpay Checkout."));
    document.body.appendChild(s);
  });
}

export default function Billing() {
  const orgId = orgStore.get();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/billing/plans").then((r) => setPlans(r.data));
    api.get("/billing/config").then((r) => setConfig(r.data));
    if (orgId) load();
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  function load() {
    api.get("/billing/summary", { params: { orgId } })
      .then((r) => setSummary(r.data))
      .catch(() => setError("Couldn't load billing details."));
  }

  async function pickPlan(planId: string) {
    if (!orgId || planId === summary?.plan) return;
    setError(""); setNote(""); setBusy(planId);
    try {
      const r = await api.post("/billing/checkout", { plan: planId }, { params: { orgId } });
      const mode = r.data.mode;

      // No keys, or downgrade to Free — the API already flipped the plan.
      if (mode === "simulated") { setNote(r.data.message); load(); return; }

      if (mode === "error") { setError(r.data.message); return; }

      if (!config?.keyId) { setError("Razorpay key isn't configured."); return; }
      await loadRazorpay();
      const Razorpay = (window as any).Razorpay;

      // Recurring subscription (plan_id configured).
      if (mode === "subscription") {
        const rzp = new Razorpay({
          key: config.keyId, subscription_id: r.data.subscriptionId,
          name: "CodeSage", description: `${planId} plan`,
          theme: { color: "#2DD4BF" },
          modal: { ondismiss: () => setBusy("") },
          handler: () => { setNote("Payment authorized. Your plan will switch once Razorpay confirms it."); load(); },
        });
        rzp.on("payment.failed", (e: any) => setError(e?.error?.description ?? "Payment failed."));
        rzp.open();
        return;
      }

      // One-time order (dev/order mode — no plan_id needed).
      if (mode === "order") {
        const rzp = new Razorpay({
          key: config.keyId, order_id: r.data.orderId, amount: r.data.amount, currency: "INR",
          name: "CodeSage", description: `${planId} plan (one-time)`,
          theme: { color: "#2DD4BF" },
          modal: { ondismiss: () => setBusy("") },
          handler: async (resp: any) => {
            try {
              await api.post("/billing/verify", {
                plan: planId,
                razorpayOrderId: resp.razorpay_order_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                razorpaySignature: resp.razorpay_signature,
              }, { params: { orgId } });
              setNote(`Payment verified — switched to ${planId}.`);
              load();
            } catch (e: any) {
              setError(e?.response?.data?.message ?? "Payment verification failed.");
            }
          },
        });
        rzp.on("payment.failed", (e: any) => setError(e?.error?.description ?? "Payment failed."));
        rzp.open();
        return;
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't switch plans.");
    } finally { setBusy(""); }
  }

  if (!orgId) return (
    <AppShell>
      <header className="topbar"><div><div className="eyebrow">Billing</div><h1 className="page__title">Billing</h1></div></header>
      <p className="muted">Pick or create an organization first — billing applies per workspace.</p>
    </AppShell>
  );

  const pct = summary ? Math.min(100, Math.round((summary.usage.used / Math.max(1, summary.usage.limit)) * 100)) : 0;

  return (
    <AppShell>
      <header className="topbar">
        <div><div className="eyebrow">Billing</div><h1 className="page__title">Plans & usage</h1></div>
        {summary && !summary.billingLive && <span className="badge">Simulated billing</span>}
      </header>

      {error && <div className="alert">{error}</div>}
      {note && <div className="alert alert--ok">{note}</div>}

      {summary && (
        <section className="panel">
          <div className="panel__head"><h3>This month</h3><span className="panel__hint">{summary.usage.period}</span></div>
          <div className="panel__body">
            <div className="usage-top">
              <div><div className="usage-v">{summary.usage.used}<span> / {summary.usage.limit}</span></div><div className="usage-k">AI calls used</div></div>
              <div><div className="usage-v">{summary.usage.explain}</div><div className="usage-k">explain</div></div>
              <div><div className="usage-v">{summary.usage.review}</div><div className="usage-k">review</div></div>
            </div>
            <div className="meter"><div className="meter__fill" style={{ width: pct + "%" }} /></div>
            <div className="meter__cap">{pct}% of monthly quota</div>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel__head"><h3>Plans</h3></div>
        <div className="plangrid">
          {plans.map((p) => {
            const current = summary?.plan === p.id;
            return (
              <div key={p.id} className={"plan" + (current ? " plan--current" : "")}>
                <div className="plan__name">{p.name}</div>
                <div className="plan__price">{money(p.priceCents)}</div>
                <ul className="plan__features">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <button className={"btn " + (current ? "btn--ghost" : "btn--primary") + " btn--block"}
                  disabled={current || busy === p.id} onClick={() => pickPlan(p.id)}>
                  {current ? "Current plan" : busy === p.id ? "Opening checkout…" : `Switch to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {summary && (
        <section className="panel">
          <div className="panel__head"><h3>Billing history</h3><CardIcon className="ic" /></div>
          {summary.events.length === 0 ? (
            <div className="panel__body"><p className="muted">No billing activity yet.</p></div>
          ) : (
            <div className="table-scroll">
              <table className="table">
                <thead><tr><th>Date</th><th>Event</th><th>Plan</th><th>Amount</th><th>Note</th></tr></thead>
                <tbody>
                  {summary.events.map((e, i) => (
                    <tr key={i}>
                      <td className="mono-cell">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td><span className="badge">{e.type}</span></td>
                      <td>{e.plan}</td>
                      <td className="mono-cell">{e.amountCents === 0 ? "—" : `₹${(e.amountCents / 100).toLocaleString("en-IN")}`}</td>
                      <td className="muted">{e.note ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}