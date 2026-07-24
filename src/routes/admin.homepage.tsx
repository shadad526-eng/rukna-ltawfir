import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { adminSignedUrls } from "@/lib/admin.functions";
import { AssetPicker } from "@/routes/admin.e.$entity";
import {
  saveHomepageDraft,
  publishHomepageDraft,
  restoreLastPublishedHomepage,
  discardHomepageDraft,
  getHomepagePublishStatus,
  type HomepageSettingsSnapshot,
} from "@/lib/homepage.functions";
import { CURRENT_HERO_PRESET } from "@/lib/current-hero-preset";
import { toast } from "sonner";
import {
  Plus, Trash2, Image as ImageIcon, X, Eye, EyeOff, ChevronUp, ChevronDown,
  Save, Upload, Layers, Monitor, Tablet, Smartphone, Maximize2, Minimize2,
  Rocket, Undo2, RotateCcw, Sparkles, RefreshCcw, FileEdit,
} from "lucide-react";

export const Route = createFileRoute("/admin/homepage")({
  ssr: false,
  head: () => ({ meta: [{ title: "مدير الصفحة الرئيسية — ركن التوفير" }, { name: "robots", content: "noindex" }] }),
  component: HomepageManagerPage,
});

/* ============================== TYPES ============================== */
type CTA = { enabled?: boolean; label_ar?: string; label_en?: string; url?: string; new_tab?: boolean };
type SliderCfg = {
  autoplay?: boolean; interval_ms?: number; transition_ms?: number;
  transition?: "fade" | "slide"; loop?: boolean;
  show_arrows?: boolean; show_dots?: boolean;
  pause_on_hover?: boolean; pause_on_interaction?: boolean;
};
type ImageCfg = {
  desktop_asset_id?: string | null; mobile_asset_id?: string | null;
  fallback_bg?: string; overlay_color?: string; overlay_opacity?: number;
  title_ar?: string; title_en?: string; description_ar?: string; description_en?: string;
  alt_ar?: string; alt_en?: string; cta1?: CTA; cta2?: CTA;
  align?: "start" | "center" | "end";
  show_title?: boolean; show_description?: boolean; show_cta1?: boolean; show_cta2?: boolean;
};
type CustomCfg = {
  bg_type?: "color" | "gradient" | "image"; bg_color?: string; bg_gradient?: string;
  bg_image_asset_id?: string | null; main_image_asset_id?: string | null; logo_asset_id?: string | null;
  title_ar?: string; title_en?: string; description_ar?: string; description_en?: string;
  cta1?: CTA; cta2?: CTA;
  text_color?: string; cta1_bg?: string; cta1_text?: string; cta2_bg?: string; cta2_text?: string;
  overlay_color?: string; overlay_opacity?: number;
  content_position?: string; order?: "image-first" | "text-first";
  padding?: "sm" | "md" | "lg"; max_width?: "sm" | "md" | "lg" | "xl" | "full";
  title_size?: "sm" | "md" | "lg" | "xl"; description_size?: "sm" | "md" | "lg";
  show_logo?: boolean; show_main_image?: boolean; show_title?: boolean;
  show_description?: boolean; show_cta1?: boolean; show_cta2?: boolean;
};
type Settings = {
  id: number;
  main_slider_enabled: boolean;
  main_slider_position: "before_hero" | "after_hero";
  main_slider_config: SliderCfg;
  hero_enabled: boolean;
  hero_type: "image" | "slider" | "custom";
  hero_image_config: ImageCfg;
  hero_slider_config: SliderCfg;
  hero_custom_config: CustomCfg;
};
type Slide = {
  id: string; slider_group: "main" | "hero"; sort_order: number;
  is_published: boolean; is_visible: boolean;
  desktop_asset_id: string | null; mobile_asset_id: string | null;
  title_ar: string | null; title_en: string | null;
  description_ar: string | null; description_en: string | null;
  alt_ar: string | null; alt_en: string | null;
  cta1: CTA; cta2: CTA;
};

const DEFAULT_SLIDER_CFG: SliderCfg = {
  autoplay: true, interval_ms: 5000, transition_ms: 500, transition: "slide",
  loop: true, show_arrows: true, show_dots: true, pause_on_hover: true, pause_on_interaction: true,
};

