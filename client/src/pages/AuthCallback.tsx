import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthCallback() {
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const err = params.get("error");
    if (err) { setError(err); return; }

    const access = params.get("access");
    const refresh = params.get("refresh");
    if (!access || !refresh) { setError("Missing sign-in details."); return; }

    loginWithTokens(access, refresh)
      .then(() => navigate("/dashboard", { replace: true }))
      .catch(() => setError("Could not complete sign-in."));
  }, [loginWithTokens, navigate]);

  return (
    <div className="center-screen">
      <div className="card" style={{ textAlign: "center", maxWidth: 340 }}>
        {error ? (
          <>
            <h1 className="card__title">Sign-in failed</h1>
            <p className="card__sub">{error}</p>
            <Link className="btn btn--primary btn--block" to="/login">Back to sign in</Link>
          </>
        ) : (
          <>
            <h1 className="card__title">Signing you in…</h1>
            <p className="card__sub">Finishing up your authentication.</p>
          </>
        )}
      </div>
    </div>
  );
}
