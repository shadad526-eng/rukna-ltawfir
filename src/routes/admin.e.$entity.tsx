import { createFileRoute, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getEntity, type Field, type Column } from "@/lib/admin-entities";
import { adminSignedUrls, adminUploadStorage } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, X, ChevronRight, ChevronLeft, Image as ImageIcon, Upload, FileText } from "lucide-react";


export const Route = createFileRoute("/admin/e/$entity")({ ssr: false, component: EntityPage });

const PAGE_SIZE = 25;

const STATUS_LABELS: Record<string, string> = {
  active: "منشور", draft: "مسودة", archived: "مؤرشف",
  new: "جديد", in_progress: "قيد المعالجة", closed: "مغلق",
  approved: "مقبول", rejected: "مرفوض",
  public: "عام", restricted: "مقيّد", b2b_only: "B2B",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  draft: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  archived: "bg-slate-700/40 text-slate-400 border-slate-700",
  new: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  in_progress: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  closed: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

function fmtDate(v: any) {
  if (!v) return "—";
  try { return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v)); }
  catch { return String(v); }
}

type RefMaps = {
  brands: Record<string, string>;
  products: Record<string, string>;
  navItems: Record<string, string>;
  assetUrls: Record<string, string>;
  assetInfo: Record<string, { name: string; mime: string | null }>;
};

