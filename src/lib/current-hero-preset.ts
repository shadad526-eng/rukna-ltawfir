import type { HeroCustomConfig } from "./homepage.functions";

/**
 * Preset that mirrors the visual language of the site's original hardcoded
 * hero (blue -> green gradients, brand tokens, big display headline, two
 * CTAs and a logo/main-image stage on the side).  Users can load this as
 * a starting point for the Current Hero editor without losing the option to
 * reset back to the truly original hardcoded design (which stays behind
 * hero_enabled = false).
 */
export const CURRENT_HERO_PRESET: HeroCustomConfig = {
  bg_type: "gradient",
  bg_gradient:
    "radial-gradient(120% 80% at 100% 0%, oklch(0.86 0.07 245) 0%, transparent 55%), radial-gradient(90% 70% at 0% 100%, oklch(0.96 0.025 138) 0%, transparent 55%), linear-gradient(180deg, #F6FAFE 0%, #EAF2FB 55%, #DCE8F5 100%)",
  bg_color: "#F6FAFE",
  overlay_color: "#000000",
  overlay_opacity: 0,
  text_color: "#0b2a4a",
  title_ar: "ركن التوفير كوزمتك للتجارة",
  title_en: "Rukn Al-Tawfir Cosmetic for Trade",
  description_ar:
    "الموزّع الحصري في اليمن لأبرز العلامات العالمية في الصحة والجمال والعناية بالأطفال.",
  description_en:
    "Yemen's exclusive distributor for the world's leading health, beauty and baby-care brands.",
  cta1: {
    enabled: true,
    label_ar: "تصفّح العلامات",
    label_en: "Explore Brands",
    url: "/ar/brands",
    new_tab: false,
  },
  cta1_bg: "linear-gradient(180deg, oklch(0.56 0.16 245), oklch(0.38 0.15 245))",
  cta1_text: "#ffffff",
  cta2: {
    enabled: true,
    label_ar: "تواصل واتساب",
    label_en: "WhatsApp",
    url: "https://wa.me/967777000000",
    new_tab: true,
  },
  cta2_bg: "#ffffff",
  cta2_text: "#0b2a4a",
  content_position: "middle-start",
  order: "text-first",
  padding: "lg",
  max_width: "xl",
  title_size: "xl",
  description_size: "lg",
  show_logo: true,
  show_main_image: true,
  show_title: true,
  show_description: true,
  show_cta1: true,
  show_cta2: true,
};
