## SEO fixes — remaining findings

Google Search Console is now connected, so I'll finish the three failing items.

### 1. Verify domain & submit sitemap to GSC (`gsc:gsc`)
Via the connector gateway from the sandbox (no code changes):
- Request a META verification token for `https://ruknaltawfer.com/`
- Add the `<meta name="google-site-verification">` tag to `src/routes/__root.tsx` head
- Call `siteVerification/v1/webResource?verificationMethod=META` to verify
- `PUT /webmasters/v3/sites/https%3A%2F%2Fruknaltawfer.com%2F` to add the site
- `PUT /webmasters/v3/sites/.../sitemaps/https%3A%2F%2Fruknaltawfer.com%2Fsitemap.xml` to submit the sitemap

Note: verification requires the meta tag to be present on the live production HTML, so this step lands fully only after publishing. I'll add the tag and run the token/verify calls; if verify 400s with `failedToFindMetaTag`, ask to publish then re-run verify.

### 2. `<main>` landmark + `<html lang>` (`lighthouse` + `lint:page_basics`)
- Wrap the per-route content in a single `<main>` element inside the shared `$lang.tsx` layout (between `<Header />` and `<Footer />`), so every route gets exactly one `<main>` without touching individual pages.
- `<html lang>` is already set dynamically in `RootShell`; the lint finding is scan-time stale — I'll re-verify after the change and mark it fixed.

### 3. Low-contrast text (`lighthouse`)
Audit `muted-foreground`/opacity usages that fall below 4.5:1 on the current backgrounds and swap the worst offenders to `text-foreground` or a darker token. Scope limited to obvious violators (footer, hero subtitles, card meta) — no layout changes.

### Out of scope
Content, URLs, schema, images, layout structure (per prior constraints).

### Verify
- `tsgo` typecheck
- `list_findings` → `update_findings` marking the three items fixed
- Re-run GSC verify after user publishes if the first attempt fails
