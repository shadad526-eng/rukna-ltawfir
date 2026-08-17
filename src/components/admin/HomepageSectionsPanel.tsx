import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListHomepageSections, adminSaveHomepageSections } from "@/lib/admin.functions";
import {
  SECTION_DEFAULTS,
  SECTION_KEYS,
  buildSectionsMap,
  type HomepageSectionRow,
} from "@/lib/homepage-sections";

/**
 * Manages every homepage section after the Hero / Main Slider.
 * Content is stored in `public.homepage_sections`; empty fields fall back to
 * the original built-in copy, so the design never changes unexpectedly.
 */
export function HomepageSectionsPanel() {
  const list = useServerFn(adminListHomepageSections);
  const save = useServerFn(adminSaveHomepageSections);
  const [rows, setRows] = useState<HomepageSectionRow[]>([]);
  const [open, setOpen] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data: any = await list();
        const map = buildSectionsMap(data ?? []);
        setRows(SECTION_KEYS.map((k) => map[k]));
      } catch (e: any) {
        toast.error(e?.message ?? "تعذّر تحميل الأقسام");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (key: string, p: Partial<HomepageSectionRow>) =>
    setRows((rs) => rs.map((r) => (r.section_key === key ? { ...r, ...p } : r)));
  const patchExtra = (key: string, p: Record<string, unknown>) =>
    setRows((rs) => rs.map((r) => (r.section_key === key ? { ...r, extra: { ...r.extra, ...p } } : r)));

  async function persist() {
    setBusy(true);
    try {
      await save({ data: { rows } });
      toast.success("تم حفظ أقسام الصفحة الرئيسية ونشرها");
    } catch (e: any) {
      toast.error(e?.message ?? "فشل الحفظ");
    } finally {
      setBusy(false);
    }
  }

  const Field = ({ label, value, onChange, area = false }: any) => (
    <label className="block">
      <span className="mb-1 block text-[11px] text-slate-400">{label}</span>
      {area ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm" />
      ) : (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm" />
      )}
    </label>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          العناوين والنصوص والأزرار والترتيب وإظهار/إخفاء كل قسم. اترك الحقل فارغاً لاستخدام النص الأصلي.
        </p>
        <button onClick={persist} disabled={busy}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "جارٍ الحفظ…" : "حفظ ونشر الأقسام"}
        </button>
      </div>

      {rows.map((r) => {
        const def = SECTION_DEFAULTS[r.section_key];
        const isOpen = open === r.section_key;
        return (
          <div key={r.section_key} className="rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex flex-wrap items-center gap-3 p-3">
              <button type="button" onClick={() => setOpen(isOpen ? "" : r.section_key)}
                className="flex-1 text-right text-sm font-semibold text-slate-100">
                {def?.label ?? r.section_key}
              </button>
              <label className="flex items-center gap-1.5 text-xs text-slate-300">
                <input type="checkbox" checked={r.is_enabled}
                  onChange={(e) => patch(r.section_key, { is_enabled: e.target.checked })} />
                ظاهر
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                الترتيب
                <input type="number" value={r.sort_order}
                  onChange={(e) => patch(r.section_key, { sort_order: Number(e.target.value) })}
                  className="w-16 rounded border border-slate-800 bg-slate-950 p-1 text-center text-xs" />
              </label>
            </div>

            {isOpen && (
              <div className="grid gap-3 border-t border-slate-800 p-3 md:grid-cols-2">
                <Field label="التمهيد (عربي)" value={r.extra?.eyebrow_ar} onChange={(v: string) => patchExtra(r.section_key, { eyebrow_ar: v })} />
                <Field label="Eyebrow (EN)" value={r.extra?.eyebrow_en} onChange={(v: string) => patchExtra(r.section_key, { eyebrow_en: v })} />
                <Field label="العنوان (عربي)" value={r.title_ar} onChange={(v: string) => patch(r.section_key, { title_ar: v })} />
                <Field label="Title (EN)" value={r.title_en} onChange={(v: string) => patch(r.section_key, { title_en: v })} />
                <Field label="عنوان فرعي (عربي)" value={r.subtitle_ar} onChange={(v: string) => patch(r.section_key, { subtitle_ar: v })} />
                <Field label="Subtitle (EN)" value={r.subtitle_en} onChange={(v: string) => patch(r.section_key, { subtitle_en: v })} />
                <Field area label="الوصف (عربي)" value={r.body_ar} onChange={(v: string) => patch(r.section_key, { body_ar: v })} />
                <Field area label="Description (EN)" value={r.body_en} onChange={(v: string) => patch(r.section_key, { body_en: v })} />
                <Field label="زر أساسي (عربي)" value={r.cta_label_ar} onChange={(v: string) => patch(r.section_key, { cta_label_ar: v })} />
                <Field label="Primary button (EN)" value={r.extra?.cta_label_en} onChange={(v: string) => patchExtra(r.section_key, { cta_label_en: v })} />
                <Field label="رابط الزر الأساسي (مثال: /brands)" value={r.cta_url} onChange={(v: string) => patch(r.section_key, { cta_url: v })} />
                <Field label="زر ثانوي (عربي)" value={r.extra?.cta2_label_ar} onChange={(v: string) => patchExtra(r.section_key, { cta2_label_ar: v })} />
                <Field label="Secondary button (EN)" value={r.extra?.cta2_label_en} onChange={(v: string) => patchExtra(r.section_key, { cta2_label_en: v })} />
                {r.section_key === "fallback_hero" && (
                  <>
                    <Field label="الشارة (عربي)" value={r.extra?.badge_ar} onChange={(v: string) => patchExtra(r.section_key, { badge_ar: v })} />
                    <Field label="Badge (EN)" value={r.extra?.badge_en} onChange={(v: string) => patchExtra(r.section_key, { badge_en: v })} />
                  </>
                )}
                {r.section_key === "partners" && (
                  <>
                    <Field area label="رسالة واتساب (عربي)" value={r.extra?.wa_message_ar} onChange={(v: string) => patchExtra(r.section_key, { wa_message_ar: v })} />
                    <Field area label="WhatsApp message (EN)" value={r.extra?.wa_message_en} onChange={(v: string) => patchExtra(r.section_key, { wa_message_en: v })} />
                  </>
                )}

                {(r.extra?.items?.length ?? 0) > 0 && (
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-[11px] text-slate-400">عناصر القسم</div>
                    {(r.extra.items ?? []).map((it, i) => (
                      <div key={i} className="grid gap-2 rounded-lg border border-slate-800 p-2 md:grid-cols-4">
                        <Field label="العنوان (عربي)" value={it.title_ar} onChange={(v: string) => {
                          const items = [...(r.extra.items ?? [])]; items[i] = { ...items[i], title_ar: v };
                          patchExtra(r.section_key, { items });
                        }} />
                        <Field label="Title (EN)" value={it.title_en} onChange={(v: string) => {
                          const items = [...(r.extra.items ?? [])]; items[i] = { ...items[i], title_en: v };
                          patchExtra(r.section_key, { items });
                        }} />
                        <Field label="الوصف (عربي)" value={it.desc_ar} onChange={(v: string) => {
                          const items = [...(r.extra.items ?? [])]; items[i] = { ...items[i], desc_ar: v };
                          patchExtra(r.section_key, { items });
                        }} />
                        <Field label="Description (EN)" value={it.desc_en} onChange={(v: string) => {
                          const items = [...(r.extra.items ?? [])]; items[i] = { ...items[i], desc_en: v };
                          patchExtra(r.section_key, { items });
                        }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
