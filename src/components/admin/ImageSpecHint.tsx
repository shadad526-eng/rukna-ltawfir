import { useEffect, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";

import { checkImageAgainstSpec, describeSpec, getImageSpec } from "@/lib/image-specs";

/**
 * Shows the recommended dimensions for an upload destination and warns when the
 * currently selected image doesn't match them. Purely informational — it never
 * blocks saving and never modifies the uploaded file.
 */
export function ImageSpecHint({ specKey, previewUrl }: { specKey: string | null | undefined; previewUrl?: string | null }) {
  const spec = getImageSpec(specKey);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    setWarning(null);
    if (!spec || !previewUrl) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setWarning(checkImageAgainstSpec(spec, img.naturalWidth, img.naturalHeight));
    };
    img.src = previewUrl;
    return () => { cancelled = true; };
  }, [spec, previewUrl]);

  if (!spec) return null;
  const lines = describeSpec(spec);

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1.5 rounded-md border border-slate-800 bg-slate-950/60 px-2.5 py-2 text-[11px] leading-5 text-slate-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
        <div>
          {lines.map((l) => <div key={l}>{l}</div>)}
        </div>
      </div>
      {warning && (
        <div className="flex gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-[11px] leading-5 text-amber-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>{warning}</div>
        </div>
      )}
    </div>
  );
}
