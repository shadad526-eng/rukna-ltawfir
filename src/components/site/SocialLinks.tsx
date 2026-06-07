import React from "react";

type Social = {
  name: string;
  label: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

const buildSocials = (whatsappNumber?: string): Social[] => {
  const list: Social[] = [];
  if (whatsappNumber) {
    const digits = whatsappNumber.replace(/\D/g, "");
    list.push({
      name: "WhatsApp",
      label: "واتساب",
      href: `https://wa.me/967${digits}`,
      icon: (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
        </svg>
      ),
    });
  }
  list.push(
    {
      name: "Instagram",
      label: "إنستجرام",
      href: "https://www.instagram.com/rkn.altwfyr/",
      icon: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      label: "فيسبوك",
      href: "https://www.facebook.com/share/198SE8GVYT/",
      icon: (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M13.5 21.95V13.5h2.86l.43-3.33H13.5V8.04c0-.96.27-1.62 1.65-1.62h1.76V3.44c-.3-.04-1.35-.13-2.57-.13-2.55 0-4.29 1.56-4.29 4.41v2.45H7.18v3.33h2.87v8.45h3.45z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      label: "تيك توك",
      href: "https://www.tiktok.com/@ruknaltawfersochi",
      icon: (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 3.31-4.42v-3.5a6.4 6.4 0 1 0 5.34 6.31V9.12a8.17 8.17 0 0 0 4.79 1.54V7.33a4.85 4.85 0 0 1-1.02-.64z" />
        </svg>
      ),
    },
  );
  return list;
};

type SocialLinksProps = {
  className?: string;
  size?: "sm" | "md";
  variant?: "header" | "footer";
  whatsappNumber?: string;
};

export function SocialLinks({
  className = "",
  size = "sm",
  variant = "header",
  whatsappNumber,
}: SocialLinksProps) {
  const socials = buildSocials(whatsappNumber);
  const iconSize = size === "sm" ? "size-[15px]" : "size-[17px]";
  const padding = size === "sm" ? "p-1.5" : "p-2";

  const base =
    variant === "footer"
      ? "text-white/55 hover:text-white"
      : "text-ink-500 hover:text-trust-700";

  return (
    <div className={`flex items-center gap-0.5 ${className}`} dir="ltr">
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          title={s.label}
          className={`group inline-flex items-center justify-center rounded-md ${padding} transition-all duration-300 ease-out ${base} hover:-translate-y-px`}
        >
          <s.icon
            className={`${iconSize} transition-transform duration-300 ease-out group-hover:scale-110`}
          />
        </a>
      ))}
    </div>
  );
}
