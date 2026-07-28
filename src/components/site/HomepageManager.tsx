import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import type {
  HomepageConfig,
  PublicSlide,
  SliderConfig,
  HomepageCTA,
} from "@/lib/homepage.functions";

function ctaHref(cta?: HomepageCTA) {
  return cta?.url && cta.url.trim() ? cta.url.trim() : null;
}

function CTAButton({
  cta,
  variant,
  bg,
  color,
}: {
  cta?: HomepageCTA;
  variant: "primary" | "secondary";
  bg?: string;
  color?: string;
}) {
  const { lang } = useLocale();
  if (!cta || cta.enabled === false) return null;
  const href = ctaHref(cta);
  const label = (lang === "ar" ? cta.label_ar : cta.label_en) || "";
  if (!href || !label) return null;
  const style =
    variant === "primary"
      ? {
          background:
            bg || "linear-gradient(180deg, oklch(0.56 0.16 245), oklch(0.38 0.15 245))",
          color: color || "#fff",
          boxShadow:
            "0 22px 44px -16px oklch(0.32 0.13 245 / 0.65), inset 0 1px 0 oklch(1 0 0 / 0.30)",
        }
      : {
          background: bg || "rgba(255,255,255,0.92)",
          color: color || "oklch(0.32 0.13 245)",
          border: "1px solid oklch(0.32 0.13 245 / 0.20)",
        };
  const external = !!cta.external || /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      target={cta.new_tab || external ? "_blank" : undefined}
      rel={cta.new_tab || external ? "noopener noreferrer" : undefined}
      className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-bold transition hover:-translate-y-0.5 md:text-[15px]"
      style={style}
    >
      {label}
    </a>
  );
}

/* ============================== SLIDER ============================== */

function useSlideshow(count: number, cfg: SliderConfig, paused: boolean) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!cfg.autoplay || paused || count <= 1) return;
    const interval = Math.max(1500, cfg.interval_ms ?? 5000);
    const id = window.setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next >= count) return cfg.loop === false ? i : 0;
        return next;
      });
    }, interval);
    return () => window.clearInterval(id);
  }, [count, cfg.autoplay, cfg.interval_ms, cfg.loop, paused]);
  return [index, setIndex] as const;
}

