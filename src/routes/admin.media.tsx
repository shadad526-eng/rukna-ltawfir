import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminListStorage, adminUploadStorage, adminDeleteStorage } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Upload, Trash2, Copy, Image as ImageIcon, FileText } from "lucide-react";
import { fileToBase64 } from "@/lib/file-to-base64";

export const Route = createFileRoute("/admin/media")({ ssr: false, component: MediaPage });

const BUCKETS = ["brand-assets", "catalogs"];

function MediaPage() {
  const listFn = useServerFn(adminListStorage);
  const uploadFn = useServerFn(adminUploadStorage);
  const deleteFn = useServerFn(adminDeleteStorage);
  const [bucket, setBucket] = useState(BUCKETS[0]);
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try { setItems(await listFn({ data: { bucket } })); }
    catch (e: any) { toast.error(e.message); }
  }, [bucket, listFn]);
  useEffect(() => { load(); }, [load]);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      try {
        const base64 = await fileToBase64(file);
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        await uploadFn({ data: { bucket, path, base64, contentType: file.type || "application/octet-stream", registerAsset: true } });
        toast.success(`تم رفع ${file.name}`);
      } catch (e: any) { toast.error(`${file.name}: ${e.message}`); }
    }
    setBusy(false);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">مكتبة الوسائط</h1>
          <p className="text-sm text-slate-400 mt-1">إدارة الصور والملفات المرفوعة إلى Supabase Storage.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={bucket} onChange={(e) => setBucket(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm">
            {BUCKETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <button onClick={() => fileRef.current?.click()} disabled={busy}
            className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1.5 disabled:opacity-50">
            <Upload className="w-4 h-4" /> {busy ? "جارٍ الرفع…" : "رفع ملفات"}
          </button>
          <input ref={fileRef} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragOver ? "border-emerald-500 bg-emerald-500/5" : "border-slate-800 bg-slate-900/40"}`}
      >
        <Upload className="w-6 h-6 mx-auto text-slate-500" />
        <div className="text-sm text-slate-400 mt-2">اسحب الملفات هنا أو استخدم زر الرفع أعلاه</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((it) => {
          const isImage = (it.mime ?? "").startsWith("image/");
          return (
            <div key={it.path} className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                {isImage && it.url
                  ? <img src={it.url} alt={it.name} className="w-full h-full object-cover" loading="lazy" />
                  : <FileText className="w-10 h-10 text-slate-600" />}
              </div>
              <div className="p-2 text-xs">
                <div className="truncate text-slate-300" title={it.name}>{it.name}</div>
                <div className="text-slate-500 mt-0.5">{it.size ? `${Math.round(it.size / 1024)} KB` : ""}</div>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={() => { navigator.clipboard.writeText(it.path); toast.success("نُسخ المسار"); }}
                    className="flex-1 p-1 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center gap-1 text-slate-300">
                    <Copy className="w-3 h-3" /> نسخ
                  </button>
                  <button onClick={async () => {
                    if (!confirm("حذف هذا الملف؟")) return;
                    try { await deleteFn({ data: { bucket, path: it.path } }); toast.success("تم الحذف"); load(); }
                    catch (e: any) { toast.error(e.message); }
                  }} className="p-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 text-sm flex flex-col items-center gap-2">
            <ImageIcon className="w-8 h-8 text-slate-700" />
            لا توجد ملفات في هذه الحاوية.
          </div>
        )}
      </div>
    </div>
  );
}
