import { Link } from "react-router-dom";
import AuthBackdrop from "../components/AuthBackdrop";

const ENTRIES = [
  { date: "Latest", items: ["Automated webhook-driven PR review with per-repo settings", "Review detail view with full findings", "Email verification on signup", "Notification history with pagination", "Server-side search across audit logs"] },
  { date: "Recent", items: ["Account settings: change password/email, manage connected accounts, delete account", "In-app invitation accept + email delivery", "Usage quotas with atomic enforcement", "Rate limiting on authentication"] },
  { date: "Earlier", items: ["Multi-tenant organizations and roles", "Razorpay billing with subscription and one-time modes", "Live notifications, audit timeline, analytics", "Redis caching, background jobs, vector search"] },
];

export default function Changelog() {
  return (
    <div className="docpage">
      <AuthBackdrop />
      <div className="docpage__inner">
        <Link className="docpage__back" to="/dashboard">← Back to app</Link>
        <span className="brandmark"><span className="brandmark__glyph">◇</span> CodeSage</span>
        <h1>Changelog</h1>
        <p className="docpage__lead">What's new in CodeSage.</p>

        {ENTRIES.map((e) => (
          <div className="changelog__group" key={e.date}>
            <h2>{e.date}</h2>
            <ul className="changelog__list">
              {e.items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}