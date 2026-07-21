import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

function resolveLangFromMatches(matches: ReadonlyArray<{ params?: Record<string, unknown> }>): Locale {
  for (const m of matches) {
    const l = (m.params as Record<string, unknown> | undefined)?.lang;
    if (typeof l === "string" && (LOCALES as readonly string[]).includes(l)) return l as Locale;
  }
  return DEFAULT_LOCALE;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found / الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ركن التوفير كوزمتك للتجارة" },
      {
        name: "description",
        content:
          "الشريك الاستراتيجي والبوابة الأولى للعلامات التجارية الصحية في اليمن.",
      },
      { property: "og:title", content: "ركن التوفير كوزمتك للتجارة" },
      {
        property: "og:description",
        content: "نبني حياة أكثر صحة... ونصنع مستقبلًا أقوى.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "ركن التوفير كوزمتك للتجارة" },
      { name: "twitter:description", content: "الشريك الاستراتيجي والبوابة الأولى للعلامات التجارية الصحية في اليمن." },
      { property: "og:site_name", content: "ركن التوفير كوزمتك للتجارة" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Ns6wyimbyrbMqmjH3Dg7bkm1Ue13/social-images/social-1780873368377-1000203342.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Ns6wyimbyrbMqmjH3Dg7bkm1Ue13/social-images/social-1780873368377-1000203342.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "Avt5o3moa4Azt8E8dTnTkifeQj0JGpCMiulsx8OhMnE" },
    ],
    scripts: [
      {
        // Global broken-image safety net: hides <img> whose src fails to load
        // (missing storage object, expired signed URL, network error) so the
        // container's placeholder/background renders instead of the browser's
        // broken-image glyph. Runs before hydration via capture-phase listener.
        children:
          "(function(){function h(e){var t=e.target;if(!t||t.tagName!=='IMG')return;if(t.dataset.imgFallback==='1')return;t.dataset.imgFallback='1';t.style.visibility='hidden';t.style.opacity='0';}document.addEventListener('error',h,true);})();",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://ruknaltawfer.com/#organization",
              name: "ركن التوفير كوزمتك للتجارة",
              alternateName: [
                "Rukn Al-Tawfir Cosmetic for Trade",
                "ركن التوفير",
                "ركن التوفير كوزمتك",
                "Rukn Al-Tawfir",
                "Rukn Altawfir",
              ],
              url: "https://ruknaltawfer.com",
              logo: {
                "@type": "ImageObject",
                url: "https://ruknaltawfer.com/rukn-logo.webp",
              },
              sameAs: [
                "https://www.instagram.com/rkn.altwfyr/",
                "https://www.facebook.com/share/198SE8GVYT/",
                "https://www.tiktok.com/@ruknaltawfersochi",
              ],
              description:
                "الوكيل الحصري لمنظومة من العلامات التجارية الصحية والاستهلاكية العالمية في الجمهورية اليمنية: iSiS, SEKEM, Steviola, NO CAL, Monivo, Baby Tawfir, Bambo, Y-Kelin.",

              areaServed: { "@type": "Country", name: "Yemen" },
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+967-774040383",
                  contactType: "sales",
                  areaServed: "YE",
                  availableLanguage: ["Arabic", "English"],
                },
              ],
              brand: [
                { "@type": "Brand", "@id": "https://ruknaltawfer.com/ar/brands/nocal#brand", name: "NO CAL", alternateName: "نو كال", url: "https://ruknaltawfer.com/ar/brands/nocal" },
                { "@type": "Brand", "@id": "https://ruknaltawfer.com/ar/brands/steviola#brand", name: "Steviola", alternateName: "ستيفيولا", url: "https://ruknaltawfer.com/ar/brands/steviola" },
                { "@type": "Brand", "@id": "https://ruknaltawfer.com/ar/brands/monivo#brand", name: "Monivo", alternateName: "مونيفو", url: "https://ruknaltawfer.com/ar/brands/monivo" },
                { "@type": "Brand", "@id": "https://ruknaltawfer.com/ar/brands/y-kelin#brand", name: "Y-Kelin", alternateName: "واي كيلين", url: "https://ruknaltawfer.com/ar/brands/y-kelin" },
                { "@type": "Brand", "@id": "https://ruknaltawfer.com/ar/brands/baby-tawfir#brand", name: "Baby Tawfir", alternateName: "بيبي توفير", url: "https://ruknaltawfer.com/ar/brands/baby-tawfir" },
                { "@type": "Brand", "@id": "https://ruknaltawfer.com/ar/brands/bambo#brand", name: "Bambo", alternateName: "بامبو", url: "https://ruknaltawfer.com/ar/brands/bambo" },
                { "@type": "Brand", "@id": "https://ruknaltawfer.com/ar/brands/sekem#brand", name: "SEKEM", alternateName: "سيكم", url: "https://ruknaltawfer.com/ar/brands/sekem" },
                { "@type": "Brand", "@id": "https://ruknaltawfer.com/ar/brands/isis#brand", name: "iSiS", alternateName: "ايزيس", url: "https://ruknaltawfer.com/ar/brands/isis" },
              ],
              knowsAbout: [
                "بدائل السكر",
                "أفضل بديل سكر في اليمن",
                "المحليات الصحية",
                "المحليات الطبيعية",
                "ستيفيا",
                "منتجات مرضى السكري",
                "منتجات الأطفال",
                "حفاضات إيكولوجية",
                "العناية بالفم والأسنان",
                "العناية بأطقم الأسنان",
                "صحة الأسنان",
                "فيتامين C",
                "دعم المناعة",
                "الحياة الصحية",
                "التغذية الصحية",
                "Sugar alternatives",
                "Natural sweeteners",
                "Stevia",
                "Diabetic-friendly products",
                "Baby care",
                "Eco diapers",
                "Oral and dental care",
                "Vitamin C",
                "Immunity support",
                "Healthy lifestyle",
              ],
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://ruknaltawfer.com/#localbusiness",
              name: "ركن التوفير كوزمتك للتجارة",
              image: "https://ruknaltawfer.com/rukn-logo.webp",
              url: "https://ruknaltawfer.com",
              priceRange: "$$",
              address: { "@type": "PostalAddress", addressCountry: "YE" },
              areaServed: { "@type": "Country", name: "Yemen" },
              parentOrganization: { "@id": "https://ruknaltawfer.com/#organization" },
            },
            {
              "@type": "WebSite",
              "@id": "https://ruknaltawfer.com/#website",
              url: "https://ruknaltawfer.com",
              name: "ركن التوفير كوزمتك للتجارة",
              alternateName: ["ركن التوفير", "ركن التوفير كوزمتك", "Rukn Al-Tawfir"],
              inLanguage: ["ar", "en"],
              publisher: { "@id": "https://ruknaltawfer.com/#organization" },

            },
          ],
        }),
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico?v=20260704", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/icon-16.png?v=20260704" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icon-32.png?v=20260704" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/icon-48.png?v=20260704" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png?v=20260704" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png?v=20260704" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icon-180.png?v=20260704" },
      { rel: "manifest", type: "application/manifest+json", href: "/site.webmanifest?v=20260704" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600&family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "alternate", hrefLang: "ar", href: "https://ruknaltawfer.com/ar" },
      { rel: "alternate", hrefLang: "en", href: "https://ruknaltawfer.com/en" },
      { rel: "alternate", hrefLang: "x-default", href: "https://ruknaltawfer.com/ar" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const matches = useRouterState({ select: (s) => s.matches });
  const lang = resolveLangFromMatches(matches);
  const dir = lang === "en" ? "ltr" : "rtl";
  return (
    <html lang={lang} dir={dir}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
