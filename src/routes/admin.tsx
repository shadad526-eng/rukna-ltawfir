import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ENTITIES } from "@/lib/admin-entities";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Rukn Al-Tawfir" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminShell,
});

function AdminShell() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const isLogin = loc.pathname === "/admin/login" || loc.pathname === "/admin/login/";

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancel) return;
      if (!session) {
        setReady(true);
        if (!isLogin) navigate({ to: "/admin/login", replace: true });
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const superAdmin = (roles ?? []).some((r) => r.role === "super_admin");
      setIsSuper(superAdmin);
      setEmail(session.user.email ?? null);
      setReady(true);
      if (!superAdmin && !isLogin) navigate({ to: "/admin/login", replace: true });
    })();
    return () => { cancel = true; };
  }, [loc.pathname, isLogin, navigate]);

  if (isLogin) {
    return <div dir="ltr" className="min-h-screen bg-slate-950 text-slate-100"><Outlet /></div>;
  }
  if (!ready) return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">Loading…</div>;
  if (!isSuper) return null;

  const groups = Array.from(new Set(ENTITIES.map((e) => e.group)));
  return (
    <div dir="ltr" className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 border-r border-slate-800 p-4 flex flex-col gap-4 sticky top-0 h-screen overflow-y-auto">
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-400">Rukn Admin</div>
          <div className="text-sm text-slate-300 mt-1 truncate">{email}</div>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link to="/admin" className="px-2 py-1.5 rounded hover:bg-slate-800" activeOptions={{ exact: true }} activeProps={{ className: "px-2 py-1.5 rounded bg-slate-800 text-emerald-300" }}>Dashboard</Link>
          <Link to="/admin/users" className="px-2 py-1.5 rounded hover:bg-slate-800" activeProps={{ className: "px-2 py-1.5 rounded bg-slate-800 text-emerald-300" }}>Administrators</Link>
          {groups.map((g) => (
            <div key={g} className="mt-3">
              <div className="text-xs uppercase text-slate-500 px-2">{g}</div>
              {ENTITIES.filter((e) => e.group === g).map((e) => (
                <Link key={e.key} to="/admin/e/$entity" params={{ entity: e.key }} className="px-2 py-1.5 rounded hover:bg-slate-800 block"
                  activeProps={{ className: "px-2 py-1.5 rounded bg-slate-800 text-emerald-300 block" }}>{e.label}</Link>
              ))}
            </div>
          ))}
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login", replace: true }); }}
            className="mt-4 px-2 py-1.5 rounded bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-left"
          >Sign out</button>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-x-hidden"><Outlet /></main>
    </div>
  );
}
