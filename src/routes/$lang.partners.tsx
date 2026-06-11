import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { WhatsAppCTA } from "@/components/site/WhatsAppCTA";

const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });

export const Route = createFileRoute("/$lang/partners")({
  head: ({ params }) => {
    const url = `https://rukna-ltawfir.lovable.app/${params.lang}/partners`;
    return {
      meta: [
        { title: "الشراكات التجارية — ركن التوفير كوزمتك للتجارة" },
        { name: "description", content: "فرص الشراكة للموزعين والصيدليات والمحلات الكبرى ضمن منظومة ركن التوفير. تواصل عبر واتساب الأعمال الرسمي." },
        { property: "og:title", content: "الشراكات التجارية — ركن التوفير" },
        { property: "og:description", content: "فرص الجملة والتوزيع لعلامات صحية عالمية في اليمن." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identityQO);
  },
  component: PartnersPage,
});

function PartnersPage() {
  const { data: id } = useSuspenseQuery(identityQO);

  const tiers = [
    { t: "موزعو الجملة", d: "موزعون إقليميون يحملون مخزون آمن من علامات المنظومة، مع أولوية في الإمداد والكتالوجات." },
    { t: "صيدليات ومستشفيات", d: "حسابات مهنية للحصول على المنتجات الصحية الأصلية مباشرة من الوكيل الحصري." },
    { t: "محلات ومراكز تجارية", d: "اتفاقيات عرض رفّي للعلامات الاستهلاكية ضمن نقاط البيع الكبرى." },
    { t: "شراكات رقمية", d: "متاجر إلكترونية موثّقة تعرض المنتجات الأصلية مع الكتالوجات الرسمية." },
  ];

  const advantages = [
    "أصول رسمية وكتالوجات معتمدة لكل علامة",
    "قناة تواصل تجارية واحدة عبر واتساب الأعمال",
    "حماية كاملة للعلامة ولأسعار الجملة الخاصة",
    "إسناد فني وتجاري مستمر لشركاء التوزيع",
  ];

  const waMsg =
    "السلام عليكم، أرغب بفتح حساب شراكة تجارية مع ركن التوفير.\n— الاسم/الشركة:\n— المدينة:\n— نوع النشاط:\n— العلامات المهتمة بها:";

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
          <div className="hq-eyebrow">شراكات الأعمال</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            ابدأ شراكتك التجارية معنا
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            للموزعين، الصيدليات، والمحلات الكبرى الراغبين في إدراج علامات المنظومة ضمن قنواتهم التجارية،
            نوفّر قناة تواصل موحّدة عبر واتساب الأعمال الرسمي بدلًا من النماذج العامة، لضمان سرعة الرد
            وسرّية شروط الشراكة.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppCTA number={id.whatsapp_number} message={waMsg}>
              فتح محادثة شراكة عبر واتساب
            </WhatsAppCTA>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="hq-eyebrow">قنوات الشراكة</div>
        <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
          أنواع الشراكات التي ندعمها
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t, i) => (
            <article key={t.t} className="prem-card relative p-6">
              <div className="text-[10px] font-bold tracking-[0.24em] text-trust-700">0{i + 1}</div>
              <h3 className="mt-3 font-arabic text-lg font-bold text-foreground">{t.t}</h3>
              <p className="mt-3 text-[13px] leading-loose text-ink-600">{t.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8">
          <div>
            <div className="hq-eyebrow">لماذا نحن</div>
            <h2 className="mt-3 font-arabic text-3xl font-bold text-foreground md:text-4xl">
              مزايا الشراكة مع ركن التوفير
            </h2>
            <ul className="mt-7 space-y-4">
              {advantages.map((a) => (
                <li key={a} className="flex items-start gap-3 text-[15px] leading-loose text-foreground">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-leaf-50 text-leaf-700">✓</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-8 md:p-10">
            <div className="hq-eyebrow">قناة التواصل الرسمية</div>
            <h3 className="mt-3 font-arabic text-2xl font-bold text-foreground">واتساب الأعمال</h3>
            <p className="mt-3 text-sm leading-loose text-ink-600">
              لا توجد نماذج عامة لعرض الأسعار. جميع طلبات الشراكة تُعالج مباشرة عبر القناة الرسمية لضمان سرعة الرد وسرية الشروط التجارية.
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-semibold text-ink-600">رقم واتساب الأعمال</div>
              <div className="mt-1 font-arabic text-xl font-bold text-trust-700">+967 {id.whatsapp_number}</div>
            </div>
            <div className="mt-6">
              <WhatsAppCTA number={id.whatsapp_number} message={waMsg} className="w-full">
                إرسال طلب الشراكة الآن
              </WhatsAppCTA>
            </div>
          </div>
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
