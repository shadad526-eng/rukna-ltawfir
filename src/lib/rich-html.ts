/**
 * Minimal isomorphic rich-text HTML normaliser + sanitiser.
 *
 * Used for article bodies that are authored in the admin rich text editor and
 * rendered on the public site. Works in the Worker runtime (no DOM required).
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "div", "span",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "mark", "small",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
]);

const VOID_TAGS = new Set(["br", "hr", "img", "col"]);

const GLOBAL_ATTRS = new Set(["dir", "align", "style", "class", "id", "lang"]);
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading", "data-asset-id"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  col: new Set(["span", "width"]),
  colgroup: new Set(["span"]),
  ol: new Set(["start", "type"]),
};

// Only harmless presentational declarations survive.
const SAFE_STYLE = /^(text-align|font-weight|font-style|text-decoration(-line)?|color|background-color|margin|margin-(top|bottom|inline-start|inline-end)|padding|width|max-width|height|direction|float)$/;

function escapeAttr(v: string) {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeText(v: string) {
  return v.replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeStyle(value: string) {
  const kept = value
    .split(";")
    .map((decl) => decl.trim())
    .filter(Boolean)
    .filter((decl) => {
      const idx = decl.indexOf(":");
      if (idx < 0) return false;
      const prop = decl.slice(0, idx).trim().toLowerCase();
      const val = decl.slice(idx + 1).trim().toLowerCase();
      if (!SAFE_STYLE.test(prop)) return false;
      if (val.includes("url(") || val.includes("expression") || val.includes("javascript:")) return false;
      return true;
    });
  return kept.join("; ");
}

function safeUrl(raw: string, allowData: boolean) {
  const url = raw.trim();
  if (!url) return null;
  const lower = url.replace(/\s+/g, "").toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("vbscript:")) return null;
  if (lower.startsWith("data:")) return allowData && lower.startsWith("data:image/") ? url : null;
  return url;
}

function sanitizeAttrs(tag: string, attrSource: string) {
  const out: string[] = [];
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrSource))) {
    const name = m[1].toLowerCase();
    let value = m[2] ?? m[3] ?? m[4] ?? "";
    if (name.startsWith("on")) continue;
    const allowed = GLOBAL_ATTRS.has(name) || TAG_ATTRS[tag]?.has(name);
    if (!allowed) continue;
    if (name === "style") {
      value = sanitizeStyle(value);
      if (!value) continue;
    }
    if (name === "href" || name === "src") {
      const safe = safeUrl(value, name === "src");
      if (!safe) continue;
      value = safe;
    }
    out.push(`${name}="${escapeAttr(value)}"`);
  }
  if (tag === "a") {
    if (!out.some((a) => a.startsWith("target="))) out.push('target="_blank"');
    if (!out.some((a) => a.startsWith("rel="))) out.push('rel="noopener noreferrer nofollow"');
  }
  if (tag === "img" && !out.some((a) => a.startsWith("loading="))) out.push('loading="lazy"');
  return out.length ? " " + out.join(" ") : "";
}

/** Remove disallowed tags/attributes while keeping formatting intact. */
export function sanitizeRichHtml(input: string): string {
  // Drop dangerous elements entirely (including their content).
  let html = input.replace(
    /<(script|style|iframe|object|embed|form|input|button|link|meta|svg|math)\b[\s\S]*?<\/\1\s*>/gi,
    "",
  );
  html = html.replace(/<(script|style|iframe|object|embed|form|input|button|link|meta)\b[^>]*\/?>/gi, "");
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  let out = "";
  let last = 0;
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>])*)>/g;
  const open: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html))) {
    out += escapeText(html.slice(last, m.index));
    last = m.index + m[0].length;
    const tag = m[1].toLowerCase();
    const closing = m[0].startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) continue;
    if (VOID_TAGS.has(tag)) {
      if (!closing) out += `<${tag}${sanitizeAttrs(tag, m[2] ?? "")} />`;
      continue;
    }
    if (closing) {
      const idx = open.lastIndexOf(tag);
      if (idx === -1) continue;
      open.splice(idx, 1);
      out += `</${tag}>`;
    } else {
      open.push(tag);
      out += `<${tag}${sanitizeAttrs(tag, m[2] ?? "")}>`;
    }
  }
  out += escapeText(html.slice(last));
  // Close anything left dangling.
  for (let i = open.length - 1; i >= 0; i--) out += `</${open[i]}>`;
  return out;
}

function looksLikeHtml(s: string) {
  return /<\/?(p|div|br|h[1-6]|ul|ol|li|strong|em|b|i|u|img|a|blockquote|table|pre|span|figure)\b/i.test(s);
}

function decodeEntities(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&");
}

function plainToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeText(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/**
 * Turn stored article bodies (HTML string, plain text, escaped HTML, or an
 * array of paragraphs) into sanitised, renderable HTML.
 */
export function toRichHtml(input: unknown): string {
  if (input == null) return "";
  if (Array.isArray(input)) {
    return input
      .map((item) =>
        typeof item === "string"
          ? item
          : item && typeof item === "object" && "text" in (item as any)
            ? String((item as any).text)
            : "",
      )
      .filter(Boolean)
      .map((chunk) => toRichHtml(chunk))
      .join("");
  }
  if (typeof input !== "string") return "";
  let s = input.trim();
  if (!s) return "";
  // Content that was double-escaped on the way in (&lt;p&gt;…).
  if (!looksLikeHtml(s) && /&lt;\/?[a-zA-Z]/.test(s)) s = decodeEntities(s);
  if (!looksLikeHtml(s)) return plainToHtml(s);
  return sanitizeRichHtml(s);
}
