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
      await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: data.role as any });
    }
    return { id: created.user?.id };
  });

export const adminUpdateUserRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; roles: string[] }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id);
    const unique = Array.from(new Set(data.roles));
    if (unique.length) {
      await supabaseAdmin.from("user_roles").insert(
        unique.map((role) => ({ user_id: data.user_id, role: role as any })),
      );
    }
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

export const adminToggleUserEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; enabled: boolean }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      ban_duration: data.enabled ? "none" : "8760h",
    } as any);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw error;
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
      const kind = data.kind ?? (data.contentType.startsWith("image/") ? "image" : data.contentType === "application/pdf" ? "pdf" : "file");
      const { data: a } = await supabaseAdmin.from("assets").insert({
        storage_bucket: data.bucket,
        storage_path: data.path,
        kind,
        mime_type: data.contentType,
      } as any).select("id").maybeSingle();
      asset_id = (a as any)?.id ?? null;
    }
    return { ok: true, asset_id };
  });

export const adminDeleteStorage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: string; path: string }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from(data.bucket).remove([data.path]);
    if (error) throw error;
    await supabaseAdmin.from("assets").delete().eq("storage_bucket", data.bucket).eq("storage_path", data.path);
    return { ok: true };
  });
