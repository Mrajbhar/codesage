import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import OrgPicker from "./OrgPicker";
import {
  GridIcon, RepoIcon, UserIcon, ShieldIcon, LogoutIcon, CodeIcon, ReviewIcon, BuildingIcon, CardIcon, ChartIcon, ClockIcon,
} from "./icons";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const cls = (path: string) =>
    "nav__item" + (loc.pathname === path ? " nav__item--active" : "");

  const initials = (user?.displayName ?? "U")
    .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/dashboard" className="brandmark sidebar__logo">
          <span className="brandmark__glyph">◇</span> CodeSage
        </Link>

        <OrgPicker />
        <nav className="nav">
          <Link className={cls("/dashboard")} to="/dashboard"><GridIcon /> Overview</Link>
          <Link className={cls("/repositories")} to="/repositories"><RepoIcon /> Repositories</Link>
          <Link className={cls("/explore")} to="/explore"><CodeIcon /> Explore</Link>
          <Link className={cls("/pulls")} to="/pulls"><ReviewIcon /> Pull requests</Link>
          <Link className={cls("/team")} to="/team"><BuildingIcon /> Team</Link>
          <Link className={cls("/billing")} to="/billing"><CardIcon /> Billing</Link>
          <Link className={cls("/analytics")} to="/analytics"><ChartIcon /> Analytics</Link>
          <Link className={cls("/activity")} to="/activity"><ClockIcon /> Activity</Link>
          <Link className={cls("/profile")} to="/profile"><UserIcon /> Profile</Link>
          {user?.role === "Admin" && (
            <Link className={cls("/admin")} to="/admin"><ShieldIcon /> Admin</Link>
          )}
        </nav>

        <div className="sidebar__user">
          {user?.avatarUrl
            ? <img className="avatar avatar--img" src={user.avatarUrl} alt="" />
            : <div className="avatar">{initials}</div>}
          <div>
            <div className="user__name">{user?.displayName}</div>
            <div className="user__role">{user?.role}</div>
          </div>
          <button className="iconbtn" onClick={logout} aria-label="Log out" title="Log out">
            <LogoutIcon />
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}