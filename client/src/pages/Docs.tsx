import { Link } from "react-router-dom";
import AuthBackdrop from "../components/AuthBackdrop";

export default function Docs() {
  return (
    <div className="docpage">
      <AuthBackdrop />
      <div className="docpage__inner">
        <Link className="docpage__back" to="/dashboard">← Back to app</Link>
        <span className="brandmark"><span className="brandmark__glyph">◇</span> CodeSage</span>
        <h1>Documentation</h1>
        <p className="docpage__lead">Everything you need to get CodeSage reviewing your pull requests.</p>

        <h2>Getting started</h2>
        <p>Connect your GitHub account from the dashboard, then open the Repositories tab to see your repos. Pick a repository and view its pull requests to run your first AI review.</p>

        <h2>Automated reviews</h2>
        <p>On the Repositories page, toggle <b>Auto-review</b> for any repo. When a pull request is opened or updated, CodeSage reviews the diff automatically and posts its findings back on the PR. Use the ⚙ settings to set a severity threshold, ignore paths, or limit which file types are reviewed.</p>

        <h2>Organizations &amp; billing</h2>
        <p>Create an organization to invite teammates and manage a shared plan. Each org has its own monthly AI-review quota — Free includes 50 reviews, with higher limits on Pro and Team. Manage your plan from the Billing page.</p>

        <h2>Semantic search</h2>
        <p>Index a repository to search it by meaning, not just keywords. Use the Search page to find relevant code across your indexed repositories.</p>

        <p className="docpage__note">Questions? This is an early product — documentation is expanding. For now, most features are discoverable directly in the app.</p>
      </div>
    </div>
  );
}