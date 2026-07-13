import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";
import ruknLogo from "@/assets/brands/rukn.json";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "تسجيل الدخول — لوحة الإدارة" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setError(error?.message === "Invalid login credentials" ? "بيانات الدخول غير صحيحة" : (error?.message ?? "فشل تسجيل الدخول"));
      setLoading(false);
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "super_admin").limit(1);
    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      setError("لا يملك هذا الحساب صلاحيات المدير.");
      setLoading(false);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40" style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}>
      <form onSubmit={onSubmit} className="w-full max-w-md bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-8 space-y-5 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-xl ring-1 ring-white/10 overflow-hidden">
            <img src={ruknLogo.url} alt="ركن التوفير" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-2xl font-bold mt-4">ركن التوفير</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center justify-center gap-1.5"><Lock className="w-3.5 h-3.5" /> لوحة الإدارة — تسجيل الدخول</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm text-slate-300">البريد الإلكتروني</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required dir="ltr"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-slate-300">كلمة المرور</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required dir="ltr"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
        </label>

        {error && <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">{error}</div>}

        <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg px-3 py-2.5 text-sm font-medium disabled:opacity-50">
          {loading ? "جارٍ الدخول…" : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
