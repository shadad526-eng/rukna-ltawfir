import { createFileRoute, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getEntity, type Field, type Column } from "@/lib/admin-entities";
import { adminSignedUrls } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, X, ChevronRight, ChevronLeft, Copy } from "lucide-react";

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
  const [brands, setBrands] = useState<Record<string, string>>({});
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

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

  // Load brands for label rendering / select options
  useEffect(() => {
    supabase.from("brands").select("id,name_ar").then(({ data }) => {
      const map: Record<string, string> = {};
      (data ?? []).forEach((b: any) => { map[b.id] = b.name_ar; });
      setBrands(map);
    });
  }, []);

  // Load signed URLs for cover images
  const imageColumnKey = useMemo(
    () => cfg?.listColumns.find((c) => c.type === "image")?.key ?? null,
    [cfg],
  );

  useEffect(() => {
    if (!cfg || !imageColumnKey || rows.length === 0) return;
    const assetIds = Array.from(new Set(rows.map((r) => r[imageColumnKey]).filter(Boolean)));
    if (assetIds.length === 0) return;
    (async () => {
      const { data: assets } = await supabase.from("assets").select("id,storage_bucket,storage_path").in("id", assetIds);
      if (!assets || assets.length === 0) return;
      const signed = await signUrls({ data: { items: assets.map((a: any) => ({ bucket: a.storage_bucket, path: a.storage_path })) } });
      const map: Record<string, string> = {};
      assets.forEach((a: any) => {
        const url = signed[`${a.storage_bucket}::${a.storage_path}`];
        if (url) map[a.id] = url;
      });
      setAssetUrls(map);
    })();
  }, [cfg, imageColumnKey, rows, signUrls]);

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
              <th className="p-3 w-28"></th>
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
                  <td key={c.key} className="p-3 max-w-[240px]">{renderCell(c, r[c.key], { brands, assetUrls })}</td>
                ))}
                <td className="p-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setEditing(r)} className="p-1.5 rounded hover:bg-slate-700 text-sky-300" title="تعديل">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(String(r[pk] ?? "")); toast.success("نُسخ المعرّف"); }} className="p-1.5 rounded hover:bg-slate-700 text-slate-400" title="نسخ المعرّف">
                      <Copy className="w-4 h-4" />
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
                  brands={brands}
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

function renderCell(col: Column, v: any, ctx: { brands: Record<string, string>; assetUrls: Record<string, string> }) {
  if (v === null || v === undefined || v === "") return <span className="text-slate-600">—</span>;
  if (col.type === "image") {
    const url = ctx.assetUrls[v];
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
    return <span className="text-slate-300">{ctx.brands[v] ?? String(v).slice(0, 8)}</span>;
  }
  if (col.type === "date") return <span className="text-slate-400 text-xs">{fmtDate(v)}</span>;
  if (typeof v === "object") return <span className="text-slate-500 text-xs">{JSON.stringify(v).slice(0, 40)}…</span>;
  return <span className="text-slate-200 truncate block">{String(v)}</span>;
}

function FieldInput({ field, value, onChange, brands }: { field: Field; value: any; onChange: (v: any) => void; brands: Record<string, string> }) {
  const base = "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

  if (field.type === "textarea") {
    return (
      <label className="block text-sm space-y-1">
        <span className="text-slate-300 font-medium">{field.label}</span>
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
  if (field.type === "select") {
    // Special: brand_id select uses live brands
    const options = field.key === "brand_id"
      ? Object.entries(brands).map(([id, name]) => ({ value: id, label: name }))
      : (field.options ?? []);
    return (
      <label className="block text-sm space-y-1">
        <span className="text-slate-300 font-medium">{field.label}</span>
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={base}>
          <option value="">—</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === "json") {
    const str = value === null || value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2);
    return (
      <label className="block text-sm space-y-1">
        <span className="text-slate-300 font-medium">{field.label}</span>
        <textarea rows={4} value={str} onChange={(e) => onChange(e.target.value)} className={base + " font-mono text-xs"} dir="ltr" placeholder='{}' />
        {field.hint && <span className="text-xs text-slate-500">{field.hint}</span>}
      </label>
    );
  }
  return (
    <label className="block text-sm space-y-1">
      <span className="text-slate-300 font-medium">{field.label}</span>
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
