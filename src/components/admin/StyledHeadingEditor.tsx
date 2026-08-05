import { useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Palette, RotateCcw } from "lucide-react";
import {
  HEADING_COLOR_PRESETS,
  HEADING_LIMITS,
  clampHeadingSize,
  normalizeHeading,
  type HeadingAlign,
  type HeadingValue,
} from "@/lib/page-content";

type Props = {
  /** Stored value: a plain string (legacy) or a styled-heading object. */
  value: unknown;
  onChange: (v: HeadingValue | string) => void;
  dir?: "rtl" | "ltr";
  placeholder?: string;
};

function toHeading(value: unknown): HeadingValue {
  if (typeof value === "string") return { html: value };
  return normalizeHeading(value) ?? { html: "" };
}

function exec(cmd: string, arg?: string) {
  document.execCommand(cmd, false, arg);
}

/**
 * Editor for major headings: short inline formatting plus responsive font-size,
 * weight, line-height, alignment and brand color presets.
 */
export function StyledHeadingEditor({ value, onChange, dir = "rtl", placeholder }: Props) {
  const h = toHeading(value);
  const ref = useRef<HTMLDivElement>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const lastHtml = useRef<string>(h.html ?? "");

  useEffect(() => {
    const incoming = h.html ?? "";
    if (ref.current && incoming !== lastHtml.current && incoming !== ref.current.innerHTML) {
      ref.current.innerHTML = incoming;
      lastHtml.current = incoming;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h.html]);

  const patch = (p: Partial<HeadingValue>) => onChange({ ...h, ...p });

  function emit() {
    const html = ref.current?.innerHTML ?? "";
    lastHtml.current = html;
    patch({ html });
  }

  function applyColor(color: string | null) {
    ref.current?.focus();
    try { document.execCommand("styleWithCSS", false, "true"); } catch { /* older engines */ }
    if (color) exec("foreColor", color);
    else exec("removeFormat");
    setColorOpen(false);
    emit();
  }

  const hasTypography = !!(h.sizeDesktop || h.sizeMobile || h.weight || h.lineHeight || h.align);
  const num = "w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-sm focus:border-emerald-500 focus:outline-none";
  const AlignBtn = ({ v, icon: Icon, title }: { v: HeadingAlign; icon: any; title: string }) => (
    <button type="button" title={title} onClick={() => patch({ align: h.align === v ? null : v })}
      className={`rounded p-1.5 ${h.align === v ? "bg-emerald-600/30 text-emerald-200" : "text-slate-300 hover:bg-slate-700"}`}>
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-800 bg-slate-900/60 p-1.5">
        <button type="button" title="غامق" onMouseDown={(e) => e.preventDefault()}
          onClick={() => { exec("bold"); emit(); }}
          className="rounded p-1.5 text-slate-300 hover:bg-slate-700"><Bold className="h-4 w-4" /></button>
        <button type="button" title="مائل" onMouseDown={(e) => e.preventDefault()}
          onClick={() => { exec("italic"); emit(); }}
          className="rounded p-1.5 text-slate-300 hover:bg-slate-700"><Italic className="h-4 w-4" /></button>
        <div className="relative">
          <button type="button" title="لون النص" onMouseDown={(e) => e.preventDefault()}
            onClick={() => setColorOpen((o) => !o)}
            className="rounded p-1.5 text-slate-300 hover:bg-slate-700"><Palette className="h-4 w-4" /></button>
          {colorOpen && (
            <div className="absolute z-30 mt-1 w-52 rounded-lg border border-slate-700 bg-slate-900 p-1.5 shadow-xl">
              {HEADING_COLOR_PRESETS.map((c) => (
                <button key={c.value} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyColor(c.value)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-right text-xs text-slate-200 hover:bg-slate-800">
                  <span className="size-3.5 shrink-0 rounded-full border border-slate-600" style={{ background: c.value }} />
                  {c.label}
                </button>
              ))}
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyColor(null)}
                className="mt-1 w-full rounded px-2 py-1.5 text-right text-xs text-slate-400 hover:bg-slate-800">إزالة اللون</button>
            </div>
          )}
        </div>
        <div className="flex-1" />
        {hasTypography && (
          <button type="button"
            onClick={() => patch({ sizeDesktop: null, sizeMobile: null, weight: null, lineHeight: null, align: null })}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-700">
            <RotateCcw className="h-3 w-3" /> التنسيق الافتراضي
          </button>
        )}
      </div>


      <div
        ref={ref}
        dir={dir}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder ?? ""}
        onPaste={(e) => {
          e.preventDefault();
          exec("insertText", e.clipboardData.getData("text/plain"));
          emit();
        }}
        onKeyDown={(e) => {
          // Manual line breaks are allowed; block paragraph splitting.
          if (e.key === "Enter") { e.preventDefault(); exec("insertLineBreak"); emit(); }
        }}
        className="rich-inline min-h-[52px] px-3 py-2.5 text-lg font-bold text-white focus:outline-none"
        style={{
          textAlign: h.align === "center" ? "center" : h.align === "end" ? "end" : undefined,
          fontWeight: h.weight ?? undefined,
        }}
      />

      <details className="border-t border-slate-800 bg-slate-900/40">
        <summary className="cursor-pointer select-none px-3 py-2 text-[11px] text-slate-400 hover:text-slate-200">
          تنسيق متقدم {hasTypography ? "• مُخصّص" : ""}
        </summary>
        <div className="flex items-center gap-1 px-2.5 pb-1">
          <span className="text-[11px] text-slate-400">المحاذاة</span>
          <AlignBtn v="start" icon={dir === "rtl" ? AlignRight : AlignLeft} title="محاذاة للبداية" />
          <AlignBtn v="center" icon={AlignCenter} title="توسيط" />
          <AlignBtn v="end" icon={dir === "rtl" ? AlignLeft : AlignRight} title="محاذاة للنهاية" />
        </div>
        <div className="grid grid-cols-2 gap-2 p-2.5 md:grid-cols-4">
          <label className="space-y-1 text-[11px] text-slate-400">
            <span>حجم الخط — سطح المكتب (px)</span>
            <input type="number" className={num} value={h.sizeDesktop ?? ""} placeholder="افتراضي"
              min={HEADING_LIMITS.desktop.min} max={HEADING_LIMITS.desktop.max}
              onChange={(e) => patch({ sizeDesktop: e.target.value === "" ? null : clampHeadingSize(e.target.value, "desktop") })} />
          </label>
          <label className="space-y-1 text-[11px] text-slate-400">
            <span>حجم الخط — الجوال (px)</span>
            <input type="number" className={num} value={h.sizeMobile ?? ""} placeholder="افتراضي"
              min={HEADING_LIMITS.mobile.min} max={HEADING_LIMITS.mobile.max}
              onChange={(e) => patch({ sizeMobile: e.target.value === "" ? null : clampHeadingSize(e.target.value, "mobile") })} />
          </label>
          <label className="space-y-1 text-[11px] text-slate-400">
            <span>سماكة الخط</span>
            <select className={num} value={h.weight ?? ""}
              onChange={(e) => patch({ weight: e.target.value === "" ? null : Number(e.target.value) })}>
              <option value="">افتراضي</option>
              {HEADING_LIMITS.weight.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-[11px] text-slate-400">
            <span>ارتفاع السطر</span>
            <input type="number" step="0.05" className={num} value={h.lineHeight ?? ""} placeholder="افتراضي"
              min={HEADING_LIMITS.lineHeight.min} max={HEADING_LIMITS.lineHeight.max}
              onChange={(e) => patch({ lineHeight: e.target.value === "" ? null : Number(e.target.value) })} />
          </label>
        </div>
      </details>
    </div>
  );
}

