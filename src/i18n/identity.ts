import { useLocale } from "@/i18n/LocaleProvider";

const LEGAL_NAME_EN = "Rukn Al-Tawfir Cosmetic for Trade";
const PARENT_GROUP_EN = "Rukn Al-Tawfir Group";
const ADDRESS_EN_FALLBACK = "Republic of Yemen";

type IdentityShape = {
  legal_name_ar: string;
  parent_group_ar: string | null;
  address_ar: string | null;
};

export function useLocalizedIdentity(id: IdentityShape) {
  const { lang } = useLocale();
  const isAr = lang === "ar";
  return {
    legalName: isAr ? id.legal_name_ar : LEGAL_NAME_EN,
    parentGroup: isAr ? id.parent_group_ar : id.parent_group_ar ? PARENT_GROUP_EN : null,
    address: isAr ? id.address_ar : id.address_ar ?? ADDRESS_EN_FALLBACK,
  };
}

export function localizedBrandName(b: { name_ar: string; name_en: string }, lang: string) {
  return lang === "ar" ? b.name_ar : b.name_en;
}
