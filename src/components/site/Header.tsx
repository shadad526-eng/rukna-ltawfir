import { Link } from "@tanstack/react-router";
import { WhatsAppCTA } from "./WhatsAppCTA";

type Props = {
  legalNameAr: string;
  parentGroupAr: string | null;
  whatsappNumber: string;
};

const navItems = [
  { to: "/", label: "الرئيسية" },
  { to: "/brands", label: "علاماتنا" },
  { to: "/about", label: "من نحن" },
  { to: "/b2b", label: "شركاء الجملة" },
  { to: "/contact", label: "تواصل" },
];

export function SiteHeader({ legalNameAr, parentGroupAr, whatsappNumber }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div
            className="grid size-10 place-items-center rounded-lg text-sm font-bold text-primary-foreground"
            style={{ background: "linear-gradient(135deg, var(--trust-700), var(--leaf-700))" }}
          >
            رت
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold text-foreground md:text-base">{legalNameAr}</div>
            {parentGroupAr ? (
              <div className="truncate text-[11px] text-muted-foreground">{parentGroupAr}</div>
            ) : null}
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 lg:flex">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-primary" }}
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
