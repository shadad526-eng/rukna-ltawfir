import { LLink } from "@/i18n/LLink";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, listBrands } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const brandsQO = queryOptions({ queryKey: ["brands"], queryFn: () => listBrands() });

export const Route = createFileRoute("/$lang/about")({
  head: ({ params }) => {
    const url = `https://rukna-ltawfir.lovable.app/${params.lang}/about`;
    return {
      meta: [
        { title: "من نحن — ركن التوفير كوزمتك للتجارة" },
        { name: "description", content: "قصة ركن التوفير: الوكيل الحصري لمنظومة من العلامات الصحية العالمية في اليمن. رؤيتنا، مهمتنا، قيمنا، وموقعنا الاستراتيجي." },
        { property: "og:title", content: "من نحن — ركن التوفير" },
        { property: "og:description", content: "وكيل حصري لعلامات صحية عالمية في اليمن، بحوكمة مؤسسية وأصول رسمية." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
    ]);
  },
  component: AboutPage,
});

function AboutPage() {
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brands } = useSuspenseQuery(brandsQO);

  const pillars = [
    { t: "قصتنا", d: "بدأت ركن التوفير كوزمتك للتجارة كذراع تجاري متخصص في تمثيل العلامات الصحية العالمية داخل السوق اليمنية، وتطوّرت لتصبح المقرّ الرسمي لمنظومة متكاملة من العلامات الموثوقة." },
    { t: "مهمتنا", d: "تقديم منتجات صحية أصلية وموثّقة من الشركات العالمية مباشرة إلى المستهلك اليمني، مع ضمان جودة التخزين والتوزيع وسلامة سلسلة الإمداد." },
    { t: "رؤيتنا", d: "أن نكون البوابة المرجعية للمنتجات الصحية العالمية في اليمن، ونقطة الإسناد الأولى للموزعين والمستشفيات والصيدليات والمستهلكين الباحثين عن الأصالة." },
    { t: "قيمنا", d: "الشفافية، الأصالة، الاحترام التحريري للعلامات، الالتزام بالحوكمة، وحماية بيانات الشركاء التجاريين." },
    { t: "موقعنا الاستراتيجي", d: "وكيل حصري لعدد من العلامات الدولية، بشبكة توزيع تغطّي المحافظات اليمنية، وقناة تواصل تجارية موحّدة عبر واتساب الأعمال الرسمي." },
  ];

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
          <div className="hq-eyebrow">عن الشركة</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            {id.legal_name_ar} — الوكيل الحصري للعلامات الصحية في اليمن
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            وكيل حصري لمنظومة من العلامات الصحية العالمية في الجمهورية اليمنية، نعمل بمعايير حوكمة
            مؤسسية تحمي العلامة والعميل والشريك التجاري.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((p, i) => (
            <article key={p.t} className="prem-card relative p-7 md:p-9">
              <div className="text-[10px] font-bold tracking-[0.24em] text-trust-700">0{i + 1}</div>
              <h2 className="mt-3 font-arabic text-2xl font-bold text-foreground">{p.t}</h2>
              <div className="mt-4 h-px w-12 prem-divider" />
              <p className="mt-4 text-[15px] leading-loose text-ink-600">{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="hq-eyebrow">المنظومة الكاملة</div>
          <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
            علامات نمثّلها رسميًا
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {brands.map((b) => (
              <LLink
                key={b.id}
                to="/$lang/brands/$slug"
                params={{ slug: b.slug }}
                className="podium grid h-24 place-items-center p-3 transition-transform hover:-translate-y-1"
                title={b.name_ar}
              >
                {b.logo_url ? (
                  <img src={b.logo_url} alt={b.name_ar} className="max-h-14 w-auto object-contain" loading="lazy" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground">{b.name_en}</span>
                )}
              </LLink>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center md:px-8">
        <h2 className="font-arabic text-3xl font-bold text-foreground md:text-4xl">
          هل ترغب في فتح قناة تجارية معنا؟
        </h2>
        <p className="mt-4 text-ink-600">جميع الاستفسارات التجارية تمرّ عبر واتساب الأعمال الرسمي.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <WhatsAppCTA number={id.whatsapp_number}>تواصل تجاري عبر واتساب</WhatsAppCTA>
          <LLink
            to="/$lang/partners"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-trust-700 hover:text-trust-700"
          >
            صفحة الشراكات
          </LLink>
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
