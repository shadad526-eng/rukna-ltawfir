import { createFileRoute, redirect, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getEntity, type Field, type Column } from "@/lib/admin-entities";
import { adminSignedUrls, adminUploadStorage } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, X, ChevronRight, ChevronLeft, ChevronDown, Image as ImageIcon, Upload, FileText, Settings2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { fileToBase64 } from "@/lib/file-to-base64";
import { optimizeImageForUpload } from "@/lib/optimize-image";
import { ImageSpecHint } from "@/components/admin/ImageSpecHint";
import { isContentPageSlug } from "@/lib/page-content";
import { Link } from "@tanstack/react-router";
import { AssetPicker } from "@/components/admin/AssetPicker";
export { AssetPicker };


// Long-form fields get a rich-text editor instead of a plain textarea.
const RICHTEXT_KEYS = new Set([
  "body_ar", "body_en",
  "long_description_ar", "long_description_en",
  "content_ar", "content_en",
  "description_ar", "description_en",
]);

// Short descriptive fields: paragraph-only formatting (no headings/tables).
const COMPACT_KEYS = new Set([
  "short_description_ar", "short_description_en",
  "excerpt_ar", "excerpt_en",
  "intro_ar", "intro_en",
  "tagline_ar", "tagline_en",
  "usage_instructions_ar", "usage_instructions_en",
  "hero_sub_ar", "hero_sub_en",
  "address_ar", "address_en",
]);

/** Which editor a textarea field should use. */
function resolveEditor(field: { key: string; editor?: "rich" | "compact" | "plain" }) {
  if (field.editor) return field.editor;
  if (RICHTEXT_KEYS.has(field.key)) return "rich";
  if (COMPACT_KEYS.has(field.key)) return "compact";
  return "plain";
}


// URL-safe slug (keeps Arabic letters as-is, replaces spaces/punct with `-`).
function slugify(input: string): string {
  return (input ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip Latin diacritics
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Turn any ISO / date-ish value into `YYYY-MM-DDTHH:mm` for <input type=datetime-local>.
function toDatetimeLocal(v: any): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function asStringArray(v: any): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x.trim());
  if (typeof v === "string" && v.trim()) {
    try { const p = JSON.parse(v); if (Array.isArray(p)) return p.filter((x) => typeof x === "string"); } catch { /* noop */ }
  }
  return [];
}



export const Route = createFileRoute("/admin/e/$entity")({
  ssr: false,
  beforeLoad: ({ params }) => {
    if (params.entity === "products" || params.entity === "product_variants") {
      throw redirect({ to: "/admin/products", replace: true });
    }
  },
  component: EntityPage,
});

const PAGE_SIZE = 25;

