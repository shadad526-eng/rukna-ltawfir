type Props = {
  number: string;
  message?: string;
  variant?: "solid" | "pill";
  className?: string;
  children?: React.ReactNode;
};

export function WhatsAppCTA({ number, message, variant = "solid", className = "", children }: Props) {
  const text = message ?? "السلام عليكم، أرغب بالاستفسار عن منتجات ركن التوفير.";
  const href = `https://wa.me/967${number}?text=${encodeURIComponent(text)}`;
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold transition-transform hover:-translate-y-0.5 text-accent-foreground bg-accent wa-pulse";
  const shape = variant === "pill"
    ? "rounded-full px-6 py-3 text-sm"
    : "rounded-lg px-7 py-3.5 text-base";
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${shape} ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
        <path d="M20.5 3.5A11.7 11.7 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.7 6L0 24l6.2-1.6A12 12 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.5ZM12 22a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A10 10 0 1 1 22 12 10 10 0 0 1 12 22Zm5.5-7.5c-.3-.2-1.8-.9-2-1s-.5-.1-.7.1l-1 1.3c-.2.2-.3.2-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.5c.1-.1.2-.3.3-.5s0-.4 0-.6-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6 0-.9.4-.3.4-1.2 1.1-1.2 2.7s1.2 3.2 1.4 3.4c.2.3 2.4 3.6 5.8 5 .8.3 1.4.5 1.9.6.8.3 1.5.2 2 .2.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4Z"/>
      </svg>
      {children ?? "تواصل عبر واتساب"}
    </a>
  );
}
