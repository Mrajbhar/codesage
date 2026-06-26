import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import {
  GridIcon,
  RepoIcon,
  UserIcon,
  ShieldIcon,
  LogoutIcon,
  CodeIcon,
  ReviewIcon,
  BuildingIcon,
  CardIcon,
  ChartIcon,
  ClockIcon,
  SearchIcon,
  GearIcon,
} from "./icons";

const RAIL_KEY = "cs_rail";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: GridIcon },
  { to: "/repositories", label: "Repositories", icon: RepoIcon },
  { to: "/explore", label: "Explore", icon: CodeIcon },
  { to: "/search", label: "Search", icon: SearchIcon },
  { to: "/pulls", label: "Pull requests", icon: ReviewIcon },
  { to: "/team", label: "Team", icon: BuildingIcon },
  { to: "/billing", label: "Billing", icon: CardIcon },
  { to: "/analytics", label: "Analytics", icon: ChartIcon },
  { to: "/activity", label: "Activity", icon: ClockIcon },
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: GearIcon },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const [rail, setRail] = useState<boolean>(() => {
    try {
      return localStorage.getItem(RAIL_KEY) === "1";
    } catch {
      return false;
    }
  });

  function toggleRail() {
    setRail((r) => {
      const next = !r;
      try {
        localStorage.setItem(RAIL_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  const cls = (path: string) =>
    "nav__item" + (loc.pathname === path ? " nav__item--active" : "");

  const initials = (user?.displayName ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={"app" + (rail ? " app--rail" : "")}>
      <Header onToggleRail={toggleRail} rail={rail} />

      <div className="app__body">
        <aside className="sidebar">
          <nav className="nav">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                className={cls(to)}
                to={to}
                title={rail ? label : undefined}
              >
                <Icon />
                <span className="nav__label">{label}</span>
              </Link>
            ))}
            {user?.role === "Admin" && (
              <Link
                className={cls("/admin")}
                to="/admin"
                title={rail ? "Admin" : undefined}
              >
                <ShieldIcon />
                <span className="nav__label">Admin</span>
              </Link>
            )}
          </nav>

          <div className="sidebar__user">
            {user?.avatarUrl ? (
              <img className="avatar avatar--img" src={user.avatarUrl} alt="" />
            ) : (
              <div className="avatar">{initials}</div>
            )}
            <div className="user__meta">
              <div className="user__name">{user?.displayName}</div>
              <div className="user__role">{user?.role}</div>
            </div>
            <button
              className="iconbtn"
              onClick={logout}
              aria-label="Log out"
              title="Log out"
            >
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
