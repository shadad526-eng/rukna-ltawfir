import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminUploadArticleInline } from "@/lib/admin.functions";
import { fileToBase64 } from "@/lib/file-to-base64";
import { HEADING_COLOR_PRESETS } from "@/lib/page-content";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Link as LinkIcon,
  Image as ImageIcon, Table as TableIcon, Undo, Redo, Eraser, Code,
  AlignRight, AlignCenter, AlignLeft, Palette,
} from "lucide-react";

type Props = {
  value: string | null | undefined;
  onChange: (html: string) => void;
  onPickImage?: () => void;
  dir?: "rtl" | "ltr" | "auto";
  minHeight?: number;
  /** Paragraph mode: hides block-level tools (headings, tables, code, images). */
  compact?: boolean;
};

function exec(cmd: string, arg?: string) {
  document.execCommand(cmd, false, arg);
}

export function RichTextEditor({ value, onChange, onPickImage, dir = "auto", minHeight = 240, compact = false }: Props) {

  const ref = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const uploadInlineFn = useServerFn(adminUploadArticleInline);
  const [raw, setRaw] = useState(value ?? "");


  // Only inject initial value; don't clobber cursor on every keystroke.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value ?? "")) {
      ref.current.innerHTML = value ?? "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setRaw(value ?? ""); }, [value]);

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function saveSelection() {
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    if (savedRange.current) {
      sel.addRange(savedRange.current);
    } else {
      const r = document.createRange();
      r.selectNodeContents(el);
      r.collapse(false);
      sel.addRange(r);
    }
  }

  async function uploadAndInsert(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!(file.type || "").startsWith("image/")) continue;
        const base64 = await fileToBase64(file);
        const res: any = await uploadInlineFn({
          data: { filename: file.name, base64, contentType: file.type || "image/jpeg" },
        });
        const url = res?.url ?? "";
        if (!url) throw new Error("تعذّر رفع الصورة");
        restoreSelection();
        const alt = file.name.replace(/\.[a-zA-Z0-9]+$/, "").replace(/[<>"]/g, "");
        exec(
          "insertHTML",
          `<img src="${url}" data-inline-image="1" alt="${alt}" style="max-width:100%;height:auto" /><p><br /></p>`,
        );
        emit();
      }
      toast.success("تم إدراج الصورة");
    } catch (e: any) {
      toast.error(e?.message ?? "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }


  function insertLink() {
    const url = prompt("رابط:", "https://");
    if (url) exec("createLink", url);
    emit();
  }
  function insertTable() {
    const html =
      '<table class="rte-table"><thead><tr><th>عنوان</th><th>عنوان</th></tr></thead>' +
      '<tbody><tr><td>خلية</td><td>خلية</td></tr><tr><td>خلية</td><td>خلية</td></tr></tbody></table><p></p>';
    exec("insertHTML", html);
    emit();
  }
  function insertImage() {
    saveSelection();
    if (onPickImage) return onPickImage();
    fileRef.current?.click();
  }

  const Btn = ({ onClick, title, children }: any) => (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={title}
      className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white">
      {children}
    </button>
  );

  function applyColor(color: string) {
    restoreSelection();
    try { document.execCommand("styleWithCSS", false, "true"); } catch { /* older engines */ }
    exec("foreColor", color);
    setColorOpen(false);
    emit();
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-slate-800 bg-slate-900/60">
        {!compact && (
          <>
            <Btn onClick={() => { exec("formatBlock", "H1"); emit(); }} title="عنوان 1"><Heading1 className="w-4 h-4" /></Btn>
            <Btn onClick={() => { exec("formatBlock", "H2"); emit(); }} title="عنوان 2"><Heading2 className="w-4 h-4" /></Btn>
            <Btn onClick={() => { exec("formatBlock", "H3"); emit(); }} title="عنوان 3"><Heading3 className="w-4 h-4" /></Btn>
            <div className="w-px h-5 bg-slate-800 mx-1" />
          </>
        )}
        <Btn onClick={() => { exec("bold"); emit(); }} title="غامق"><Bold className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("italic"); emit(); }} title="مائل"><Italic className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("underline"); emit(); }} title="تحته خط"><Underline className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("strikeThrough"); emit(); }} title="يتوسطه خط"><Strikethrough className="w-4 h-4" /></Btn>

        <div className="w-px h-5 bg-slate-800 mx-1" />
        <div className="relative">
          <button type="button" title="لون النص"
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
            onClick={() => setColorOpen((o) => !o)}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white">
            <Palette className="w-4 h-4" />
          </button>
          {colorOpen && (
            <div className="absolute z-30 mt-1 w-52 rounded-lg border border-slate-700 bg-slate-900 p-1.5 shadow-xl">
              {HEADING_COLOR_PRESETS.map((c) => (
                <button key={c.value} type="button" onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyColor(c.value)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-right text-xs text-slate-200 hover:bg-slate-800">
                  <span className="size-3.5 shrink-0 rounded-full border border-slate-600" style={{ background: c.value }} />
                  {c.label}
                </button>
              ))}
              <button type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => { restoreSelection(); exec("removeFormat"); setColorOpen(false); emit(); }}
                className="mt-1 w-full rounded px-2 py-1.5 text-right text-xs text-slate-400 hover:bg-slate-800">
                إزالة اللون
              </button>
            </div>
          )}
        </div>
        <Btn onClick={() => { exec("justifyRight"); emit(); }} title="محاذاة لليمين"><AlignRight className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("justifyCenter"); emit(); }} title="توسيط"><AlignCenter className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("justifyLeft"); emit(); }} title="محاذاة لليسار"><AlignLeft className="w-4 h-4" /></Btn>

        <div className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={() => { exec("insertUnorderedList"); emit(); }} title="قائمة نقطية"><List className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("insertOrderedList"); emit(); }} title="قائمة مرقمة"><ListOrdered className="w-4 h-4" /></Btn>
        {!compact && (
          <>
            <Btn onClick={() => { exec("formatBlock", "BLOCKQUOTE"); emit(); }} title="اقتباس"><Quote className="w-4 h-4" /></Btn>
            <Btn onClick={() => { exec("formatBlock", "PRE"); emit(); }} title="كود"><Code className="w-4 h-4" /></Btn>
          </>
        )}
        <div className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={insertLink} title="رابط"><LinkIcon className="w-4 h-4" /></Btn>
        {!compact && (
          <>
            <Btn onClick={insertImage} title={uploading ? "جارٍ رفع الصورة…" : "صورة من الجهاز"}>
              <ImageIcon className={`w-4 h-4 ${uploading ? "animate-pulse text-emerald-400" : ""}`} />
            </Btn>
            <Btn onClick={insertTable} title="جدول"><TableIcon className="w-4 h-4" /></Btn>
          </>
        )}
        <div className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={() => { exec("undo"); emit(); }} title="تراجع"><Undo className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("redo"); emit(); }} title="إعادة"><Redo className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("removeFormat"); emit(); }} title="مسح التنسيق"><Eraser className="w-4 h-4" /></Btn>

        <div className="flex-1" />
        <button type="button" onClick={() => {
          if (source) { if (ref.current) ref.current.innerHTML = raw; onChange(raw); }
          setSource(!source);
        }} className="text-xs px-2 py-1 rounded hover:bg-slate-700 text-slate-400">
          {source ? "معاينة" : "HTML"}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        multiple
        onChange={(e) => {
          uploadAndInsert(e.target.files);
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      {source ? (
        <textarea
          dir="ltr"
          value={raw}
          onChange={(e) => { setRaw(e.target.value); onChange(e.target.value); }}
          className="w-full bg-slate-950 p-3 font-mono text-xs focus:outline-none"
          style={{ minHeight }}
        />
      ) : (
        <div
          ref={ref}
          dir={dir}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={() => { saveSelection(); emit(); }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text/plain");
            if (text && !e.clipboardData.getData("text/html")) {
              e.preventDefault();
              exec("insertText", text);
              emit();
            }
          }}
          className="rte-content w-full p-4 focus:outline-none prose prose-invert prose-sm max-w-none"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
