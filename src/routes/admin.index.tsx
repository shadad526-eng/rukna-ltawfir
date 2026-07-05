import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminDashboardStats } from "@/lib/admin.functions";
import { ENTITIES } from "@/lib/admin-entities";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const call = useServerFn(adminDashboardStats);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { call().then(setStats).catch((e) => setErr(e.message)); }, [call]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Live counts across every managed table.</p>
      </div>
      {err && <div className="text-rose-400 text-sm">{err}</div>}
      {!stats ? <div className="text-slate-400 text-sm">Loading…</div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats).map(([k, v]) => {
            const label = ENTITIES.find((e) => e.table === k)?.label ?? k;
            return (
              <div key={k} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="text-xs text-slate-400">{label}</div>
                <div className="text-2xl font-semibold mt-1">{v}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
