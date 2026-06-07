
# Phase 1 — Bilingual Foundation

Goal: ship a real bilingual architecture (URL-based locale, RTL/LTR auto-switch, persistent preference, elegant language switcher in Header) translating the global chrome only. Static pages and CMS content come in Phases 2 and 3.

Decisions confirmed by you:
- URL strategy: path prefix — `/ar/*` (default), `/en/*`.
- CMS strategy: schema already has `*_en` columns (Phase 3 wires them in).
- Delivery: phased, approval between phases.

Note on stack: this project runs on TanStack Start, not Next.js. The architecture below is the TanStack-equivalent of Next.js path-prefix i18n (same UX, same SEO benefits).

## What ships in Phase 1

1. **Locale architecture**
   - Supported locales: `ar` (default, RTL), `en` (LTR). Extensible — adding a locale = one entry in a config + one translation file.
   - URL contract: every page lives under `/$lang/...`. Root `/` redirects to `/<preferred>/` based on cookie → `Accept-Language` → `ar` fallback.
   - Persistence: `lovable-lang` cookie (1 year). Updated on every switch and on first auto-detect.
   - SSR-safe: locale resolved in the root route's `beforeLoad` so `<html lang dir>` is correct on first paint (no flash).

2. **Routing migration** (TanStack file-based)
   - New layout route `src/routes/$lang.tsx` validates the `lang` param, sets `dir`, provides locale via context.
   - Move existing pages into the `$lang.*` namespace:
     ```text
     $lang.index.tsx
     $lang.about.tsx
     $lang.contact.tsx
     $lang.partners.tsx
     $lang.catalogs.tsx
     $lang.brands.tsx + $lang.brands.index.tsx
     $lang.brands.$slug.tsx + $lang.brands.$slug.index.tsx
     $lang.brands.$slug.$productSlug.tsx
     ```
   - Old root-level routes deleted in the same commit.
   - `src/routes/index.tsx` becomes a tiny redirector → `/<lang>/`.
   - All internal `<Link to="/foo">` updated to `<Link to="/$lang/foo" params={{ lang }}>` via a thin `useLocalizedNav()` helper so existing pages don't break.

3. **i18n runtime**
   - Lightweight in-house provider (no extra dependency — keeps bundle lean and SSR-trivial):
     - `LocaleProvider` exposes `{ lang, dir, t, switchTo }`.
     - `t("key.path", { vars })` reads from typed JSON dictionaries.
   - Dictionaries:
     ```text
     src/i18n/locales/ar.json
     src/i18n/locales/en.json
     ```
   - Scope for Phase 1: navigation, header chrome, footer, WhatsApp CTA, social labels, common buttons, language switcher, 404/error boundaries.

4. **Language switcher (Header)**
   - Elegant minimal pill: `العربية | EN` separated by a hairline, current language emphasized.
   - Keeps the user on the same page in the other language (swaps only the `$lang` segment, preserves params and search).
   - `<link rel="alternate" hreflang>` tags added in `__root.tsx` head() per match.
   - Sets the `lovable-lang` cookie on switch.

5. **RTL/LTR polish**
   - `<html lang dir>` set from the resolved locale.
   - Verify existing utilities work both ways; flip directional paddings/margins (`pl-` / `pr-`) to logical equivalents (`ps-` / `pe-`) on Header, Footer, WhatsApp CTA, Social row. No design changes — just symmetry.
   - English typography uses the existing `Inter` family already loaded; Arabic keeps `font-arabic`.

6. **SEO**
   - Root `head()` emits per-locale `og:locale`, `<html lang>`, and `hreflang` alternates for `ar` and `en`.
   - Each page keeps its own title/description; in Phase 2 these become localized.

## What is explicitly NOT in Phase 1

- Translating page bodies (Home/About/Contact/Partners/Catalogs copy) → Phase 2.
- Wiring `name_en`, `description_en`, `title_en`, `body_en`, etc. into brand/product/article rendering → Phase 3.
- Admin UI for filling English columns → Phase 3.
- Localized SEO metadata for CMS pages → Phase 3.

## Files touched (Phase 1)

```text
src/i18n/config.ts                 (new — locales, default, dir map)
src/i18n/LocaleProvider.tsx        (new — context, t(), switchTo)
src/i18n/useLocalizedNav.ts        (new — Link/navigate helpers)
src/i18n/locales/ar.json           (new — chrome strings)
src/i18n/locales/en.json           (new — chrome strings)

src/routes/__root.tsx              (edit — html lang/dir, hreflang head, provider)
src/routes/index.tsx               (rewrite — redirect to /<lang>/)
src/routes/$lang.tsx               (new — layout, validates lang, sets dir)
src/routes/$lang.index.tsx         (moved from index.tsx)
src/routes/$lang.about.tsx         (moved)
src/routes/$lang.contact.tsx       (moved)
src/routes/$lang.partners.tsx     (moved)
src/routes/$lang.catalogs.tsx      (moved)
src/routes/$lang.brands*.tsx       (moved — 5 files)

src/components/site/Header.tsx     (edit — language switcher, localized links, t())
src/components/site/Footer.tsx     (edit — localized links, t())
src/components/site/LanguageSwitcher.tsx  (new)
src/components/site/SocialLinks.tsx (edit — aria-labels via t())
src/components/site/WhatsAppCTA.tsx (edit — label via t())
```

No database migration in Phase 1.

## Acceptance for Phase 1

- Visiting `/` redirects to `/ar/` for first-time Arabic users, `/en/` if the cookie says so.
- `/ar/about`, `/en/about`, `/ar/brands/<slug>`, `/en/brands/<slug>/<product>` all resolve correctly.
- Header switcher toggles language, preserves the current page, persists across reloads.
- `<html lang>` and `dir` update without a layout flash.
- Header nav, Footer, WhatsApp CTA, and social aria-labels render in the active language.
- All existing pages still render their current Arabic content (untranslated bodies stay Arabic — that's Phase 2).

If you approve, I'll execute Phase 1 end-to-end and stop for review before Phase 2 (static page bodies) and Phase 3 (CMS English columns + admin UI).
