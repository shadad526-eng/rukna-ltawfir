import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSuperAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "super_admin")
    .limit(1);
  if (error || !data || data.length === 0) throw new Error("Forbidden");
}

export const adminWhoAmI = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role, brand_id")
      .eq("user_id", context.userId);
    return {
      userId: context.userId,
      email: (context.claims as any)?.email ?? null,
      roles: (roles ?? []).map((r: any) => r.role),
      isSuperAdmin: (roles ?? []).some((r: any) => r.role === "super_admin"),
    };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw error;
    const ids = data.users.map((u) => u.id);
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, brand_id")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    return data.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      banned_until: (u as any).banned_until ?? null,
      roles: (roles ?? []).filter((r: any) => r.user_id === u.id).map((r: any) => r.role),
    }));
  });

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; password: string; role?: string; display_name?: string }) => {
    if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) throw new Error("بريد إلكتروني غير صالح");
    if (!d.password || d.password.length < 8) throw new Error("كلمة المرور يجب ألا تقل عن 8 أحرف");
    return d;
  })
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { display_name: data.display_name ?? data.email.split("@")[0] },
    });
    if (error) throw error;
    if (data.role && created.user) {
      // Explicit, audited grant only — no automatic elevation anywhere.
      const { error: rErr } = await context.supabase.rpc("admin_set_user_roles", {
        _user_id: created.user.id,
        _roles: [data.role] as any,
      });
      if (rErr) {
        await supabaseAdmin.auth.admin.deleteUser(created.user.id);
        throw new Error(rErr.message);
      }
    }
    await audit(supabaseAdmin, context.userId, "user.create", "auth.users", created.user?.id ?? null, {
      after: { email: data.email, role: data.role ?? null },
    });
    return { id: created.user?.id };

  });

export const adminUpdateUserRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; roles: string[] }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    // Atomic + guarded (last-super-admin protection + audit) inside Postgres.
    const { error } = await context.supabase.rpc("admin_set_user_roles", {
      _user_id: data.user_id,
      _roles: Array.from(new Set(data.roles)) as any,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; password: string }) => {
    if (!d.password || d.password.length < 8) throw new Error("كلمة المرور يجب ألا تقل عن 8 أحرف");
    return d;
  })
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { password: data.password });
    if (error) throw error;
    return { ok: true };
  });

/** Throws when the action would leave the system without any active super admin. */
async function assertNotLastSuperAdmin(admin: any, userId: string) {
  const { data: isSuper } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .limit(1);
  if (!isSuper || isSuper.length === 0) return;
  const { data: others } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin")
    .neq("user_id", userId)
    .limit(1);
  if (!others || others.length === 0) {
    throw new Error("لا يمكن تعطيل أو حذف آخر مدير عام (Super Admin) في النظام");
  }
}

async function audit(
  admin: any,
  actor: string,
  action: string,
  entity_type: string,
  entity_id: string | null,
  meta?: { before?: any; after?: any },
) {
  try {
    await admin.from("audit_log").insert({
      actor_user_id: actor,
      action,
      entity_type,
      entity_id,
      before: meta?.before ?? null,
      after: meta?.after ?? null,
    });
  } catch { /* auditing must never break the operation */ }
}

export const adminToggleUserEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; enabled: boolean }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!data.enabled && data.user_id === context.userId) {
      throw new Error("لا يمكنك تعطيل حسابك الحالي");
    }
    if (!data.enabled) await assertNotLastSuperAdmin(supabaseAdmin, data.user_id);

    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      ban_duration: data.enabled ? "none" : "8760h",
    } as any);
    if (error) throw error;
    await audit(supabaseAdmin, context.userId, data.enabled ? "user.enable" : "user.disable", "auth.users", data.user_id);
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.user_id === context.userId) throw new Error("لا يمكنك حذف حسابك الحالي");
    await assertNotLastSuperAdmin(supabaseAdmin, data.user_id);
    const { data: before } = await supabaseAdmin
      .from("user_roles").select("role, brand_id").eq("user_id", data.user_id);
    // Delete the auth user first: user_roles.user_id and profiles.id cascade on
    // delete, so a failure here leaves the account fully intact with its roles.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw error;
    await audit(supabaseAdmin, context.userId, "user.delete", "auth.users", data.user_id, {
      before: { roles: before ?? [] },
    });
    return { ok: true };
  });



