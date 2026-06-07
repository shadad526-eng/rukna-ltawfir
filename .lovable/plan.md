# Premium Redesign Plan — Rukn Al-Tawfir Corporate Ecosystem

## Locked (no changes)
DB schema, brand/product IDs, slugs, URLs, asset workflow, governance, RTL, no-pricing, no human imagery, logo-derived color system, admin/CMS, existing Supabase server functions.

This is **visual + UX only**. All current routes keep working: `/`, `/brands`, `/brands/$slug`, `/brands/$slug/$productSlug`, `/catalogs`, plus new `/about`, `/partners`, `/contact`.

---

## 1. New corporate Home (`src/routes/index.tsx`)
Rebuild as the corporate flagship — Rukn Al-Tawfir is the protagonist, brands are the ecosystem.

Sections, in order:
1. **Cinematic Hero** — full-bleed cinema-hero canvas, corporate identity headline ("ركن التوفير — الوكيل الحصري في اليمن"), official family product image (uploaded asset) on a podium with halo + float motion, dual CTAs (WhatsApp inquiry + "اكتشف العلامات"), scroll cue.
2. **Why Rukn Al-Tawfir** — 6 premium feature cards (exclusive agencies, original products, intl. quality, nationwide distribution, strong partnerships, professional support) with icons + glass surfaces.
3. **Exclusive International Brands** — premium showcase grid of all 8 brands in approved order (NO CAL → Steviola → Monivo → Baby Tawfir → Bambo → Y-Kelin → iSiS → SEKEM). Equal weight. Each card: hero image, logo overlay on podium, short description, fully clickable to `/brands/$slug`, hover lift + shimmer.
4. **Featured Products** — mixed product spotlight from all brands (cards pulled from products table, image + brand + name, click → product page).
5. **About excerpt** — story/mission/vision/values teaser → `/about`.
6. **Partnership band** — B2B CTA → `/partners`.
7. **Contact strip** — WhatsApp, phone, email, address → `/contact`.

Remove "العلامتان الرائدتان" and "دليل العلامات التجارية" framing.

## 2. New routes
- `src/routes/about.tsx` — Company story, mission, vision, values, strategic positioning. Premium editorial layout.
- `src/routes/partners.tsx` — B2B partnerships & distributor request (WhatsApp + form-style CTA, no backend change; form opens WhatsApp prefilled).
- `src/routes/contact.tsx` — WhatsApp, phone, email, address, contact card with prefilled WhatsApp message builder.

Each with full `head()` metadata (title, description, og:title, og:description).

## 3. Brand portal redesign (`src/routes/brands.$slug.tsx`)
Reshape into the actual brand experience (not directory re-render):
- Brand hero with halo accent in brand color, official logo on podium, brand tagline.
- Brand story block (from CMS `description_ar`).
- Product collection grid (podium tiles, brand-accent halos, click → product page).
- Gallery strip (existing brand assets).
- Catalog download CTA (if `catalog_url`).
- WhatsApp inquiry CTA prefilled with brand name.
- "علامات ذات صلة" — 3 sibling brands at bottom (not full directory).

Empty-product brands (iSiS, SEKEM): show "قريباً — منتجات رسمية" placeholder card instead of empty grid.

## 4. Brands index (`src/routes/brands.tsx`)
Keep as full premium directory (8 brand podium tiles, equal weight, approved order). No "featured" tier.

## 5. Header / nav
Update nav items to: الرئيسية، العلامات، المنتجات (catalogs), من نحن، الشراكة، تواصل. Keep mega-menu of brands. Keep glass header.

## 6. Footer
Premium 4-column footer: corporate info + logo, brands list (all 8), quick links (الرئيسية/من نحن/الشراكة/تواصل/الكتالوجات), contact data + WhatsApp pill.

## 7. Navigation audit
Verify every card/button/link routes correctly; no `<a href>` for dynamic params — all `<Link to params>`. WhatsApp CTAs use `WhatsAppCTA` with context-aware prefilled message.

## 8. Visual language (extend `src/styles.css` only, no token rewrites)
Use existing premium utilities (`cinema-hero`, `glass`, `podium`, `prem-card`, halos, prem-fade-up, prem-float, prem-shimmer). Add a few helpers if missing: `feature-card`, `section-eyebrow-xl`, `editorial-prose`. All colors via existing tokens (trust/leaf/sand/ink). No raw hex.

## 9. Out of scope (explicit)
- No DB migrations.
- No new server functions (reuse `listBrands`, `getBrand`, `listProductsByBrand`, plus add a small `listFeaturedProducts` server fn if needed — pure read, no schema change).
- No asset uploads in this pass; reuse existing official assets in `brand-assets` bucket.
- No pricing surfaces anywhere.
- No human/face imagery.

## Technical notes
- All new routes use `createFileRoute` with proper `head()` per `tanstack-route-architecture`.
- Data reads via `createServerFn` + `useQuery` / `ensureQueryData` pattern already in place.
- All Arabic copy, RTL preserved (`dir="rtl"` inherited from root).
- Mobile-first: hero, cards, and grids tested at 442px viewport (current preview).
- No `-webkit-backdrop-filter` hand-written (per tailwind4-gotchas).

## Delivery order
1. Extend styles.css helpers.
2. New routes: about, partners, contact.
3. Add `listFeaturedProducts` server fn (read-only).
4. Rebuild `index.tsx` (corporate home).
5. Rebuild `brands.$slug.tsx` (real brand experience + empty-state for iSiS/SEKEM).
6. Update Header nav + Footer.
7. Audit links/CTAs end-to-end on preview.

Approve to proceed, or tell me which sections to adjust first.