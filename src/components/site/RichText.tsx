import { createElement, type ReactNode } from "react";
import { sanitizeRichHtml } from "@/lib/rich-html";
import { normalizeHeading, type HeadingValue } from "@/lib/page-content";

const HAS_TAGS = /<[a-z!/][\s\S]*>/i;

/**
 * Renders an admin-authored value. Plain strings render as plain text (keeping
 * the exact current appearance), formatted values render sanitized HTML inline
 * so the surrounding component keeps full control of layout and typography.
 */
export function RichText({
  value,
  className,
  as = "span",
}: {
  value: string | null | undefined;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  if (!HAS_TAGS.test(raw)) {
    return createElement(as as any, { className }, raw);
  }
  return createElement(as as any, {
    className: `rich-inline ${className ?? ""}`.trim(),
    dangerouslySetInnerHTML: { __html: sanitizeRichHtml(raw) },
  });
}

function headingStyle(h: HeadingValue): React.CSSProperties {
  const style: Record<string, string | number> = {};
  if (h.sizeDesktop) style["--h-fs-d"] = `${h.sizeDesktop}px`;
  if (h.sizeMobile) style["--h-fs-m"] = `${h.sizeMobile}px`;
  if (!h.sizeMobile && h.sizeDesktop) style["--h-fs-m"] = `${Math.round(h.sizeDesktop * 0.62)}px`;
  if (!h.sizeDesktop && h.sizeMobile) style["--h-fs-d"] = `${h.sizeMobile}px`;
  if (h.weight) style.fontWeight = h.weight;
  if (h.lineHeight) style.lineHeight = h.lineHeight;
  if (h.align) style.textAlign = h.align === "start" ? "start" : h.align === "end" ? "end" : "center";
  return style as React.CSSProperties;
}

/**
 * Renders a section heading. When no custom typography was saved, the children
 * (the site's existing markup) render untouched.
 */
export function StyledHeading({
  heading,
  level = 2,
  className,
  children,
}: {
  heading: HeadingValue | null | undefined;
  level?: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  const h = normalizeHeading(heading);
  const tag = `h${level}`;
  if (!h) return createElement(tag, { className }, children);

  const html = (h.html ?? "").trim();
  const hasCustomType = !!(h.sizeDesktop || h.sizeMobile || h.weight || h.lineHeight || h.align);
  const props: Record<string, unknown> = {
    className: `${className ?? ""}${hasCustomType ? " styled-heading" : ""}`.trim(),
    style: hasCustomType ? headingStyle(h) : undefined,
  };
  if (!html) return createElement(tag, props, children);
  return createElement(tag, {
    ...props,
    dangerouslySetInnerHTML: { __html: sanitizeRichHtml(html) },
  });
}
