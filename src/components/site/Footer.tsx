type Props = {
  legalNameAr: string;
  parentGroupAr: string | null;
  whatsappNumber: string;
  email: string | null;
  addressAr: string | null;
};

export function SiteFooter({ legalNameAr, parentGroupAr, whatsappNumber, email, addressAr }: Props) {
  return (
    <footer
      className="mt-24 text-sand-50"
      style={{ background: "linear-gradient(180deg, var(--trust-900), var(--ink-900))" }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <div className="text-lg font-bold">{legalNameAr}</div>
          {parentGroupAr ? <div className="mt-1 text-sm opacity-70">{parentGroupAr}</div> : null}
          <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-80">
            البوابة الرسمية لمجموعة العلامات التجارية الصحية في اليمن. نلتزم بأعلى معايير الجودة والشفافية.
          </p>
        </div>
        <div className="text-sm leading-loose opacity-85">
          <div className="mb-2 font-semibold opacity-100">التواصل</div>
          <div>واتساب: +967 {whatsappNumber}</div>
          {email ? <div>البريد: {email}</div> : null}
          {addressAr ? <div>العنوان: {addressAr}</div> : null}
        </div>
        <div className="text-sm leading-loose opacity-85">
          <div className="mb-2 font-semibold opacity-100">حوكمة المحتوى</div>
          <div>الأسعار التجارية لا تُعرض على الموقع العام.</div>
          <div>الاستفسارات التجارية عبر قسم شركاء الجملة.</div>
          <div>جميع الصور والشعارات ملكية أصحابها الأصليين.</div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs opacity-70 md:px-6">
          © {new Date().getFullYear()} {legalNameAr}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
