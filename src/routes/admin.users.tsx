import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  adminListUsers, adminCreateUser, adminUpdateUserRoles,
  adminResetPassword, adminToggleUserEnabled, adminDeleteUser,
} from "@/lib/admin.functions";
import { Plus, KeyRound, Ban, Trash2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ ssr: false, component: UsersPage });

const ROLES: { value: string; label: string }[] = [
  { value: "super_admin", label: "مدير عام" },
  { value: "brand_manager", label: "مدير علامة" },
  { value: "editor", label: "محرر" },
  { value: "viewer", label: "مشاهد" },
];

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

  const refresh = useCallback(
    () => list().then(setUsers).catch((e) => setErr(e.message)),
    [list],
  );
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المدراء والصلاحيات</h1>
        <p className="text-sm text-slate-400 mt-1">إدارة حسابات الإدارة وأدوارها بشكل كامل.</p>
      </div>

      {err && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg p-3 text-sm">{err}</div>}

      <form
        onSubmit={async (e) => {
          e.preventDefault(); setErr(null);
          try {
            await create({ data: nu });
            toast.success("تم إنشاء الحساب");
            setNu({ email: "", password: "", role: "editor", display_name: "" });
            refresh();
          } catch (e: any) { setErr(e.message); toast.error(e.message); }
        }}
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-2"
      >
        <input required placeholder="البريد الإلكتروني" dir="ltr" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
        <input required placeholder="كلمة المرور (٨+)" dir="ltr" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="الاسم الظاهر" value={nu.display_name} onChange={(e) => setNu({ ...nu, display_name: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
        <select value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm">
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" /> إضافة مدير
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-300">
            <tr>
              <th className="text-right p-3">البريد</th>
              <th className="text-right p-3">الأدوار</th>
              <th className="text-right p-3">الحالة</th>
              <th className="text-right p-3">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="p-3">
                  <div dir="ltr" className="text-slate-200">{u.email}</div>
                  {u.roles.includes("super_admin") && <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> مدير عام</div>}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map((r) => {
                      const on = u.roles.includes(r.value);
                      return (
                        <button key={r.value} onClick={async () => {
                          const next = on ? u.roles.filter((x: string) => x !== r.value) : [...u.roles, r.value];
                          try { await setRoles({ data: { user_id: u.id, roles: next } }); toast.success("تم التحديث"); refresh(); }
                          catch (e: any) { toast.error(e.message); }
                        }} className={`px-2 py-0.5 rounded-full text-xs border ${on ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-slate-800 text-slate-500 border-slate-700"}`}>{r.label}</button>
                      );
                    })}
                  </div>
                </td>
                <td className="p-3">
                  {u.banned_until
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">معطّل</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">مفعّل</span>}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={async () => {
                      const p = prompt("كلمة المرور الجديدة (٨+):"); if (!p) return;
                      try { await reset({ data: { user_id: u.id, password: p } }); toast.success("تم تحديث كلمة المرور"); }
                      catch (e: any) { toast.error(e.message); }
                    }} className="p-1.5 rounded hover:bg-slate-700 text-sky-300" title="إعادة تعيين كلمة المرور">
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button onClick={async () => {
                      try { await toggle({ data: { user_id: u.id, enabled: !!u.banned_until } }); toast.success("تم"); refresh(); }
                      catch (e: any) { toast.error(e.message); }
                    }} className="p-1.5 rounded hover:bg-slate-700 text-amber-300" title={u.banned_until ? "تفعيل" : "تعطيل"}>
                      <Ban className="w-4 h-4" />
                    </button>
                    <button onClick={async () => {
                      if (!confirm(`حذف ${u.email}؟`)) return;
                      try { await del({ data: { user_id: u.id } }); toast.success("تم الحذف"); refresh(); }
                      catch (e: any) { toast.error(e.message); }
                    }} className="p-1.5 rounded hover:bg-slate-700 text-rose-300" title="حذف">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500">لا يوجد مدراء بعد.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
