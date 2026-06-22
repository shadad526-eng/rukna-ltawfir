import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/admin/seo")({
  head: () => ({
    meta: [
      { title: "SEO & AI Visibility Dashboard — Architecture" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Internal architecture preview for the SEO & AI visibility measurement layer." },
    ],
  }),
  component: SeoMeasurementPage,
});

type Kpi = {
  domain: string;
  northStar: string;
  target: string;
  cadence: string;
  metrics: string[];
};

const KPIS: Kpi[] = [
  {
    domain: "Indexing Coverage",
    northStar: "% indexed of submitted URLs",
    target: "≥ 95%",
    cadence: "Weekly",
    metrics: [
      "Submitted URLs (sitemap count)",
      "Indexed URLs (GSC Coverage)",
      "Excluded reasons breakdown",
      "Index latency p50/p90 (days)",
    ],
  },
  {
    domain: "Rich Results Coverage",
    northStar: "% URLs with ≥1 valid rich result",
    target: "≥ 80%",
    cadence: "Weekly",
    metrics: [
      "Organization / LocalBusiness / WebSite",
      "Product + ImageObject + Offer",
      "Article + BreadcrumbList",
      "FAQPage / ItemList / CollectionPage",
    ],
  },
  {
    domain: "FAQ Visibility",
    northStar: "FAQ impressions in SERP",
    target: "+50% MoM",
    cadence: "Weekly",
    metrics: [
      "FAQ impressions & clicks (GSC)",
      "Live FAQ questions per hub",
      "AI-engine citation rate of FAQ answers",
    ],
  },
  {
    domain: "Entity Coverage",
    northStar: "Brands/topics recognized as entities",
    target: "8 / 8 brands",
    cadence: "Monthly",
    metrics: [
      "Knowledge Panel presence per brand",
      "sameAs link count",
      "AI recall score (5 engines × 3 prompts)",
      "knowsAbout topic completeness",
    ],
  },
  {
    domain: "Internal Authority Flow",
    northStar: "Avg internal links per pillar",
    target: "≥ 15",
    cadence: "Monthly",
    metrics: [
      "In/out degree per URL",
      "PageRank approximation",
      "Orphan pages (target 0)",
      "Pillar ↔ cluster link density",
    ],
  },
  {
    domain: "Crawl Depth",
    northStar: "% key URLs reachable ≤ 3 clicks",
    target: "≥ 95%",
    cadence: "Monthly",
    metrics: [
      "BFS click-depth from homepage",
      "URLs at depth > 3",
      "GSC crawl stats (req/day, bytes)",
    ],
  },
  {
    domain: "Brand Discoverability",
    northStar: "Branded + non-branded impressions",
    target: "+30% QoQ",
    cadence: "Weekly",
    metrics: [
      "Branded queries (impr / clicks / CTR)",
      "Non-branded category queries",
      "Share of voice vs. competitors (SEMrush)",
      "Direct + organic-branded sessions",
    ],
  },
  {
    domain: "Topic Hub Performance",
    northStar: "Hub sessions → WhatsApp CR",
    target: "≥ 4%",
    cadence: "Weekly",
    metrics: [
      "Sessions, time-on-page, scroll depth",
      "Outbound clicks to brand pages",
      "WhatsApp CTA CTR",
      "Inbound internal links count",
    ],
  },
];

const SOURCES = [
  ["Google Search Console API", "Indexing, queries, rich results", "Daily 03:00 UTC"],
  ["Google Analytics 4 / Plausible", "Sessions, conversion rate", "Real-time"],
  ["Bing Webmaster Tools API", "Bing parity metrics", "Daily"],
  ["Internal Crawl (Playwright)", "Link graph, depth, orphans", "Weekly Mon"],
  ["Schema Extractor (jsdom)", "JSON-LD inventory per build", "Per deploy"],
  ["AI Engine Probes", "ChatGPT / Gemini / Perplexity / Copilot", "Bi-weekly"],
  ["SEMrush API", "Share of voice, backlinks", "Weekly"],
];

