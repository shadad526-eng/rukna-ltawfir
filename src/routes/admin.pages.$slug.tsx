import { useMemo, useState } from "react";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Loader2, Save } from "lucide-react";
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

function GroupEditor({
  group, lang, content, set,
}: { group: ContentGroup; lang: "ar" | "en"; content: PageContent; set: (k: string, v: any) => void }) {
  const rep = group.repeater;
  const list: any[] = rep && Array.isArray(content[rep.key]) ? content[rep.key] : [];

  return (
    <section id={`sec-${group.key}`} className="scroll-mt-28 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="text-base font-bold text-white">{group.label}</h2>
      <div className="mt-5 space-y-5">
        {(group.fields ?? []).map((f) => (
          <div key={f.key} className="space-y-1.5">
            <div className="text-sm text-slate-300">{f.label}</div>
            {f.hint && <div className="text-[11px] text-slate-500">{f.hint}</div>}
            <FieldControl field={f} lang={lang} content={content} onSet={set} />
          </div>
        ))}

        {rep && (
          <div className="space-y-3">
            <div className="text-sm text-slate-300">{rep.label}</div>
            {rep.hint && <div className="text-[11px] text-slate-500">{rep.hint}</div>}
            {list.map((row, i) => (
              <div key={i} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">عنصر {i + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" disabled={i === 0}
                      onClick={() => { const n = [...list]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set(rep.key, n); }}
                      className="rounded bg-slate-800 px-2 py-0.5 text-xs disabled:opacity-30">↑</button>
                    <button type="button" disabled={i === list.length - 1}
                      onClick={() => { const n = [...list]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set(rep.key, n); }}
                      className="rounded bg-slate-800 px-2 py-0.5 text-xs disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => set(rep.key, list.filter((_, j) => j !== i))}
                      className="rounded bg-rose-600/20 px-2 py-0.5 text-xs text-rose-300">حذف</button>
                  </div>
                </div>
                {rep.itemFields.map((itf) => (
                  <div key={itf.key} className="space-y-1.5">
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
        )}
      </div>
    </section>
  );
}

function PageEditor() {
  const { slug } = Route.useLoaderData();
  const navigate = useNavigate();
  const schema = PAGE_SCHEMAS[slug];
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [content, setContent] = useState<PageContent | null>(null);
  const [extra, setExtra] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useMemo(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("id,slug,extra")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      if (error) toast.error(error.message);
      const ex = (data?.extra && typeof data.extra === "object" ? data.extra : {}) as Record<string, any>;
      setExtra(ex);
      setContent(withDefaults(slug, ex.content as PageContent));
      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const set = (k: string, v: any) => {
    setDirty(true);
    setContent((c) => ({ ...(c ?? {}), [k]: v }));
  };

  async function save() {
    if (!content) return;
    setSaving(true);
    const { error } = await supabase
      .from("pages")
      .update({ extra: { ...extra, content } as any })
      .eq("slug", slug);
    setSaving(false);
    if (error) return toast.error(error.message);
    setDirty(false);
    toast.success("تم حفظ محتوى الصفحة");
  }

  if (loading || !content) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="pb-16">
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate({ to: "/admin/e/$entity", params: { entity: "pages" } })}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700">
            <ArrowRight className="h-3.5 w-3.5" /> رجوع
          </button>
          <h1 className="text-lg font-bold text-white">محرّر صفحة: {CONTENT_PAGE_LABELS[slug]}</h1>
          <div className="flex overflow-hidden rounded-lg border border-slate-700">
            {(["ar", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1.5 text-xs ${lang === l ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-300"}`}>
                {l === "ar" ? "العربية" : "English"}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <button onClick={() => { setContent(defaultContent(slug)); setDirty(true); }}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700">
            استعادة النصوص الأصلية
          </button>
          <button onClick={save} disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
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
        <div className="space-y-5">
          {schema.map((g) => (
            <GroupEditor key={g.key} group={g} lang={lang} content={content} set={set} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const CONTENT_SLUGS = CONTENT_PAGE_SLUGS;