function EntityPage() {
  const { entity } = useParams({ from: "/admin/e/$entity" });
  const cfg = getEntity(entity);
  const signUrls = useServerFn(adminSignedUrls);

  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [confirmDel, setConfirmDel] = useState<any | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [refs, setRefs] = useState<RefMaps>({ brands: {}, products: {}, navItems: {}, assetUrls: {}, assetInfo: {} });
  const [assetPickerFor, setAssetPickerFor] = useState<{ key: string; accept: "image" | "pdf" | "any" } | null>(null);

  const pk = cfg?.primaryKey ?? "id";

  const load = useCallback(async () => {
    if (!cfg) return;
    setErr(null);
    let q = supabase.from(cfg.table as any).select("*").limit(1000);
    if (cfg.orderBy) q = q.order(cfg.orderBy.column, { ascending: cfg.orderBy.ascending });
    const { data, error } = await q;
    if (error) setErr(error.message);
    else {
      setRows(data ?? []);
      setSelected(new Set());
    }
  }, [cfg]);

  useEffect(() => { load(); setEditing(null); setPage(1); setQuery(""); }, [load, entity]);

  // Load ref maps: brands, products, nav items
  useEffect(() => {
    (async () => {
      const [{ data: bs }, { data: ps }, { data: ns }] = await Promise.all([
        supabase.from("brands").select("id,name_ar").order("name_ar"),
        supabase.from("products").select("id,name_ar").order("name_ar").limit(500),
        supabase.from("navigation_items").select("id,label_ar,location").order("sort_order"),
      ]);
      const brands: Record<string, string> = {};
      (bs ?? []).forEach((b: any) => { brands[b.id] = b.name_ar; });
      const products: Record<string, string> = {};
      (ps ?? []).forEach((p: any) => { products[p.id] = p.name_ar; });
      const navItems: Record<string, string> = {};
      (ns ?? []).forEach((n: any) => { navItems[n.id] = `${n.label_ar} · ${n.location}`; });
      setRefs((r) => ({ ...r, brands, products, navItems }));
    })();
  }, []);

  // Which asset columns show images?
  const assetColumnKeys = useMemo(
    () => cfg?.listColumns.filter((c) => c.type === "image" || c.type === "asset_ref").map((c) => c.key) ?? [],
    [cfg],
  );

  // Load signed URLs & info for asset IDs referenced anywhere on-page
  useEffect(() => {
    if (!cfg || rows.length === 0) return;
    // Collect asset ids from image columns AND, for the assets table, use the row's own id
    let assetIds: string[] = [];
    if (cfg.table === "assets") {
      assetIds = rows.map((r) => r.id).filter(Boolean);
    } else {
      const ids = new Set<string>();
      for (const key of assetColumnKeys) {
        for (const r of rows) if (r[key]) ids.add(r[key]);
      }
      assetIds = Array.from(ids);
    }
    if (assetIds.length === 0) return;
    (async () => {
      const { data: assets } = await supabase
        .from("assets")
        .select("id,storage_bucket,storage_path,original_filename,mime_type")
        .in("id", assetIds);
      if (!assets || assets.length === 0) return;
      const signed = await signUrls({ data: { items: assets.map((a: any) => ({ bucket: a.storage_bucket, path: a.storage_path })) } });
      const urls: Record<string, string> = {};
      const info: Record<string, { name: string; mime: string | null }> = {};
      assets.forEach((a: any) => {
        const u = signed[`${a.storage_bucket}::${a.storage_path}`];
        if (u) urls[a.id] = u;
        info[a.id] = { name: a.original_filename || a.storage_path.split("/").pop(), mime: a.mime_type };
      });
      setRefs((r) => ({ ...r, assetUrls: { ...r.assetUrls, ...urls }, assetInfo: { ...r.assetInfo, ...info } }));
    })();
  }, [cfg, rows, assetColumnKeys, signUrls]);

  const filtered = useMemo(() => {
    if (!cfg || !query.trim()) return rows;
    const q = query.trim().toLowerCase();
    const cols = cfg.searchColumns ?? cfg.listColumns.map((c) => c.key);
    return rows.filter((r) => cols.some((c) => String(r[c] ?? "").toLowerCase().includes(q)));
  }, [rows, query, cfg]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  if (!cfg) return <div className="text-rose-400">كيان غير معروف: {entity}</div>;

  async function save(row: Record<string, any>) {
    setErr(null);
    const payload: Record<string, any> = {};
    for (const f of cfg!.fields) {
      let v = row[f.key];
      if (v === "" || v === undefined) v = null;
      if (f.type === "number" && v !== null) v = Number(v);
      if (f.type === "boolean") v = !!v;
      if (f.type === "json" && typeof v === "string") {
        try { v = v.trim() ? JSON.parse(v) : null; }
        catch { setErr(`JSON غير صالح في: ${f.label}`); toast.error(`JSON غير صالح في: ${f.label}`); return; }
      }
      payload[f.key] = v;
    }
    const isNew = !row[pk];
    const q = isNew
      ? supabase.from(cfg!.table as any).insert(payload)
      : supabase.from(cfg!.table as any).update(payload).eq(pk, row[pk]);
    const { error } = await q;
    if (error) { setErr(error.message); toast.error(error.message); }
    else {
      toast.success(isNew ? "تم إنشاء العنصر" : "تم حفظ التغييرات");
      setEditing(null);
      load();
    }
  }

  async function remove(row: any) {
    const { error } = await supabase.from(cfg!.table as any).delete().eq(pk, row[pk]);
    if (error) { setErr(error.message); toast.error(error.message); }
    else { toast.success("تم الحذف"); setConfirmDel(null); load(); }
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`حذف ${selected.size} عنصر؟`)) return;
    const { error } = await supabase.from(cfg!.table as any).delete().in(pk, Array.from(selected));
    if (error) toast.error(error.message);
    else { toast.success(`تم حذف ${selected.size} عنصر`); load(); }
  }

  async function bulkToggle(field: string, value: boolean) {
    if (selected.size === 0) return;
    const payload: Record<string, any> = { [field]: value };
    const { error } = await supabase.from(cfg!.table as any).update(payload).in(pk, Array.from(selected));
    if (error) toast.error(error.message);
    else { toast.success("تم التحديث"); load(); }
  }

  const hasPublished = cfg.fields.some((f) => f.key === "is_published");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{cfg.label}</h1>
          <p className="text-sm text-slate-400 mt-1">{filtered.length.toLocaleString("ar-EG")} عنصر</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="بحث…" className="bg-slate-900 border border-slate-800 rounded-lg pr-8 pl-3 py-1.5 text-sm w-56" />
          </div>
          <button onClick={() => setEditing({})} className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> إضافة جديد
          </button>
        </div>
      </div>

      {err && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg p-3 text-sm">{err}</div>}

      {selected.size > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between text-sm">
          <div>محدّد: {selected.size}</div>
          <div className="flex gap-2">
            {hasPublished && (
              <>
                <button onClick={() => bulkToggle("is_published", true)} className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs">نشر</button>
                <button onClick={() => bulkToggle("is_published", false)} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs">إلغاء النشر</button>
              </>
            )}
            <button onClick={bulkDelete} className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs">حذف المحدد</button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs">إلغاء التحديد</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-300">
            <tr>
              <th className="p-3 w-10">
                <input type="checkbox"
                  checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r[pk]))}
                  onChange={(e) => {
                    const next = new Set(selected);
                    pageRows.forEach((r) => e.target.checked ? next.add(r[pk]) : next.delete(r[pk]));
                    setSelected(next);
                  }} />
              </th>
              {cfg.listColumns.map((c) => (
                <th key={c.key} className="text-right p-3 font-medium">{c.label}</th>
              ))}
              <th className="p-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r[pk]} className="border-t border-slate-800 hover:bg-slate-800/30">
                <td className="p-3">
                  <input type="checkbox" checked={selected.has(r[pk])} onChange={(e) => {
                    const next = new Set(selected);
                    e.target.checked ? next.add(r[pk]) : next.delete(r[pk]);
                    setSelected(next);
                  }} />
                </td>
                {cfg.listColumns.map((c) => (
                  <td key={c.key} className="p-3 max-w-[240px]">{renderCell(c, r[c.key], r, refs)}</td>
                ))}
                <td className="p-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setEditing(r)} className="p-1.5 rounded hover:bg-slate-700 text-sky-300" title="تعديل">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDel(r)} className="p-1.5 rounded hover:bg-slate-700 text-rose-300" title="حذف">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td className="p-8 text-center text-slate-500" colSpan={cfg.listColumns.length + 2}>لا توجد بيانات لعرضها.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">صفحة {page} من {totalPages}</div>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="font-semibold">{editing[pk] ? `تعديل · ${cfg.label}` : `إضافة إلى ${cfg.label}`}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="p-5 space-y-4">
              {cfg.fields.map((f) => (
                <FieldInput key={f.key} field={f} value={editing[f.key]}
                  refs={refs}
                  onOpenAssetPicker={() => setAssetPickerFor({ key: f.key, accept: f.accept ?? "image" })}
                  onChange={(v) => setEditing({ ...editing, [f.key]: v })} />
              ))}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">إلغاء</button>
                <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assetPickerFor && editing && (
        <AssetPicker
          accept={assetPickerFor.accept}
          onClose={() => setAssetPickerFor(null)}
          onPick={(id, url, info) => {
            setEditing({ ...editing, [assetPickerFor.key]: id });
            setRefs((r) => ({
              ...r,
              assetUrls: { ...r.assetUrls, [id]: url },
              assetInfo: { ...r.assetInfo, [id]: info },
            }));
            setAssetPickerFor(null);
          }}
        />
      )}


      {confirmDel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setConfirmDel(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">تأكيد الحذف</h3>
            <p className="text-sm text-slate-400 mt-2">هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">إلغاء</button>
              <button onClick={() => remove(confirmDel)} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderCell(col: Column, v: any, row: any, refs: RefMaps) {
  if (col.type === "asset_ref") {
    // Row IS an asset. Show a thumbnail from its own id.
    const url = refs.assetUrls[row.id];
    const isImg = (row.mime_type ?? "").startsWith("image/");
    if (url && isImg) return <img src={url} alt="" className="w-12 h-12 rounded object-cover bg-slate-800" loading="lazy" />;
    return <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-slate-600"><ImageIcon className="w-5 h-5" /></div>;
  }
  if (v === null || v === undefined || v === "") return <span className="text-slate-600">—</span>;
  if (col.type === "image") {
    const url = refs.assetUrls[v];
    return url
      ? <img src={url} alt="" className="w-12 h-12 rounded object-cover bg-slate-800" loading="lazy" />
      : <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">لا صورة</div>;
  }
  if (col.type === "boolean") {
    return v
      ? <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">✓ نعم</span>
      : <span className="text-slate-500 text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">لا</span>;
  }
  if (col.type === "status") {
    const label = STATUS_LABELS[v] ?? v;
    const cls = STATUS_COLORS[v] ?? "bg-slate-800 text-slate-300 border-slate-700";
    return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
  }
  if (col.type === "brand") {
    return <span className="text-slate-300">{refs.brands[v] ?? "—"}</span>;
  }
  if (col.type === "product") {
    return <span className="text-slate-300">{refs.products[v] ?? "—"}</span>;
  }
  if (col.type === "date") return <span className="text-slate-400 text-xs">{fmtDate(v)}</span>;
  if (typeof v === "object") return <span className="text-slate-500 text-xs">{JSON.stringify(v).slice(0, 40)}…</span>;
  return <span className="text-slate-200 truncate block">{String(v)}</span>;
}

function FieldInput({ field, value, onChange, refs, onOpenAssetPicker }: {
  field: Field; value: any; onChange: (v: any) => void; refs: RefMaps; onOpenAssetPicker: () => void;
}) {
  const base = "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";
  const labelEl = <span className="text-slate-300 font-medium">{field.label}{field.required && <span className="text-rose-400"> *</span>}</span>;

  if (field.type === "textarea") {
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base} />
      </label>
    );
  }
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
        <span>{field.label}</span>
      </label>
    );
  }
  if (field.type === "brand_ref") {
    const opts = Object.entries(refs.brands);
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={base}>
          <option value="">— اختر علامة —</option>
          {opts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === "product_ref") {
    const opts = Object.entries(refs.products);
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={base}>
          <option value="">— اختر منتج —</option>
          {opts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === "nav_parent_ref") {
    const opts = Object.entries(refs.navItems);
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={base}>
          <option value="">— بدون أب —</option>
          {opts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === "select") {
    const options = field.options ?? [];
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={base}>
          <option value="">—</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === "asset") {
    const url = value ? refs.assetUrls[value] : null;
    const info = value ? refs.assetInfo[value] : null;
    return (
      <div className="block text-sm space-y-1">{labelEl}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg p-2">
          <div className="w-16 h-16 rounded bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
            {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-200 text-xs truncate">{info?.name ?? (value ? "الأصل محدّد" : "لم يُحدّد أصل")}</div>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={onOpenAssetPicker} className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs">اختيار من المكتبة</button>
              {value && <button type="button" onClick={() => onChange(null)} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs">إزالة</button>}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (field.type === "json") {
    const str = value === null || value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2);
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <textarea rows={4} value={str} onChange={(e) => onChange(e.target.value)} className={base + " font-mono text-xs"} dir="ltr" placeholder='{}' />
        {field.hint && <span className="text-xs text-slate-500">{field.hint}</span>}
      </label>
    );
  }
  return (
    <label className="block text-sm space-y-1">{labelEl}
      <input
        type={field.type === "number" ? "number" : field.type === "date" ? "datetime-local" : "text"}
        value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className={base} required={field.required}
        dir={field.type === "number" ? "ltr" : "auto"}
      />
      {field.hint && <span className="text-xs text-slate-500">{field.hint}</span>}
    </label>
  );
}

function AssetPicker({ onClose, onPick, accept }: {
  onClose: () => void;
  onPick: (id: string, url: string, info: { name: string; mime: string | null }) => void;
  accept: "image" | "pdf" | "any";
}) {
  const signUrls = useServerFn(adminSignedUrls);
  const uploadFn = useServerFn(adminUploadStorage);
  const [items, setItems] = useState<any[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    let query = supabase
      .from("assets")
      .select("id,storage_bucket,storage_path,original_filename,mime_type,channel,created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (accept === "image") query = query.like("mime_type", "image/%");
    else if (accept === "pdf") query = query.eq("mime_type", "application/pdf");
    const { data } = await query;
    setItems(data ?? []);
    if (data && data.length) {
      const signed = await signUrls({ data: { items: data.map((a: any) => ({ bucket: a.storage_bucket, path: a.storage_path })) } });
      const map: Record<string, string> = {};
      data.forEach((a: any) => {
        const u = signed[`${a.storage_bucket}::${a.storage_path}`];
        if (u) map[a.id] = u;
      });
      setUrls(map);
    }
  }, [signUrls, accept]);

  useEffect(() => { load(); }, [load]);

  const acceptAttr = accept === "image" ? "image/*" : accept === "pdf" ? "application/pdf" : undefined;

  async function upload(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const buf = await file.arrayBuffer();
        let bin = "";
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
        const base64 = btoa(bin);
        const isPdf = (file.type || "") === "application/pdf";
        const bucket = isPdf ? "catalogs" : "brand-assets";
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        await uploadFn({ data: { bucket, path, base64, contentType: file.type || "application/octet-stream", registerAsset: true } });
        toast.success(`تم رفع ${file.name}`);
      }
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "فشل الرفع");
    } finally {
      setBusy(false);
    }
  }

  const filtered = q.trim()
    ? items.filter((a) => (a.original_filename ?? a.storage_path ?? "").toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="font-semibold">
            {accept === "pdf" ? "اختيار ملف PDF" : accept === "image" ? "اختيار صورة" : "اختيار من مكتبة الوسائط"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم…"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-2 text-sm" />
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
            className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 disabled:opacity-50 shrink-0">
            <Upload className="w-4 h-4" /> {busy ? "جارٍ الرفع…" : "رفع جديد"}
          </button>
          <input ref={fileRef} type="file" hidden accept={acceptAttr} multiple
            onChange={(e) => { upload(e.target.files); if (fileRef.current) fileRef.current.value = ""; }} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filtered.map((a) => {
            const url = urls[a.id];
            const isImg = (a.mime_type ?? "").startsWith("image/");
            return (
              <button key={a.id} type="button"
                onClick={() => onPick(a.id, url ?? "", { name: a.original_filename ?? a.storage_path, mime: a.mime_type })}
                className="text-right bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-lg overflow-hidden group">
                <div className="aspect-square bg-slate-900 flex items-center justify-center overflow-hidden">
                  {url && isImg
                    ? <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    : <FileText className="w-8 h-8 text-slate-600" />}
                </div>
                <div className="p-1.5 text-[11px] text-slate-300 truncate">{a.original_filename ?? a.storage_path.split("/").pop()}</div>
              </button>
            );
          })}
          {filtered.length === 0 && <div className="col-span-full text-center text-slate-500 text-sm py-12">لا توجد نتائج. ارفع ملفًا جديدًا من الأعلى.</div>}
        </div>
      </div>
    </div>
  );
}

