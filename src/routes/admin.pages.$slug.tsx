import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, notFound, useBlocker, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { StyledHeadingEditor } from "@/components/admin/StyledHeadingEditor";
import {
  CONTENT_PAGE_LABELS,
  CONTENT_PAGE_SLUGS,
  PAGE_SCHEMAS,
  defaultContent,
  isContentPageSlug,
  withDefaults,
  type ContentField,
  type ContentGroup,
  type ContentPageSlug,
  type DefaultSeed,
  type PageContent,
} from "@/lib/page-content";

export const Route = createFileRoute("/admin/pages/$slug")({
  loader: ({ params }): { slug: ContentPageSlug } => {
    if (!isContentPageSlug(params.slug)) throw notFound();
    return { slug: params.slug };
  },

  component: PageEditor,
});

const input =
  "w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";

function FieldControl({
  field, lang, content, onSet,
}: { field: ContentField; lang: "ar" | "en"; content: PageContent; onSet: (k: string, v: any) => void }) {
  const key = field.bilingual === false ? field.key : `${field.key}_${lang}`;
  const dir = field.bilingual === false || lang === "en" ? "ltr" : "rtl";
  const value = content[key];

  if (field.ui === "toggle") {
    const on = value !== false;
    return (
      <button
        type="button"
        onClick={() => onSet(key, !on)}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
          on ? "bg-emerald-600/20 text-emerald-300" : "bg-slate-800 text-slate-400"
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${on ? "bg-emerald-400" : "bg-slate-500"}`} />
        {on ? "ظاهر" : "مخفي"}
      </button>
    );
  }
  if (field.ui === "heading") {
    return <StyledHeadingEditor value={value} dir={dir} onChange={(v) => onSet(key, v)} />;
  }
  if (field.ui === "rich") {
    return (
      <RichTextEditor
        compact
        minHeight={120}
        dir={dir}
        value={typeof value === "string" ? value : ""}
        onChange={(html) => onSet(key, html)}
      />
    );
  }
  if (field.ui === "textarea") {
    return (
      <textarea rows={3} dir={dir} className={input} value={typeof value === "string" ? value : ""}
        onChange={(e) => onSet(key, e.target.value)} />
    );
  }
  return (
    <input dir={dir} className={input} value={typeof value === "string" ? value : ""}
      onChange={(e) => onSet(key, e.target.value)} />
  );
}

function RepeaterEditor({
  rep, lang, content, set,
}: { rep: NonNullable<ContentGroup["repeater"]>; lang: "ar" | "en"; content: PageContent; set: (k: string, v: any) => void }) {
  const list: any[] = Array.isArray(content[rep.key]) ? content[rep.key] : [];
  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-300">{rep.label}</div>
      {rep.hint && <div className="text-[11px] text-slate-500">{rep.hint}</div>}
      {list.map((row, i) => (
        <div key={i} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">عنصر {i + 1}</span>
            <div className="flex gap-1">
              <button type="button" disabled={i === 0}
                onClick={() => { const n = [...list]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set(rep.key, n); }}
                className="rounded bg-slate-800 px-2 py-0.5 text-xs disabled:opacity-30">↑</button>
              <button type="button" disabled={i === list.length - 1}
                onClick={() => { const n = [...list]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set(rep.key, n); }}
                className="rounded bg-slate-800 px-2 py-0.5 text-xs disabled:opacity-30">↓</button>
              <button type="button"
                onClick={() => { if (confirm("حذف هذا العنصر؟")) set(rep.key, list.filter((_, j) => j !== i)); }}
                className="rounded bg-rose-600/20 px-2 py-0.5 text-xs text-rose-300">حذف</button>
            </div>
          </div>
          {rep.itemFields.map((itf) => (
            <div key={itf.key} className="min-w-0 space-y-1.5">
              <div className="text-xs text-slate-400">{itf.label}</div>
              <FieldControl
                field={itf}
                lang={lang}
                content={row}
                onSet={(k, v) => set(rep.key, list.map((r, j) => (j === i ? { ...r, [k]: v } : r)))}
              />
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={() => set(rep.key, [...list, {}])}
        className="rounded bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700">
        + إضافة عنصر
      </button>
    </div>
  );
}

function GroupEditor({
  group, lang, content, set,
}: { group: ContentGroup; lang: "ar" | "en"; content: PageContent; set: (k: string, v: any) => void }) {
  const repeaters = [group.repeater, ...(group.repeaters ?? [])].filter(Boolean) as NonNullable<
    ContentGroup["repeater"]
  >[];

  return (
    <section id={`sec-${group.key}`} className="scroll-mt-28 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-5">
      <h2 className="text-base font-bold text-white">{group.label}</h2>
      <div className="mt-5 space-y-5">
        {(group.fields ?? []).map((f) => (
          <div key={f.key} className="min-w-0 space-y-1.5">
            <div className="text-sm text-slate-300">{f.label}</div>
            {f.hint && <div className="text-[11px] text-slate-500">{f.hint}</div>}
            <FieldControl field={f} lang={lang} content={content} onSet={set} />
          </div>
        ))}

        {repeaters.map((rep) => (
          <RepeaterEditor key={rep.key} rep={rep} lang={lang} content={content} set={set} />
        ))}
      </div>
    </section>
  );
}


/**
 * Loads the live values the defaults depend on (company legal name, currently
 * displayed headquarters address) so a missing editor field is pre-filled with
 * exactly what the public page shows today.
 */
async function loadSeed(): Promise<DefaultSeed> {
  const [identity, branch] = await Promise.all([
    supabase.from("corporate_identity").select("legal_name_ar,legal_name_en").limit(1).maybeSingle(),
    supabase.from("branches").select("address_ar,address_en").order("sort_order").limit(1).maybeSingle(),
  ]);
  return {
    legalNameAr: identity.data?.legal_name_ar ?? "",
    legalNameEn: identity.data?.legal_name_en ?? "",
    addressAr: branch.data?.address_ar ?? "",
    addressEn: branch.data?.address_en ?? branch.data?.address_ar ?? "",
  };
}

function PageEditor() {
  const params = Route.useParams();
  const slug = params.slug as ContentPageSlug;
  const navigate = useNavigate();
  const schema = PAGE_SCHEMAS[slug];

  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [content, setContent] = useState<PageContent | null>(null);
  const [extra, setExtra] = useState<Record<string, any>>({});
  const [seed, setSeed] = useState<DefaultSeed>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const savingRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setContent(null);
    setDirty(false);
    setSavedAt(null);
    setSaveError(null);
    const s = await loadSeed();
    const { data, error } = await supabase
      .from("pages")
      .select("id,slug,extra")
      .eq("slug", slug)
      .maybeSingle();
    setSeed(s);
    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }
    if (!data) {
      setLoadError("لا يوجد سجل لهذه الصفحة في قاعدة البيانات.");
      setLoading(false);
      return;
    }
    const ex = (data.extra && typeof data.extra === "object" ? data.extra : {}) as Record<string, any>;
    setExtra(ex);
    setContent(withDefaults(slug, ex.content as PageContent, s));
    setLoading(false);
  }, [slug]);

  // Reloads whenever the edited page changes so content never goes stale.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, [load]);

  // Native warning when leaving the tab with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // In-app navigation guard.
  useBlocker({
    shouldBlockFn: () => dirty && !window.confirm("لديك تعديلات غير محفوظة. المغادرة ستفقدها. هل تريد المتابعة؟"),
    enableBeforeUnload: false,
  });

  const set = (k: string, v: any) => {
    setDirty(true);
    setSavedAt(null);
    setContent((c) => ({ ...(c ?? {}), [k]: v }));
  };

  async function save() {
    if (!content || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    // `select()` confirms a row was actually updated (RLS can silently match 0).
    const { data, error } = await supabase
      .from("pages")
      .update({ extra: { ...extra, content } as any })
      .eq("slug", slug)
      .select("id,extra");
    setSaving(false);
    savingRef.current = false;
    if (error) {
      setSaveError(error.message);
      toast.error(error.message);
      return;
    }
    if (!data || data.length === 0) {
      const msg = "لم يتم حفظ أي سجل — تحقّق من الصلاحيات.";
      setSaveError(msg);
      toast.error(msg);
      return;
    }
    const savedExtra = (data[0].extra && typeof data[0].extra === "object" ? data[0].extra : {}) as Record<string, any>;
    setExtra(savedExtra);
    setDirty(false);
    setSavedAt(Date.now());
    toast.success("تم حفظ محتوى الصفحة");
  }

  function restore() {
    if (!confirm("سيتم استبدال كل الحقول بالنصوص الأصلية المنشورة. هل تريد المتابعة؟")) return;
    setContent(defaultContent(slug, seed));
    setDirty(true);
    setSavedAt(null);
  }

  function cancel() {
    if (dirty && !confirm("سيتم التراجع عن التعديلات غير المحفوظة. هل تريد المتابعة؟")) return;
    void load();
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (loadError || !content) {
    return (
      <div dir="rtl" className="mx-auto max-w-lg rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-rose-300" />
        <p className="mt-3 text-sm text-rose-200">{loadError ?? "تعذّر تحميل الصفحة."}</p>
        <button onClick={() => void load()} className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-100">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full min-w-0 pb-16">
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button onClick={() => navigate({ to: "/admin/e/$entity", params: { entity: "pages" } })}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700">
            <ArrowRight className="h-3.5 w-3.5" /> رجوع
          </button>
          <h1 className="text-base font-bold text-white md:text-lg">محرّر صفحة: {CONTENT_PAGE_LABELS[slug]}</h1>
          <div className="flex overflow-hidden rounded-lg border border-slate-700">
            {(["ar", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1.5 text-xs ${lang === l ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-300"}`}>
                {l === "ar" ? "العربية" : "English"}
              </button>
            ))}
          </div>
          <div className="hidden flex-1 md:block" />
          {saving ? (
            <span className="text-[11px] text-slate-400">جارٍ الحفظ…</span>
          ) : saveError ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-300">
              <AlertCircle className="h-3.5 w-3.5" /> {saveError}
            </span>
          ) : savedAt ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> تم الحفظ
            </span>
          ) : dirty ? (
            <span className="text-[11px] text-amber-300">تعديلات غير محفوظة</span>
          ) : null}
          <button onClick={cancel} disabled={saving}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-40">
            إلغاء التعديلات
          </button>
          <button onClick={restore} disabled={saving}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-40">
            استعادة النصوص الأصلية
          </button>
          <button onClick={save} disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
          </button>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            {schema.map((g) => (
              <a key={g.key} href={`#sec-${g.key}`}
                className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
                {g.label}
              </a>
            ))}
          </div>
        </nav>
        <div className="min-w-0 space-y-5">
          {schema.map((g) => (
            <GroupEditor key={g.key} group={g} lang={lang} content={content} set={set} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const CONTENT_SLUGS = CONTENT_PAGE_SLUGS;
