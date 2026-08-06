import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FileText, Search, Upload, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { adminSignedUrls, adminUploadStorage } from "@/lib/admin.functions";
import { fileToBase64 } from "@/lib/file-to-base64";
import { optimizeImageForUpload } from "@/lib/optimize-image";

export function AssetPicker({ onClose, onPick, accept }: {
  onClose: () => void;
  onPick: (id: string, url: string, info: { name: string; mime: string | null }) => void;
  accept: "image" | "pdf" | "any";
}) {
  const signUrls = useServerFn(adminSignedUrls);
  const uploadFn = useServerFn(adminUploadStorage);
  const [items, setItems] = useState<any[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    let query = supabase
      .from("assets")
      .select("id,storage_bucket,storage_path,original_filename,mime_type,channel,created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (accept === "image") query = query.like("mime_type", "image/%");
    else if (accept === "pdf") query = query.eq("mime_type", "application/pdf");
    const { data } = await query;
    setItems(data ?? []);
    if (data && data.length) {
      const signed = await signUrls({ data: { items: data.map((a: any) => ({ bucket: a.storage_bucket, path: a.storage_path })) } });
      const map: Record<string, string> = {};
      data.forEach((a: any) => {
        const u = signed[`${a.storage_bucket}::${a.storage_path}`];
        if (u) map[a.id] = u;
      });
      setUrls(map);
    }
  }, [signUrls, accept]);

  useEffect(() => { load(); }, [load]);

  const acceptAttr = accept === "image" ? "image/*" : accept === "pdf" ? "application/pdf" : undefined;

  async function upload(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const isPdf = (file.type || "") === "application/pdf";
        // Compress/resize images (WebP when supported) before uploading.
        const opt = isPdf
          ? { blob: file as Blob, contentType: file.type, filename: file.name }
          : await optimizeImageForUpload(file);
        const base64 = await fileToBase64(opt.blob);
        const bucket = isPdf ? "catalogs" : "brand-assets";
        const path = `${Date.now()}-${opt.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        await uploadFn({ data: { bucket, path, base64, contentType: opt.contentType || "application/octet-stream", registerAsset: true } });
        toast.success(`تم رفع ${file.name}`);
      }
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "فشل الرفع");
    } finally {
      setBusy(false);
    }
  }

  const filtered = q.trim()
    ? items.filter((a) => (a.original_filename ?? a.storage_path ?? "").toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="font-semibold">
            {accept === "pdf" ? "اختيار ملف PDF" : accept === "image" ? "اختيار صورة" : "اختيار من مكتبة الوسائط"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم…"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-2 text-sm" />
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
            className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 disabled:opacity-50 shrink-0">
            <Upload className="w-4 h-4" /> {busy ? "جارٍ الرفع…" : "رفع جديد"}
          </button>
          <input ref={fileRef} type="file" hidden accept={acceptAttr} multiple
            onChange={(e) => { upload(e.target.files); if (fileRef.current) fileRef.current.value = ""; }} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filtered.map((a) => {
            const url = urls[a.id];
            const isImg = (a.mime_type ?? "").startsWith("image/");
            return (
              <button key={a.id} type="button"
                onClick={() => onPick(a.id, url ?? "", { name: a.original_filename ?? a.storage_path, mime: a.mime_type })}
                className="text-right bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-lg overflow-hidden group">
                <div className="aspect-square bg-slate-900 flex items-center justify-center overflow-hidden">
                  {url && isImg
                    ? <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    : <FileText className="w-8 h-8 text-slate-600" />}
                </div>
                <div className="p-1.5 text-[11px] text-slate-300 truncate">{a.original_filename ?? a.storage_path.split("/").pop()}</div>
              </button>
            );
          })}
          {filtered.length === 0 && <div className="col-span-full text-center text-slate-500 text-sm py-12">لا توجد نتائج. ارفع ملفًا جديدًا من الأعلى.</div>}
        </div>
      </div>
    </div>
  );
}

