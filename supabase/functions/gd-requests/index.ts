// GD requests — the integration endpoint for third-party partners.
//
// Partners (starting with the Portal do Voluntário) call this function to
// create and read "Quero entrar num GD" requests. Each partner authenticates
// with a static API key sent in the `x-api-key` header:
//
//   x-api-key: <the key you were given>
//
// The keys are Edge Function secrets, one per partner:
//
//   supabase secrets set PARTNER_PORTAL_ONDA='{"source":"portal-onda","key":"…","scopes":["gd_requests:read","gd_requests:write"]}'
//
// Secrets take effect immediately (no redeploy), so adding a partner or giving
// one a new permission is a secret change, not a code change.
//
// Because partners do not hold a Supabase JWT, `verify_jwt` is off in
// supabase/config.toml — this function authenticates every request itself.
// It runs on a public URL: nothing else may be trusted from the request.
//
// The key is resolved to its partner before anything else happens, and only the
// partner's `source` reaches the database. It is never accepted from the
// request body, so a partner can only ever touch its own rows.
//
// All database access goes through the service_role key, which is injected into
// the runtime and never leaves it. The RPCs are granted to `service_role` only,
// so this function is the sole way in.
//
//   POST /functions/v1/gd-requests   create/upsert  (scope gd_requests:write)
//   GET  /functions/v1/gd-requests   read statuses  (scope gd_requests:read)

import { createClient } from "npm:@supabase/supabase-js@2";

const SCOPE_WRITE = "gd_requests:write";
const SCOPE_READ = "gd_requests:read";
const SOURCE_RE = /^[a-z0-9][a-z0-9_-]{0,59}$/;
const SECRET_PREFIX = "PARTNER_";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-api-key, authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

interface PartnerConfig {
  source: string;
  key: string;
  scopes: string[];
}

/** Every `PARTNER_*` secret holds one partner:
 *  `{"source":"portal-onda","key":"…","scopes":["gd_requests:read", …]}`.
 *  Read per request, so a rotated key or a new partner takes effect without
 *  waiting for the isolate to recycle. */
function partnerConfigs(): PartnerConfig[] {
  const out: PartnerConfig[] = [];
  for (const [name, value] of Object.entries(Deno.env.toObject())) {
    if (!name.startsWith(SECRET_PREFIX) || !value) continue;
    try {
      const parsed = JSON.parse(value) as { source?: unknown; key?: unknown; scopes?: unknown };
      if (typeof parsed.source !== "string" || !SOURCE_RE.test(parsed.source)) {
        console.error(`gd-requests: ${name} has a missing or invalid "source" — ignoring`);
        continue;
      }
      if (typeof parsed.key !== "string" || parsed.key.length < 16) {
        console.error(`gd-requests: ${name} has a missing or too-short "key" — ignoring`);
        continue;
      }
      out.push({
        source: parsed.source,
        key: parsed.key,
        scopes: Array.isArray(parsed.scopes)
          ? parsed.scopes.filter((s): s is string => typeof s === "string")
          : [],
      });
    } catch {
      console.error(`gd-requests: ${name} is not valid JSON — ignoring`);
    }
  }
  return out;
}

if (partnerConfigs().length === 0) {
  console.warn(
    `gd-requests: no ${SECRET_PREFIX}* secrets configured — every request will be rejected. ` +
      `Set one with \`supabase secrets set ${SECRET_PREFIX}…\`.`,
  );
}

/** Compare without short-circuiting on the first differing character, so a
 *  wrong key cannot be narrowed down by how long the comparison took. The
 *  length is not secret: every key has the same format. */
function keysMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Resolve the caller from the presented key: 401 when it matches no partner,
 *  403 when that partner is missing the scope this route needs. */
function authorize(req: Request, scope: string): { source: string } | Response {
  // `x-api-key` is the documented header; a bearer token is accepted too, for
  // clients that only make it easy to send one. Nothing here is a Supabase JWT:
  // `verify_jwt` is off, so the platform has not checked anything for us.
  const bearer = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const presented = (req.headers.get("x-api-key") || bearer || "").trim();
  if (!presented) return json({ error: "unauthorized" }, 401);

  const partner = partnerConfigs().find((p) => keysMatch(p.key, presented));
  if (!partner) return json({ error: "unauthorized" }, 401);
  if (!partner.scopes.includes(scope)) return json({ error: "forbidden" }, 403);

  return { source: partner.source };
}

/** Turn a Postgres error into a response that reveals nothing about the
 *  database. The SQLSTATE is logged for the operator, never returned. */
function dbError(err: unknown): Response {
  const code = (err as { code?: string } | null)?.code ?? "";
  console.error("gd-requests: rpc failed", code, (err as { message?: string } | null)?.message);
  if (code === "22023") return json({ error: "invalid_request" }, 400);
  if (code === "42501") return json({ error: "forbidden" }, 403);
  return json({ error: "internal_error" }, 500);
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function asInt(v: unknown): number | null {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
  return typeof n === "number" && Number.isInteger(n) ? n : null;
}

function asBool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

async function handlePost(req: Request, source: string): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_request" }, 400);
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return json({ error: "invalid_request" }, 400);
  }
  const b = body as Record<string, unknown>;

  const ref = asString(b.ref);
  const name = asString(b.name);
  if (!ref || ref.length > 120) return json({ error: "invalid_request" }, 400);
  if (!name || name.length < 2) return json({ error: "invalid_request" }, 400);

  const { data, error } = await db.rpc("submit_gd_request", {
    p_source: source,
    p_ref: ref,
    p_name: name,
    p_phone: asString(b.phone),
    p_email: asString(b.email),
    p_concelho: asString(b.concelho),
    p_age: asInt(b.age),
    p_marital_status: asString(b.maritalStatus),
    p_notes: asString(b.notes),
    p_region: asString(b.region),
    p_has_children: asBool(b.hasChildren),
    p_children_note: asString(b.childrenNote),
  });
  if (error) return dbError(error);

  // `submit_gd_request` returns { id, status } — the same ref keeps the same
  // id and whatever the supervisor already did with it.
  return json(data);
}

interface StatusRow {
  source_ref: string;
  status: string;
  gd_name: string | null;
  status_by_name: string | null;
  updated_at: string;
}

async function handleGet(req: Request, source: string): Promise<Response> {
  const refsParam = new URL(req.url).searchParams.get("refs");
  // No `refs` = the partner's latest 1000; an explicit (possibly empty) list
  // asks only for those.
  const refs =
    refsParam === null
      ? null
      : refsParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 1000);

  const { data, error } = await db.rpc("gd_request_statuses", {
    p_source: source,
    p_refs: refs,
  });
  if (error) return dbError(error);

  const requests = ((data ?? []) as StatusRow[]).map((r) => ({
    ref: r.source_ref,
    status: r.status,
    gdName: r.gd_name,
    statusByName: r.status_by_name,
    updatedAt: r.updated_at,
  }));
  return json({ requests });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const scope = req.method === "POST" ? SCOPE_WRITE : req.method === "GET" ? SCOPE_READ : null;
  if (scope === null) return json({ error: "method_not_allowed" }, 405);

  try {
    const partner = authorize(req, scope);
    if (partner instanceof Response) return partner;
    return req.method === "POST"
      ? await handlePost(req, partner.source)
      : await handleGet(req, partner.source);
  } catch (err) {
    console.error("gd-requests: unexpected error", err);
    return json({ error: "internal_error" }, 500);
  }
});
