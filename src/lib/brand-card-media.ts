import steviolaCard from "@/assets/brand-cards/steviola-card.json";
import nocalCard from "@/assets/brand-cards/nocal-card.json";
import babyTawfirCard from "@/assets/brand-cards/baby-tawfir-card.json";
import monivoCard from "@/assets/brand-cards/monivo-card.json";
import bamboCard from "@/assets/brand-cards/bambo-card.json";
import yKelinCard from "@/assets/brand-cards/y-kelin-card.json";
import sekemCard from "@/assets/brand-cards/sekem-card.json";
import isisCard from "@/assets/brand-cards/isis-card.json";

export const brandCardMediaBySlug: Record<string, string> = {
  steviola: steviolaCard.url,
  nocal: nocalCard.url,
  "no-cal": nocalCard.url,
  "baby-tawfir": babyTawfirCard.url,
  monivo: monivoCard.url,
  bambo: bamboCard.url,
  "y-kelin": yKelinCard.url,
  sekem: sekemCard.url,
  isis: isisCard.url,
};

export function getBrandCardMedia(slug: string) {
  return brandCardMediaBySlug[slug] ?? null;
}
