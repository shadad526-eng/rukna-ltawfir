# Premium Corporate Redesign — Rukn Al-Tawfir

A full UX/UI transformation inspired by the reference image's quality level (not literal copy), built around our official identity and uploaded assets. Architecture, routes, IDs, slugs, and database remain untouched.

## Scope

1. **Homepage** (`/`) — full rebuild of layout structure:
   - Cinematic hero (corporate composition of our real product packshots on a blue→green premium stage, glassmorphism, floating leaves, soft layered shadows)
   - Why Rukn Al-Tawfir (refined 6-card grid)
   - International Brand Ecosystem (premium brand cards — see below, equal weight, no "featured")
   - Featured Products (editorial grid using official packshots)
   - Brand Collections (visual category compositions)
   - Knowledge Center (article previews using official imagery)
   - Partnership Section
   - Contact Section
   - Premium Footer

2. **Brand portals** (`/brands/$slug`) — independent microsite feel:
   - Brand hero (full-bleed image + logo + tagline)
   - Brand story
   - Product collection grid
   - Image gallery (from uploaded brand assets)
   - Catalog download CTA
   - WhatsApp inquiry block
   - Related brands strip (NOT full directory)

3. **Product pages** (`/brands/$slug/$productSlug`):
   - Large gallery with smooth transitions
   - Product info (verified only)
   - Variant selector (when variants exist)
   - WhatsApp inquiry CTA
   - Related products from same brand

4. **Brand cards** — premium pattern used on homepage + brands index:
   - Hero/cover image (official) + logo overlay
   - Short Arabic description
   - Fully-clickable card with elegant hover (lift, image zoom, shimmer)

## Design System

- Reinforce blue (Trust) + green (Leaf) tokens from `src/styles.css`
- Add premium primitives: deeper glassmorphism, layered gradient meshes, soft elevated shadows, podium stages, shimmer, scroll-reveal utility
- RTL Arabic typography with refined display scale
- Mobile-first: every section reflows to premium mobile layout (sticky WhatsApp, swipeable galleries, full-width cards)

## Constraints (strict)

- Use ONLY official uploaded assets (logos, packshots, family shots, catalogs). No stock, no AI-generated humans, no fake products, no women, no faces.
- Hide prices; conversion goes through WhatsApp inquiry.
- Equal treatment for all 8 brands. No "featured brand."
- Preserve database, routes, slugs, IDs, asset workflow.

## Technical Plan

- Edit: `src/routes/index.tsx`, `src/routes/brands.$slug.index.tsx`, `src/routes/brands.$slug.$productSlug.tsx`, `src/routes/brands.index.tsx`
- Add reusable components: `src/components/site/BrandCard.tsx`, `ProductCard.tsx`, `HeroStage.tsx`, `SectionHeader.tsx`, `Gallery.tsx`, `RelatedBrands.tsx`
- Extend `src/styles.css` with new premium utilities (glass-2, mesh-aurora, premium-shadow-lg, reveal-on-scroll, image-zoom)
- Use existing `site.functions.ts` data; add helper queries for galleries/related if needed (no schema change)

## Phased Execution (with approval between phases)

Per project memory ("phased execution with approval between phases"):

- **Phase 1 — Foundation + Homepage**: design tokens, primitives, new homepage. ← *I'll start here on approval.*
- **Phase 2 — Brand portals + brand cards**.
- **Phase 3 — Product pages + galleries + polish (mobile QA, micro-animations)**.

## Confirmation Needed Before I Start

1. Confirm Phase 1 first (homepage + foundation), then approval gate before Phases 2 and 3.
2. Confirm I should rely strictly on assets already in the database (`logo_url`, `cover_url`, brand/product images already uploaded) — no new image generation for products or humans. For decorative atmosphere (leaves, abstract blue/green light), small abstract SVG/CSS-only embellishments are acceptable. Yes/No?