const TABLES = [
  ["seo_snapshots", "Daily domain-level KPI snapshot"],
  ["seo_url_metrics", "Per-URL weekly metrics + schema types"],
  ["seo_schema_inventory", "Build-time JSON-LD validity inventory"],
  ["seo_ai_probes", "AI engine prompt results, citations, sentiment"],
  ["seo_link_graph", "Internal link edges (from → to, anchor, weight)"],
];

const ROADMAP = [
  ["P0", "Foundations", "DB schema, GSC connector, daily snapshot cron, dashboard shell", "Week 1"],
  ["P1", "Crawl + Graph", "Playwright crawler, link-graph store, depth + orphan reports", "Week 2"],
  ["P2", "Schema + FAQ", "Build-time JSON-LD extractor, rich-results inventory, FAQ tracker", "Week 3"],
  ["P3", "AI Probes", "Perplexity API + manual scoring sheet, AI scorecard tile", "Week 4"],
  ["P4", "Alerts + SOV", "SEMrush SOV, threshold alerts, weekly digest email", "Week 5"],
];

function SeoMeasurementPage() {
  return (
    <main dir="ltr" className="mx-auto max-w-6xl px-6 py-10 text-foreground">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Internal · noindex
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          SEO &amp; AI Visibility Measurement Layer
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Architecture preview. Unifies indexing, rich results, FAQ, entity,
          authority, crawl depth, brand and topic-hub measurement for
          ruknaltawfer.com across Google and AI answer engines.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">KPI Framework — 8 Domains</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {KPIS.map((k) => (
            <div key={k.domain} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">{k.domain}</h3>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {k.target}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                North-star: {k.northStar} · {k.cadence}
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-foreground/80">
                {k.metrics.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Data Sources &amp; Cadence</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Provides</th>
                <th className="px-3 py-2">Cadence</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map(([s, p, c]) => (
                <tr key={s} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{s}</td>
                  <td className="px-3 py-2 text-foreground/80">{p}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Storage Model (Lovable Cloud)</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2">Table</th>
                <th className="px-3 py-2">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {TABLES.map(([t, p]) => (
                <tr key={t} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">{t}</td>
                  <td className="px-3 py-2 text-foreground/80">{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          All tables RLS-gated to admin role via <code>has_role(auth.uid(), 'admin')</code>.
          Reads from dashboard only; writes from scheduled server functions.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Dashboard Sections (planned)</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground/85">
          <li>Overview — 8 KPI tiles with sparkline + delta vs. prior period</li>
          <li>Indexing — coverage funnel, excluded reasons, latency histogram</li>
          <li>Schema — heatmap of schema type × URL group</li>
          <li>FAQ &amp; AI — top-cited FAQs, AI-probe scorecard per engine</li>
          <li>Authority Graph — interactive force graph (pillar ↔ cluster)</li>
          <li>Crawl Depth — depth histogram + orphan list</li>
          <li>Hubs — per-hub funnel (sessions → outbound → WhatsApp)</li>
          <li>Alerts — open issues + history</li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Implementation Roadmap</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2">Phase</th>
                <th className="px-3 py-2">Scope</th>
                <th className="px-3 py-2">Deliverables</th>
                <th className="px-3 py-2">ETA</th>
              </tr>
            </thead>
            <tbody>
              {ROADMAP.map(([p, s, d, eta]) => (
                <tr key={p} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">{p}</td>
                  <td className="px-3 py-2 font-medium">{s}</td>
                  <td className="px-3 py-2 text-foreground/80">{d}</td>
                  <td className="px-3 py-2 text-muted-foreground">{eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 text-sm">
        <h2 className="mb-2 text-base font-semibold">Guardrails</h2>
        <ul className="list-disc space-y-1 pl-5 text-foreground/80">
          <li>No changes to robots.txt, sitemap generator, DNS, or Search Console verification.</li>
          <li>No edits to existing canonical URLs, hreflang, image filenames, or live routes.</li>
          <li>Read-only against production; writes scoped to new <code>seo_*</code> tables.</li>
          <li>This page is <code>noindex, nofollow</code> and intended for internal review.</li>
        </ul>
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        Full architecture spec: <code>docs/seo-ai-measurement-layer.md</code>
      </p>
    </main>
  );
}
