import NodeField from "./Nodefield";

// Full-screen animated node-graph backdrop for the compact auth pages
// (forgot/reset/verify) so the whole auth flow feels consistent with Login.
export default function AuthBackdrop() {
  return (
    <div className="auth-backdrop" aria-hidden>
      <NodeField density={1} />
      <div className="auth__orb auth__orb--1" />
      <div className="auth__orb auth__orb--2" />
    </div>
  );
}