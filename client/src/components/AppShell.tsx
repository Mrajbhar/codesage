import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import { orgStore } from "../auth/orgStore";
import Header from "./Header";
import Footer from "./Footer";
import {
  GridIcon, RepoIcon, UserIcon, ShieldIcon, LogoutIcon, CodeIcon, ReviewIcon,
  BuildingIcon, CardIcon, ChartIcon, ClockIcon, SearchIcon,
  GearIcon,
} from "./icons";

const RAIL_KEY = "cs_rail";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", label: "Overview", icon: GridIcon },
      { to: "/analytics", label: "Analytics", icon: ChartIcon },
      { to: "/activity", label: "Activity", icon: ClockIcon },
    ],
  },
  {
    label: "Code",
    items: [
      { to: "/repositories", label: "Repositories", icon: RepoIcon },
      { to: "/explore", label: "Explore", icon: CodeIcon },
      { to: "/search", label: "Search", icon: SearchIcon },
      { to: "/pulls", label: "Pull requests", icon: ReviewIcon },
    ],
  },
  {
    label: "Organization",
    items: [
      { to: "/team", label: "Team", icon: BuildingIcon },
      { to: "/billing", label: "Billing", icon: CardIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/profile", label: "Profile", icon: UserIcon },
      { to: "/settings", label: "Settings", icon: GearIcon },
    ],
  },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const [rail, setRail] = useState<boolean>(() => {
    try { return localStorage.getItem(RAIL_KEY) === "1"; } catch { return false; }
  });
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMenuOpen(false); }, [loc.pathname]);

  // Determine the user's role in their current organization, to gate management menus.
  const [orgRole, setOrgRole] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    api.get("/orgs")
      .then((r) => {
        if (cancelled) return;
        const current = orgStore.get();
        const orgs: { id: string; myRole: string }[] = r.data ?? [];
        const mine = orgs.find((o) => o.id === current) ?? orgs[0];
        setOrgRole(mine?.myRole ?? "");
      })
      .catch(() => { if (!cancelled) setOrgRole(""); });
    return () => { cancelled = true; };
  }, [loc.pathname]);

  // Org admins/owners (or platform admins) can manage the team and billing.
  const canManageOrg =
    user?.role === "Admin" ||
    ["owner", "admin"].includes((orgRole || "").toLowerCase());

  function toggleRail() {
    setRail((r) => {
      const next = !r;
      try { localStorage.setItem(RAIL_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  }

  const cls = (path: string) =>
    "nav__item" + (loc.pathname === path ? " nav__item--active" : "");

  const initials = (user?.displayName ?? "U")
    .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className={"app" + (rail ? " app--rail" : "") + (menuOpen ? " app--menu-open" : "")}>
      <Header onToggleRail={toggleRail} rail={rail} onToggleMenu={() => setMenuOpen((o) => !o)} />

      <div className="app__body">
        {/* tap-to-close backdrop on mobile */}
        <div className="sidebar__scrim" onClick={() => setMenuOpen(false)} aria-hidden />
        <aside className="sidebar">
          <nav className="nav">
            {NAV_GROUPS.map((group) => {
              const items = group.items.filter((it) =>
                canManageOrg || !["/team", "/billing"].includes(it.to));
              if (items.length === 0) return null;
              return (
                <div className="nav__group" key={group.label}>
                  <div className="nav__grouplabel">{group.label}</div>
                  {items.map(({ to, label, icon: Icon }) => (
                    <Link key={to} className={cls(to)} to={to} title={rail ? label : undefined}>
                      <Icon /><span className="nav__label">{label}</span>
                    </Link>
                  ))}
                </div>
              );
            })}
            {user?.role === "Admin" && (
              <div className="nav__group">
                <div className="nav__grouplabel">Platform</div>
                <Link className={cls("/admin")} to="/admin" title={rail ? "Admin" : undefined}>
                  <ShieldIcon /><span className="nav__label">Admin</span>
                </Link>
              </div>
            )}
          </nav>

          <div className="sidebar__user">
            {user?.avatarUrl
              ? <img className="avatar avatar--img" src={user.avatarUrl} alt="" />
              : <div className="avatar">{initials}</div>}
            <div className="user__meta">
              <div className="user__name">{user?.displayName}</div>
              <div className="user__role">{user?.role}</div>
            </div>
            <button className="iconbtn" onClick={logout} aria-label="Log out" title="Log out">
              <LogoutIcon />
            </button>
          </div>
        </aside>

        <main className="main">
          <div className="main__content">{children}</div>
        </main>
      </div>

      <Footer />
    </div>
  );
}