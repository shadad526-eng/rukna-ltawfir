import { useMemo } from "react";
import { ChevronDown, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  CONTENT_PAGE_SLUGS,
  PAGE_SCHEMAS,
  defaultContent,
  type ContentField,
  type ContentPageSlug,
  type PageContent,
} from "@/lib/page-content";

function isContentSlug(slug: any): slug is ContentPageSlug {
  return typeof slug === "string" && (CONTENT_PAGE_SLUGS as readonly string[]).includes(slug);
}

const inputCls =
  "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500";

function TextControl({
  value, onChange, kind, dir, placeholder,
}: { value: string; onChange: (v: string) => void; kind?: "text" | "textarea"; dir: "rtl" | "ltr"; placeholder?: string }) {
  if (kind === "textarea") {
    return (
      <textarea rows={3} dir={dir} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className={inputCls} />
    );
  }
  return (
    <input dir={dir} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} className={inputCls} />
  );
}

function BilingualField({
  field, content, onSet, defaults,
}: { field: ContentField; content: PageContent; onSet: (k: string, v: any) => void; defaults: PageContent }) {
  if (field.bilingual === false) {
    return (
      <label className="block space-y-1 text-sm">
        <span className="text-slate-300">{field.label}</span>
        <TextControl dir="ltr" kind={field.kind} value={content[field.key] ?? ""}
          placeholder={defaults[field.key] ?? ""} onChange={(v) => onSet(field.key, v)} />
      </label>
    );
  }
  return (
    <div className="space-y-1.5">
      <span className="text-sm text-slate-300">{field.label}</span>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-1">
          <span className="text-[11px] text-slate-500">عربي</span>
          <TextControl dir="rtl" kind={field.kind} value={content[`${field.key}_ar`] ?? ""}
            placeholder={defaults[`${field.key}_ar`] ?? ""} onChange={(v) => onSet(`${field.key}_ar`, v)} />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-slate-500">English</span>
          <TextControl dir="ltr" kind={field.kind} value={content[`${field.key}_en`] ?? ""}
            placeholder={defaults[`${field.key}_en`] ?? ""} onChange={(v) => onSet(`${field.key}_en`, v)} />
        </div>
      </div>
    </div>
  );
}

/**
 * Structured section editor for the corporate pages. Writes into
 * `extra.content` while leaving any other keys inside `extra` untouched.
 */
export function PageSectionsEditor({
  slug, value, onChange,
}: { slug: string | null | undefined; value: any; onChange: (v: any) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const schema = isContentSlug(slug) ? PAGE_SCHEMAS[slug] : null;
  const defaults = useMemo(() => (isContentSlug(slug) ? defaultContent(slug) : {}), [slug]);

  if (!schema) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-400">
        محرّر الأقسام المنظّم متاح للصفحات: من نحن (about)، الشراكات (partners)، تواصل معنا (contact).
      </div>
    );
  }

  const extra = typeof value === "object" && value ? value : {};
  const content: PageContent = typeof extra.content === "object" && extra.content ? extra.content : {};
  const commit = (next: PageContent) => onChange({ ...extra, content: next });
  const set = (k: string, v: any) => commit({ ...content, [k]: v });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] leading-5 text-slate-500">
          كل حقل فارغ يعرض النص الحالي المنشور تلقائيًا (يظهر كنص باهت داخل الحقل).
        </p>
        <button type="button"
          onClick={() => commit({ ...defaults })}
          className="inline-flex shrink-0 items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-700">
          <RotateCcw className="h-3 w-3" /> تعبئة بالنصوص الحالية
        </button>
      </div>

      {schema.map((g) => {
        const isOpen = open[g.key] ?? false;
        return (
          <div key={g.key} className="rounded-lg border border-slate-800 bg-slate-950/40">
            <button type="button" onClick={() => setOpen((o) => ({ ...o, [g.key]: !isOpen }))}
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-slate-200">
              <span>{g.label}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="space-y-4 border-t border-slate-800 p-3">
                {(g.fields ?? []).map((fl) => (
                  <BilingualField key={fl.key} field={fl} content={content} onSet={set} defaults={defaults} />
                ))}
                {g.repeater && (() => {
                  const rep = g.repeater!;
                  const list: any[] = Array.isArray(content[rep.key])
                    ? content[rep.key]
                    : (defaults[rep.key] as any[]) ?? [];
                  const setList = (next: any[]) => set(rep.key, next);
                  return (
                    <div className="space-y-2">
                      <div className="text-sm text-slate-300">{rep.label}</div>
                      {rep.hint && <div className="text-[11px] text-slate-500">{rep.hint}</div>}
                      {list.map((row, i) => (
                        <div key={i} className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">عنصر {i + 1}</span>
                            <div className="flex gap-1">
                              <button type="button" onClick={() => setList(list.filter((_, j) => j !== i))}
                                className="rounded bg-rose-600/20 p-1 text-rose-300 hover:bg-rose-600/30">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          {rep.itemFields.map((itf) => (
                            <BilingualField
                              key={itf.key}
                              field={itf}
                              content={row}
                              defaults={{}}
                              onSet={(k, v) => setList(list.map((r, j) => (j === i ? { ...r, [k]: v } : r)))}
                            />
                          ))}
                        </div>
                      ))}
                      <button type="button" onClick={() => setList([...list, {}])}
                        className="inline-flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700">
                        <Plus className="h-3.5 w-3.5" /> إضافة عنصر
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
