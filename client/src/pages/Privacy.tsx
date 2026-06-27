import { Link } from "react-router-dom";
import AuthBackdrop from "../components/AuthBackdrop";

export default function Privacy() {
  return (
    <div className="docpage">
      <AuthBackdrop />
      <div className="docpage__inner">
        <Link className="docpage__back" to="/dashboard">← Back to app</Link>
        <span className="brandmark"><span className="brandmark__glyph">◇</span> CodeSage</span>
        <h1>Privacy</h1>
        <p className="docpage__lead">How CodeSage handles your data.</p>

        <h2>What we access</h2>
        <p>When you connect GitHub, CodeSage reads repository metadata, file contents, and pull request diffs needed to perform reviews. We request only the scopes required for these features.</p>

        <h2>What we store</h2>
        <p>We store your account details, organization membership, review results, and audit logs. Pull request diffs are sent to the configured AI model to generate reviews; review summaries and findings are saved so you can revisit them.</p>

        <h2>Your control</h2>
        <p>You can disconnect GitHub at any time from Settings, which removes our access token. You can delete your account from Settings, which removes your data and any organization you solely own.</p>

        <h2>Note</h2>
        <p className="docpage__note">This is a template privacy statement for an early-stage product. Before handling real user data in production, replace this with a reviewed policy that reflects your actual data practices and jurisdiction.</p>
      </div>
    </div>
  );
}