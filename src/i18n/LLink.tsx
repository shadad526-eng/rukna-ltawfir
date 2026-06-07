import { Link, useParams } from "@tanstack/react-router";
import { forwardRef } from "react";
import { useLocale } from "./LocaleProvider";

/**
 * Locale-aware Link wrapper. Automatically injects the current `lang` param
 * so call sites don't have to thread it through every navigation.
 *
 * Usage: <LLink to="/$lang/about">…</LLink>
 *        <LLink to="/$lang/brands/$slug" params={{ slug }}>…</LLink>
 */
export const LLink = forwardRef<HTMLAnchorElement, any>(function LLink(
  { params, ...rest }: any,
  ref,
) {
  const cur = useParams({ strict: false }) as Record<string, unknown> | undefined;
  const { lang } = useLocale();
  const incoming = (params && typeof params === "object" ? params : {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = { lang: (cur?.lang as string) ?? lang, ...incoming };
  return <Link ref={ref as never} {...rest} params={merged as never} />;
});
