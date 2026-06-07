import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCorporateIdentity, listBrands } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { BrandCard } from "@/components/site/BrandCard";


const identityQO = queryOptions({ queryKey: ["corporate-identity"], queryFn: () => getCorporateIdentity() });
const brandsQO = queryOptions({ queryKey: ["brands"], queryFn: () => listBrands() });

export const Route = createFileRoute("/$lang/brands/")({
  head: () => ({
    meta: [
      { title: "العلامات التجارية — ركن التوفير كوزمتك للتجارة" },
      { name: "description", content: "العلامات الصحية الرسمية الممثلة عبر منظومة ركن التوفير في اليمن: iSiS, SEKEM, Steviola, NO CAL, Monivo, Baby Tawfir, Bambo Fresh." },
      { property: "og:title", content: "العلامات التجارية — ركن التوفير" },
      { property: "og:description", content: "علامات صحية رسمية ضمن منظومة ركن التوفير." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(identityQO),
      context.queryClient.ensureQueryData(brandsQO),
    ]);
  },
  component: BrandsPage,
  errorComponent: ({ error }) => <ErrorState message={error.message} />,
});

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">تعذّر تحميل العلامات</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function BrandsPage() {
  const { data: id } = useSuspenseQuery(identityQO);
  const { data: brands } = useSuspenseQuery(brandsQO);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        legalNameAr={id.legal_name_ar}
        parentGroupAr={id.parent_group_ar}
        whatsappNumber={id.whatsapp_number}
        logoUrl={id.logo_url}
      />

      <section className="relative overflow-hidden cinema-hero">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--trust-700) 1px, transparent 1px), linear-gradient(90deg, var(--trust-700) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="hq-eyebrow">منظومة العلامات</div>
          <h1 className="mt-3 font-arabic text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
            دليل العلامات التجارية
          </h1>
          <div className="mt-6 h-px w-28 prem-divider" />
          <p className="mt-6 max-w-3xl text-base leading-loose text-ink-600 md:text-lg">
            ثمانٍ علامات صحية عالمية ضمن مظلة ركن التوفير. الشعارات وصور المنتجات تُعرض حصرًا من
            الأصول الرسمية للعلامة، دون أي إعادة تصميم.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b, idx) => (
            <BrandCard key={b.id} brand={b} index={idx} ctaLabel="استعراض المنتجات" />
          ))}
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
