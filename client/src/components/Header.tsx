import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import OrgPicker from "./Orgpicker";
import NotificationBell from "./Notificationbell";
import { SearchIcon } from "./icons";

export default function Header({ onToggleRail, rail, onToggleMenu }: { onToggleRail: () => void; rail: boolean; onToggleMenu?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initials = (user?.displayName ?? "U")
    .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) navigate("/search");
  }

  return (
    <header className="appheader">
      <div className="appheader__brand">
        <button className="hamburger" onClick={onToggleMenu}
          aria-label="Open menu" title="Menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="20" height="20">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <button className="railtoggle" onClick={onToggleRail}
          aria-label={rail ? "Expand sidebar" : "Collapse sidebar"} title={rail ? "Expand" : "Collapse"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" />
          </svg>
        </button>
        <Link to="/dashboard" className="brandmark">
          <span className="brandmark__glyph">◇</span>
          <span className="brandmark__text">CodeSage</span>
        </Link>
        <span className="appheader__div" />
        <OrgPicker />
      </div>

      <form className="cmdbar" onSubmit={submitSearch}>
        <SearchIcon className="cmdbar__ic" />
        <input
          ref={inputRef}
          className="cmdbar__input"
          placeholder="Search code by meaning…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <kbd className="cmdbar__kbd">{isMac ? "⌘ K" : "Ctrl K"}</kbd>
      </form>

      <div className="appheader__right">
        <NotificationBell />
        <Link to="/profile" className="userchip" title="Your profile">
          {user?.avatarUrl
            ? <img className="userchip__img" src={user.avatarUrl} alt="" />
            : <span className="userchip__initials">{initials}</span>}
          <span className="userchip__meta">
            <span className="userchip__name">{user?.displayName}</span>
            <span className="userchip__role">{user?.role}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}