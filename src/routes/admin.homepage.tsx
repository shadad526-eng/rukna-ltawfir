import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { adminSignedUrls } from "@/lib/admin.functions";
import { AssetPicker } from "@/routes/admin.e.$entity";
import { toast } from "sonner";
import {
  Plus, Trash2, Image as ImageIcon, X, Eye, EyeOff, ChevronUp, ChevronDown,
  Save, Upload, Layers,
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
  const [tab, setTab] = useState<"main" | "hero">("main");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mainSlides, setMainSlides] = useState<Slide[]>([]);
  const [heroSlides, setHeroSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: s }, { data: mSlides }, { data: hSlides }] = await Promise.all([
      supabase.from("homepage_settings" as any).select("*").eq("id", 1).maybeSingle(),
      supabase.from("homepage_slides" as any).select("*").eq("slider_group", "main").order("sort_order"),
      supabase.from("homepage_slides" as any).select("*").eq("slider_group", "hero").order("sort_order"),
    ]);
    if (s) {
      setSettings({
        ...(s as any),
        main_slider_config: { ...DEFAULT_SLIDER_CFG, ...((s as any).main_slider_config ?? {}) },
        hero_slider_config: { ...DEFAULT_SLIDER_CFG, ...((s as any).hero_slider_config ?? {}) },
        hero_image_config: (s as any).hero_image_config ?? {},
        hero_custom_config: (s as any).hero_custom_config ?? {},
      });
    }
    setMainSlides((mSlides ?? []) as any);
    setHeroSlides((hSlides ?? []) as any);
    setDirty(false);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("homepage_settings" as any)
        .update({
          main_slider_enabled: settings.main_slider_enabled,
          main_slider_position: settings.main_slider_position,
          main_slider_config: settings.main_slider_config,
          hero_enabled: settings.hero_enabled,
          hero_type: settings.hero_type,
          hero_image_config: settings.hero_image_config,
          hero_slider_config: settings.hero_slider_config,
          hero_custom_config: settings.hero_custom_config,
        })
        .eq("id", 1);
      if (error) throw error;
      toast.success("تم حفظ الإعدادات");
      setDirty(false);
    } catch (e: any) {
      toast.error(e.message ?? "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  function updateSettings(patch: Partial<Settings>) {
    setSettings((s) => (s ? { ...s, ...patch } : s));
    setDirty(true);
  }

  if (loading || !settings) {
    return <div className="text-slate-400 text-sm">جارٍ التحميل…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدير الصفحة الرئيسية</h1>
          <p className="text-slate-400 text-sm mt-1">
            إدارة السلايدر الرئيسي وبانر الهيرو بكل تفاصيلهما.
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={!dirty || saving}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        <TabBtn active={tab === "main"} onClick={() => setTab("main")} icon={<Layers className="w-4 h-4" />} label="السلايدر الرئيسي" />
        <TabBtn active={tab === "hero"} onClick={() => setTab("hero")} icon={<ImageIcon className="w-4 h-4" />} label="بناء الهيرو" />
      </div>

      {tab === "main" ? (
        <MainSliderPanel
          settings={settings}
          slides={mainSlides}
          onSettingsChange={updateSettings}
          onSlidesChange={setMainSlides}
          reload={load}
        />
      ) : (
        <HeroPanel
          settings={settings}
          slides={heroSlides}
          onSettingsChange={updateSettings}
          onSlidesChange={setHeroSlides}
          reload={load}
        />
      )}
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
            onUpdate={(patch) => updateSlide(slide.id, patch)}
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

function TextField({ label, value, onChange, placeholder, ltr }: any) {
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
function TextArea({ label, value, onChange, ltr }: any) {
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
function NumberField({ label, value, onChange, min, step }: any) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 block mb-1">{label}</span>
      <input type="number" min={min} step={step} value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
    </label>
  );
}
function SelectField({ label, value, onChange, options }: any) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 block mb-1">{label}</span>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm">
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
function ColorField({ label, value, onChange }: any) {
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
function RangeField({ label, value, onChange, min, max, step }: any) {
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
