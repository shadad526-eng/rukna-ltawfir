import { useLocale } from "@/i18n/LocaleProvider";

type IdentityShape = {
  legal_name_ar: string;
  legal_name_en?: string | null;
  parent_group_ar: string | null;
  parent_group_en?: string | null;
  address_ar: string | null;
  address_en?: string | null;
};

/**
 * Localised corporate identity. Every value comes from the `corporate_identity`
 * record managed in the dashboard — English falls back to Arabic only when the
 * English value has not been filled in yet.
 */
export function useLocalizedIdentity(id: IdentityShape) {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  return {
    legalName: isAr ? id.legal_name_ar : id.legal_name_en || id.legal_name_ar,
    parentGroup: isAr ? id.parent_group_ar : id.parent_group_en || id.parent_group_ar,
    address: isAr ? id.address_ar : id.address_en || id.address_ar,
  };
}

export function localizedBrandName(b: { name_ar: string; name_en: string }, lang: string) {
  return lang === "ar" ? b.name_ar : b.name_en;
}
