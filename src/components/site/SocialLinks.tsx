import React from "react";

const socials = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/198SE8GVYT/",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.03 0-2.804.61-2.804 2.397v1.57h3.99l-.532 3.667h-3.458v8.041A11.965 11.965 0 0 1 0 12C0 5.373 5.373 0 12 0s12 5.373 12 12-5.373 12-12 12c-1.023 0-2.02-.128-2.973-.369z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/rkn.altwfyr/",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@ruknaltawfersochi",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.83 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.88c.34 0 .67.06.97.16v-3.5a6.33 6.33 0 0 0-1-.08A6.4 6.4 0 0 0 2 16.72 6.4 6.4 0 0 0 8.4 23.12a6.4 6.4 0 0 0 6.4-6.4V9.12a8.17 8.17 0 0 0 4.79 1.54V7.33a4.85 4.85 0 0 1-1.03-.64z" />
      </svg>
    ),
  },
];

type SocialLinksProps = {
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md";
};

export function SocialLinks({ className = "", iconClassName = "", size = "md" }: SocialLinksProps) {
  const sizeClasses = size === "sm" ? "size-8" : "size-9";
  const iconSize = size === "sm" ? "size-4" : "size-[18px]";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className={`grid ${sizeClasses} place-items-center rounded-full border border-border/50 bg-card/50 text-ink-600 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-trust-300/70 hover:bg-trust-50/70 hover:text-trust-700 hover:shadow-md ${iconClassName}`}
        >
          <s.icon className={iconSize} />
        </a>
      ))}
    </div>
  );
}