const STATUS_LABELS: Record<string, string> = {
  active: "منشور", draft: "مسودة", archived: "مؤرشف",
  new: "جديد", in_progress: "قيد المعالجة", closed: "مغلق",
  in_review: "قيد المراجعة", contacted: "تم التواصل", converted: "تم التحويل",
  approved: "مقبول", rejected: "مرفوض",
  public: "عام", restricted: "مقيّد", b2b_only: "B2B",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  draft: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  archived: "bg-slate-700/40 text-slate-400 border-slate-700",
  new: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  in_progress: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  in_review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  contacted: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  converted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
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
  articles: Record<string, string>;
  navItems: Record<string, string>;
  certifications: Record<string, string>;
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
  const [refs, setRefs] = useState<RefMaps>({ brands: {}, products: {}, articles: {}, navItems: {}, certifications: {}, assetUrls: {}, assetInfo: {} });
  const [assetPickerFor, setAssetPickerFor] = useState<{ key: string; accept: "image" | "pdf" | "any" } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  // Load ref maps: brands, products, articles, nav items, certifications
  useEffect(() => {
    (async () => {
      const [{ data: bs }, { data: ps }, { data: arts }, { data: ns }, { data: cs }] = await Promise.all([
        supabase.from("brands").select("id,name_ar").order("name_ar"),
        supabase.from("products").select("id,name_ar").order("name_ar").limit(500),
        supabase.from("insights").select("id,title_ar").order("title_ar").limit(500),
        supabase.from("navigation_items").select("id,label_ar,location").order("sort_order"),
        supabase.from("certifications").select("id,name_ar").order("name_ar"),
      ]);
      const brands: Record<string, string> = {};
      (bs ?? []).forEach((b: any) => { brands[b.id] = b.name_ar; });
      const products: Record<string, string> = {};
      (ps ?? []).forEach((p: any) => { products[p.id] = p.name_ar; });
      const articles: Record<string, string> = {};
      (arts ?? []).forEach((a: any) => { articles[a.id] = a.title_ar; });
      const navItems: Record<string, string> = {};
      (ns ?? []).forEach((n: any) => { navItems[n.id] = `${n.label_ar} · ${n.location}`; });
      const certifications: Record<string, string> = {};
      (cs ?? []).forEach((c: any) => { certifications[c.id] = c.name_ar; });
      setRefs((r) => ({ ...r, brands, products, articles, navItems, certifications }));
    })();
  }, []);

  // Brand ⇄ certification links live in a join table; hydrate them into the form.
  const editingId = editing && !Array.isArray(editing) ? (editing as any).id : null;
  const editingCerts = editing ? (editing as any).__certifications : undefined;
  useEffect(() => {
    if (!cfg || cfg.table !== "brands" || !editingId || editingCerts !== undefined) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("brand_certifications").select("certification_id").eq("brand_id", editingId);
      if (cancelled) return;
      setEditing((prev) => (prev && prev.id === editingId
        ? { ...prev, __certifications: (data ?? []).map((r: any) => r.certification_id) }
        : prev));
    })();
    return () => { cancelled = true; };
  }, [cfg, editingId, editingCerts]);



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
    if (saving) return; // prevent duplicate submissions
    setErr(null);
    const errors: Record<string, string> = {};
    const payload: Record<string, any> = {};
    for (const f of cfg!.fields) {
      if (f.hidden) continue;
      // Relationship stored in a join table, not a column on this row.
      if (f.type === "certification_multi_ref") continue;
      let v = row[f.key];

      // Normalize empty → null
      if (v === "" || v === undefined) v = null;

      // Coerce by type
      if (f.type === "number" && v !== null) {
        const n = Number(v);
        if (Number.isNaN(n)) { errors[f.key] = "قيمة رقمية غير صالحة"; continue; }
        v = n;
      }
      if (f.type === "boolean") v = !!v;
      if (f.type === "date" && v !== null && typeof v === "string") {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) { errors[f.key] = "تاريخ غير صالح"; continue; }
        v = d.toISOString();
      }
      if (f.type === "slug" && typeof v === "string") {
        v = slugify(v);
        if (v && !/^[\p{L}\p{N}-]+$/u.test(v)) { errors[f.key] = "المعرّف يحتوي على أحرف غير صالحة"; continue; }
      }
      if ((f.type === "tags" || f.type === "brand_multi_ref" || f.type === "product_multi_ref" || f.type === "article_multi_ref")) {
        v = Array.isArray(v) ? v : asStringArray(v);
        if ((v as string[]).length === 0) v = null;
      }
      // Language list is a NOT NULL array column — never send null.
      if (f.type === "lang_multi") {
        const langs = (Array.isArray(v) ? v : asStringArray(v)).filter((l) => l === "ar" || l === "en");
        v = langs.length ? langs : ["ar"];
      }

      if (f.type === "json" && typeof v === "string") {
        try { v = v.trim() ? JSON.parse(v) : null; }
        catch { errors[f.key] = "JSON غير صالح"; continue; }
      }
      // Repeatable extra-fields area is stored in a NOT NULL jsonb column.
      if (f.type === "page_fields") {
        const list = Array.isArray((v as any)?.fields) ? (v as any).fields : [];
        v = { ...(typeof v === "object" && v ? v : {}), fields: list };
      }




      // NOT NULL columns that the editor leaves optional: mirror another field.
      if ((v === null || v === "") && f.fallbackFrom) {
        const fb = row[f.fallbackFrom];
        if (typeof fb === "string" && fb.trim()) v = fb.trim();
      }

      // Required check
      if (f.required && (v === null || v === undefined || v === "")) {
        errors[f.key] = "هذا الحقل مطلوب";
      }

      payload[f.key] = v;
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      const first = cfg!.fields.find((f) => errors[f.key]);
      const msg = first ? `${first.label}: ${errors[first.key]}` : "الرجاء تصحيح الأخطاء المميّزة.";
      setErr(msg);
      toast.error(msg);
      return;
    }
    setFieldErrors({});

    const isNew = !row[pk];
    setSaving(true);
    try {
      const q = isNew
        ? supabase.from(cfg!.table as any).insert(payload).select(pk)
        : supabase.from(cfg!.table as any).update(payload).eq(pk, row[pk]).select(pk);
      const { data, error } = await q;
      if (error) {
        const raw = [error.message, (error as any).details, (error as any).hint].filter(Boolean).join(" — ");
        const msg = /duplicate key|unique/i.test(error.message)
          ? "قيمة مكرّرة (تحقّق من المعرّف / Slug)."
          : /row-level security|permission denied/i.test(raw)
            ? "لا تملك صلاحية الحفظ لهذا العنصر."
            : raw;
        setErr(msg); toast.error(msg);
        return;
      }
      if (!data || data.length === 0) {
        // No error but nothing written → RLS silently filtered the write.
        const msg = "لم يتم حفظ أي تغييرات — تحقّق من الصلاحيات ثم أعد المحاولة.";
        setErr(msg); toast.error(msg);
        return;
      }
      toast.success(isNew ? "تم إنشاء العنصر بنجاح" : "تم حفظ التغييرات");
      setEditing(null);
      load();
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "تعذّر الحفظ. تحقّق من الاتصال ثم أعد المحاولة.";
      setErr(msg); toast.error(msg);
    } finally {
      setSaving(false);
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
                    {isContentPageSlug(r.slug) && (
                      <Link
                        to="/admin/pages/$slug"
                        params={{ slug: r.slug }}
                        className="rounded bg-emerald-600/20 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-600/30"
                        title="تحرير أقسام الصفحة"
                      >
                        محرّر الأقسام
                      </Link>
                    )}

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

      {editing && (() => {
        const isNew = !editing[pk];
        const visibleFields = cfg.fields.filter((f) => !f.hidden && !f.advanced);
        const advancedFields = cfg.fields.filter((f) => !f.hidden && f.advanced);
        const setField = (key: string, v: any) => {
          setEditing((prev) => {
            if (!prev) return prev;
            const next = { ...prev, [key]: v };
            // Auto-fill slug from source on new records if slug is empty.
            if (isNew) {
              for (const f of cfg.fields) {
                if (f.type === "slug" && f.slugFrom === key && !prev[f.key]) {
                  next[f.key] = slugify(String(v ?? ""));
                }
              }
            }
            return next;
          });
          if (fieldErrors[key]) setFieldErrors((e) => { const c = { ...e }; delete c[key]; return c; });
        };
        return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="font-semibold">{editing[pk] ? `تعديل · ${cfg.label}` : `إضافة إلى ${cfg.label}`}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="p-5 space-y-4">
              {visibleFields.map((f) => (
                <FieldInput key={f.key} field={f} value={editing[f.key]} row={editing}
                  refs={refs} error={fieldErrors[f.key]} specKey={`${entity}.${f.key}`}
                  onOpenAssetPicker={() => setAssetPickerFor({ key: f.key, accept: f.accept ?? "image" })}
                  onChange={(v) => setField(f.key, v)} />
              ))}
              {advancedFields.length > 0 && (
                <div className="border-t border-slate-800 pt-3">
                  <button type="button" onClick={() => setShowAdvanced((s) => !s)}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200">
                    <Settings2 className="w-3.5 h-3.5" />
                    خيارات متقدمة
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                  </button>
                  {showAdvanced && (
                    <div className="mt-3 space-y-4">
                      {advancedFields.map((f) => (
                        <FieldInput key={f.key} field={f} value={editing[f.key]} row={editing}
                          refs={refs} error={fieldErrors[f.key]} specKey={`${entity}.${f.key}`}
                          onOpenAssetPicker={() => setAssetPickerFor({ key: f.key, accept: f.accept ?? "image" })}
                          onChange={(v) => setField(f.key, v)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">إلغاء</button>
                <button disabled={saving} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50">
                  {saving ? "جاري الحفظ…" : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
        );
      })()}


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
  if (col.type === "brand" && (v === null || v === undefined || v === "")) {
    return <span className="text-slate-400">عام</span>;
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

function FieldInput({ field, value, onChange, refs, onOpenAssetPicker, error, specKey, row }: {
  field: Field; value: any; onChange: (v: any) => void; refs: RefMaps; onOpenAssetPicker: () => void; error?: string; specKey?: string; row?: Record<string, any>;
}) {
  const baseCls = "w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm focus:outline-none";
  const border = error ? "border-rose-500 focus:border-rose-400" : "border-slate-800 focus:border-emerald-500";
  const base = `${baseCls} ${border}`;
  const labelEl = <span className="text-slate-300 font-medium">{field.label}{field.required && <span className="text-rose-400"> *</span>}</span>;
  const hintEl = (
    <>
      {error && <span className="block text-xs text-rose-400 mt-1">{error}</span>}
      {!error && field.hint && <span className="block text-xs text-slate-500 mt-1">{field.hint}</span>}
    </>
  );

  if (field.type === "textarea") {
    const editor = resolveEditor(field);
    if (editor !== "plain") {
      return (
        <label className="block text-sm space-y-1">{labelEl}
          <RichTextEditor
            value={value ?? ""}
            onChange={onChange}
            compact={editor === "compact"}
            minHeight={editor === "compact" ? 140 : 240}
            dir={field.key.endsWith("_en") ? "ltr" : "rtl"}
          />
          {hintEl}
        </label>
      );
    }
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base} />
        {hintEl}
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
          <option value="">عام (بدون علامة)</option>
          {opts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        {hintEl}
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
        {hintEl}
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
        {hintEl}
      </label>
    );
  }
  if (field.type === "brand_multi_ref" || field.type === "product_multi_ref" || field.type === "article_multi_ref") {
    const source =
      field.type === "brand_multi_ref" ? refs.brands
        : field.type === "product_multi_ref" ? refs.products
          : refs.articles;
    const current = asStringArray(value);
    const remaining = Object.entries(source).filter(([id]) => !current.includes(id));
    return (
      <div className="block text-sm space-y-1">{labelEl}
        <div className={`${base} min-h-[42px] flex flex-wrap gap-1.5 items-center`}>
          {current.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 rounded px-2 py-0.5 text-xs">
              {source[id] ?? id}
              <button type="button" onClick={() => onChange(current.filter((x) => x !== id))} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {current.length === 0 && <span className="text-slate-600 text-xs">لا يوجد اختيار</span>}
        </div>
        {remaining.length > 0 && (
          <select value="" onChange={(e) => e.target.value && onChange([...current, e.target.value])}
            className={`${base} mt-1`}>
            <option value="">＋ أضف عنصر…</option>
            {remaining.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        )}
        {hintEl}
      </div>
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
        {hintEl}
      </label>
    );
  }
  if (field.type === "asset") {
    const url = value ? refs.assetUrls[value] : null;
    const info = value ? refs.assetInfo[value] : null;
    const isImg = (info?.mime ?? "").startsWith("image/");
    return (
      <div className="block text-sm space-y-1">{labelEl}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg p-2">
          <div className="w-16 h-16 rounded bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
            {url && isImg
              ? <img src={url} alt="" className="w-full h-full object-cover" />
              : url
                ? <FileText className="w-7 h-7 text-slate-500" />
                : <ImageIcon className="w-6 h-6 text-slate-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-200 text-xs truncate">{info?.name ?? (value ? "الأصل محدّد" : "لم يُحدّد أصل")}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <button type="button" onClick={onOpenAssetPicker} className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs">
                {value ? "استبدال" : "اختيار / رفع"}
              </button>
              {url && <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs">معاينة</a>}
              {value && <button type="button" onClick={() => onChange(null)} className="px-3 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs">إزالة</button>}
            </div>
          </div>
        </div>
        <ImageSpecHint specKey={specKey} previewUrl={isImg ? url : null} />
        {hintEl}
      </div>
    );
  }

  if (field.type === "page_fields") {

    const list: any[] = Array.isArray(value?.fields) ? value.fields : [];
    const commit = (next: any[]) => onChange({ ...(typeof value === "object" && value ? value : {}), fields: next });
    const patch = (i: number, p: any) => commit(list.map((f, j) => (j === i ? { ...f, ...p } : f)));
    const move = (i: number, dir: -1 | 1) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      commit(next.map((f, k) => ({ ...f, sort_order: k })));
    };
    return (
      <div className="block text-sm space-y-2">{labelEl}
        <div className="space-y-2">
          {list.map((f, i) => (
            <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">حقل {i + 1}</span>
                <div className="flex items-center gap-1">
                  <label className="flex items-center gap-1 text-[11px] text-slate-400">
                    <input type="checkbox" checked={f.enabled !== false} onChange={(e) => patch(i, { enabled: e.target.checked })} className="accent-emerald-500" />
                    مفعّل
                  </label>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-2 py-0.5 rounded bg-slate-800 text-xs disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="px-2 py-0.5 rounded bg-slate-800 text-xs disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => commit(list.filter((_, j) => j !== i))} className="px-2 py-0.5 rounded bg-rose-600/20 text-rose-300 text-xs">حذف</button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <input value={f.label_ar ?? ""} onChange={(e) => patch(i, { label_ar: e.target.value })} placeholder="العنوان (AR)" className={base} />
                <input value={f.label_en ?? ""} onChange={(e) => patch(i, { label_en: e.target.value })} placeholder="Label (EN)" dir="ltr" className={base} />
                <textarea rows={2} value={f.value_ar ?? ""} onChange={(e) => patch(i, { value_ar: e.target.value })} placeholder="القيمة (AR)" className={base} />
                <textarea rows={2} value={f.value_en ?? ""} onChange={(e) => patch(i, { value_en: e.target.value })} placeholder="Value (EN)" dir="ltr" className={base} />
                <input value={f.icon_url ?? ""} onChange={(e) => patch(i, { icon_url: e.target.value })} placeholder="رابط أيقونة أو صورة (اختياري)" dir="ltr" className={base + " md:col-span-2"} />
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">لا توجد حقول إضافية.</div>}
        </div>
        <button type="button" onClick={() => commit([...list, { enabled: true, sort_order: list.length }])}
          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs">＋ إضافة حقل</button>
        {hintEl}
      </div>
    );
  }

  if (field.type === "tags") {
    const current = asStringArray(value);
    return (
      <div className="block text-sm space-y-1">{labelEl}
        <div className={`${base} min-h-[42px] flex flex-wrap gap-1.5 items-center`}>
          {current.map((tag, i) => (
            <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-xs">
              {tag}
              <button type="button" onClick={() => onChange(current.filter((_, j) => j !== i))} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={current.length === 0 ? "اكتب ثم اضغط Enter…" : ""}
            onKeyDown={(e) => {
              const v = (e.target as HTMLInputElement).value.trim();
              if ((e.key === "Enter" || e.key === ",") && v) {
                e.preventDefault();
                if (!current.includes(v)) onChange([...current, v]);
                (e.target as HTMLInputElement).value = "";
              } else if (e.key === "Backspace" && !(e.target as HTMLInputElement).value && current.length) {
                onChange(current.slice(0, -1));
              }
            }}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && !current.includes(v)) { onChange([...current, v]); e.target.value = ""; }
            }}
            className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
          />
        </div>
        {hintEl}
      </div>
    );
  }

  if (field.type === "slug") {
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <div className="flex gap-2">
          <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onChange(slugify(e.target.value))}
            className={base + " font-mono"} dir="ltr" placeholder="my-slug" />
        </div>
        {hintEl}
      </label>
    );
  }

  if (field.type === "json") {
    const str = value === null || value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2);
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <textarea rows={4} value={str} onChange={(e) => onChange(e.target.value)} className={base + " font-mono text-xs"} dir="ltr" placeholder='{}' />
        {hintEl}
      </label>
    );
  }

  if (field.type === "date") {
    return (
      <label className="block text-sm space-y-1">{labelEl}
        <input type="datetime-local" value={toDatetimeLocal(value)} onChange={(e) => onChange(e.target.value)}
          className={base} dir="ltr" />
        {hintEl}
      </label>
    );
  }

  return (
    <label className="block text-sm space-y-1">{labelEl}
      <input
        type={field.type === "number" ? "number" : "text"}
        value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className={base}
        dir={field.type === "number" ? "ltr" : "auto"}
      />
      {hintEl}
    </label>
  );
}




