import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Link as LinkIcon,
  Image as ImageIcon, Table as TableIcon, Undo, Redo, Eraser, Code,
} from "lucide-react";

type Props = {
  value: string | null | undefined;
  onChange: (html: string) => void;
  onPickImage?: () => void;
  dir?: "rtl" | "ltr" | "auto";
  minHeight?: number;
};

function exec(cmd: string, arg?: string) {
  document.execCommand(cmd, false, arg);
}

export function RichTextEditor({ value, onChange, onPickImage, dir = "auto", minHeight = 240 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState(false);
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
    if (onPickImage) return onPickImage();
    const url = prompt("رابط الصورة:", "https://");
    if (url) exec("insertImage", url);
    emit();
  }

  const Btn = ({ onClick, title, children }: any) => (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={title}
      className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white">
      {children}
    </button>
  );

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-slate-800 bg-slate-900/60">
        <Btn onClick={() => { exec("formatBlock", "H1"); emit(); }} title="عنوان 1"><Heading1 className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("formatBlock", "H2"); emit(); }} title="عنوان 2"><Heading2 className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("formatBlock", "H3"); emit(); }} title="عنوان 3"><Heading3 className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={() => { exec("bold"); emit(); }} title="غامق"><Bold className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("italic"); emit(); }} title="مائل"><Italic className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("underline"); emit(); }} title="تحته خط"><Underline className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("strikeThrough"); emit(); }} title="يتوسطه خط"><Strikethrough className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={() => { exec("insertUnorderedList"); emit(); }} title="قائمة نقطية"><List className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("insertOrderedList"); emit(); }} title="قائمة مرقمة"><ListOrdered className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("formatBlock", "BLOCKQUOTE"); emit(); }} title="اقتباس"><Quote className="w-4 h-4" /></Btn>
        <Btn onClick={() => { exec("formatBlock", "PRE"); emit(); }} title="كود"><Code className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={insertLink} title="رابط"><LinkIcon className="w-4 h-4" /></Btn>
        <Btn onClick={insertImage} title="صورة"><ImageIcon className="w-4 h-4" /></Btn>
        <Btn onClick={insertTable} title="جدول"><TableIcon className="w-4 h-4" /></Btn>
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
          onBlur={emit}
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
