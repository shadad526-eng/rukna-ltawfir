import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Login" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("rukn@ruknaltawfer.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setError(error?.message ?? "Sign-in failed");
      setLoading(false);
      return;
    }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id);
    const superAdmin = (roles ?? []).some((r) => r.role === "super_admin");
    if (!superAdmin) {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setLoading(false);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Rukn Al-Tawfir — Admin</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in with your administrator account.</p>
        </div>
        <label className="block text-sm">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
            className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
            className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" />
        </label>
        {error && <div className="text-sm text-rose-400">{error}</div>}
        <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 rounded px-3 py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
