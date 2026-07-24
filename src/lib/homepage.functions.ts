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

async function slidesFor(group: "main" | "hero"): Promise<PublicSlide[]> {
  const client = getPublicDataClient() as any;
  const { data } = await client
    .from("homepage_slides")
    .select("*")
    .eq("slider_group", group)
    .eq("is_published", true)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  const rows = (data ?? []) as any[];
  return await Promise.all(
    rows.map(async (r) => ({
      id: r.id,
      desktop_url: await assetUrl(r.desktop_asset_id),
      mobile_url: await assetUrl(r.mobile_asset_id),
      title_ar: r.title_ar,
      title_en: r.title_en,
      description_ar: r.description_ar,
      description_en: r.description_en,
      alt_ar: r.alt_ar,
      alt_en: r.alt_en,
      cta1: (r.cta1 ?? {}) as HomepageCTA,
      cta2: (r.cta2 ?? {}) as HomepageCTA,
    })),
  );
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

export const getHomepageConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageConfig> => {
    const client = getPublicDataClient() as any;
    const { data: s } = await client
      .from("homepage_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    const row = (s ?? {}) as any;

    const imageCfg = (row.hero_image_config ?? {}) as HeroImageConfig;
    const customCfg = (row.hero_custom_config ?? {}) as HeroCustomConfig;

    const [mainSlides, heroSlides] = await Promise.all([
      slidesFor("main"),
      slidesFor("hero"),
    ]);

    const [imgDesktop, imgMobile, bgImg, mainImg, logoImg] = await Promise.all([
      assetUrl(imageCfg.desktop_asset_id ?? null),
      assetUrl(imageCfg.mobile_asset_id ?? null),
      assetUrl(customCfg.bg_image_asset_id ?? null),
      assetUrl(customCfg.main_image_asset_id ?? null),
      assetUrl(customCfg.logo_asset_id ?? null),
    ]);

    return {
      main_slider: {
        enabled: !!row.main_slider_enabled,
        position: (row.main_slider_position ?? "before_hero") as
          | "before_hero"
          | "after_hero",
        config: { ...DEFAULT_SLIDER, ...(row.main_slider_config ?? {}) },
        slides: mainSlides,
      },
      hero: {
        enabled: !!row.hero_enabled,
        type: (row.hero_type ?? "image") as "image" | "slider" | "custom",
        image: {
          ...imageCfg,
          desktop_url: imgDesktop,
          mobile_url: imgMobile,
        },
        slider: {
          config: { ...DEFAULT_SLIDER, ...(row.hero_slider_config ?? {}) },
          slides: heroSlides,
        },
        custom: {
          ...customCfg,
          bg_image_url: bgImg,
          main_image_url: mainImg,
          logo_url: logoImg,
        },
      },
    };
  },
);
