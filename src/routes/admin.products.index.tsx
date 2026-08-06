import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { adminSignedUrls } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/products/")({ ssr: false, component: ProductsListPage });

type Row = {
  id: string; slug: string; name_ar: string; name_en: string;
  brand_id: string | null; is_published: boolean; sort_order: number; cover_asset_id: string | null;
};

function ProductsListPage() {
  const navigate = useNavigate();
  const signUrls = useServerFn(adminSignedUrls);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [brands, setBrands] = useState<Record<string, string>>({});
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [confirmDel, setConfirmDel] = useState<Row | null>(null);

  const load = useCallback(async () => {
    const [p, b] = await Promise.all([
      supabase.from("products").select("id,slug,name_ar,name_en,brand_id,is_published,sort_order,cover_asset_id").order("sort_order", { ascending: true }),
      supabase.from("brands").select("id,name_ar").order("sort_order", { ascending: true }),
    ]);
    setRows((p.data ?? []) as Row[]);
    const map: Record<string, string> = {};
    (b.data ?? []).forEach((x: any) => { map[x.id] = x.name_ar; });
    setBrands(map);

    const ids = Array.from(new Set(((p.data ?? []) as Row[]).map((r) => r.cover_asset_id).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: assets } = await supabase.from("assets").select("id,storage_bucket,storage_path").in("id", ids);
      if (assets?.length) {
        const signed = await signUrls({ data: { items: assets.map((a: any) => ({ bucket: a.storage_bucket, path: a.storage_path })) } });
        const urls: Record<string, string> = {};
        assets.forEach((a: any) => {
          const u = (signed as any)[`${a.storage_bucket}::${a.storage_path}`];
          if (u) urls[a.id] = u;
        });
        setCovers(urls);
      }
    }
  }, [signUrls]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = rows ?? [];
    if (brandFilter) list = list.filter((r) => (brandFilter === "__none" ? !r.brand_id : r.brand_id === brandFilter));
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((r) => `${r.name_ar} ${r.name_en} ${r.slug}`.toLowerCase().includes(term));
    return list;
  }, [rows, q, brandFilter]);

  async function togglePublished(r: Row) {
    const { error } = await supabase.from("products").update({ is_published: !r.is_published }).eq("id", r.id);
    if (error) return toast.error(error.message);
    setRows((prev) => (prev ?? []).map((x) => (x.id === r.id ? { ...x, is_published: !r.is_published } : x)));
    toast.success(!r.is_published ? "تم النشر" : "تم إلغاء النشر");
  }

  async function remove(r: Row) {
    const { error } = await supabase.from("products").delete().eq("id", r.id);
    setConfirmDel(null);
    if (error) return toast.error(error.message);
    setRows((prev) => (prev ?? []).filter((x) => x.id !== r.id));
    toast.success("تم حذف المنتج");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">المنتجات</h1>
          <p className="text-xs text-slate-500 mt-0.5">مساحة عمل كاملة لإدارة المنتجات ومحتواها ثنائي اللغة.</p>
        </div>
        <Link to="/admin/products/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold">
          <Plus className="w-4 h-4" /> منتج جديد
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو المعرّف…"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-2 text-sm" />
        </div>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm">
          <option value="">كل العلامات</option>
          <option value="__none">بدون علامة</option>
          {Object.entries(brands).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </div>

      {rows === null ? (
        <div className="flex items-center gap-2 p-10 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل…</div>
      ) : (
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/70 text-slate-400 text-xs">
              <tr>
                <th className="p-3 text-right w-16">الصورة</th>
                <th className="p-3 text-right">الاسم</th>
                <th className="p-3 text-right">العلامة</th>
                <th className="p-3 text-right">المعرّف</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right w-28">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-slate-800 hover:bg-slate-900/40">
                  <td className="p-2">
                    <div className="w-12 h-12 rounded bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                      {r.cover_asset_id && covers[r.cover_asset_id]
                        ? <img src={covers[r.cover_asset_id]} alt="" className="w-full h-full object-cover" />
                        : <ImageIcon className="w-4 h-4 text-slate-600" />}
                    </div>
                  </td>
                  <td className="p-3">
                    <button onClick={() => navigate({ to: "/admin/products/$id", params: { id: r.id } })} className="text-slate-100 hover:text-emerald-300 font-medium">
                      {r.name_ar}
                    </button>
                    <div className="text-[11px] text-slate-500" dir="ltr">{r.name_en}</div>
                  </td>
                  <td className="p-3 text-slate-300">{r.brand_id ? brands[r.brand_id] ?? "—" : "عام"}</td>
                  <td className="p-3 text-slate-500 text-xs" dir="ltr">{r.slug}</td>
                  <td className="p-3">
                    <button onClick={() => togglePublished(r)}
                      className={`px-2 py-0.5 rounded-full text-[11px] border ${
                        r.is_published
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-500/15 text-slate-300 border-slate-500/30"
                      }`}>
                      {r.is_published ? "منشور" : "مسودة"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <Link to="/admin/products/$id" params={{ id: r.id }} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700"><Pencil className="w-3.5 h-3.5" /></Link>
                      <button onClick={() => setConfirmDel(r)} className="p-1.5 rounded bg-rose-600/20 text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-slate-500 text-sm">لا توجد منتجات مطابقة.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setConfirmDel(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">حذف المنتج</h3>
            <p className="text-sm text-slate-400">سيتم حذف «{confirmDel.name_ar}» وكل محتواه المرتبط نهائياً.</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => remove(confirmDel)} className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm">حذف</button>
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2 rounded-lg bg-slate-800 text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
