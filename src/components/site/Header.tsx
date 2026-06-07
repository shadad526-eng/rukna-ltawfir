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
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 place-items-center overflow-hidden rounded-full border border-border bg-card">
            {logoUrl ? (
              <img src={logoUrl} alt={`شعار ${legalNameAr}`} className="size-full object-contain" />
            ) : (
              <span className="text-xs font-bold text-primary">رت</span>
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold text-foreground md:text-base">{legalNameAr}</div>
            {parentGroupAr ? (
              <div className="truncate text-[11px] text-muted-foreground">{parentGroupAr}</div>
            ) : null}
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 lg:flex">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
              className="transition-colors hover:text-primary"
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
