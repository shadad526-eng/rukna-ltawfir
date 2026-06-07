import { Link } from "@tanstack/react-router";
import { WhatsAppCTA } from "./WhatsAppCTA";

type Props = {
  legalNameAr: string;
  parentGroupAr: string | null;
  whatsappNumber: string;
  logoUrl: string | null;
};

const navItems = [
  { to: "/", label: "الرئيسية" },
  { to: "/brands", label: "العلامات التجارية" },
  { to: "/catalogs", label: "الكتالوجات" },
];

export function SiteHeader({ legalNameAr, parentGroupAr, whatsappNumber, logoUrl }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="h-0.5 w-full hq-rule" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="grid size-12 place-items-center overflow-hidden rounded-full border border-border bg-card shadow-sm">
            {logoUrl ? (
              <img src={logoUrl} alt={`شعار ${legalNameAr}`} className="size-full object-contain p-1" />
            ) : (
              <span className="text-xs font-bold text-trust-700">رت</span>
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-arabic text-sm font-bold text-foreground md:text-[15px]">{legalNameAr}</div>
            {parentGroupAr ? (
              <div className="truncate text-[10px] font-medium tracking-wider text-ink-600">{parentGroupAr}</div>
            ) : null}
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-semibold text-ink-600 lg:flex">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-trust-700" }}
              activeOptions={{ exact: n.to === "/" }}
              className="relative transition-colors hover:text-trust-700"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <WhatsAppCTA number={whatsappNumber} variant="pill" className="hidden sm:inline-flex">
          استفسار سريع
        </WhatsAppCTA>
      </div>
    </header>
  );
}
