import { LLink } from "@/i18n/LLink";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import { SocialLinks } from "./SocialLinks";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { listBrands } from "@/lib/site.functions";
import { useT } from "@/i18n/LocaleProvider";

type Props = {
  legalNameAr: string;
  parentGroupAr: string | null;
  whatsappNumber: string;
  logoUrl: string | null;
};

export function SiteHeader({ legalNameAr, parentGroupAr, whatsappNumber, logoUrl }: Props) {
  const t = useT();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => listBrands(),
    staleTime: 60_000,
  });

  const navItems = useMemo(
    () => [
      { to: "/$lang/", label: t("nav.home"), exact: true },
      { to: "/$lang/brands", label: t("nav.brands"), hasMega: true },
      { to: "/$lang/catalogs", label: t("nav.catalogs") },
      { to: "/$lang/about", label: t("nav.about") },
      { to: "/$lang/partners", label: t("nav.partners") },
      { to: "/$lang/contact", label: t("nav.contact") },
    ],
    [t],
  );

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="h-0.5 w-full hq-rule" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-8">
        <LLink to="/$lang/" className="flex min-w-0 items-center gap-3">
          <div className="relative grid size-12 place-items-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {logoUrl ? (
              <img src={logoUrl} alt={`شعار ${legalNameAr}`} className="size-full object-contain p-1" />
            ) : (
              <span className="text-xs font-bold text-trust-700">رت</span>
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-arabic text-sm font-bold text-foreground md:text-[15px]">{legalNameAr}</div>
            {parentGroupAr ? (
              <div className="truncate text-[10px] font-medium tracking-wider text-ink-600">{parentGroupAr}</div>
            ) : null}
          </div>
        </LLink>

        <nav className="hidden items-center gap-1 text-[13px] font-semibold text-ink-600 lg:flex">
          {navItems.map((n) => (
            <div
              key={n.to}
              className="relative"
              onMouseEnter={() => n.hasMega && setMegaOpen(true)}
              onMouseLeave={() => n.hasMega && setMegaOpen(false)}
            >
              <LLink
                to={n.to}
                activeProps={{ className: "text-trust-700 bg-trust-50" }}
                activeOptions={{ exact: !!n.exact }}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors hover:bg-secondary hover:text-trust-700"
              >
                {n.label}
                {n.hasMega ? (
                  <span aria-hidden className="text-[10px] opacity-60">▾</span>
                ) : null}
              </LLink>
              {n.hasMega && megaOpen && brands && brands.length > 0 ? (
                <div className="absolute right-0 top-full pt-3">
                  <div className="w-[640px] overflow-hidden rounded-2xl border border-border bg-card premium-shadow prem-fade-up">
                    <div className="border-b border-border bg-secondary/40 px-5 py-3">
                      <div className="hq-eyebrow">{t("header.brandsSystem")}</div>
                      <div className="mt-1 text-[13px] text-ink-600">
                        {t("header.brandsSystemSub")}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 p-4">
                      {brands.map((b) => (
                        <LLink
                          key={b.id}
                          to="/$lang/brands/$slug"
                          params={{ slug: b.slug }}
                          className="group flex flex-col items-center gap-2 rounded-xl border border-transparent p-3 text-center transition-all hover:-translate-y-0.5 hover:border-border hover:bg-background"
                          onClick={() => setMegaOpen(false)}
                        >
                          <div className="grid h-14 w-full place-items-center overflow-hidden rounded-lg bg-sand-50 p-2">
                            {b.logo_url ? (
                              <img src={b.logo_url} alt={`شعار ${b.name_ar}`} className="max-h-10 w-auto object-contain" loading="lazy" />
                            ) : (
                              <span className="text-[10px] font-bold text-muted-foreground">{b.name_en}</span>
                            )}
                          </div>
                          <div className="font-arabic text-[12px] font-bold text-foreground group-hover:text-trust-700">
                            {b.name_ar}
                          </div>
                        </LLink>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-5 py-3 text-xs">
                      <span className="text-ink-600">{t("header.brandsGuide")}</span>
                      <LLink to="/$lang/brands" className="font-bold text-trust-700 hover:underline" onClick={() => setMegaOpen(false)}>
                        {t("header.enterGuide")}
                      </LLink>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <SocialLinks size="sm" variant="header" whatsappNumber={whatsappNumber} className="hidden md:flex" />
          <button
            type="button"
            aria-label={t("header.menu")}
            onClick={() => setMobileOpen((s) => !s)}
            className="grid size-11 place-items-center rounded-full border border-border bg-card text-trust-700 lg:hidden"
          >
            <span className="block size-4 relative">
              <span className={`absolute inset-x-0 top-0 h-0.5 bg-current transition-transform ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`absolute inset-x-0 top-1.5 h-0.5 bg-current transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`absolute inset-x-0 top-3 h-0.5 bg-current transition-transform ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen ? (
        <div className="border-t border-border bg-card lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3">
            <ul className="grid gap-1">
              {navItems.map((n) => (
                <li key={n.to}>
                  <LLink
                    to={n.to}
                    onClick={() => setMobileOpen(false)}
                    activeProps={{ className: "bg-trust-50 text-trust-700" }}
                    activeOptions={{ exact: !!n.exact }}
                    className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    {n.label}
                  </LLink>
                </li>
              ))}
            </ul>
            {brands && brands.length > 0 ? (
              <div className="mt-3 border-t border-border pt-3">
                <div className="hq-eyebrow mb-2">{t("nav.brands")}</div>
                <div className="grid grid-cols-4 gap-2">
                  {brands.map((b) => (
                    <LLink
                      key={b.id}
                      to="/$lang/brands/$slug"
                      params={{ slug: b.slug }}
                      onClick={() => setMobileOpen(false)}
                      className="grid h-14 place-items-center rounded-lg border border-border bg-sand-50 p-2"
                    >
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name_ar} className="max-h-9 w-auto object-contain" loading="lazy" />
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground">{b.name_en}</span>
                      )}
                    </LLink>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-3">
              <WhatsAppCTA number={whatsappNumber} className="w-full">{t("header.whatsappInquiry")}</WhatsAppCTA>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
              <LanguageSwitcher />
              <SocialLinks size="md" variant="header" whatsappNumber={whatsappNumber} />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
