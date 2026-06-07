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
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <div className="text-lg font-bold">{legalNameAr}</div>
          {parentGroupAr ? <div className="mt-1 text-sm opacity-70">{parentGroupAr}</div> : null}
          <p className="mt-4 max-w-md text-sm leading-relaxed opacity-80">
            البوابة الرسمية لمجموعة العلامات التجارية الصحية في اليمن. نلتزم بأعلى معايير الجودة والشفافية.
          </p>
          <div className="mt-5 inline-block h-1 w-16 rounded-full bg-accent" />
        </div>
        <div className="text-sm leading-loose opacity-90">
          <div className="mb-2 font-semibold">روابط</div>
          <ul className="space-y-1">
            <li><Link to="/brands" className="hover:text-accent">العلامات التجارية</Link></li>
            <li><Link to="/catalogs" className="hover:text-accent">الكتالوجات</Link></li>
          </ul>
        </div>
        <div className="text-sm leading-loose opacity-90">
          <div className="mb-2 font-semibold">التواصل</div>
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
