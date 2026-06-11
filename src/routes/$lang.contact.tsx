import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";
import { useState } from "react";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) => {
    const url = `https://rukna-ltawfir.lovable.app/${params.lang}/contact`;
    return {
      meta: [
        { title: "تواصل معنا — ركن التوفير كوزمتك للتجارة" },
        { name: "description", content: "تواصل مباشر مع ركن التوفير عبر واتساب الأعمال، الهاتف، والبريد الإلكتروني. قناة موحّدة لجميع الاستفسارات التجارية." },
        { property: "og:title", content: "تواصل معنا — ركن التوفير" },
        { property: "og:description", content: "قنوات التواصل الرسمية مع المقرّ الرقمي لركن التوفير." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identityQO);
  },
  component: ContactPage,
});

function ContactPage() {
  const { data: id } = useSuspenseQuery(identityQO);
  const [subject, setSubject] = useState("استفسار عام");
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");

  const composed =
    `السلام عليكم،\nالاسم: ${name || "—"}\nالموضوع: ${subject}\nالتفاصيل: ${details || "—"}`;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="relative overflow-hidden cinema-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="hq-eyebrow">تواصل معنا</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            قنوات التواصل الرسمية
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            نعتمد واتساب الأعمال قناةً أساسية لجميع الاستفسارات التجارية والاستهلاكية، لضمان سرعة
            الردّ وحماية بيانات العميل.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "واتساب الأعمال", v: `+967 ${id.whatsapp_number}`, hint: "الأسرع للردّ التجاري" },
            { t: "البريد الإلكتروني", v: id.email ?? "—", hint: "للمراسلات الرسمية" },
            { t: "العنوان", v: id.address_ar ?? "الجمهورية اليمنية", hint: "المقرّ الرئيسي" },
          ].map((c) => (
            <div key={c.t} className="prem-card p-6">
              <div className="hq-eyebrow">{c.hint}</div>
              <div className="mt-2 font-arabic text-lg font-bold text-foreground">{c.t}</div>
              <div className="mt-2 text-sm leading-relaxed text-ink-600 break-words">{c.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-20">
          <div>
            <div className="hq-eyebrow">نموذج استفسار سريع</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
              صياغة رسالة واتساب جاهزة
            </h2>
            <p className="mt-4 text-sm leading-loose text-ink-600">
              املأ الحقول التالية ثم اضغط إرسال — ستفتح محادثة واتساب الأعمال مع رسالة جاهزة بكامل بياناتك.
              لا يتم تخزين أي بيانات على الخادم.
            </p>
          </div>
          <form
            className="glass rounded-3xl p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              const url = `https://wa.me/967${id.whatsapp_number}?text=${encodeURIComponent(composed)}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            <label className="block text-xs font-semibold text-ink-600">الاسم أو اسم الجهة</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:border-trust-700 focus:outline-none"
              placeholder="مثال: شركة الفجر للتوزيع"
            />
            <label className="mt-4 block text-xs font-semibold text-ink-600">الموضوع</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:border-trust-700 focus:outline-none"
            >
              <option>استفسار عام</option>
              <option>استفسار عن منتج</option>
              <option>طلب شراكة تجارية / توزيع</option>
              <option>طلب كتالوج رسمي</option>
              <option>دعم بعد البيع</option>
            </select>
            <label className="mt-4 block text-xs font-semibold text-ink-600">تفاصيل إضافية</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:border-trust-700 focus:outline-none"
              placeholder="اذكر العلامة أو المنتج محل الاستفسار، والمدينة"
            />
            <button
              type="submit"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 wa-pulse"
            >
              فتح محادثة واتساب جاهزة
            </button>
            <div className="mt-3 text-center text-[11px] text-ink-600">
              أو تواصل مباشرة عبر <WhatsAppCTA number={id.whatsapp_number} variant="pill" className="!inline !px-3 !py-1 !text-[11px]">واتساب الأعمال</WhatsAppCTA>
            </div>
          </form>
        </div>
      </section>

      <SiteFooter
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        email={id.email}
        addressAr={id.address_ar}
      />
    </div>
  );
}
