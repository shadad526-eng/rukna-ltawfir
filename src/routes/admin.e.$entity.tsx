import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getEntity, type Field } from "@/lib/admin-entities";

export const Route = createFileRoute("/admin/e/$entity")({ ssr: false, component: EntityPage });

function EntityPage() {
  const { entity } = useParams({ from: "/admin/e/$entity" });
  const cfg = getEntity(entity);
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);

  const pk = cfg?.primaryKey ?? "id";
  const load = useCallback(async () => {
    if (!cfg) return;
    setErr(null);
    let q = supabase.from(cfg.table as any).select("*").limit(500);
    if (cfg.orderBy) q = q.order(cfg.orderBy.column, { ascending: cfg.orderBy.ascending });
    const { data, error } = await q;
    if (error) setErr(error.message); else setRows(data ?? []);
  }, [cfg]);
  useEffect(() => { load(); setEditing(null); }, [load, entity]);

  if (!cfg) return <div className="text-rose-400">Unknown entity: {entity}</div>;

  async function save(row: Record<string, any>) {
    setErr(null);
    const payload: Record<string, any> = {};
    for (const f of cfg!.fields) {
      let v = row[f.key];
      if (v === "" || v === undefined) v = null;
      if (f.type === "number" && v !== null) v = Number(v);
      if (f.type === "boolean") v = !!v;
      if (f.type === "json" && typeof v === "string") {
        try { v = v.trim() ? JSON.parse(v) : null; } catch { setErr(`Invalid JSON in ${f.label}`); return; }
      }
      payload[f.key] = v;
    }
    const isNew = !row[pk];
    const q = isNew
      ? supabase.from(cfg!.table as any).insert(payload)
      : supabase.from(cfg!.table as any).update(payload).eq(pk, row[pk]);
    const { error } = await q;
    if (error) setErr(error.message); else { setEditing(null); load(); }
  }

  async function remove(row: any) {
    if (!confirm("Delete this row?")) return;
    const { error } = await supabase.from(cfg!.table as any).delete().eq(pk, row[pk]);
    if (error) setErr(error.message); else load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{cfg.label}</h1>
        <button onClick={() => setEditing({})} className="bg-emerald-600 hover:bg-emerald-500 rounded px-3 py-1.5 text-sm">+ New</button>
      </div>
      {err && <div className="text-rose-400 text-sm">{err}</div>}

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-300"><tr>
            {cfg.listColumns.map((c) => <th key={c} className="text-left p-2">{c}</th>)}
            <th className="p-2 w-24"></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[pk]} className="border-t border-slate-800 hover:bg-slate-800/30">
                {cfg.listColumns.map((c) => (
                  <td key={c} className="p-2 max-w-[240px] truncate">{formatCell(r[c])}</td>
                ))}
                <td className="p-2 text-right space-x-2">
                  <button onClick={() => setEditing(r)} className="text-sky-300 text-xs hover:underline">Edit</button>
                  <button onClick={() => remove(r)} className="text-rose-300 text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="p-4 text-slate-500 text-sm" colSpan={cfg.listColumns.length + 1}>No rows.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{editing[pk] ? "Edit" : "New"} · {cfg.label}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="space-y-3">
              {cfg.fields.map((f) => (
                <FieldInput key={f.key} field={f} value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} />
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-3 py-1.5 rounded bg-slate-800 text-sm">Cancel</button>
                <button className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCell(v: any) {
  if (v === null || v === undefined) return <span className="text-slate-600">—</span>;
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 60);
  return String(v);
}

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const base = "w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm";
  if (field.type === "textarea")
    return (
      <label className="block text-sm"><span className="text-slate-300">{field.label}</span>
        <textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base + " font-mono"} />
      </label>
    );
  if (field.type === "boolean")
    return (
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  if (field.type === "select")
    return (
      <label className="block text-sm"><span className="text-slate-300">{field.label}</span>
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={base}>
          <option value="">—</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );
  if (field.type === "json") {
    const str = value === null || value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2);
    return (
      <label className="block text-sm"><span className="text-slate-300">{field.label}</span>
        <textarea rows={4} value={str} onChange={(e) => onChange(e.target.value)} className={base + " font-mono text-xs"} placeholder='{}' />
        {field.hint && <span className="text-xs text-slate-500">{field.hint}</span>}
      </label>
    );
  }
  return (
    <label className="block text-sm"><span className="text-slate-300">{field.label}</span>
      <input type={field.type === "number" ? "number" : field.type === "date" ? "datetime-local" : "text"}
        value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base} required={field.required} />
      {field.hint && <span className="text-xs text-slate-500">{field.hint}</span>}
    </label>
  );
}
