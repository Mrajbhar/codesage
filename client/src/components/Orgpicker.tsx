import { useEffect, useState } from "react";
import api from "../api/axios";
import { orgStore } from "../auth/OrgPicker";

interface OrgDto { id: string; name: string; plan: string }

export default function OrgPicker() {
  const [orgs, setOrgs] = useState<OrgDto[]>([]);
  const [active, setActive] = useState(orgStore.get() ?? "");

  useEffect(() => {
    api.get("/orgs").then((r) => {
      setOrgs(r.data);
      if (!active && r.data.length) {
        orgStore.set(r.data[0].id);
        setActive(r.data[0].id);
      }
    });
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  function pick(id: string) {
    orgStore.set(id);
    setActive(id);
    window.location.reload();   // simplest way to refetch per-org data everywhere
  }

  if (orgs.length === 0) return null;

  return (
    <div className="orgpicker">
      <div className="orgpicker__cap">Workspace</div>
      <select className="input" value={active} onChange={(e) => pick(e.target.value)}>
        {orgs.map((o) => <option key={o.id} value={o.id}>{o.name} · {o.plan}</option>)}
      </select>
    </div>
  );
}