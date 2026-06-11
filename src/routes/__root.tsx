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
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "ركن التوفير كوزمتك للتجارة",
          alternateName: "Rukn Al-Tawfir Cosmetic for Trade",
          url: "https://rukna-ltawfir.lovable.app",
          logo: "https://rukna-ltawfir.lovable.app/rukn-logo.webp",
          description:
            "الوكيل الحصري لمنظومة من العلامات التجارية الصحية العالمية في الجمهورية اليمنية.",
        }),
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600&family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "alternate", hrefLang: "ar", href: "/ar" },
      { rel: "alternate", hrefLang: "en", href: "/en" },
      { rel: "alternate", hrefLang: "x-default", href: "/ar" },
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
