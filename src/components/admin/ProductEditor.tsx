import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowRight, Eye, Image as ImageIcon, Loader2, Plus, Save, Trash2, X,
  FileText, ChevronUp, ChevronDown, ExternalLink,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { adminSignedUrls } from "@/lib/admin.functions";
import { AssetPicker } from "@/routes/admin.e.$entity";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageSpecHint } from "@/components/admin/ImageSpecHint";
import {
  emptyProduct, loadProduct, saveProduct, slugify, validateProduct,
  type FaqDraft, type GalleryDraft, type IngredientDraft, type NutritionDraft,
  type ProductDraft, type VariantDraft,
} from "@/lib/product-admin";

const SECTIONS = [
  { key: "basic", label: "المعلومات الأساسية" },
  { key: "ar", label: "المحتوى بالعربية" },
  { key: "en", label: "English content" },
  { key: "variants", label: "الأنواع والعبوات" },
  { key: "gallery", label: "معرض الصور" },
  { key: "ingredients", label: "المكوّنات" },
  { key: "nutrition", label: "القيم الغذائية" },
  { key: "faqs", label: "الأسئلة الشائعة" },
  { key: "seo", label: "تحسين محركات البحث" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

const input =
  "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500";

export function ProductEditor({ productId }: { productId?: string }) {
  const navigate = useNavigate();
  const signUrls = useServerFn(adminSignedUrls);

  const [draft, setDraft] = useState<ProductDraft | null>(productId ? null : emptyProduct());
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [section, setSection] = useState<SectionKey>("basic");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brands, setBrands] = useState<{ id: string; name_ar: string; slug: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name_ar: string }[]>([]);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState<null | { mode: "cover" } | { mode: "variant"; index: number } | { mode: "gallery" }>(null);
  const slugTouched = useRef(false);
  const savingRef = useRef(false);

  // ---- load reference data -------------------------------------------------
  useEffect(() => {
    (async () => {
      const [b, c] = await Promise.all([
        supabase.from("brands").select("id,name_ar,slug").order("sort_order", { ascending: true }),
        supabase.from("product_categories").select("id,name_ar").order("sort_order", { ascending: true }),
      ]);
      setBrands((b.data ?? []) as any);
      setCategories((c.data ?? []) as any);
    })();
  }, []);

  // ---- load the product ----------------------------------------------------
  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setDraft(null);
    setLoadErr(null);
    loadProduct(productId)
      .then((d) => { if (!cancelled) { setDraft(d); slugTouched.current = true; setDirty(false); } })
      .catch((e) => { if (!cancelled) setLoadErr(e.message ?? "تعذّر تحميل المنتج"); });
    return () => { cancelled = true; };
  }, [productId]);

  // ---- resolve preview urls for every referenced asset ---------------------
  const assetIds = useMemo(() => {
    if (!draft) return [] as string[];
    const ids = [draft.cover_asset_id, ...draft.gallery.map((g) => g.asset_id), ...draft.variants.map((v) => v.cover_asset_id)];
    return Array.from(new Set(ids.filter(Boolean) as string[]));
  }, [draft]);

  useEffect(() => {
    const missing = assetIds.filter((id) => !assetUrls[id]);
    if (!missing.length) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("assets").select("id,storage_bucket,storage_path").in("id", missing);
      if (!data?.length) return;
      const signed = await signUrls({ data: { items: data.map((a: any) => ({ bucket: a.storage_bucket, path: a.storage_path })) } });
      if (cancelled) return;
      const map: Record<string, string> = {};
      data.forEach((a: any) => {
        const u = (signed as any)[`${a.storage_bucket}::${a.storage_path}`];
        if (u) map[a.id] = u;
      });
      setAssetUrls((prev) => ({ ...prev, ...map }));
    })();
    return () => { cancelled = true; };
  }, [assetIds, assetUrls, signUrls]);

  // ---- unsaved-changes guard ----------------------------------------------
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const patch = useCallback((p: Partial<ProductDraft>) => {
    setDraft((d) => (d ? { ...d, ...p } : d));
    setDirty(true);
  }, []);

  async function handleSave(opts?: { stay?: boolean }) {
    if (!draft || savingRef.current) return;
    const errs = validateProduct(draft);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("يرجى تصحيح الحقول المطلوبة قبل الحفظ");
      if (errs.name_ar || errs.name_en || errs.slug) setSection("basic");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const id = await saveProduct(draft);
      const fresh = await loadProduct(id);
      setDraft(fresh);
      setDirty(false);
      toast.success("تم حفظ المنتج بنجاح");
      if (!productId && !opts?.stay) {
        navigate({ to: "/admin/products/$id", params: { id }, replace: true });
      }
    } catch (e: any) {
      toast.error(e?.message ?? "فشل الحفظ");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function leave() {
    if (dirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد المغادرة؟")) return;
    navigate({ to: "/admin/products" });
  }

  if (loadErr) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
        {loadErr}
        <button onClick={() => navigate({ to: "/admin/products" })} className="mr-3 underline">العودة للقائمة</button>
      </div>
    );
  }
  if (!draft) {
    return <div className="flex items-center gap-2 p-10 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل…</div>;
  }

  const brandSlug = brands.find((b) => b.id === draft.brand_id)?.slug ?? null;

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 -mx-6 px-6 py-3 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={leave} className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800">
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="text-base font-semibold truncate">{draft.name_ar || (productId ? "منتج" : "منتج جديد")}</div>
            <div className="text-[11px] text-slate-500 truncate" dir="ltr">{draft.slug || "—"}</div>
          </div>
          {dirty && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">غير محفوظ</span>}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
            <input type="checkbox" className="accent-emerald-500" checked={draft.is_published}
              onChange={(e) => patch({ is_published: e.target.checked })} />
            منشور
          </label>
          {productId && brandSlug && draft.slug && (
            <a href={`/ar/brands/${brandSlug}/${draft.slug}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs">
              <Eye className="w-4 h-4" /> معاينة
            </a>
          )}
          <button onClick={() => handleSave()} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* section nav */}
        <nav className="space-y-1 lg:sticky lg:top-20 self-start">
          {SECTIONS.map((s) => (
            <button key={s.key} onClick={() => setSection(s.key)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm ${
                section === s.key
                  ? "bg-emerald-600/15 text-emerald-300 border border-emerald-500/20"
                  : "text-slate-400 hover:bg-slate-800/60"
              }`}>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {section === "basic" && (
            <Card title="المعلومات الأساسية">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="الاسم بالعربية" required error={errors.name_ar}>
                  <input className={input} value={draft.name_ar}
                    onChange={(e) => {
                      const name_ar = e.target.value;
                      patch(!slugTouched.current && !draft.name_en ? { name_ar, slug: slugify(name_ar) } : { name_ar });
                    }} />
                </Field>
                <Field label="Name (EN)" required error={errors.name_en}>
                  <input className={input} dir="ltr" value={draft.name_en}
                    onChange={(e) => {
                      const name_en = e.target.value;
                      patch(slugTouched.current ? { name_en } : { name_en, slug: slugify(name_en) });
                    }} />
                </Field>
                <Field label="المعرّف (Slug)" required error={errors.slug} hint="يُولَّد تلقائياً من الاسم الإنجليزي ويظهر في رابط الصفحة.">
                  <input className={input} dir="ltr" value={draft.slug}
                    onChange={(e) => { slugTouched.current = true; patch({ slug: e.target.value }); }}
                    onBlur={(e) => patch({ slug: slugify(e.target.value) })} />
                </Field>
                <Field label="العلامة التجارية" hint="اترك «عام» إذا لم يكن المنتج تابعاً لعلامة محددة.">
                  <select className={input} value={draft.brand_id ?? ""} onChange={(e) => patch({ brand_id: e.target.value || null })}>
                    <option value="">عام (بدون علامة)</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
                  </select>
                </Field>
                <Field label="التصنيف">
                  <select className={input} value={draft.category_id ?? ""} onChange={(e) => patch({ category_id: e.target.value || null })}>
                    <option value="">—</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                  </select>
                </Field>
                <Field label="ترتيب العرض">
                  <input type="number" className={input} value={draft.sort_order}
                    onChange={(e) => patch({ sort_order: Number(e.target.value) || 0 })} />
                </Field>
              </div>

              <div className="mt-4 space-y-4">
                <Field label="صورة الغلاف">
                  <AssetBox
                    url={draft.cover_asset_id ? assetUrls[draft.cover_asset_id] : null}
                    specKey="products.cover_asset_id"
                    onPick={() => setPicker({ mode: "cover" })}
                    onClear={() => patch({ cover_asset_id: null })}
                  />
                </Field>
                {draft.cover_asset_id ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="تعليق صورة الغلاف (AR)" hint="يظهر أسفل الصورة في الصفحة العامة. اتركه فارغاً لإخفائه.">
                      <input className={input} value={draft.cover_caption_ar ?? ""}
                        onChange={(e) => patch({ cover_caption_ar: e.target.value })} />
                    </Field>
                    <Field label="Cover caption (EN)" hint="Shown under the image on the English page. Leave empty to hide.">
                      <input className={input} dir="ltr" value={draft.cover_caption_en ?? ""}
                        onChange={(e) => patch({ cover_caption_en: e.target.value })} />
                    </Field>
                  </div>
                ) : null}
              </div>

            </Card>
          )}

          {section === "ar" && (
            <>
              <Card title="الوصف المختصر (AR)">
                <RichTextEditor compact dir="rtl" minHeight={120} value={draft.short_description_ar}
                  onChange={(html) => patch({ short_description_ar: html })} />
              </Card>
              <Card title="الوصف التفصيلي (AR)">
                <RichTextEditor dir="rtl" value={draft.long_description_ar}
                  onChange={(html) => patch({ long_description_ar: html })} />
              </Card>
              <Card title="طريقة الاستخدام (AR)">
                <RichTextEditor compact dir="rtl" minHeight={140} value={draft.usage_instructions_ar}
                  onChange={(html) => patch({ usage_instructions_ar: html })} />
              </Card>
              <Card title="الفوائد الرئيسية (AR)">
                <TagsInput values={draft.key_benefits_ar} onChange={(v) => patch({ key_benefits_ar: v })} dir="rtl" />
              </Card>
            </>
          )}

          {section === "en" && (
            <>
              <Card title="Short description (EN)">
                <RichTextEditor compact dir="ltr" minHeight={120} value={draft.short_description_en}
                  onChange={(html) => patch({ short_description_en: html })} />
              </Card>
              <Card title="Full description (EN)">
                <RichTextEditor dir="ltr" value={draft.long_description_en}
                  onChange={(html) => patch({ long_description_en: html })} />
              </Card>
              <Card title="Usage instructions (EN)">
                <RichTextEditor compact dir="ltr" minHeight={140} value={draft.usage_instructions_en}
                  onChange={(html) => patch({ usage_instructions_en: html })} />
              </Card>
              <Card title="Key benefits (EN)">
                <TagsInput values={draft.key_benefits_en} onChange={(v) => patch({ key_benefits_en: v })} dir="ltr" />
              </Card>
            </>
          )}

          {section === "variants" && (
            <Card title="الأنواع والعبوات" action={
              <AddButton onClick={() => patch({
                variants: [...draft.variants, {
                  slug: "", name_ar: "", name_en: "", variant_type: "size", pack_size: "",
                  unit_count: null, weight_grams: null, barcode: "", internal_sku: "",
                  cover_asset_id: null, is_published: true,
                } as VariantDraft],
              })} />
            }>
              <Repeater
                items={draft.variants}
                empty="لا توجد أنواع. أضف عبوة أو حجماً."
                onReorder={(items) => patch({ variants: items })}
                title={(v, i) => v.name_ar || `نوع ${i + 1}`}
                error={(i) => errors[`variant_${i}`]}
                render={(v, i, set) => (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="الاسم (AR)" required>
                      <input className={input} value={v.name_ar}
                        onChange={(e) => set({ name_ar: e.target.value, slug: v.slug || slugify(e.target.value) })} />
                    </Field>
                    <Field label="Name (EN)"><input className={input} dir="ltr" value={v.name_en} onChange={(e) => set({ name_en: e.target.value })} /></Field>
                    <Field label="المعرّف (Slug)">
                      <input className={input} dir="ltr" value={v.slug}
                        onChange={(e) => set({ slug: e.target.value })} onBlur={(e) => set({ slug: slugify(e.target.value) })} />
                    </Field>
                    <Field label="حجم العبوة"><input className={input} value={v.pack_size ?? ""} onChange={(e) => set({ pack_size: e.target.value })} /></Field>
                    <Field label="عدد الوحدات"><input type="number" className={input} value={v.unit_count ?? ""} onChange={(e) => set({ unit_count: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
                    <Field label="الوزن (جرام)"><input type="number" className={input} value={v.weight_grams ?? ""} onChange={(e) => set({ weight_grams: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
                    <Field label="الباركود"><input className={input} dir="ltr" value={v.barcode ?? ""} onChange={(e) => set({ barcode: e.target.value })} /></Field>
                    <Field label="رمز داخلي (SKU)"><input className={input} dir="ltr" value={v.internal_sku ?? ""} onChange={(e) => set({ internal_sku: e.target.value })} /></Field>
                    <div className="md:col-span-2">
                      <Field label="صورة النوع">
                        <AssetBox
                          url={v.cover_asset_id ? assetUrls[v.cover_asset_id] : null}
                          specKey="product_variants.cover_asset_id"
                          onPick={() => setPicker({ mode: "variant", index: i })}
                          onClear={() => set({ cover_asset_id: null })}
                        />
                      </Field>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input type="checkbox" className="accent-emerald-500" checked={v.is_published} onChange={(e) => set({ is_published: e.target.checked })} />
                      منشور
                    </label>
                  </div>
                )}
              />
            </Card>
          )}

          {section === "gallery" && (
            <Card title="معرض الصور" action={<AddButton label="إضافة صورة" onClick={() => setPicker({ mode: "gallery" })} />}>
              <p className="text-[11px] text-slate-500 mb-3">المقاس الموصى به 1000×1000 بكسل، صورة منتج على خلفية نظيفة.</p>
              <Repeater
                items={draft.gallery}
                empty="لا توجد صور إضافية بعد."
                onReorder={(items) => patch({ gallery: items })}
                title={(g, i) => `صورة ${i + 1}`}
                thumb={(g) => (g.asset_id ? assetUrls[g.asset_id] : null)}
                render={(g, i, set) => (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="التعليق (AR)"><input className={input} value={g.caption_ar ?? ""} onChange={(e) => set({ caption_ar: e.target.value })} /></Field>
                    <Field label="Caption (EN)"><input className={input} dir="ltr" value={g.caption_en ?? ""} onChange={(e) => set({ caption_en: e.target.value })} /></Field>
                  </div>
                )}
              />
            </Card>
          )}

          {section === "ingredients" && (
            <Card title="المكوّنات" action={
              <AddButton onClick={() => patch({
                ingredients: [...draft.ingredients, { name_ar: "", name_en: "", percentage: null, origin_ar: "", origin_en: "", notes_ar: "", notes_en: "" } as IngredientDraft],
              })} />
            }>
              <Repeater
                items={draft.ingredients}
                empty="لا توجد مكوّنات."
                onReorder={(items) => patch({ ingredients: items })}
                title={(x, i) => x.name_ar || `مكوّن ${i + 1}`}
                render={(x, i, set) => (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="الاسم (AR)" required><input className={input} value={x.name_ar} onChange={(e) => set({ name_ar: e.target.value })} /></Field>
                    <Field label="Name (EN)"><input className={input} dir="ltr" value={x.name_en} onChange={(e) => set({ name_en: e.target.value })} /></Field>
                    <Field label="النسبة %"><input type="number" step="0.01" className={input} value={x.percentage ?? ""} onChange={(e) => set({ percentage: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
                    <Field label="المصدر (AR)"><input className={input} value={x.origin_ar ?? ""} onChange={(e) => set({ origin_ar: e.target.value })} /></Field>
                    <Field label="ملاحظات (AR)"><input className={input} value={x.notes_ar ?? ""} onChange={(e) => set({ notes_ar: e.target.value })} /></Field>
                    <Field label="Notes (EN)"><input className={input} dir="ltr" value={x.notes_en ?? ""} onChange={(e) => set({ notes_en: e.target.value })} /></Field>
                  </div>
                )}
              />
            </Card>
          )}

          {section === "nutrition" && (
            <Card title="القيم الغذائية" action={
              <AddButton onClick={() => patch({ nutrition: [...draft.nutrition, { label_ar: "", label_en: "", value: "", unit: "" } as NutritionDraft] })} />
            }>
              <Repeater
                items={draft.nutrition}
                empty="لا توجد قيم غذائية."
                onReorder={(items) => patch({ nutrition: items })}
                title={(x, i) => x.label_ar || `قيمة ${i + 1}`}
                error={(i) => errors[`nutrition_${i}`]}
                render={(x, i, set) => (
                  <div className="grid gap-3 md:grid-cols-4">
                    <Field label="العنوان (AR)" required><input className={input} value={x.label_ar} onChange={(e) => set({ label_ar: e.target.value })} /></Field>
                    <Field label="Label (EN)"><input className={input} dir="ltr" value={x.label_en} onChange={(e) => set({ label_en: e.target.value })} /></Field>
                    <Field label="القيمة" required><input className={input} value={x.value} onChange={(e) => set({ value: e.target.value })} /></Field>
                    <Field label="الوحدة"><input className={input} value={x.unit ?? ""} onChange={(e) => set({ unit: e.target.value })} /></Field>
                  </div>
                )}
              />
            </Card>
          )}

          {section === "faqs" && (
            <Card title="الأسئلة الشائعة" action={
              <AddButton onClick={() => patch({ faqs: [...draft.faqs, { question_ar: "", answer_ar: "", question_en: "", answer_en: "" } as FaqDraft] })} />
            }>
              <Repeater
                items={draft.faqs}
                empty="لا توجد أسئلة."
                onReorder={(items) => patch({ faqs: items })}
                title={(x, i) => x.question_ar || `سؤال ${i + 1}`}
                error={(i) => errors[`faq_${i}`]}
                render={(x, i, set) => (
                  <div className="grid gap-3">
                    <Field label="السؤال (AR)" required><input className={input} value={x.question_ar} onChange={(e) => set({ question_ar: e.target.value })} /></Field>
                    <Field label="الإجابة (AR)" required><textarea rows={3} className={input} value={x.answer_ar} onChange={(e) => set({ answer_ar: e.target.value })} /></Field>
                    <Field label="Question (EN)"><input className={input} dir="ltr" value={x.question_en ?? ""} onChange={(e) => set({ question_en: e.target.value })} /></Field>
                    <Field label="Answer (EN)"><textarea rows={3} className={input} dir="ltr" value={x.answer_en ?? ""} onChange={(e) => set({ answer_en: e.target.value })} /></Field>
                  </div>
                )}
              />
            </Card>
          )}

          {section === "seo" && (
            <Card title="تحسين محركات البحث">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="عنوان SEO (AR)" hint="يُفضّل أقل من 60 حرفاً. يُستخدم الاسم تلقائياً إذا تُرك فارغاً.">
                  <input className={input} value={draft.seo_title_ar ?? ""} onChange={(e) => patch({ seo_title_ar: e.target.value })} />
                </Field>
                <Field label="SEO title (EN)">
                  <input className={input} dir="ltr" value={draft.seo_title_en ?? ""} onChange={(e) => patch({ seo_title_en: e.target.value })} />
                </Field>
                <Field label="وصف SEO (AR)" hint="يُفضّل أقل من 160 حرفاً.">
                  <textarea rows={3} className={input} value={draft.seo_description_ar ?? ""} onChange={(e) => patch({ seo_description_ar: e.target.value })} />
                </Field>
                <Field label="SEO description (EN)">
                  <textarea rows={3} className={input} dir="ltr" value={draft.seo_description_en ?? ""} onChange={(e) => patch({ seo_description_en: e.target.value })} />
                </Field>
              </div>
              {brandSlug && draft.slug ? (
                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-400" dir="ltr">
                  <ExternalLink className="inline w-3 h-3 ml-1" /> https://ruknaltawfer.com/ar/brands/{brandSlug}/{draft.slug}
                </div>
              ) : null}
            </Card>
          )}
        </div>
      </div>

      {picker && (
        <AssetPicker
          accept="image"
          onClose={() => setPicker(null)}
          onPick={(id, url) => {
            setAssetUrls((prev) => ({ ...prev, [id]: url }));
            if (picker.mode === "cover") patch({ cover_asset_id: id });
            else if (picker.mode === "gallery") patch({ gallery: [...draft.gallery, { asset_id: id, caption_ar: "", caption_en: "" } as GalleryDraft] });
            else patch({ variants: draft.variants.map((v, i) => (i === picker.index ? { ...v, cover_asset_id: id } : v)) });
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- primitives

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-slate-400">
        {label} {required && <span className="text-rose-400">*</span>}
      </div>
      {children}
      {hint && <div className="text-[11px] text-slate-600">{hint}</div>}
      {error && <div className="text-[11px] text-rose-400">{error}</div>}
    </div>
  );
}

function AddButton({ onClick, label = "إضافة" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold">
      <Plus className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function AssetBox({ url, specKey, onPick, onClear }: {
  url?: string | null; specKey: string; onPick: () => void; onClear: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg p-2">
        <div className="w-16 h-16 rounded bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
          {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-600" />}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={onPick} className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs">
            {url ? "استبدال" : "اختيار / رفع"}
          </button>
          {url && <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs">معاينة</a>}
          {url && <button type="button" onClick={onClear} className="px-3 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs">إزالة</button>}
        </div>
      </div>
      <ImageSpecHint specKey={specKey} previewUrl={url ?? null} />
    </div>
  );
}

function TagsInput({ values, onChange, dir = "rtl" }: { values: string[]; onChange: (v: string[]) => void; dir?: "rtl" | "ltr" }) {
  const [text, setText] = useState("");
  function add() {
    const v = text.trim();
    if (!v) return;
    onChange([...values, v]);
    setText("");
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-200">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="hover:text-white"><X className="w-3 h-3" /></button>
          </span>
        ))}
        {values.length === 0 && <span className="text-xs text-slate-600">لا توجد عناصر</span>}
      </div>
      <input
        className={input} dir={dir} value={text} placeholder="اكتب ثم اضغط Enter للإضافة"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        onBlur={add}
      />
    </div>
  );
}

function Repeater<T>({ items, onReorder, render, title, empty, thumb, error }: {
  items: T[];
  onReorder: (items: T[]) => void;
  render: (item: T, index: number, set: (p: Partial<T>) => void) => React.ReactNode;
  title: (item: T, index: number) => string;
  empty: string;
  thumb?: (item: T) => string | null | undefined;
  error?: (index: number) => string | undefined;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const set = (i: number) => (p: Partial<T>) => onReorder(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onReorder(next);
    setOpen(j);
  };

  if (!items.length) {
    return <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">{empty}</div>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const t = thumb?.(item);
        const err = error?.(i);
        return (
          <div key={i} className={`rounded-lg border bg-slate-950 ${err ? "border-rose-500/40" : "border-slate-800"}`}>
            <div className="flex items-center gap-2 p-2.5">
              {t !== undefined && (
                <div className="w-10 h-10 rounded bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {t ? <img src={t} alt="" className="w-full h-full object-cover" /> : <FileText className="w-4 h-4 text-slate-600" />}
                </div>
              )}
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex-1 text-right text-sm text-slate-200 truncate">
                {title(item, i)}
              </button>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded bg-slate-900 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1.5 rounded bg-slate-900 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => onReorder(items.filter((_, j) => j !== i))} className="p-1.5 rounded bg-rose-600/20 text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            {err && <div className="px-3 pb-2 text-[11px] text-rose-400">{err}</div>}
            {open === i && <div className="border-t border-slate-800 p-3">{render(item, i, set(i))}</div>}
          </div>
        );
      })}
    </div>
  );
}
