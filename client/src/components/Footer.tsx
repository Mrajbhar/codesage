import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="appfooter">
      <div className="appfooter__brand">
        <span className="appfooter__glyph">◇</span>
        <span className="appfooter__name">CodeSage</span>
        <span className="appfooter__ver">v1.0</span>
      </div>

      <nav className="appfooter__links">
        <Link to="/dashboard">Docs</Link>
        <Link to="/dashboard">Changelog</Link>
        <Link to="/dashboard">Privacy</Link>
      </nav>

      <div className="appfooter__meta">
        <span className="appfooter__status"><i className="appfooter__pulse" /> Operational</span>
        <span className="appfooter__copy">© {year}</span>
      </div>
    </footer>
  );
}