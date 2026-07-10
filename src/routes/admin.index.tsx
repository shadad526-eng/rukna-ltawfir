import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminDashboardStats, adminRecentActivity } from "@/lib/admin.functions";
import { ENTITIES } from "@/lib/admin-entities";
import { Link } from "@tanstack/react-router";
import {
  Package, Tag, FileText, Send, ClipboardList, Handshake, Image as ImageIcon,
  BookOpen, Award, Layers, Globe, Menu, LayoutDashboard, ScrollText, TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: Dashboard,
});

const CARD_ICONS: Record<string, any> = {
  brands: Tag, products: Package, product_variants: Layers, product_categories: Tag,
  insights: FileText, topic_hubs: BookOpen, pages: Globe, catalogs: FileText,
  certifications: Award, assets: ImageIcon, inquiries: Send,
  catalog_requests: ClipboardList, b2b_partner_applications: Handshake,
  navigation_items: Menu, homepage_sections: LayoutDashboard, audit_log: ScrollText,
};

const STATUS_LABELS: Record<string, string> = {
  new: "جديد", in_progress: "قيد المعالجة", closed: "مغلق",
  approved: "مقبول", rejected: "مرفوض",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  in_progress: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  closed: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

function fmtDate(s: string | null) {
  if (!s) return "—";
  try { return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s)); }
  catch { return s; }
}

function Dashboard() {
  const statsFn = useServerFn(adminDashboardStats);
  const activityFn = useServerFn(adminRecentActivity);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [activity, setActivity] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    statsFn().then(setStats).catch((e) => setErr(e.message));
    activityFn().then(setActivity).catch(() => {});
  }, [statsFn, activityFn]);

  const primary = useMemo(() => ["products", "brands", "insights", "inquiries"], []);
  const secondary = useMemo(() => Object.keys(stats ?? {}).filter((k) => !primary.includes(k)), [stats, primary]);
  const maxVal = useMemo(() => Math.max(1, ...(stats ? Object.values(stats) : [1])), [stats]);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-sm text-slate-400 mt-1">نظرة عامة مباشرة على المحتوى والطلبات والنشاط</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/e/$entity" params={{ entity: "products" }} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm">+ منتج جديد</Link>
          <Link to="/admin/e/$entity" params={{ entity: "insights" }} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">+ مقال جديد</Link>
        </div>
      </header>

      {err && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg p-3 text-sm">{err}</div>}

      {/* Primary big cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {primary.map((k) => {
          const cfg = ENTITIES.find((e) => e.table === k);
          const Icon = CARD_ICONS[k] ?? FileText;
          const v = stats?.[k] ?? 0;
          return (
            <Link key={k} to="/admin/e/$entity" params={{ entity: cfg?.key ?? k }}
              className="group bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-600 group-hover:text-emerald-400" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">{v.toLocaleString("ar-EG")}</div>
                <div className="text-sm text-slate-400 mt-1">{cfg?.label ?? k}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Distribution + secondary counts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4">توزيع المحتوى</h2>
          <div className="space-y-2">
            {stats && Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
              const cfg = ENTITIES.find((e) => e.table === k);
              const pct = Math.round((v / maxVal) * 100);
              return (
                <div key={k} className="flex items-center gap-3 text-sm">
                  <div className="w-40 shrink-0 truncate text-slate-300">{cfg?.label ?? k}</div>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-l from-emerald-500 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-14 text-left text-slate-400 tabular-nums">{v.toLocaleString("ar-EG")}</div>
                </div>
              );
            })}
            {!stats && <div className="text-slate-500 text-sm">جارٍ تحميل الإحصاءات…</div>}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 gap-2">
            {["brands", "products", "insights", "catalogs", "certifications", "navigation_items"].map((k) => {
              const cfg = ENTITIES.find((e) => e.key === k);
              const Icon = CARD_ICONS[k] ?? FileText;
              return (
                <Link key={k} to="/admin/e/$entity" params={{ entity: k }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-sm">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span className="truncate">{cfg?.label ?? k}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent requests + audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RequestsPanel title="أحدث طلبات التواصل" entity="inquiries" rows={activity?.inquiries ?? []} nameKey="full_name" subKey="subject" />
        <RequestsPanel title="أحدث طلبات الكتالوج" entity="catalog_requests" rows={activity?.catalog_requests ?? []} nameKey="full_name" subKey="company" />
        <RequestsPanel title="أحدث طلبات الشراكة" entity="b2b_partner_applications" rows={activity?.partners ?? []} nameKey="company_name" subKey="contact_name" />
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">سجل النشاط</h2>
            <Link to="/admin/e/$entity" params={{ entity: "audit_log" }} className="text-xs text-emerald-400 hover:underline">عرض الكل</Link>
          </div>
          {(activity?.audit ?? []).length === 0 ? (
            <div className="text-sm text-slate-500">لا يوجد نشاط بعد.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {(activity?.audit ?? []).slice(0, 8).map((row: any) => {
                const cfg = ENTITIES.find((e) => e.table === row.entity_type);
                return (
                  <li key={row.id} className="flex items-start justify-between gap-3 border-b border-slate-800/50 pb-2 last:border-0">
                    <div>
                      <div className="text-slate-200">{row.action}</div>
                      <div className="text-xs text-slate-500">{cfg?.label ?? row.entity_type ?? "—"}</div>
                    </div>
                    <div className="text-xs text-slate-500 shrink-0">{fmtDate(row.created_at)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestsPanel({ title, entity, rows, nameKey, subKey }: { title: string; entity: string; rows: any[]; nameKey: string; subKey: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link to="/admin/e/$entity" params={{ entity }} className="text-xs text-emerald-400 hover:underline">عرض الكل</Link>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-slate-500">لا توجد طلبات بعد.</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 border-b border-slate-800/50 pb-2 last:border-0">
              <div className="min-w-0">
                <div className="text-slate-200 truncate">{r[nameKey] ?? "—"}</div>
                <div className="text-xs text-slate-500 truncate">{r[subKey] ?? ""}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.status && <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status] ?? "bg-slate-800 text-slate-400 border-slate-700"}`}>{STATUS_LABELS[r.status] ?? r.status}</span>}
                <span className="text-xs text-slate-500">{fmtDate(r.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
