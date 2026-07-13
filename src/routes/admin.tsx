import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ENTITIES } from "@/lib/admin-entities";
import ruknLogo from "@/assets/brands/rukn.json";
import {
  LayoutDashboard, Users, Image as ImageIcon, LogOut,
  Package, Layers, Tag, FileText, BookOpen, Globe, Award,
  Menu, Settings, Building2, ClipboardList, Send, Handshake,
  ScrollText, Search,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "لوحة التحكم — ركن التوفير" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminShell,
});

const ENTITY_ICONS: Record<string, any> = {
  brands: Tag, products: Package, product_variants: Layers, product_categories: Tag,
  insights: FileText, topic_hubs: BookOpen, pages: Globe, catalogs: FileText,
  certifications: Award, navigation_items: Menu, homepage_sections: LayoutDashboard,
  inquiries: Send, catalog_requests: ClipboardList, b2b_partner_applications: Handshake,
  site_settings: Settings, corporate_identity: Building2, audit_log: ScrollText,
  assets: ImageIcon,
};

function AdminShell() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [query, setQuery] = useState("");
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
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "super_admin").limit(1);
      const superAdmin = (roles ?? []).length > 0;
      setIsSuper(superAdmin);
      setEmail(session.user.email ?? null);
      setReady(true);
      if (!superAdmin && !isLogin) navigate({ to: "/admin/login", replace: true });
    })();
    return () => { cancel = true; };
  }, [loc.pathname, isLogin, navigate]);

  if (isLogin) {
    return <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100"><Outlet /></div>;
  }
  if (!ready) return <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">جارٍ التحميل…</div>;
  if (!isSuper) return null;

  const groups = Array.from(new Set(ENTITIES.map((e) => e.group)));
  const filteredEntities = query
    ? ENTITIES.filter((e) => e.label.includes(query) || e.key.includes(query.toLowerCase()))
    : ENTITIES;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex" style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}>
      <aside className="w-72 border-l border-slate-800 bg-slate-900/50 flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/95 flex items-center justify-center overflow-hidden shrink-0 shadow-sm ring-1 ring-white/10">
              <img src={ruknLogo.url} alt="ركن التوفير" className="w-full h-full object-contain p-1" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">ركن التوفير</div>
              <div className="text-xs text-slate-400">لوحة الإدارة</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 truncate">{email}</div>
        </div>

        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في القوائم…"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-1.5 text-sm placeholder:text-slate-500"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
          <SidebarLink to="/admin" exact icon={LayoutDashboard} label="الرئيسية" />
          <SidebarLink to="/admin/users" icon={Users} label="المدراء والصلاحيات" />
          <SidebarLink to="/admin/media" icon={ImageIcon} label="مكتبة الوسائط" />

          {groups.map((g) => {
            const items = filteredEntities.filter((e) => e.group === g);
            if (items.length === 0) return null;
            return (
              <div key={g} className="mt-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 px-2 mb-1">{g}</div>
                {items.map((e) => {
                  const Icon = ENTITY_ICONS[e.key] ?? FileText;
                  return <SidebarLink key={e.key} to="/admin/e/$entity" params={{ entity: e.key }} icon={Icon} label={e.label} />;
                })}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login", replace: true }); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600/10 text-rose-300 hover:bg-rose-600/20 text-sm"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-6"><Outlet /></div>
      </main>
    </div>
  );
}

function SidebarLink({ to, params, exact, icon: Icon, label }: any) {
  const base = "flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300";
  const active = "flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-600/15 text-emerald-300 border border-emerald-500/20";
  return (
    <Link to={to} params={params} className={base}
      activeOptions={exact ? { exact: true } : undefined}
      activeProps={{ className: active }}>
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
