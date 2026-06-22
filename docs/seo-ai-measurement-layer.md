# SEO & AI Visibility Measurement Layer
**Project:** ruknaltawfer.com  
**Owner:** Growth / SEO Lead  
**Status:** Architecture v1.0

---

## 1. Purpose

A unified measurement layer that quantifies how well ruknaltawfer.com is
discovered, indexed, ranked, cited, and converted across:

- Traditional search engines (Google, Bing)
- AI answer engines (ChatGPT, Gemini, Claude, Perplexity, Copilot, Google AI Overviews)
- Internal authority graph (brand ↔ topic hub ↔ product ↔ article)
- WhatsApp conversion funnel (primary CTA)

It replaces ad-hoc spreadsheets with **8 KPI domains**, **30+ metrics**,
and a documented data pipeline feeding one internal dashboard.

---

## 2. KPI Framework — 8 Domains

| # | Domain | North-Star KPI | Target (Q1) | Cadence |
|---|--------|---------------|-------------|---------|
| 1 | Indexing Coverage | % indexed of submitted URLs | ≥ 95% | Weekly |
| 2 | Rich Results Coverage | % URLs with ≥1 valid rich result | ≥ 80% | Weekly |
| 3 | FAQ Visibility | FAQ impressions in SERP | +50% MoM | Weekly |
| 4 | Entity Coverage | Brands/topics in Google Knowledge Panel + AI answers | 8/8 brands | Monthly |
| 5 | Internal Authority Flow | Avg internal links per pillar | ≥ 15 | Monthly |
| 6 | Crawl Depth | % key URLs reachable ≤ 3 clicks | ≥ 95% | Monthly |
| 7 | Brand Discoverability | Branded + non-branded impressions | +30% QoQ | Weekly |
| 8 | Topic Hub Performance | Hub sessions → WhatsApp clicks | ≥ 4% CR | Weekly |

---

## 3. Tracked Metrics — Detail

### 3.1 Indexing Coverage
- Submitted URLs (sitemap.xml count)
- Indexed URLs (GSC `urlInspection` + Coverage report)
- Excluded (crawled-not-indexed, discovered-not-indexed, soft-404, duplicate)
- Index latency (submit → indexed, days, p50/p90)
- **Source:** Google Search Console API (`/searchanalytics`, `/urlInspection`)

### 3.2 Rich Results Coverage
Per schema type, count of valid / warning / error URLs:
- `Organization`, `LocalBusiness`, `WebSite`
- `Product`, `ImageObject`, `Offer`
- `Article`, `BreadcrumbList`
- `FAQPage`, `ItemList`, `CollectionPage`
- **Source:** GSC Enhancements API + scheduled Rich Results Test runs

### 3.3 FAQ Visibility
- FAQ impressions, clicks, avg position (GSC search appearance filter = "FAQ")
- # of FAQ questions live per hub (parsed from JSON-LD in build)
- AI-engine citation rate of FAQ answers (manual + Perplexity API sampling)

### 3.4 Entity Coverage
- Brand presence in Google Knowledge Panel (manual quarterly audit)
- `sameAs` link count per brand entity
- AI-engine recall test: ask "ما هي بدائل السكر في اليمن؟" across 5 engines; score 0–3 per brand
- `knowsAbout` topic coverage (count vs. target catalog)

### 3.5 Internal Authority Flow
- Internal links per URL (in/out degree)
- PageRank approximation (computed via internal link graph)
- Orphan pages count (target = 0)
- Pillar → cluster link density per Topic Hub

### 3.6 Crawl Depth
- Click depth from homepage (BFS over internal graph)
- # URLs at depth > 3 (target = 0 for revenue-critical pages)
- Crawl stats (GSC: requests/day, avg response, bytes)

### 3.7 Brand Discoverability
- Branded queries (containing "ركن التوفير" / "rukn al-tawfir") — impressions, clicks, CTR
- Non-branded category queries — impressions, clicks, position
- Share of voice vs. competitor set (SEMrush)
- Direct + organic-branded sessions trend

### 3.8 Topic Hub Performance
Per hub (`/sugar-alternatives`, `/oral-care`, `/baby-care`, `/immunity-vitamin-c`):
- Sessions, avg time-on-page, scroll depth
- Outbound clicks to brand pages
- WhatsApp CTA click-through rate
- Inbound internal links count
- Top entry keywords (GSC)

---

## 4. Architecture