export const adminDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tables = [
      "brands", "products", "product_variants", "product_categories", "insights",
      "topic_hubs", "pages", "catalogs", "certifications", "assets",
      "inquiries", "catalog_requests", "b2b_partner_applications", "navigation_items",
      "homepage_sections", "audit_log",
    ] as const;
    const out: Record<string, number> = {};
    for (const t of tables) {
      const { count } = await supabaseAdmin.from(t).select("*", { count: "exact", head: true });
      out[t] = count ?? 0;
    }
    return out;
  });

export const adminRecentActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [audit, inquiries, catalogReqs, partners] = await Promise.all([
      supabaseAdmin.from("audit_log").select("*").order("created_at", { ascending: false }).limit(10),
      supabaseAdmin.from("inquiries").select("id,full_name,subject,created_at,status").order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("catalog_requests").select("id,full_name,company,created_at,status").order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("b2b_partner_applications").select("id,company_name,contact_name,created_at,status").order("created_at", { ascending: false }).limit(5),
    ]);
    return {
      audit: audit.data ?? [],
      inquiries: inquiries.data ?? [],
      catalog_requests: catalogReqs.data ?? [],
      partners: partners.data ?? [],
    };
  });

export const adminSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: string; path: string; ttl?: number }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: r, error } = await supabaseAdmin.storage.from(data.bucket).createSignedUrl(data.path, data.ttl ?? 3600);
    if (error) throw error;
    return { url: r.signedUrl };
  });

export const adminSignedUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { items: { bucket: string; path: string }[]; ttl?: number }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const out: Record<string, string> = {};
    for (const it of data.items) {
      const key = `${it.bucket}::${it.path}`;
      const { data: r } = await supabaseAdmin.storage.from(it.bucket).createSignedUrl(it.path, data.ttl ?? 3600);
      if (r?.signedUrl) out[key] = r.signedUrl;
    }
    return out;
  });

export const adminListStorage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: string; prefix?: string }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: files, error } = await supabaseAdmin.storage
      .from(data.bucket)
      .list(data.prefix ?? "", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;
    const items = await Promise.all(
      (files ?? []).filter((f) => f.name && !f.name.endsWith("/")).map(async (f) => {
        const path = data.prefix ? `${data.prefix}/${f.name}` : f.name;
        const { data: signed } = await supabaseAdmin.storage.from(data.bucket).createSignedUrl(path, 3600);
        return {
          name: f.name,
          path,
          size: (f.metadata as any)?.size ?? null,
          mime: (f.metadata as any)?.mimetype ?? null,
          created_at: f.created_at,
          url: signed?.signedUrl ?? null,
        };
      }),
    );
    return items;
  });

export const adminUploadStorage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: string; path: string; base64: string; contentType: string; registerAsset?: boolean; kind?: string }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const { error } = await supabaseAdmin.storage.from(data.bucket).upload(data.path, bytes, {
      contentType: data.contentType,
      upsert: true,
    });
    if (error) throw error;
    let asset_id: string | null = null;
    if (data.registerAsset) {
      const channel = data.kind
        ?? (data.contentType === "application/pdf" ? "catalog_pdf"
          : data.contentType.startsWith("image/") ? "marketing_generated"
          : "document");
      const { data: a } = await supabaseAdmin.from("assets").upsert({
        storage_bucket: data.bucket,
        storage_path: data.path,
        channel,
        mime_type: data.contentType,
        original_filename: data.path.split("/").pop() ?? data.path,
        uploaded_by: context.userId,
      } as any, { onConflict: "storage_bucket,storage_path" }).select("id").maybeSingle();
      asset_id = (a as any)?.id ?? null;
    }
    return { ok: true, asset_id };
  });

export const adminAssetUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: string; path: string }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { findAssetUsage } = await import("./asset-usage.server");
    return findAssetUsage(supabaseAdmin, data.bucket, data.path);
  });


export const adminDeleteStorage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: string; path: string }) => ({ bucket: d.bucket, path: d.path }))
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { findAssetUsage } = await import("./asset-usage.server");
    const usage = await findAssetUsage(supabaseAdmin, data.bucket, data.path);

    // No force/bypass path exists: referenced media can never be physically deleted.
    if (usage.used_by.length > 0) {
      throw new Error(
        `لا يمكن حذف هذا الملف لأنه مستخدم في: ${usage.used_by.join("، ")}. أزل الارتباط أولاً.`,
      );
    }

    // Delete the DB row FIRST — the BEFORE DELETE trigger on public.assets is the
    // authoritative guard, so the storage object is only removed once the database
    // confirms nothing references it.
    if (usage.asset_id) {
      const { error: dbErr } = await supabaseAdmin.from("assets").delete().eq("id", usage.asset_id);
      if (dbErr) throw new Error(dbErr.message);
    }
    const { error } = await supabaseAdmin.storage.from(data.bucket).remove([data.path]);
    if (error) throw error;
    await audit(supabaseAdmin, context.userId, "media.delete", "assets", usage.asset_id, {
      before: { bucket: data.bucket, path: data.path, asset_id: usage.asset_id },
    });
    return { ok: true };
  });



