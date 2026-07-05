import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListUsers, adminCreateUser, adminUpdateUserRoles,
  adminResetPassword, adminToggleUserEnabled, adminDeleteUser,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users")({ ssr: false, component: UsersPage });

const ROLES = ["super_admin", "brand_manager", "editor", "viewer"] as const;

function UsersPage() {
  const list = useServerFn(adminListUsers);
  const create = useServerFn(adminCreateUser);
  const setRoles = useServerFn(adminUpdateUserRoles);
  const reset = useServerFn(adminResetPassword);
  const toggle = useServerFn(adminToggleUserEnabled);
  const del = useServerFn(adminDeleteUser);
  const [users, setUsers] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [nu, setNu] = useState({ email: "", password: "", role: "editor", display_name: "" });

  const refresh = useCallback(() => list().then(setUsers).catch((e) => setErr(e.message)), [list]);
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Administrators</h1>
      {err && <div className="text-rose-400 text-sm">{err}</div>}

      <form onSubmit={async (e) => {
        e.preventDefault(); setErr(null);
        try { await create({ data: nu }); setNu({ email: "", password: "", role: "editor", display_name: "" }); refresh(); }
        catch (e: any) { setErr(e.message); }
      }} className="bg-slate-900 border border-slate-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-5 gap-2">
        <input required placeholder="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm" />
        <input required placeholder="password (min 8)" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm" />
        <input placeholder="display name" value={nu.display_name} onChange={(e) => setNu({ ...nu, display_name: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm" />
        <select value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm">
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="bg-emerald-600 hover:bg-emerald-500 rounded px-3 py-1.5 text-sm">Add Admin</button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-300"><tr>
            <th className="text-left p-2">Email</th><th className="text-left p-2">Roles</th>
            <th className="text-left p-2">Status</th><th className="text-left p-2">Actions</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map((r) => {
                      const on = u.roles.includes(r);
                      return (
                        <button key={r} onClick={async () => {
                          const next = on ? u.roles.filter((x: string) => x !== r) : [...u.roles, r];
                          try { await setRoles({ data: { user_id: u.id, roles: next } }); refresh(); }
                          catch (e: any) { setErr(e.message); }
                        }} className={`px-2 py-0.5 rounded text-xs ${on ? "bg-emerald-600/30 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>{r}</button>
                      );
                    })}
                  </div>
                </td>
                <td className="p-2">{u.banned_until ? <span className="text-rose-400">Disabled</span> : <span className="text-emerald-400">Enabled</span>}</td>
                <td className="p-2 space-x-2">
                  <button onClick={async () => {
                    const p = prompt("New password (min 8):"); if (!p) return;
                    try { await reset({ data: { user_id: u.id, password: p } }); alert("Password updated"); }
                    catch (e: any) { setErr(e.message); }
                  }} className="text-xs text-sky-300 hover:underline">Reset PW</button>
                  <button onClick={async () => {
                    try { await toggle({ data: { user_id: u.id, enabled: !!u.banned_until } }); refresh(); }
                    catch (e: any) { setErr(e.message); }
                  }} className="text-xs text-amber-300 hover:underline">{u.banned_until ? "Enable" : "Disable"}</button>
                  <button onClick={async () => {
                    if (!confirm(`Delete ${u.email}?`)) return;
                    try { await del({ data: { user_id: u.id } }); refresh(); }
                    catch (e: any) { setErr(e.message); }
                  }} className="text-xs text-rose-300 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