```
┌───────────────────────────────────────────────────────────────┐
│  DATA SOURCES                                                 │
│  ─ Google Search Console API     (indexing, queries, rich)    │
│  ─ Google Analytics 4 / Plausible (sessions, CR)              │
│  ─ Bing Webmaster Tools API      (Bing parity)                │
│  ─ Internal Crawl (Playwright)   (graph, depth, orphans)      │
│  ─ Schema Extractor (jsdom)      (JSON-LD inventory)          │
│  ─ AI Engine Probes              (ChatGPT/Perplexity/Gemini)  │
│  ─ SEMrush API                   (SOV, backlinks)             │
└─────────────────────────┬─────────────────────────────────────┘
                          │
              ┌───────────▼────────────┐
              │  Lovable Cloud (Supabase) │
              │  tables:                  │
              │   seo_snapshots           │
              │   seo_url_metrics         │
              │   seo_schema_inventory    │
              │   seo_ai_probes           │
              │   seo_link_graph          │
              └───────────┬────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
 ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
 │ TanStack    │  │ Scheduled   │  │ Alerting    │
 │ /admin/seo  │  │ server fns  │  │ (email/WA)  │
 │ dashboard   │  │ (cron)      │  │             │
 └─────────────┘  └─────────────┘  └─────────────┘
```

### 4.1 Collection cadence
| Source | Method | Frequency |
|--------|--------|-----------|
| GSC `searchanalytics` | server fn → REST | Daily 03:00 UTC |
| GSC `urlInspection` | server fn (batched) | Weekly Mon |
| Internal crawl | Playwright job | Weekly Mon |
| Schema inventory | Build-time extractor | Per deploy |
| AI engine probes | API + manual sampling | Bi-weekly |
| SEMrush | connector → REST | Weekly |

### 4.2 Storage schema (proposed)
```sql
-- snapshot row per domain per day
seo_snapshots(id, captured_at, indexed_urls, submitted_urls,
              rich_valid, rich_warning, rich_error,
              branded_impr, nonbranded_impr, faq_impr, ...)

-- per-URL per-week metrics
seo_url_metrics(url, week, depth, in_links, out_links,
                impressions, clicks, position, indexed_state,
                schema_types text[])

-- schema inventory at build time
seo_schema_inventory(url, schema_type, valid, errors, captured_at)

-- AI engine probe results
seo_ai_probes(captured_at, engine, prompt, brand, mentioned bool,
              citation_url, sentiment)

-- internal link graph (sparse)
seo_link_graph(from_url, to_url, anchor_text, weight)
```

GRANT block per table — see `public-schema-grants` rule; reads restricted to
`authenticated` admin role via `has_role(_, 'admin')` RLS policies.

### 4.3 Dashboard
Route: `/admin/seo` (gated under `_authenticated` + `admin` role).
Sections:
1. **Overview** — 8 KPI tiles with sparkline + delta vs. prior period
2. **Indexing** — coverage funnel, excluded-reason breakdown, latency histogram
3. **Schema** — heatmap of schema type × URL group
4. **FAQ & AI** — top-cited FAQs, AI-probe scorecard per engine
5. **Authority Graph** — interactive force graph (pillar ↔ cluster)
6. **Crawl Depth** — depth histogram + orphan list
7. **Hubs** — per-hub funnel (sessions → outbound → WhatsApp)
8. **Alerts** — open issues + history

---

## 5. KPI Targets & SLAs

| KPI | Floor (alert) | Target | Stretch |
|-----|---------------|--------|---------|
| Index coverage | < 85% | 95% | 99% |
| Rich result errors | > 5 URLs | 0 | 0 |
| Avg crawl depth (key URLs) | > 4 | ≤ 3 | ≤ 2 |
| FAQ impressions WoW | < −10% | +10% | +25% |
| Hub → WhatsApp CR | < 2% | 4% | 6% |
| AI brand recall (NO CAL) | < 1/3 engines | 3/5 | 5/5 |

Breaching a floor triggers an alert (email + WhatsApp to growth lead).

---

## 6. Roadmap

| Phase | Scope | ETA |
|-------|-------|-----|
| **P0 — Foundations** | DB schema, GSC connector, daily snapshot cron, dashboard shell `/admin/seo` | Week 1 |
| **P1 — Crawl + Graph** | Playwright crawler, link-graph store, depth + orphan reports | Week 2 |
| **P2 — Schema + FAQ** | Build-time JSON-LD extractor, rich-results inventory, FAQ tracker | Week 3 |
| **P3 — AI Probes** | Perplexity API + manual scoring sheet, AI scorecard tile | Week 4 |
| **P4 — Alerts + SOV** | SEMrush share-of-voice, threshold alerts, weekly digest email | Week 5 |

---

## 7. What this layer does NOT change

- No edits to `robots.txt`, `sitemap.xml` generator, DNS, or Search Console verification
- No modification of existing canonical URLs, hreflang, image filenames, or routes
- Read-only against production; all writes scoped to new `seo_*` tables