/* ============ Article inline images (separate from Media Library) ============
 * Inline body images live in the private `article-inline` bucket and are NEVER
 * registered in `public.assets`, so they never show up in the Media Library or
 * the asset pickers. They are served publicly through
 * `/api/public/article-media/<path>`.
 */

export const ARTICLE_INLINE_BUCKET = "article-inline";

export const adminUploadArticleInline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { filename: string; base64: string; contentType: string }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    if (!data.contentType.startsWith("image/")) throw new Error("الملف ليس صورة");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safeName = (data.filename || "image")
      .split("/").pop()!
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(-60);
    const path = `${new Date().toISOString().slice(0, 7)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const { error } = await supabaseAdmin.storage
      .from(ARTICLE_INLINE_BUCKET)
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    return { path, url: `/api/public/article-media/${path}` };
  });

/**
 * Delete inline images that no article body references any more.
 * Objects younger than 30 minutes are kept so an in-progress edit that has not
 * been saved yet can never lose its freshly uploaded images.
 */
export const adminCleanupArticleInline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const referenced = new Set<string>();
    const collect = (html: unknown) => {
      if (typeof html !== "string") return;
      const re = /\/api\/public\/article-media\/([^"'\s>)]+)/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html))) referenced.add(decodeURIComponent(m[1]));
    };
    const { data: articles } = await supabaseAdmin.from("insights").select("body_ar, body_en");
    for (const a of (articles ?? []) as any[]) { collect(a.body_ar); collect(a.body_en); }
    const { data: pages } = await supabaseAdmin.from("pages").select("body_ar, body_en, extra");
    for (const p of (pages ?? []) as any[]) {
      collect(p.body_ar); collect(p.body_en);
      collect(p.extra ? JSON.stringify(p.extra) : null);
    }

    const cutoff = Date.now() - 30 * 60 * 1000;
    const removed: string[] = [];
    const { data: folders } = await supabaseAdmin.storage
      .from(ARTICLE_INLINE_BUCKET)
      .list("", { limit: 1000 });
    for (const folder of (folders ?? []) as any[]) {
      if (!folder?.name) continue;
      const { data: files } = await supabaseAdmin.storage
        .from(ARTICLE_INLINE_BUCKET)
        .list(folder.name, { limit: 1000 });
      for (const f of (files ?? []) as any[]) {
        const full = `${folder.name}/${f.name}`;
        if (referenced.has(full)) continue;
        const created = f.created_at ? new Date(f.created_at).getTime() : Date.now();
        if (created > cutoff) continue;
        removed.push(full);
      }
    }
    if (removed.length) {
      await supabaseAdmin.storage.from(ARTICLE_INLINE_BUCKET).remove(removed);
    }
    return { removed: removed.length };
  });

/* ============ Homepage sections (post-hero managed content) ============ */

export const adminListHomepageSections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { data, error } = await context.supabase
      .from("homepage_sections")
      .select("section_key, title_ar, title_en, subtitle_ar, subtitle_en, body_ar, body_en, cta_label_ar, cta_url, sort_order, is_enabled, extra");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveHomepageSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { rows: any[] }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    for (const r of data.rows ?? []) {
      if (!r?.section_key) continue;
      const payload = {
        section_key: r.section_key,
        title_ar: r.title_ar ?? null,
        title_en: r.title_en ?? null,
        subtitle_ar: r.subtitle_ar ?? null,
        subtitle_en: r.subtitle_en ?? null,
        body_ar: r.body_ar ?? null,
        body_en: r.body_en ?? null,
        cta_label_ar: r.cta_label_ar ?? null,
        cta_url: r.cta_url ?? null,
        sort_order: Number(r.sort_order ?? 0),
        is_enabled: r.is_enabled !== false,
        extra: r.extra ?? {},
        updated_at: new Date().toISOString(),
      };
      const { error } = await context.supabase
        .from("homepage_sections")
        .upsert(payload, { onConflict: "section_key" });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
