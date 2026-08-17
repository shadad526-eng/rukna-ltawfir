import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assetUrl, getPublicDataClient } from "./site-public-data.server";

export type HomepageCTA = {
  enabled?: boolean;
  label_ar?: string;
  label_en?: string;
  url?: string;
  external?: boolean;
  new_tab?: boolean;
};

export type SliderConfig = {
  autoplay?: boolean;
  interval_ms?: number;
  transition_ms?: number;
  transition?: "fade" | "slide";
  loop?: boolean;
  show_arrows?: boolean;
  show_dots?: boolean;
  pause_on_hover?: boolean;
  pause_on_interaction?: boolean;
  /** Section heading rendered OUTSIDE and directly above the slider. */
  section_title_enabled?: boolean;
  section_title_ar?: string;
  section_title_en?: string;
};


export type HeroImageConfig = {
  desktop_asset_id?: string | null;
  mobile_asset_id?: string | null;
  fallback_bg?: string;
  overlay_color?: string;
  overlay_opacity?: number;
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  alt_ar?: string;
  alt_en?: string;
  cta1?: HomepageCTA;
  cta2?: HomepageCTA;
  align?: "start" | "center" | "end";
  show_title?: boolean;
  show_description?: boolean;
  show_cta1?: boolean;
  show_cta2?: boolean;
};

export type HeroCustomConfig = {
  bg_type?: "color" | "gradient" | "image";
  bg_color?: string;
  bg_gradient?: string;
  bg_image_asset_id?: string | null;
  main_image_asset_id?: string | null;
  logo_asset_id?: string | null;
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  cta1?: HomepageCTA;
  cta2?: HomepageCTA;
  text_color?: string;
  cta1_bg?: string;
  cta1_text?: string;
  cta2_bg?: string;
  cta2_text?: string;
  overlay_color?: string;
  overlay_opacity?: number;
  content_position?:
    | "top-start" | "top-center" | "top-end"
    | "middle-start" | "middle-center" | "middle-end"
    | "bottom-start" | "bottom-center" | "bottom-end";
  order?: "image-first" | "text-first";
  padding?: "sm" | "md" | "lg";
  max_width?: "sm" | "md" | "lg" | "xl" | "full";
  title_size?: "sm" | "md" | "lg" | "xl";
  description_size?: "sm" | "md" | "lg";
  show_logo?: boolean;
  show_main_image?: boolean;
  show_title?: boolean;
  show_description?: boolean;
  show_cta1?: boolean;
  show_cta2?: boolean;
};

export type PublicSlide = {
  id: string;
  desktop_url: string | null;
  mobile_url: string | null;
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  alt_ar: string | null;
  alt_en: string | null;
  cta1: HomepageCTA;
  cta2: HomepageCTA;
};

export type PublicHeroImage = HeroImageConfig & {
  desktop_url: string | null;
  mobile_url: string | null;
};

export type PublicHeroCustom = HeroCustomConfig & {
  bg_image_url: string | null;
  main_image_url: string | null;
  logo_url: string | null;
};

export type HomepageConfig = {
  main_slider: {
    enabled: boolean;
    position: "before_hero" | "after_hero";
    config: SliderConfig;
    slides: PublicSlide[];
  };
  hero: {
    enabled: boolean;
    type: "image" | "slider" | "custom";
    image: PublicHeroImage;
    slider: { config: SliderConfig; slides: PublicSlide[] };
    custom: PublicHeroCustom;
  };
};

function normalizeSlideRow(r: any): any | null {
  if (!r || typeof r !== "object" || !r.id) return null;
  return r;
}

async function mapSlides(rows: any[]): Promise<PublicSlide[]> {
  const safe = rows.map(normalizeSlideRow).filter(Boolean) as any[];
  return await Promise.all(
    safe.map(async (r) => ({
      id: String(r.id),
      desktop_url: await assetUrl(r.desktop_asset_id ?? null).catch(() => null),
      mobile_url: await assetUrl(r.mobile_asset_id ?? null).catch(() => null),
      title_ar: r.title_ar ?? null,
      title_en: r.title_en ?? null,
      description_ar: r.description_ar ?? null,
      description_en: r.description_en ?? null,
      alt_ar: r.alt_ar ?? null,
      alt_en: r.alt_en ?? null,
      cta1: (r.cta1 ?? {}) as HomepageCTA,
      cta2: (r.cta2 ?? {}) as HomepageCTA,
    })),
  );
}

/** Live (draft) slides straight from the working table — admin preview only. */
async function draftSlidesFor(
  group: "main" | "hero",
  client?: any,
): Promise<PublicSlide[]> {
  const db = client ?? (getPublicDataClient() as any);
  const { data } = await db
    .from("homepage_slides")
    .select("*")
    .eq("slider_group", group)
    .eq("is_published", true)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  return mapSlides((data ?? []) as any[]);
}

