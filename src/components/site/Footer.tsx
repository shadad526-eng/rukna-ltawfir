import { LLink } from "@/i18n/LLink";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { SocialLinks } from "./SocialLinks";
import { useT } from "@/i18n/LocaleProvider";
import { useQuery } from "@tanstack/react-query";
import { getCorporateIdentity } from "@/lib/site.functions";

type Props = {
  legalName: string;
  parentGroup: string | null;
  whatsappNumber: string;
  email: string | null;
  address: string | null;
  logoUrl?: string | null;
};

export function SiteFooter({ legalName, parentGroup, whatsappNumber, email, address, logoUrl }: Props) {
  const t = useT();
  const { data } = useQuery({
    queryKey: ["corporate-identity"],
    queryFn: () => getCorporateIdentity(),
    staleTime: 60_000,
  });
  const footerLogoUrl = logoUrl ?? data?.logo_url ?? null;
  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="aurora-mesh text-sand-50">
        <div className="absolute inset-x-0 top-0 h-px hq-rule" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-12 md:px-8">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4">
              {footerLogoUrl ? (
                <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/95 p-1.5 shadow-sm">
                  <img src={footerLogoUrl} alt={legalName} className="size-full object-contain" loading="lazy" />
                </div>
              ) : null}
              <div>
                <div className="font-arabic text-2xl font-bold">{legalName}</div>
                {parentGroup ? <div className="mt-1 text-sm opacity-70">{parentGroup}</div> : null}
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-loose opacity-85">{t("footer.tagline")}</p>
            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl glass-dark px-4 py-3">
              <span className="grid size-9 place-items-center rounded-full bg-leaf-500 text-trust-900">↗</span>
              <div className="text-sm">
                <div className="font-bold">{t("footer.whatsapp")}</div>
                <div className="opacity-80">+967 {whatsappNumber}</div>
              </div>
            </div>
            <div className="mt-7 text-[11px] font-medium tracking-[0.22em] opacity-70">
              NO CAL · STEVIOLA · MONIVO · BABY TAWFIR · BAMBO · Y-KELIN · iSiS · SEKEM
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">{t("footer.navColumn")}</div>
            <ul className="space-y-2 text-sm opacity-90">
              <li><LLink to="/$lang/" className="hover:text-leaf-300">{t("nav.home")}</LLink></li>
              <li><LLink to="/$lang/brands" className="hover:text-leaf-300">{t("nav.brands")}</LLink></li>
              <li><LLink to="/$lang/catalogs" className="hover:text-leaf-300">{t("nav.catalogs")}</LLink></li>
              <li><LLink to="/$lang/sugar-alternatives" className="hover:text-leaf-300">بدائل السكر</LLink></li>
              <li><LLink to="/$lang/about" className="hover:text-leaf-300">{t("nav.about")}</LLink></li>
              <li><LLink to="/$lang/partners" className="hover:text-leaf-300">{t("nav.partners")}</LLink></li>
              <li><LLink to="/$lang/contact" className="hover:text-leaf-300">{t("nav.contact")}</LLink></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">{t("footer.contactColumn")}</div>
            <ul className="space-y-2 text-sm leading-loose opacity-90">
              <li>{t("footer.whatsapp")}: +967 {whatsappNumber}</li>
              {email ? <li>{t("footer.email")}: {email}</li> : null}
              {address ? <li>{t("footer.address")}: {address}</li> : null}
            </ul>
            <div className="mt-5">
              <WhatsAppCTA number={whatsappNumber} variant="pill">{t("footer.startInquiry")}</WhatsAppCTA>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-60">{t("footer.follow")}</span>
              <span className="h-px flex-1 bg-white/10" />
              <SocialLinks size="sm" variant="footer" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs opacity-75 md:flex-row md:px-8 md:text-right">
            <div>© {new Date().getFullYear()} {legalName}. {t("footer.rightsReserved")}</div>
            <div>{t("footer.noticePrices")}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
