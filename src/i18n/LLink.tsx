import { Link, useParams, type LinkComponentProps } from "@tanstack/react-router";
import { forwardRef } from "react";
import { useLocale } from "./LocaleProvider";

/**
 * Locale-aware Link wrapper. Automatically injects the current `lang` param
 * so call sites don't have to thread it through every navigation.
 *
 * Usage: <LLink to="/$lang/about">…</LLink>
 *        <LLink to="/$lang/brands/$slug" params={{ slug }}>…</LLink>
 */
type AnyProps = LinkComponentProps<"a"> & { params?: Record<string, unknown> };

export const LLink = forwardRef<HTMLAnchorElement, AnyProps>(function LLink(
  { params, ...rest },
  ref,
) {
  const cur = useParams({ strict: false }) as Record<string, unknown>;
  const { lang } = useLocale();
  const merged = { lang: (cur?.lang as string) ?? lang, ...((params ?? {}) as Record<string, unknown>) };
  // Cast: type-safe `to` would require per-route typing; the wrapper is
  // intentionally loose so existing call sites compile unchanged.
  return <Link ref={ref as never} {...(rest as never)} params={merged as never} />;
});
