import { Link } from "@tanstack/react-router";

type Props = {
  legalNameAr: string;
  parentGroupAr: string | null;
  whatsappNumber: string;
  email: string | null;
  addressAr: string | null;
};

export function SiteFooter({ legalNameAr, parentGroupAr, whatsappNumber, email, addressAr }: Props) {
  return (
    <footer className="mt-24 border-t border-border bg-trust-900 text-sand-50">
      <div className="h-0.5 w-full hq-rule" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="font-arabic text-xl font-bold">{legalNameAr}</div>
          {parentGroupAr ? <div className="mt-1 text-sm opacity-70">{parentGroupAr}</div> : null}
          <p className="mt-5 max-w-md text-sm leading-loose opacity-80">
            المقرّ الرقمي لمنظومة العلامات التجارية الصحية في اليمن. نلتزم بأعلى معايير الجودة والشفافية والحوكمة المؤسسية.
          </p>
          <div className="mt-6 inline-block h-1 w-16 rounded-full bg-leaf-500" />
          <div className="mt-6 text-[11px] font-medium tracking-[0.18em] opacity-70">
            NO CAL · STEVIOLA · MONIVO · BABY TAWFIR · BAMBO FRESH · iSiS · SEKEM
          </div>
        </div>
        <div className="text-sm leading-loose opacity-90">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">روابط</div>
          <ul className="space-y-1.5">
            <li><Link to="/brands" className="hover:text-leaf-300">العلامات التجارية</Link></li>
            <li><Link to="/catalogs" className="hover:text-leaf-300">الكتالوجات</Link></li>
          </ul>
        </div>
        <div className="text-sm leading-loose opacity-90">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">التواصل</div>
          <div>واتساب: +967 {whatsappNumber}</div>
          {email ? <div>البريد: {email}</div> : null}
          {addressAr ? <div>العنوان: {addressAr}</div> : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs opacity-70 md:px-6">
          © {new Date().getFullYear()} {legalNameAr}. جميع الحقوق محفوظة. الأسعار التجارية لا تُعرض على الموقع العام.
        </div>
      </div>
    </footer>
  );
}