/** Published slides come from the immutable snapshot stored at publish time. */
async function publishedSlidesFor(row: any, group: "main" | "hero"): Promise<PublicSlide[]> {
  const snap = row?.published_slides;
  if (snap && typeof snap === "object") {
    const arr = Array.isArray((snap as any)[group]) ? (snap as any)[group] : [];
    return mapSlides(arr);
  }
  // Never published yet (legacy state): fall back to the live table so existing
  // production content keeps rendering exactly as before.
  return draftSlidesFor(group);
}


const DEFAULT_SLIDER: SliderConfig = {
  autoplay: true,
  interval_ms: 5000,
  transition_ms: 500,
  transition: "slide",
  loop: true,
  show_arrows: true,
  show_dots: true,
  pause_on_hover: true,
  pause_on_interaction: true,
};

export type HomepageSettingsSnapshot = {
  main_slider_enabled?: boolean;
  main_slider_position?: "before_hero" | "after_hero";
  main_slider_config?: SliderConfig;
  hero_enabled?: boolean;
  hero_type?: "image" | "slider" | "custom";
  hero_image_config?: HeroImageConfig;
  hero_slider_config?: SliderConfig;
  hero_custom_config?: HeroCustomConfig;
};

function pickSettings(row: any, snapshot?: any): any {
  const src = snapshot && typeof snapshot === "object" ? { ...row, ...snapshot } : row;
  return src ?? {};
}

async function buildHomepageConfig(
  row: any,
  slides: { main: PublicSlide[]; hero: PublicSlide[] },
): Promise<HomepageConfig> {
  const imageCfg = (row.hero_image_config ?? {}) as HeroImageConfig;
  const customCfg = (row.hero_custom_config ?? {}) as HeroCustomConfig;

  const [imgDesktop, imgMobile, bgImg, mainImg, logoImg] = await Promise.all([
    assetUrl(imageCfg.desktop_asset_id ?? null).catch(() => null),
    assetUrl(imageCfg.mobile_asset_id ?? null).catch(() => null),
    assetUrl(customCfg.bg_image_asset_id ?? null).catch(() => null),
    assetUrl(customCfg.main_image_asset_id ?? null).catch(() => null),
    assetUrl(customCfg.logo_asset_id ?? null).catch(() => null),
  ]);

  return {
    main_slider: {
      enabled: !!row.main_slider_enabled,
      position: (row.main_slider_position === "after_hero"
        ? "after_hero"
        : "before_hero") as "before_hero" | "after_hero",
      config: { ...DEFAULT_SLIDER, ...(row.main_slider_config ?? {}) },
      slides: slides.main,
    },
    hero: {
      enabled: !!row.hero_enabled,
      type: (["image", "slider", "custom"].includes(row.hero_type)
        ? row.hero_type
        : "image") as "image" | "slider" | "custom",
      image: { ...imageCfg, desktop_url: imgDesktop, mobile_url: imgMobile },
      slider: {
        config: { ...DEFAULT_SLIDER, ...(row.hero_slider_config ?? {}) },
        slides: slides.hero,
      },
      custom: {
        ...customCfg,
        bg_image_url: bgImg,
        main_image_url: mainImg,
        logo_url: logoImg,
      },
    },
  };
}

const EMPTY_CONFIG_ROW = {};

export const getHomepageConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageConfig> => {
    try {
      const client = getPublicDataClient() as any;
      const { data } = await client
        .from("homepage_settings")
        .select(
          "id, main_slider_enabled, main_slider_position, main_slider_config, hero_enabled, hero_type, hero_image_config, hero_slider_config, hero_custom_config, published_slides",
        )
        .eq("id", 1)
        .maybeSingle();
      const row = data ?? EMPTY_CONFIG_ROW;
      const [main, hero] = await Promise.all([
        publishedSlidesFor(row, "main").catch(() => [] as PublicSlide[]),
        publishedSlidesFor(row, "hero").catch(() => [] as PublicSlide[]),
      ]);
      return buildHomepageConfig(row, { main, hero });
    } catch {
      // Public homepage must never fail because of homepage-config state.
      return buildHomepageConfig(EMPTY_CONFIG_ROW, { main: [], hero: [] });
    }
  },
);

async function assertSuperAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const getHomepageDraftConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HomepageConfig> => {
    const { supabase, userId } = context as any;
    await assertSuperAdmin(supabase, userId);
    const { data } = await supabase
      .from("homepage_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    const row = pickSettings(data ?? {}, (data as any)?.draft_settings);
    const [main, hero] = await Promise.all([
      draftSlidesFor("main", supabase).catch(() => [] as PublicSlide[]),
      draftSlidesFor("hero", supabase).catch(() => [] as PublicSlide[]),
    ]);
    return buildHomepageConfig(row, { main, hero });
  });


export type HomepagePublishStatus = {
  has_draft: boolean;
  has_published_snapshot: boolean;
  last_published_at: string | null;
};

