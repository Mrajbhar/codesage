import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import AuthBackdrop from "../components/AuthBackdrop";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"working" | "ok" | "fail">("working");
  const [msg, setMsg] = useState("Verifying your email…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;     // guard against React StrictMode double-invoke in dev
    ran.current = true;

    if (!token) { setState("fail"); setMsg("This verification link is missing its token."); return; }
    api.post("/auth/verify-email", { token })
      .then((r) => { setState("ok"); setMsg(r.data.message ?? "Email verified."); })
      .catch((e) => { setState("fail"); setMsg(e?.response?.data?.message ?? "Verification failed."); });
  }, [token]);

  return (
    <div className="center-screen">
      <AuthBackdrop />
      <div className="card" style={{ maxWidth: 380, textAlign: "center" }}>
        <div className="card__head">
          <h1 className="card__title">Email verification</h1>
        </div>
        <div className={"alert" + (state === "ok" ? " alert--ok" : "")} style={{ visibility: state === "working" ? "hidden" : "visible" }}>{msg}</div>
        {state === "working" && <p className="muted">{msg}</p>}
        {state === "ok" && <Link className="btn btn--primary btn--block" to="/login">Sign in</Link>}
        {state === "fail" && <Link className="btn btn--ghost btn--block" to="/login">Back to sign in</Link>}
      </div>
    </div>
  );
}