/* ============================== ROOT PAGE ============================== */
function HomepageManagerPage() {
  const [tab, setTab] = useState<"main" | "hero">("hero");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mainSlides, setMainSlides] = useState<Slide[]>([]);
  const [heroSlides, setHeroSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"" | "draft" | "publish" | "restore" | "discard">("");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ has_draft: boolean; has_published_snapshot: boolean; last_published_at: string | null } | null>(null);

  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewLang, setPreviewLang] = useState<"ar" | "en">("ar");
  const [fullscreen, setFullscreen] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(() => Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const saveDraftFn = useServerFn(saveHomepageDraft);
  const publishFn = useServerFn(publishHomepageDraft);
  const restoreFn = useServerFn(restoreLastPublishedHomepage);
  const discardFn = useServerFn(discardHomepageDraft);
  const statusFn = useServerFn(getHomepagePublishStatus);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: s }, { data: mSlides }, { data: hSlides }] = await Promise.all([
      supabase.from("homepage_settings" as any).select("*").eq("id", 1).maybeSingle(),
      supabase.from("homepage_slides" as any).select("*").eq("slider_group", "main").order("sort_order"),
      supabase.from("homepage_slides" as any).select("*").eq("slider_group", "hero").order("sort_order"),
    ]);
    if (s) {
      const row: any = s;
      const draft = (row.draft_settings ?? {}) as any;
      // Editor works against draft-overlay on live columns. Save writes back to draft only.
      setSettings({
        id: row.id,
        main_slider_enabled: draft.main_slider_enabled ?? row.main_slider_enabled,
        main_slider_position: draft.main_slider_position ?? row.main_slider_position,
        main_slider_config: { ...DEFAULT_SLIDER_CFG, ...(row.main_slider_config ?? {}), ...(draft.main_slider_config ?? {}) },
        hero_enabled: draft.hero_enabled ?? row.hero_enabled,
        hero_type: draft.hero_type ?? row.hero_type,
        hero_image_config: draft.hero_image_config ?? row.hero_image_config ?? {},
        hero_slider_config: { ...DEFAULT_SLIDER_CFG, ...(row.hero_slider_config ?? {}), ...(draft.hero_slider_config ?? {}) },
        hero_custom_config: draft.hero_custom_config ?? row.hero_custom_config ?? {},
      });
    }
    setMainSlides((mSlides ?? []) as any);
    setHeroSlides((hSlides ?? []) as any);
    setDirty(false);
    setLoading(false);
    try { setStatus(await statusFn()); } catch { /* ignore */ }
  }, [statusFn]);

  useEffect(() => { load(); }, [load]);

  function snapshotFromSettings(s: Settings): HomepageSettingsSnapshot {
    return {
      main_slider_enabled: s.main_slider_enabled,
      main_slider_position: s.main_slider_position,
      main_slider_config: s.main_slider_config,
      hero_enabled: s.hero_enabled,
      hero_type: s.hero_type,
      hero_image_config: s.hero_image_config,
      hero_slider_config: s.hero_slider_config,
      hero_custom_config: s.hero_custom_config as any,
    } as HomepageSettingsSnapshot;
  }

  async function saveDraft(showToast = true) {
    if (!settings) return;
    setBusy("draft");
    try {
      await saveDraftFn({ data: { snapshot: snapshotFromSettings(settings) } });
      setDirty(false);
      setStatus((s) => (s ? { ...s, has_draft: true } : s));
      if (showToast) toast.success("تم حفظ المسودة");
      refreshPreview();
    } catch (e: any) { toast.error(e.message ?? "فشل حفظ المسودة"); }
    finally { setBusy(""); }
  }

  async function publish() {
    if (!settings) return;
    if (dirty) await saveDraft(false);
    if (!confirm("نشر التغييرات على الصفحة الرئيسية العامة؟")) return;
    setBusy("publish");
    try {
      await publishFn();
      toast.success("تم النشر بنجاح");
      await load();
      refreshPreview();
    } catch (e: any) { toast.error(e.message ?? "فشل النشر"); }
    finally { setBusy(""); }
  }

  async function restoreLastPublished() {
    if (!confirm("استعادة آخر نسخة منشورة كمسودة حالية؟ سيتم استبدال المسودة الحالية.")) return;
    setBusy("restore");
    try {
      await restoreFn();
      toast.success("تمت الاستعادة");
      await load();
      refreshPreview();
    } catch (e: any) { toast.error(e.message ?? "فشل الاستعادة"); }
    finally { setBusy(""); }
  }

  async function discardDraft() {
    if (!confirm("تجاهل التغييرات غير المنشورة والعودة للنسخة الحية؟")) return;
    setBusy("discard");
    try {
      await discardFn();
      toast.success("تم تجاهل المسودة");
      await load();
      refreshPreview();
    } catch (e: any) { toast.error(e.message ?? "فشل التجاهل"); }
    finally { setBusy(""); }
  }

  function applyCurrentHeroPreset() {
    if (!settings) return;
    if (!confirm("تحميل قالب الهيرو الحالي كنقطة بداية للتحرير؟")) return;
    setSettings({
      ...settings,
      hero_enabled: true,
      hero_type: "custom",
      hero_custom_config: { ...CURRENT_HERO_PRESET },
    });
    setDirty(true);
    toast.info("تم تحميل القالب. اضغط حفظ مسودة للحفظ.");
  }

  function resetToOriginalHero() {
    if (!settings) return;
    if (!confirm("العودة للهيرو الأصلي المبني في الكود؟ (يعطّل الهيرو المُدار)")) return;
    setSettings({ ...settings, hero_enabled: false });
    setDirty(true);
  }

  function updateSettings(patch: Partial<Settings>) {
    setSettings((s) => (s ? { ...s, ...patch } : s));
    setDirty(true);
  }

  function refreshPreview() {
    setPreviewNonce(Date.now());
    try { iframeRef.current?.contentWindow?.postMessage({ type: "hp-preview-refresh" }, window.location.origin); } catch {}
  }

  const deviceWidth = device === "desktop" ? "100%" : device === "tablet" ? "820px" : "390px";
  const previewSrc = useMemo(
    () => `/${previewLang}?hp_preview=1&t=${previewNonce}`,
    [previewLang, previewNonce],
  );

  if (loading || !settings) return <div className="text-slate-400 text-sm">جارٍ التحميل…</div>;

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-slate-950 p-4 overflow-auto" : "space-y-6"}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-slate-950/95 backdrop-blur border-b border-slate-800 flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-lg font-bold">مدير الصفحة الرئيسية</h1>
          <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-2 items-center">
            {status?.has_draft && <span className="text-amber-300">● مسودة غير منشورة</span>}
            {dirty && <span className="text-rose-300">● تغييرات غير محفوظة</span>}
            {status?.last_published_at && (
              <span>آخر نشر: {new Date(status.last_published_at).toLocaleString("ar")}</span>
            )}
          </div>
        </div>
        <button onClick={() => saveDraft()} disabled={busy !== "" || !dirty}
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-1.5">
          <FileEdit className="w-4 h-4" /> {busy === "draft" ? "جارٍ…" : "حفظ مسودة"}
        </button>
        <button onClick={publish} disabled={busy !== ""}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-1.5">
          <Rocket className="w-4 h-4" /> {busy === "publish" ? "جارٍ النشر…" : "نشر"}
        </button>
        <button onClick={discardDraft} disabled={busy !== "" || !status?.has_draft}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5" title="تجاهل المسودة">
          <Undo2 className="w-4 h-4" /> تجاهل
        </button>
        <button onClick={restoreLastPublished} disabled={busy !== "" || !status?.has_published_snapshot}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5" title="استعادة آخر نسخة منشورة">
          <RotateCcw className="w-4 h-4" /> استعادة
        </button>
      </div>

      <div className={fullscreen ? "grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_1fr] gap-4 mt-4" : "grid grid-cols-1 xl:grid-cols-[minmax(0,520px)_1fr] gap-6"}>
        {/* Editor column */}
        <div className="space-y-6 min-w-0">
          <div className="flex gap-2 border-b border-slate-800">
            <TabBtn active={tab === "hero"} onClick={() => setTab("hero")} icon={<ImageIcon className="w-4 h-4" />} label="بناء الهيرو" />
            <TabBtn active={tab === "main"} onClick={() => setTab("main")} icon={<Layers className="w-4 h-4" />} label="السلايدر الرئيسي" />
          </div>

          {tab === "hero" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-2">
              <button onClick={applyCurrentHeroPreset}
                className="bg-trust-700 hover:bg-trust-600 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> تحميل قالب الهيرو الحالي
              </button>
              <button onClick={resetToOriginalHero}
                className="bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> إعادة تعيين للهيرو الأصلي
              </button>
              <span className="text-xs text-slate-400 self-center">
                القالب نقطة بداية قابلة للتعديل بالكامل. الإعادة تعطّل الهيرو المُدار وتُعيد التصميم الأصلي المبني في الكود.
              </span>
            </div>
          )}

          {tab === "main" ? (
            <MainSliderPanel settings={settings} slides={mainSlides} onSettingsChange={updateSettings} onSlidesChange={setMainSlides} reload={load} />
          ) : (
            <HeroPanel settings={settings} slides={heroSlides} onSettingsChange={updateSettings} onSlidesChange={setHeroSlides} reload={load} />
          )}
        </div>

        {/* Live Preview column */}
        <div className="min-w-0">
          <div className="sticky top-20">
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 p-2 border-b border-slate-800 bg-slate-950/60">
                <span className="text-xs text-slate-400 mr-1">معاينة مباشرة</span>
                <div className="flex bg-slate-800 rounded-md overflow-hidden">
                  {(["desktop", "tablet", "mobile"] as const).map((d) => (
                    <button key={d} onClick={() => setDevice(d)}
                      className={`px-2 py-1.5 text-xs flex items-center gap-1 ${device === d ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>
                      {d === "desktop" ? <Monitor className="w-3.5 h-3.5" /> : d === "tablet" ? <Tablet className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
                <div className="flex bg-slate-800 rounded-md overflow-hidden">
                  {(["ar", "en"] as const).map((l) => (
                    <button key={l} onClick={() => setPreviewLang(l)}
                      className={`px-2 py-1.5 text-xs ${previewLang === l ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button onClick={refreshPreview} className="px-2 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-md flex items-center gap-1">
                  <RefreshCcw className="w-3.5 h-3.5" /> تحديث
                </button>
                <button onClick={() => setFullscreen((v) => !v)} className="px-2 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-md flex items-center gap-1 ms-auto">
                  {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="bg-slate-950 p-3 flex justify-center">
                <div style={{ width: deviceWidth, maxWidth: "100%" }} className="transition-all">
                  <iframe
                    ref={iframeRef}
                    key={previewSrc}
                    src={previewSrc}
                    title="معاينة"
                    className="w-full bg-white rounded-lg border border-slate-800"
                    style={{ height: fullscreen ? "80vh" : "70vh" }}
                  />
                </div>
              </div>
              {!status?.has_draft && !dirty && (
                <div className="p-3 text-xs text-slate-400 border-t border-slate-800 bg-slate-950/60">
                  المعاينة تعرض المسودة الحالية. لا توجد مسودة → المعاينة تطابق النسخة المنشورة.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px transition ${
        active ? "border-emerald-500 text-emerald-300" : "border-transparent text-slate-400 hover:text-slate-200"
      }`}
    >
      {icon} {label}
    </button>
  );
}

/* ============================== MAIN SLIDER ============================== */
function MainSliderPanel({ settings, slides, onSettingsChange, onSlidesChange, reload }: {
  settings: Settings; slides: Slide[];
  onSettingsChange: (p: Partial<Settings>) => void;
  onSlidesChange: (s: Slide[]) => void;
  reload: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card title="التفعيل والموقع">
        <div className="grid md:grid-cols-3 gap-4">
          <Toggle
            label="تفعيل السلايدر الرئيسي"
            checked={settings.main_slider_enabled}
            onChange={(v) => onSettingsChange({ main_slider_enabled: v })}
          />
          <SelectField
            label="موقع العرض"
            value={settings.main_slider_position}
            onChange={(v) => onSettingsChange({ main_slider_position: v as any })}
            options={[
              { value: "before_hero", label: "قبل الهيرو" },
              { value: "after_hero", label: "بعد الهيرو" },
            ]}
          />
        </div>
      </Card>

      <SliderConfigCard
        title="إعدادات العرض"
        config={settings.main_slider_config}
        onChange={(cfg) => onSettingsChange({ main_slider_config: cfg })}
      />

      <SlidesEditor
        title="الشرائح"
        group="main"
        slides={slides}
        onChange={onSlidesChange}
        reload={reload}
      />
    </div>
  );
}

/* ============================== HERO PANEL ============================== */
function HeroPanel({ settings, slides, onSettingsChange, onSlidesChange, reload }: any) {
  const s: Settings = settings;
  return (
    <div className="space-y-6">
      <Card title="التفعيل ونوع الهيرو">
        <div className="grid md:grid-cols-3 gap-4">
          <Toggle
            label="تفعيل الهيرو المدار"
            checked={s.hero_enabled}
            onChange={(v: boolean) => onSettingsChange({ hero_enabled: v })}
          />
          <SelectField
            label="نوع الهيرو"
            value={s.hero_type}
            onChange={(v: string) => onSettingsChange({ hero_type: v as any })}
            options={[
              { value: "image", label: "صورة (Image Hero)" },
              { value: "slider", label: "سلايدر (Slider Hero)" },
              { value: "custom", label: "مخصص (Custom Hero)" },
            ]}
          />
        </div>
        {!s.hero_enabled && (
          <p className="mt-3 text-xs text-amber-300/80">
            عندما يكون التفعيل مغلقًا سيعرض الموقع الهيرو الافتراضي الحالي.
          </p>
        )}
      </Card>

      {s.hero_type === "image" && (
        <HeroImageEditor
          value={s.hero_image_config}
          onChange={(v: ImageCfg) => onSettingsChange({ hero_image_config: v })}
        />
      )}

      {s.hero_type === "slider" && (
        <>
          <SliderConfigCard
            title="إعدادات سلايدر الهيرو"
            config={s.hero_slider_config}
            onChange={(cfg: SliderCfg) => onSettingsChange({ hero_slider_config: cfg })}
          />
          <SlidesEditor
            title="شرائح الهيرو"
            group="hero"
            slides={slides}
            onChange={onSlidesChange}
            reload={reload}
          />
        </>
      )}

      {s.hero_type === "custom" && (
        <HeroCustomEditor
          value={s.hero_custom_config}
          onChange={(v: CustomCfg) => onSettingsChange({ hero_custom_config: v })}
        />
      )}
    </div>
  );
}

/* ============================== HERO IMAGE EDITOR ============================== */
function HeroImageEditor({ value, onChange }: { value: ImageCfg; onChange: (v: ImageCfg) => void }) {
  const v = value ?? {};
  const set = (patch: Partial<ImageCfg>) => onChange({ ...v, ...patch });
  return (
    <div className="space-y-6">
      <Card title="الصور">
        <div className="grid md:grid-cols-2 gap-4">
          <AssetField label="صورة سطح المكتب" value={v.desktop_asset_id ?? null} onChange={(id) => set({ desktop_asset_id: id })} accept="image" />
          <AssetField label="صورة الجوال (اختياري)" value={v.mobile_asset_id ?? null} onChange={(id) => set({ mobile_asset_id: id })} accept="image" />
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <ColorField label="خلفية احتياطية" value={v.fallback_bg ?? "#0f172a"} onChange={(c) => set({ fallback_bg: c })} />
          <ColorField label="لون الطبقة" value={v.overlay_color ?? "#000000"} onChange={(c) => set({ overlay_color: c })} />
          <RangeField label={`شفافية الطبقة (${(v.overlay_opacity ?? 0.35).toFixed(2)})`} value={v.overlay_opacity ?? 0.35} min={0} max={1} step={0.05} onChange={(n) => set({ overlay_opacity: n })} />
        </div>
      </Card>

      <Card title="النصوص">
        <div className="grid md:grid-cols-2 gap-4">
          <TextField label="العنوان بالعربية" value={v.title_ar ?? ""} onChange={(s) => set({ title_ar: s })} />
          <TextField label="Title (English)" value={v.title_en ?? ""} onChange={(s) => set({ title_en: s })} ltr />
          <TextArea label="الوصف بالعربية" value={v.description_ar ?? ""} onChange={(s) => set({ description_ar: s })} />
          <TextArea label="Description (English)" value={v.description_en ?? ""} onChange={(s) => set({ description_en: s })} ltr />
          <TextField label="نص بديل للصورة (عربي)" value={v.alt_ar ?? ""} onChange={(s) => set({ alt_ar: s })} />
          <TextField label="Image alt (English)" value={v.alt_en ?? ""} onChange={(s) => set({ alt_en: s })} ltr />
        </div>
        <div className="grid md:grid-cols-4 gap-3 mt-4">
          <Toggle label="عرض العنوان" checked={v.show_title !== false} onChange={(x) => set({ show_title: x })} />
          <Toggle label="عرض الوصف" checked={v.show_description !== false} onChange={(x) => set({ show_description: x })} />
          <Toggle label="عرض الزر 1" checked={v.show_cta1 !== false} onChange={(x) => set({ show_cta1: x })} />
          <Toggle label="عرض الزر 2" checked={v.show_cta2 !== false} onChange={(x) => set({ show_cta2: x })} />
        </div>
        <div className="mt-4">
          <SelectField
            label="محاذاة المحتوى"
            value={v.align ?? "start"}
            onChange={(x) => set({ align: x as any })}
            options={[
              { value: "start", label: "بداية" },
              { value: "center", label: "منتصف" },
              { value: "end", label: "نهاية" },
            ]}
          />
        </div>
      </Card>

      <CTACard label="الزر الأساسي" value={v.cta1} onChange={(c) => set({ cta1: c })} />
      <CTACard label="الزر الثانوي" value={v.cta2} onChange={(c) => set({ cta2: c })} />
    </div>
  );
}

/* ============================== HERO CUSTOM EDITOR ============================== */
function HeroCustomEditor({ value, onChange }: { value: CustomCfg; onChange: (v: CustomCfg) => void }) {
  const v = value ?? {};
  const set = (patch: Partial<CustomCfg>) => onChange({ ...v, ...patch });
  return (
    <div className="space-y-6">
      <Card title="الخلفية">
        <div className="grid md:grid-cols-3 gap-4">
          <SelectField
            label="نوع الخلفية"
            value={v.bg_type ?? "color"}
            onChange={(x) => set({ bg_type: x as any })}
            options={[
              { value: "color", label: "لون" },
              { value: "gradient", label: "تدرّج (CSS)" },
              { value: "image", label: "صورة" },
            ]}
          />
          {v.bg_type !== "gradient" && v.bg_type !== "image" && (
            <ColorField label="لون الخلفية" value={v.bg_color ?? "#0f172a"} onChange={(c) => set({ bg_color: c })} />
          )}
          {v.bg_type === "gradient" && (
            <TextField label="تدرّج CSS" placeholder="linear-gradient(...)" value={v.bg_gradient ?? ""} onChange={(s) => set({ bg_gradient: s })} ltr />
          )}
          {v.bg_type === "image" && (
            <AssetField label="صورة الخلفية" value={v.bg_image_asset_id ?? null} onChange={(id) => set({ bg_image_asset_id: id })} accept="image" />
          )}
        </div>
        {v.bg_type === "image" && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <ColorField label="لون الطبقة" value={v.overlay_color ?? "#000000"} onChange={(c) => set({ overlay_color: c })} />
            <RangeField label={`شفافية الطبقة (${(v.overlay_opacity ?? 0.35).toFixed(2)})`} value={v.overlay_opacity ?? 0.35} min={0} max={1} step={0.05} onChange={(n) => set({ overlay_opacity: n })} />
          </div>
        )}
      </Card>

      <Card title="الوسائط">
        <div className="grid md:grid-cols-2 gap-4">
          <AssetField label="الشعار (اختياري)" value={v.logo_asset_id ?? null} onChange={(id) => set({ logo_asset_id: id })} accept="image" />
          <AssetField label="الصورة الرئيسية" value={v.main_image_asset_id ?? null} onChange={(id) => set({ main_image_asset_id: id })} accept="image" />
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <Toggle label="عرض الشعار" checked={v.show_logo !== false} onChange={(x) => set({ show_logo: x })} />
          <Toggle label="عرض الصورة الرئيسية" checked={v.show_main_image !== false} onChange={(x) => set({ show_main_image: x })} />
        </div>
      </Card>

      <Card title="النصوص">
        <div className="grid md:grid-cols-2 gap-4">
          <TextField label="العنوان بالعربية" value={v.title_ar ?? ""} onChange={(s) => set({ title_ar: s })} />
          <TextField label="Title (English)" value={v.title_en ?? ""} onChange={(s) => set({ title_en: s })} ltr />
          <TextArea label="الوصف بالعربية" value={v.description_ar ?? ""} onChange={(s) => set({ description_ar: s })} />
          <TextArea label="Description (English)" value={v.description_en ?? ""} onChange={(s) => set({ description_en: s })} ltr />
        </div>
        <div className="grid md:grid-cols-4 gap-3 mt-4">
          <Toggle label="عرض العنوان" checked={v.show_title !== false} onChange={(x) => set({ show_title: x })} />
          <Toggle label="عرض الوصف" checked={v.show_description !== false} onChange={(x) => set({ show_description: x })} />
          <Toggle label="عرض الزر 1" checked={v.show_cta1 !== false} onChange={(x) => set({ show_cta1: x })} />
          <Toggle label="عرض الزر 2" checked={v.show_cta2 !== false} onChange={(x) => set({ show_cta2: x })} />
        </div>
      </Card>

      <Card title="التخطيط">
        <div className="grid md:grid-cols-3 gap-4">
          <SelectField
            label="موقع المحتوى"
            value={v.content_position ?? "middle-start"}
            onChange={(x) => set({ content_position: x })}
            options={[
              "top-start","top-center","top-end",
              "middle-start","middle-center","middle-end",
              "bottom-start","bottom-center","bottom-end",
            ].map((p) => ({ value: p, label: p }))}
          />
          <SelectField
            label="ترتيب النص/الصورة"
            value={v.order ?? "text-first"}
            onChange={(x) => set({ order: x as any })}
            options={[
              { value: "text-first", label: "النص أولاً" },
              { value: "image-first", label: "الصورة أولاً" },
            ]}
          />
          <SelectField
            label="العرض الأقصى"
            value={v.max_width ?? "lg"}
            onChange={(x) => set({ max_width: x as any })}
            options={["sm","md","lg","xl","full"].map((s) => ({ value: s, label: s.toUpperCase() }))}
          />
          <SelectField
            label="حجم العنوان"
            value={v.title_size ?? "lg"}
            onChange={(x) => set({ title_size: x as any })}
            options={["sm","md","lg","xl"].map((s) => ({ value: s, label: s.toUpperCase() }))}
          />
          <SelectField
            label="حجم الوصف"
            value={v.description_size ?? "md"}
            onChange={(x) => set({ description_size: x as any })}
            options={["sm","md","lg"].map((s) => ({ value: s, label: s.toUpperCase() }))}
          />
          <SelectField
            label="الحشوة العمودية"
            value={v.padding ?? "md"}
            onChange={(x) => set({ padding: x as any })}
            options={["sm","md","lg"].map((s) => ({ value: s, label: s.toUpperCase() }))}
          />
        </div>
      </Card>

      <Card title="الألوان">
        <div className="grid md:grid-cols-5 gap-4">
          <ColorField label="لون النص" value={v.text_color ?? "#ffffff"} onChange={(c) => set({ text_color: c })} />
          <ColorField label="خلفية زر 1" value={v.cta1_bg ?? ""} onChange={(c) => set({ cta1_bg: c })} />
          <ColorField label="لون زر 1" value={v.cta1_text ?? "#ffffff"} onChange={(c) => set({ cta1_text: c })} />
          <ColorField label="خلفية زر 2" value={v.cta2_bg ?? "#ffffff"} onChange={(c) => set({ cta2_bg: c })} />
          <ColorField label="لون زر 2" value={v.cta2_text ?? "#000000"} onChange={(c) => set({ cta2_text: c })} />
        </div>
      </Card>

      <CTACard label="الزر الأساسي" value={v.cta1} onChange={(c) => set({ cta1: c })} />
      <CTACard label="الزر الثانوي" value={v.cta2} onChange={(c) => set({ cta2: c })} />
    </div>
  );
}

/* ============================== SLIDES EDITOR ============================== */
function SlidesEditor({ title, group, slides, onChange, reload }: {
  title: string; group: "main" | "hero"; slides: Slide[];
  onChange: (s: Slide[]) => void; reload: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  async function addSlide() {
    setBusy(true);
    try {
      const nextOrder = slides.length ? Math.max(...slides.map((s) => s.sort_order)) + 1 : 0;
      const { data, error } = await supabase
        .from("homepage_slides" as any)
        .insert({
          slider_group: group,
          sort_order: nextOrder,
          is_published: false,
          is_visible: true,
          cta1: {},
          cta2: {},
        })
        .select("*")
        .single();
      if (error) throw error;
      onChange([...slides, data as any]);
      setEditing((data as any).id);
      toast.success("تمت إضافة شريحة جديدة");
    } catch (e: any) {
      toast.error(e.message ?? "فشل الإنشاء");
    } finally {
      setBusy(false);
    }
  }

  async function removeSlide(id: string) {
    if (!confirm("حذف الشريحة نهائيًا؟")) return;
    const { error } = await supabase.from("homepage_slides" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    onChange(slides.filter((s) => s.id !== id));
    toast.success("تم الحذف");
  }

  async function updateSlide(id: string, patch: Partial<Slide>) {
    const { error } = await supabase.from("homepage_slides" as any).update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    onChange(slides.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = slides.findIndex((s) => s.id === id);
    const other = slides[idx + dir];
    if (!other) return;
    const a = slides[idx];
    await Promise.all([
      supabase.from("homepage_slides" as any).update({ sort_order: other.sort_order }).eq("id", a.id),
      supabase.from("homepage_slides" as any).update({ sort_order: a.sort_order }).eq("id", other.id),
    ]);
    reload();
  }

  return (
    <Card title={title}>
      <div className="flex justify-between mb-4">
        <div className="text-sm text-slate-400">{slides.length} شريحة</div>
        <button
          onClick={addSlide}
          disabled={busy}
          className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> إضافة شريحة
        </button>
      </div>
      {slides.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-8 border border-dashed border-slate-800 rounded-lg">
          لا توجد شرائح بعد. اضغط "إضافة شريحة" للبدء.
        </div>
      )}
      <div className="space-y-2">
        {slides.map((slide, i) => (
          <SlideRow
            key={slide.id}
            slide={slide}
            first={i === 0}
            last={i === slides.length - 1}
            expanded={editing === slide.id}
            onToggle={() => setEditing(editing === slide.id ? null : slide.id)}
            onMoveUp={() => move(slide.id, -1)}
            onMoveDown={() => move(slide.id, 1)}
            onRemove={() => removeSlide(slide.id)}
            onUpdate={(patch: Partial<Slide>) => updateSlide(slide.id, patch)}
          />
        ))}
      </div>
    </Card>
  );
}

function SlideRow({ slide, first, last, expanded, onToggle, onMoveUp, onMoveDown, onRemove, onUpdate }: any) {
  const s: Slide = slide;
  const [thumb, setThumb] = useState<string | null>(null);
  const sign = useServerFn(adminSignedUrls);

  useEffect(() => {
    (async () => {
      if (!s.desktop_asset_id) { setThumb(null); return; }
      const { data } = await supabase.from("assets").select("storage_bucket,storage_path").eq("id", s.desktop_asset_id).maybeSingle();
      if (!data) return;
      const signed = await sign({ data: { items: [{ bucket: data.storage_bucket, path: data.storage_path }] } });
      setThumb(signed[`${data.storage_bucket}::${data.storage_path}`] ?? null);
    })();
  }, [s.desktop_asset_id, sign]);

  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
      <div className="flex items-center gap-3 p-3">
        <div className="w-16 h-10 bg-slate-950 rounded overflow-hidden shrink-0 flex items-center justify-center">
          {thumb ? <img src={thumb} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-slate-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{s.title_ar || s.title_en || "بلا عنوان"}</div>
          <div className="text-xs text-slate-500">ترتيب: {s.sort_order}</div>
        </div>
        <button
          onClick={() => onUpdate({ is_published: !s.is_published })}
          title={s.is_published ? "منشور" : "مسودة"}
          className={`text-xs px-2 py-1 rounded-md ${s.is_published ? "bg-emerald-600/20 text-emerald-300" : "bg-slate-800 text-slate-400"}`}
        >
          {s.is_published ? "منشور" : "مسودة"}
        </button>
        <button onClick={() => onUpdate({ is_visible: !s.is_visible })} title="ظاهر" className="text-slate-400 hover:text-slate-200">
          {s.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button onClick={onMoveUp} disabled={first} className="text-slate-400 hover:text-slate-200 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
        <button onClick={onMoveDown} disabled={last} className="text-slate-400 hover:text-slate-200 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
        <button onClick={onToggle} className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700">
          {expanded ? "إغلاق" : "تحرير"}
        </button>
        <button onClick={onRemove} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-4 h-4" /></button>
      </div>
      {expanded && (
        <div className="border-t border-slate-800 p-4 space-y-4 bg-slate-950/40">
          <div className="grid md:grid-cols-2 gap-4">
            <AssetField label="صورة سطح المكتب" value={s.desktop_asset_id} onChange={(id) => onUpdate({ desktop_asset_id: id })} accept="image" />
            <AssetField label="صورة الجوال (اختياري)" value={s.mobile_asset_id} onChange={(id) => onUpdate({ mobile_asset_id: id })} accept="image" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="العنوان بالعربية" value={s.title_ar ?? ""} onChange={(x) => onUpdate({ title_ar: x })} />
            <TextField label="Title (English)" value={s.title_en ?? ""} onChange={(x) => onUpdate({ title_en: x })} ltr />
            <TextArea label="الوصف بالعربية" value={s.description_ar ?? ""} onChange={(x) => onUpdate({ description_ar: x })} />
            <TextArea label="Description (English)" value={s.description_en ?? ""} onChange={(x) => onUpdate({ description_en: x })} ltr />
            <TextField label="نص بديل (عربي)" value={s.alt_ar ?? ""} onChange={(x) => onUpdate({ alt_ar: x })} />
            <TextField label="Alt (English)" value={s.alt_en ?? ""} onChange={(x) => onUpdate({ alt_en: x })} ltr />
          </div>
          <CTACard label="الزر الأساسي" value={s.cta1} onChange={(c) => onUpdate({ cta1: c })} />
          <CTACard label="الزر الثانوي" value={s.cta2} onChange={(c) => onUpdate({ cta2: c })} />
        </div>
      )}
    </div>
  );
}

/* ============================== SLIDER CONFIG CARD ============================== */
function SliderConfigCard({ title, config, onChange }: { title: string; config: SliderCfg; onChange: (c: SliderCfg) => void }) {
  const c = config ?? {};
  const set = (patch: Partial<SliderCfg>) => onChange({ ...c, ...patch });
  return (
    <Card title={title}>
      <div className="grid md:grid-cols-4 gap-4">
        <Toggle label="تشغيل تلقائي" checked={c.autoplay !== false} onChange={(v) => set({ autoplay: v })} />
        <NumberField label="الفاصل (مللي ثانية)" value={c.interval_ms ?? 5000} onChange={(v) => set({ interval_ms: v })} min={1500} step={500} />
        <NumberField label="مدة الانتقال" value={c.transition_ms ?? 500} onChange={(v) => set({ transition_ms: v })} min={150} step={50} />
        <SelectField
          label="نمط الانتقال"
          value={c.transition ?? "slide"}
          onChange={(v) => set({ transition: v as any })}
          options={[{ value: "slide", label: "انزلاق" }, { value: "fade", label: "تلاشي" }]}
        />
        <Toggle label="تكرار (Loop)" checked={c.loop !== false} onChange={(v) => set({ loop: v })} />
        <Toggle label="أسهم" checked={c.show_arrows !== false} onChange={(v) => set({ show_arrows: v })} />
        <Toggle label="نقاط" checked={c.show_dots !== false} onChange={(v) => set({ show_dots: v })} />
        <Toggle label="إيقاف عند التمرير" checked={c.pause_on_hover !== false} onChange={(v) => set({ pause_on_hover: v })} />
        <Toggle label="إيقاف بعد تفاعل" checked={c.pause_on_interaction !== false} onChange={(v) => set({ pause_on_interaction: v })} />
      </div>
    </Card>
  );
}

/* ============================== SHARED FIELDS ============================== */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-bold text-slate-200 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-200">
      <span className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-emerald-500" : "bg-slate-700"}`}>
        <span className={`absolute top-0.5 ${checked ? "right-0.5" : "right-5"} w-5 h-5 bg-white rounded-full transition-all`} />
      </span>
      <input type="checkbox" hidden checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, ltr }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; ltr?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 block mb-1">{label}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={ltr ? "ltr" : "rtl"}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
      />
    </label>
  );
}
function TextArea({ label, value, onChange, ltr }: { label: string; value: string; onChange: (v: string) => void; ltr?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 block mb-1">{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        dir={ltr ? "ltr" : "rtl"}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm resize-y"
      />
    </label>
  );
}
function NumberField({ label, value, onChange, min, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; step?: number }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 block mb-1">{label}</span>
      <input type="number" min={min} step={step} value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
    </label>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 block mb-1">{label}</span>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 block mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-9 bg-slate-950 border border-slate-800 rounded cursor-pointer" />
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          placeholder="#hex or CSS"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" dir="ltr" />
      </div>
    </label>
  );
}
function RangeField({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 block mb-1">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}

function AssetField({ label, value, onChange, accept }: { label: string; value: string | null; onChange: (id: string | null) => void; accept: "image" | "pdf" }) {
  const [picker, setPicker] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const sign = useServerFn(adminSignedUrls);
  useEffect(() => {
    (async () => {
      if (!value) { setPreview(null); return; }
      const { data } = await supabase.from("assets").select("storage_bucket,storage_path").eq("id", value).maybeSingle();
      if (!data) { setPreview(null); return; }
      const signed = await sign({ data: { items: [{ bucket: data.storage_bucket, path: data.storage_path }] } });
      setPreview(signed[`${data.storage_bucket}::${data.storage_path}`] ?? null);
    })();
  }, [value, sign]);
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="border border-slate-800 rounded-lg bg-slate-950 p-3 flex items-center gap-3">
        <div className="w-20 h-14 bg-slate-900 rounded overflow-hidden flex items-center justify-center shrink-0">
          {preview
            ? <img src={preview} className="w-full h-full object-cover" />
            : <ImageIcon className="w-5 h-5 text-slate-600" />}
        </div>
        <div className="flex-1 flex gap-2">
          <button type="button" onClick={() => setPicker(true)}
            className="bg-slate-800 hover:bg-slate-700 rounded-md px-3 py-1.5 text-xs flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> {value ? "استبدال" : "اختيار / رفع"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)}
              className="bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 rounded-md px-3 py-1.5 text-xs flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> إزالة
            </button>
          )}
        </div>
      </div>
      {picker && (
        <AssetPicker
          accept={accept}
          onClose={() => setPicker(false)}
          onPick={(id) => { onChange(id); setPicker(false); }}
        />
      )}
    </div>
  );
}

function CTACard({ label, value, onChange }: { label: string; value?: CTA; onChange: (c: CTA) => void }) {
  const v = value ?? {};
  const set = (patch: Partial<CTA>) => onChange({ ...v, ...patch });
  return (
    <Card title={label}>
      <div className="grid md:grid-cols-4 gap-4">
        <Toggle label="مفعّل" checked={v.enabled !== false} onChange={(x) => set({ enabled: x })} />
        <TextField label="النص بالعربية" value={v.label_ar ?? ""} onChange={(s) => set({ label_ar: s })} />
        <TextField label="Label (English)" value={v.label_en ?? ""} onChange={(s) => set({ label_en: s })} ltr />
        <TextField label="الرابط (URL)" value={v.url ?? ""} onChange={(s) => set({ url: s })} placeholder="/ar/brands أو https://..." ltr />
        <Toggle label="فتح في تبويب جديد" checked={!!v.new_tab} onChange={(x) => set({ new_tab: x })} />
      </div>
    </Card>
  );
}
