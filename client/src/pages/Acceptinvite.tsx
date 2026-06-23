import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"working" | "done" | "error">("working");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const token = params.get("token");
    if (!token) { setState("error"); setMessage("This invite link is missing its token."); return; }

    api.post("/orgs/invites/accept", { token })
      .then(() => { setState("done"); setTimeout(() => navigate("/team", { replace: true }), 1200); })
      .catch((e) => { setState("error"); setMessage(e?.response?.data?.message ?? "This invitation is no longer valid."); });
  }, [params, navigate]);

  return (
    <div className="center-screen">
      <div className="card" style={{ textAlign: "center", maxWidth: 360 }}>
        {state === "working" && (<><h1 className="card__title">Joining…</h1><p className="card__sub">Adding you to the organization.</p></>)}
        {state === "done" && (<><h1 className="card__title">You're in 🎉</h1><p className="card__sub">Taking you to your team.</p></>)}
        {state === "error" && (<>
          <h1 className="card__title">Invite not valid</h1>
          <p className="card__sub">{message}</p>
          <Link className="btn btn--primary btn--block" to="/team">Go to Team</Link>
        </>)}
      </div>
    </div>
  );
}