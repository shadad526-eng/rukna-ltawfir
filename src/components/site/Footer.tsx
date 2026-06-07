import { Link } from "@tanstack/react-router";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { SocialLinks } from "./SocialLinks";

type Props = {
  legalNameAr: string;
  parentGroupAr: string | null;
  whatsappNumber: string;
  email: string | null;
  addressAr: string | null;
};

export function SiteFooter({ legalNameAr, parentGroupAr, whatsappNumber, email, addressAr }: Props) {
  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="aurora-mesh text-sand-50">
        <div className="absolute inset-x-0 top-0 h-px hq-rule" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-12 md:px-8">
          <div className="md:col-span-5">
            <div className="font-arabic text-2xl font-bold">{legalNameAr}</div>
            {parentGroupAr ? <div className="mt-1 text-sm opacity-70">{parentGroupAr}</div> : null}
            <p className="mt-5 max-w-md text-sm leading-loose opacity-85">
              المقرّ الرقمي لمنظومة العلامات التجارية الصحية في اليمن. شراكات حصرية، أصول رسمية،
              وحوكمة مؤسسية على أعلى المعايير.
            </p>
            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl glass-dark px-4 py-3">
              <span className="grid size-9 place-items-center rounded-full bg-leaf-500 text-trust-900">↗</span>
              <div className="text-sm">
                <div className="font-bold">قناة التواصل الرسمية</div>
                <div className="opacity-80">واتساب الأعمال — +967 {whatsappNumber}</div>
              </div>
            </div>
            <div className="mt-7 text-[11px] font-medium tracking-[0.22em] opacity-70">
              NO CAL · STEVIOLA · MONIVO · BABY TAWFIR · BAMBO · Y-KELIN · iSiS · SEKEM
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">المنظومة</div>
            <ul className="space-y-2 text-sm opacity-90">
              <li><Link to="/$lang/" className="hover:text-leaf-300">الرئيسية</Link></li>
              <li><Link to="/$lang/brands" className="hover:text-leaf-300">العلامات التجارية</Link></li>
              <li><Link to="/$lang/catalogs" className="hover:text-leaf-300">الكتالوجات الرسمية</Link></li>
              <li><Link to="/$lang/about" className="hover:text-leaf-300">من نحن</Link></li>
              <li><Link to="/$lang/partners" className="hover:text-leaf-300">الشراكة التجارية</Link></li>
              <li><Link to="/$lang/contact" className="hover:text-leaf-300">تواصل معنا</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">التواصل</div>
            <ul className="space-y-2 text-sm leading-loose opacity-90">
              <li>واتساب: +967 {whatsappNumber}</li>
              {email ? <li>البريد: {email}</li> : null}
              {addressAr ? <li>العنوان: {addressAr}</li> : null}
            </ul>
            <div className="mt-5">
              <WhatsAppCTA number={whatsappNumber} variant="pill">بدء استفسار تجاري</WhatsAppCTA>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-60">تابعنا</span>
              <span className="h-px flex-1 bg-white/10" />
              <SocialLinks size="sm" variant="footer" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs opacity-75 md:flex-row md:px-8 md:text-right">
            <div>© {new Date().getFullYear()} {legalNameAr}. جميع الحقوق محفوظة.</div>
            <div>الأسعار التجارية لا تُعرض على الموقع العام — تُمنح عبر القنوات الرسمية.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