export function HomepageSlider({
  slides,
  config,
  variant = "banner",
}: {
  slides: PublicSlide[];
  config: SliderConfig;
  variant?: "banner" | "hero";
}) {
  const { lang, dir } = useLocale();
  const isAr = lang === "ar";
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [index, setIndex] = useSlideshow(slides.length, config, paused);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!slides.length) return null;

  const goTo = (i: number) => {
    if (config.pause_on_interaction) setPaused(true);
    setIndex(((i % slides.length) + slides.length) % slides.length);
  };
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const isFade = config.transition === "fade";
  const transMs = Math.max(150, config.transition_ms ?? 500);
  const aspectClass =
    variant === "hero"
      ? "aspect-[16/9] md:aspect-[21/9] min-h-[380px] md:min-h-[520px]"
      : "aspect-[16/6] md:aspect-[21/6] min-h-[220px] md:min-h-[300px]";

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-900 ${aspectClass}`}
      dir={dir}
      onMouseEnter={() => config.pause_on_hover && setPaused(true)}
      onMouseLeave={() => config.pause_on_hover && setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
        if (config.pause_on_hover) setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (config.pause_on_hover) setPaused(false);
        if (start == null) return;
        const delta = e.changedTouches[0].clientX - start;
        if (Math.abs(delta) < 40) return;
        if (isAr) (delta < 0 ? prev() : next());
        else (delta < 0 ? next() : prev());
      }}
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((s, i) => {
          const active = i === index;
          const src = (isMobile && s.mobile_url) || s.desktop_url || s.mobile_url;
          const alt = (isAr ? s.alt_ar : s.alt_en) || (isAr ? s.title_ar : s.title_en) || "";
          const title = (isAr ? s.title_ar : s.title_en) || "";
          const desc = (isAr ? s.description_ar : s.description_en) || "";
          const base = "absolute inset-0 transition-opacity";
          const style: React.CSSProperties = isFade
            ? {
                opacity: active ? 1 : 0,
                transitionDuration: `${transMs}ms`,
                pointerEvents: active ? "auto" : "none",
              }
            : {
                transform: `translateX(${(i - index) * 100 * (isAr ? -1 : 1)}%)`,
                transition: `transform ${transMs}ms ease-out`,
                opacity: 1,
              };
          return (
            <div key={s.id} className={base} style={style} aria-hidden={!active}>
              {src ? (
                <img
                  src={src}
                  alt={alt}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-trust-700 to-trust-900" />
              )}
              {(title || desc || ctaHref(s.cta1) || ctaHref(s.cta2)) && (
                <div className="absolute inset-0 bg-black/30" />
              )}
              {(title || desc || ctaHref(s.cta1) || ctaHref(s.cta2)) && (
                <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4 md:px-8">
                  <div className="max-w-xl text-white">
                    {title && (
                      <h2 className="text-2xl font-black leading-tight drop-shadow-md md:text-4xl">
                        {title}
                      </h2>
                    )}
                    {desc && (
                      <p className="mt-3 text-sm leading-relaxed text-white/90 md:text-base">
                        {desc}
                      </p>
                    )}
                    {(ctaHref(s.cta1) || ctaHref(s.cta2)) && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <CTAButton cta={s.cta1} variant="primary" />
                        <CTAButton cta={s.cta2} variant="secondary" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {config.show_arrows && slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute top-1/2 z-20 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white"
            style={{ [isAr ? "right" : "left"]: 12 } as React.CSSProperties}
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute top-1/2 z-20 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white"
            style={{ [isAr ? "left" : "right"]: 12 } as React.CSSProperties}
          >
            ›
          </button>
        </>
      )}

      {config.show_dots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== HERO IMAGE ============================== */

export function HeroImageBlock({ hero }: { hero: HomepageConfig["hero"]["image"] }) {
  const { lang, dir } = useLocale();
  const isAr = lang === "ar";
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const src = (isMobile && hero.mobile_url) || hero.desktop_url || hero.mobile_url;
  const title = (isAr ? hero.title_ar : hero.title_en) || "";
  const desc = (isAr ? hero.description_ar : hero.description_en) || "";
  const alt = (isAr ? hero.alt_ar : hero.alt_en) || title;
  const align = hero.align ?? "start";
  const alignCls =
    align === "center"
      ? "items-center text-center mx-auto"
      : align === "end"
      ? isAr
        ? "items-start text-start"
        : "ml-auto items-end text-end"
      : "items-start text-start";
  const overlay = hero.overlay_color || "#000000";
  const overlayOp = hero.overlay_opacity ?? 0.35;

  return (
    <section
      className="relative w-full overflow-hidden min-h-[460px] md:min-h-[560px]"
      dir={dir}
      style={{ background: hero.fallback_bg || "#0f172a" }}
    >
      {src && (
        <img
          src={src}
          alt={alt || ""}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: overlay, opacity: overlayOp }}
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[460px] max-w-6xl items-center px-4 py-16 md:min-h-[560px] md:px-8 md:py-24">
        <div className={`flex max-w-2xl flex-col gap-5 text-white ${alignCls}`}>
          {hero.show_title !== false && title && (
            <h1 className="text-3xl font-black leading-tight drop-shadow md:text-5xl">
              {title}
            </h1>
          )}
          {hero.show_description !== false && desc && (
            <p className="text-base leading-relaxed text-white/90 md:text-lg">{desc}</p>
          )}
          {((hero.show_cta1 !== false && ctaHref(hero.cta1)) ||
            (hero.show_cta2 !== false && ctaHref(hero.cta2))) && (
            <div className="mt-2 flex flex-wrap gap-3">
              {hero.show_cta1 !== false && <CTAButton cta={hero.cta1} variant="primary" />}
              {hero.show_cta2 !== false && <CTAButton cta={hero.cta2} variant="secondary" />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================== HERO CUSTOM ============================== */

export function HeroCustomBlock({ hero }: { hero: HomepageConfig["hero"]["custom"] }) {
  const { lang, dir } = useLocale();
  const isAr = lang === "ar";

  const bg =
    hero.bg_type === "image" && hero.bg_image_url
      ? undefined
      : hero.bg_type === "gradient" && hero.bg_gradient
      ? hero.bg_gradient
      : hero.bg_color || "#0f172a";

  const titleSize =
    { sm: "text-2xl md:text-3xl", md: "text-3xl md:text-4xl", lg: "text-4xl md:text-5xl", xl: "text-5xl md:text-6xl" }[
      hero.title_size ?? "lg"
    ];
  const descSize =
    { sm: "text-sm md:text-base", md: "text-base md:text-lg", lg: "text-lg md:text-xl" }[
      hero.description_size ?? "md"
    ];
  const maxW =
    { sm: "max-w-3xl", md: "max-w-5xl", lg: "max-w-6xl", xl: "max-w-7xl", full: "max-w-full" }[
      hero.max_width ?? "lg"
    ];
  const pad = { sm: "py-10 md:py-14", md: "py-16 md:py-24", lg: "py-24 md:py-32" }[hero.padding ?? "md"];

  const [vAlign, hAlign] = (hero.content_position ?? "middle-start").split("-");
  const vCls = vAlign === "top" ? "items-start" : vAlign === "bottom" ? "items-end" : "items-center";
  const hCls =
    hAlign === "center" ? "text-center mx-auto" : hAlign === "end" ? (isAr ? "text-start" : "text-end ml-auto") : "text-start";

  const title = (isAr ? hero.title_ar : hero.title_en) || "";
  const desc = (isAr ? hero.description_ar : hero.description_en) || "";
  const orderText = hero.order !== "image-first";

  return (
    <section
      className="relative w-full overflow-hidden"
      dir={dir}
      style={{ background: bg }}
    >
      {hero.bg_type === "image" && hero.bg_image_url && (
        <>
          <img
            src={hero.bg_image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background: hero.overlay_color || "#000",
              opacity: hero.overlay_opacity ?? 0.35,
            }}
            aria-hidden
          />
        </>
      )}
      <div className={`relative mx-auto grid gap-10 px-4 md:px-8 ${maxW} ${pad}`}>
        <div className={`flex flex-col gap-6 md:grid md:grid-cols-2 md:items-center ${vCls}`}>
          <div className={`flex flex-col gap-5 ${hCls} ${orderText ? "md:order-1" : "md:order-2"}`}
               style={{ color: hero.text_color || "#ffffff" }}>
            {hero.show_logo !== false && hero.logo_url && (
              <img src={hero.logo_url} alt="" className="h-14 w-auto object-contain md:h-16" />
            )}
            {hero.show_title !== false && title && (
              <h1 className={`font-black leading-tight ${titleSize}`}>{title}</h1>
            )}
            {hero.show_description !== false && desc && (
              <p className={`leading-relaxed opacity-90 ${descSize}`}>{desc}</p>
            )}
            {((hero.show_cta1 !== false && ctaHref(hero.cta1)) ||
              (hero.show_cta2 !== false && ctaHref(hero.cta2))) && (
              <div className="mt-2 flex flex-wrap gap-3">
                {hero.show_cta1 !== false && (
                  <CTAButton cta={hero.cta1} variant="primary" bg={hero.cta1_bg} color={hero.cta1_text} />
                )}
                {hero.show_cta2 !== false && (
                  <CTAButton cta={hero.cta2} variant="secondary" bg={hero.cta2_bg} color={hero.cta2_text} />
                )}
              </div>
            )}
          </div>
          {hero.show_main_image !== false && hero.main_image_url && (
            <div className={orderText ? "md:order-2" : "md:order-1"}>
              <img
                src={hero.main_image_url}
                alt=""
                className="mx-auto max-h-[520px] w-full object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================== ROOT RENDERER ============================== */

export function HomepageManagerHero({ config }: { config: HomepageConfig["hero"] }) {
  if (!config.enabled) return null;
  if (config.type === "slider") {
    if (!config.slider.slides.length) return null;
    return <HomepageSlider slides={config.slider.slides} config={config.slider.config} variant="hero" />;
  }
  if (config.type === "custom") return <HeroCustomBlock hero={config.custom} />;
  return <HeroImageBlock hero={config.image} />;
}

export function HomepageMainSlider({
  config,
}: {
  config: HomepageConfig["main_slider"];
}) {
  if (!config.enabled || !config.slides.length) return null;
  return <HomepageSlider slides={config.slides} config={config.config} variant="banner" />;
}