export const getHomepagePublishStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HomepagePublishStatus> => {
    const { supabase, userId } = context as any;
    await assertSuperAdmin(supabase, userId);
    const { data } = await supabase
      .from("homepage_settings")
      .select("draft_settings, published_snapshot, last_published_at")
      .eq("id", 1)
      .maybeSingle();
    const row = (data ?? {}) as any;
    return {
      has_draft: !!row.draft_settings,
      has_published_snapshot: !!row.published_snapshot,
      last_published_at: row.last_published_at ?? null,
    };
  });

export const saveHomepageDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { snapshot: HomepageSettingsSnapshot }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertSuperAdmin(supabase, userId);
    const { error } = await supabase
      .from("homepage_settings")
      .update({ draft_settings: data.snapshot })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const publishHomepageDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertSuperAdmin(supabase, userId);
    const { data: cur, error: readErr } = await supabase
      .from("homepage_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    const row = (cur ?? {}) as any;
    const draft = (row.draft_settings ?? {}) as any;
    const merged = {
      main_slider_enabled:
        draft.main_slider_enabled ?? row.main_slider_enabled ?? false,
      main_slider_position:
        draft.main_slider_position ?? row.main_slider_position ?? "before_hero",
      main_slider_config: draft.main_slider_config ?? row.main_slider_config ?? {},
      hero_enabled: draft.hero_enabled ?? row.hero_enabled ?? false,
      hero_type: draft.hero_type ?? row.hero_type ?? "image",
      hero_image_config: draft.hero_image_config ?? row.hero_image_config ?? {},
      hero_slider_config:
        draft.hero_slider_config ?? row.hero_slider_config ?? {},
      hero_custom_config:
        draft.hero_custom_config ?? row.hero_custom_config ?? {},
    };
    // Fail closed on incoherent draft state.
    if (!["before_hero", "after_hero"].includes(merged.main_slider_position))
      throw new Error("موضع السلايدر غير صالح");
    if (!["image", "slider", "custom"].includes(merged.hero_type))
      throw new Error("نوع الهيرو غير صالح");

    // Freeze the slide state belonging to this draft so config + slides go
    // live together in one atomic row update.
    const { data: slideRows, error: slidesErr } = await supabase
      .from("homepage_slides")
      .select("*")
      .eq("is_published", true)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });
    if (slidesErr) throw new Error(slidesErr.message);
    const rows = (slideRows ?? []) as any[];
    const publishedSlides = {
      main: rows.filter((r) => r.slider_group === "main"),
      hero: rows.filter((r) => r.slider_group === "hero"),
    };

    const snapshot: HomepageSettingsSnapshot = { ...merged } as any;
    const publishedAt = new Date().toISOString();
    const { error } = await supabase
      .from("homepage_settings")
      .update({
        ...merged,
        draft_settings: null,
        published_snapshot: snapshot,
        published_slides: publishedSlides,
        last_published_at: publishedAt,
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("audit_log").insert({
        actor_user_id: userId,
        action: "homepage.publish",
        entity_type: "homepage_settings",
        before: {
          settings: {
            main_slider_enabled: row.main_slider_enabled,
            main_slider_position: row.main_slider_position,
            hero_enabled: row.hero_enabled,
            hero_type: row.hero_type,
          },
          slides_count: {
            main: Array.isArray(row.published_slides?.main) ? row.published_slides.main.length : null,
            hero: Array.isArray(row.published_slides?.hero) ? row.published_slides.hero.length : null,
          },
        },
        after: {
          settings: {
            main_slider_enabled: merged.main_slider_enabled,
            main_slider_position: merged.main_slider_position,
            hero_enabled: merged.hero_enabled,
            hero_type: merged.hero_type,
          },
          slides_count: {
            main: publishedSlides.main.length,
            hero: publishedSlides.hero.length,
          },
        },
      } as any);
    } catch { /* audit must never break publishing */ }

    return { ok: true, published_at: publishedAt };
  });


export const restoreLastPublishedHomepage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertSuperAdmin(supabase, userId);
    const { data } = await supabase
      .from("homepage_settings")
      .select("published_snapshot")
      .eq("id", 1)
      .maybeSingle();
    const snap = (data as any)?.published_snapshot;
    if (!snap) throw new Error("لا يوجد نسخة منشورة سابقة");
    const { error } = await supabase
      .from("homepage_settings")
      .update({ draft_settings: snap })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const discardHomepageDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertSuperAdmin(supabase, userId);
    const { error } = await supabase
      .from("homepage_settings")
      .update({ draft_settings: null })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


/* ===================== Managed homepage sections ===================== */

export const listHomepageSections = createServerFn({ method: "GET" }).handler(
  async (): Promise<import("./homepage-sections").HomepageSectionsMap> => {
    const { buildSectionsMap } = await import("./homepage-sections");
    try {
      const client = getPublicDataClient() as any;
      const { data } = await client
        .from("homepage_sections")
        .select(
          "section_key, title_ar, title_en, subtitle_ar, subtitle_en, body_ar, body_en, cta_label_ar, cta_url, sort_order, is_enabled, extra",
        );
      return buildSectionsMap((data ?? []) as any[]);
    } catch {
      // Homepage must never fail because of section state.
      return buildSectionsMap([]);
    }
  },
);
