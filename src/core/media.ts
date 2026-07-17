/** wp_media — WordPress media-library tool (core `/wp/v2/media`, outside
 *  both Fluent namespaces, hence a server-level tool like verify_setup).
 *
 *  The star action is `upload_from_url`: the server fetches an image URL
 *  (e.g. a Shopify CDN photo) and sideloads it into the media library, so
 *  binary never travels through a JSON tool call. Guards: http(s) only, no
 *  private/loopback hosts, image/* content types, 15 MB cap. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FluentApiError } from './errors.js';
import type { FluentClient } from './http.js';
import { OUTPUT_SHAPE } from './tool-factory.js';

const MAX_BYTES = 15 * 1024 * 1024;

const SUMMARY_KEYS = ['id', 'date', 'slug', 'source_url', 'mime_type', 'alt_text', 'media_type'] as const;

type Rec = Record<string, unknown>;

function summarizeAttachment(raw: unknown): Rec {
  if (!raw || typeof raw !== 'object') return { raw };
  const a = raw as Rec;
  const out: Rec = {};
  for (const k of SUMMARY_KEYS) if (k in a) out[k] = a[k];
  const title = a.title as Rec | undefined;
  if (title && typeof title === 'object' && 'rendered' in title) out.title = title.rendered;
  return out;
}

/** http(s) only; refuse loopback/private/link-local targets (the fetch runs
 *  server-side with network access the caller may not have). */
export function assertSafeSourceUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`source_url is not an absolute URL: ${raw}`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`source_url must be http(s), got ${url.protocol}`);
  }
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('source_url may not point at local hosts');
  }
  if (host === '::1' || host === '[::1]') throw new Error('source_url may not point at loopback addresses');
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0 || a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)) {
      throw new Error('source_url may not point at private or loopback addresses');
    }
  }
  return url;
}

function filenameFor(url: URL, explicit: string | undefined, contentType: string): string {
  let name = explicit?.trim() || url.pathname.split('/').filter(Boolean).pop() || '';
  name = name.split('?')[0].replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 120);
  if (!name || !name.includes('.')) {
    const ext = contentType.split('/')[1]?.split('+')[0] || 'jpg';
    name = `${name || 'upload'}.${ext}`;
  }
  return name;
}

function err(text: string) {
  return { content: [{ type: 'text' as const, text }], isError: true };
}

function ok(action: string, status: number, summaryLine: string, data: unknown) {
  const structured = { ok: true, status, action, data };
  return {
    content: [{ type: 'text' as const, text: `${summaryLine}\n${JSON.stringify(structured)}` }],
    structuredContent: structured,
  };
}

type Shaping = { detail?: 'summary' | 'full'; fields?: string[] };

/** Honor the server-wide response conventions: summary by default,
 *  detail:"full" for the raw attachment, fields:[…] to project. Explicit
 *  fields project from the RAW record (like shape.ts) — a session asking
 *  for "caption" must get it even though the summary would drop it. */
function shapeMedia(raw: unknown, args: Shaping): unknown {
  if (args.fields?.length && raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const r = raw as Rec;
    const out: Rec = {};
    for (const f of args.fields) if (f in r) out[f] = r[f];
    if (!('id' in out) && 'id' in r) out.id = r.id; // never lose the identifier
    return out;
  }
  return args.detail === 'full' ? raw : summarizeAttachment(raw);
}

/** The three media operations, shared by both registration modes. Each takes
 *  a `label` — the tool name to use in result text and error messages. */

async function runListMedia(
  client: FluentClient,
  label: string,
  args: { query?: Record<string, unknown>; page?: number; per_page?: number } & Shaping
) {
  const res = await client.wpRequest({
    method: 'GET',
    path: '/wp/v2/media',
    query: { page: args.page ?? 1, per_page: args.per_page ?? 20, ...(args.query ?? {}) },
  });
  const items = Array.isArray(res.data) ? res.data.map((item) => shapeMedia(item, args)) : res.data;
  const count = Array.isArray(items) ? items.length : 0;
  return ok('list_media', res.status, `${label} → HTTP ${res.status} — ${count} items`, items);
}

async function runGetMedia(client: FluentClient, label: string, args: { id: string | number } & Shaping) {
  const res = await client.wpRequest({ method: 'GET', path: `/wp/v2/media/${encodeURIComponent(String(args.id))}` });
  return ok('get_media', res.status, `${label} → HTTP ${res.status}`, shapeMedia(res.data, args));
}

async function runUploadFromUrl(
  client: FluentClient,
  label: string,
  args: { source_url: string; filename?: string; title?: string; alt_text?: string } & Shaping
) {
  const source = assertSafeSourceUrl(args.source_url);
  const fetched = await client.fetchUrl(source.toString());
  if (!fetched.ok) return err(`Fetching source_url failed: HTTP ${fetched.status} from ${source.hostname}`);
  const contentType = (fetched.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (!contentType.startsWith('image/')) {
    return err(`source_url returned "${contentType || 'unknown'}" — only image/* content can be uploaded with this tool.`);
  }
  const bytes = new Uint8Array(await fetched.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) {
    return err(`Image is ${(bytes.byteLength / 1048576).toFixed(1)} MB — the upload cap is ${MAX_BYTES / 1048576} MB.`);
  }
  const filename = filenameFor(source, args.filename, contentType);
  const uploaded = await client.wpRequest({
    method: 'POST',
    path: '/wp/v2/media',
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: bytes,
  });
  let attachment = uploaded.data as Rec;
  if ((args.title || args.alt_text) && attachment && typeof attachment.id === 'number') {
    const updated = await client.wpRequest({
      method: 'POST',
      path: `/wp/v2/media/${attachment.id}`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(args.title ? { title: args.title } : {}), ...(args.alt_text ? { alt_text: args.alt_text } : {}) }),
    });
    attachment = updated.data as Rec;
  }
  const summary = summarizeAttachment(attachment);
  return ok(
    'upload_from_url',
    uploaded.status,
    `${label} → HTTP ${uploaded.status} — attachment id=${summary.id}, ${(bytes.byteLength / 1024).toFixed(0)} KB ${contentType}`,
    shapeMedia(attachment, args)
  );
}

type MediaResult = ReturnType<typeof ok> | ReturnType<typeof err>;

function caught(label: string, e: unknown): MediaResult {
  if (e instanceof FluentApiError) return err(e.message);
  return err(`${label} failed: ${e instanceof Error ? e.message : String(e)}`);
}

const guard =
  <A,>(label: string, fn: (args: A) => Promise<MediaResult>) =>
  async (args: A): Promise<MediaResult> => {
    try {
      return await fn(args);
    } catch (e) {
      return caught(label, e);
    }
  };

const SOURCE_URL_DESC = 'Public http(s) image URL to sideload, e.g. "https://cdn.shopify.com/s/files/1/xxxx/photo.jpg"';
const FILENAME_DESC = 'Filename to store as (default: derived from the URL), e.g. "lilly-print-8x10.jpg"';
const LIST_QUERY_DESC = 'Filters, e.g. {"search": "lilly", "media_type": "image"}';

const SHAPING_SHAPE = {
  fields: z.array(z.string()).optional().describe('Return only these fields per record, e.g. ["id","source_url"]'),
  detail: z
    .enum(['summary', 'full'])
    .optional()
    .describe('"summary" (default) returns key attachment fields; "full" returns the raw WordPress attachment'),
};

/** Individual mode: one tool per media operation. Returns the tool names. */
export function registerWpMediaTools(server: McpServer, client: FluentClient): string[] {
  server.registerTool(
    'wp_media_upload_from_url',
    {
      description:
        'Upload an image into the WordPress media library from a URL — the server fetches it (great for migrating product photos from another platform\'s CDN) and returns the attachment ID. [WordPress · wp_media] POST /wp/v2/media.',
      inputSchema: {
        source_url: z.string().describe(SOURCE_URL_DESC),
        filename: z.string().optional().describe(FILENAME_DESC),
        title: z.string().optional().describe('Media title to set after upload'),
        alt_text: z.string().optional().describe('Accessibility alt text to set after upload'),
        ...SHAPING_SHAPE,
      },
      outputSchema: OUTPUT_SHAPE,
      annotations: { title: 'Upload Image From URL', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    guard('wp_media_upload_from_url', (args: { source_url: string; filename?: string; title?: string; alt_text?: string } & Shaping) =>
      runUploadFromUrl(client, 'wp_media_upload_from_url', args)
    ) as Parameters<typeof server.registerTool>[2]
  );

  server.registerTool(
    'wp_media_get',
    {
      description: 'Get one WordPress media-library attachment by ID. [WordPress · wp_media] GET /wp/v2/media/{id}.',
      inputSchema: {
        id: z.union([z.string(), z.number()]).describe('Attachment ID, e.g. 92401'),
        ...SHAPING_SHAPE,
      },
      outputSchema: OUTPUT_SHAPE,
      annotations: { title: 'Get Media', readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    guard('wp_media_get', (args: { id: string | number } & Shaping) =>
      runGetMedia(client, 'wp_media_get', args)
    ) as Parameters<typeof server.registerTool>[2]
  );

  server.registerTool(
    'wp_media_list',
    {
      description: 'List or search the WordPress media library. [WordPress · wp_media] GET /wp/v2/media.',
      inputSchema: {
        query: z.record(z.unknown()).optional().describe(LIST_QUERY_DESC),
        page: z.number().int().min(1).optional().describe('Page number (default 1)'),
        per_page: z.number().int().min(1).max(100).optional().describe('Items per page (default 20)'),
        ...SHAPING_SHAPE,
      },
      outputSchema: OUTPUT_SHAPE,
      annotations: { title: 'List Media', readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    guard('wp_media_list', (args: { query?: Record<string, unknown>; page?: number; per_page?: number } & Shaping) =>
      runListMedia(client, 'wp_media_list', args)
    ) as Parameters<typeof server.registerTool>[2]
  );

  return ['wp_media_upload_from_url', 'wp_media_get', 'wp_media_list'];
}

/** Grouped (legacy) mode: the single wp_media tool with an `action` param. */
export function registerWpMediaTool(server: McpServer, client: FluentClient): void {
  server.registerTool(
    'wp_media',
    {
      description:
        'Work with the WordPress media library: upload an image from a URL (the server fetches it — great for migrating product photos from another platform\'s CDN), or look up existing media.',
      inputSchema: {
        action: z
          .enum(['upload_from_url', 'get_media', 'list_media'])
          .describe('upload_from_url(source_url); get_media(id); list_media'),
        source_url: z.string().optional().describe(SOURCE_URL_DESC),
        filename: z.string().optional().describe(FILENAME_DESC),
        title: z.string().optional().describe('Media title to set after upload'),
        alt_text: z.string().optional().describe('Accessibility alt text to set after upload'),
        id: z.union([z.string(), z.number()]).optional().describe('Attachment ID for get_media, e.g. 92401'),
        query: z.record(z.unknown()).optional().describe(LIST_QUERY_DESC),
        page: z.number().int().min(1).optional().describe('Page for list_media (default 1)'),
        per_page: z.number().int().min(1).max(100).optional().describe('Items per page for list_media (default 20)'),
        ...SHAPING_SHAPE,
      },
      outputSchema: OUTPUT_SHAPE,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      const label = `wp_media.${args.action}`;
      try {
        if (args.action === 'list_media') return await runListMedia(client, label, args);
        if (args.action === 'get_media') {
          if (args.id === undefined) return err('get_media needs id (the attachment ID).');
          return await runGetMedia(client, label, { ...args, id: args.id });
        }
        if (!args.source_url) return err('upload_from_url needs source_url (a public image URL).');
        return await runUploadFromUrl(client, label, { ...args, source_url: args.source_url });
      } catch (e) {
        return caught(label, e);
      }
    }
  );
}

/** Map entries for the media tools, for the tool_map / TOOL_MAP.md renderers. */
export function wpMediaMapTools(mode: 'individual' | 'grouped') {
  const n = (individual: string, grouped: string) => (mode === 'individual' ? individual : grouped);
  return [
    { name: n('wp_media_upload_from_url', 'wp_media.upload_from_url'), summary: 'Upload an image from a URL (server-side fetch)', params: ['source_url'], destructive: false, paginated: false },
    { name: n('wp_media_get', 'wp_media.get_media'), summary: 'Get one media attachment', params: ['id'], destructive: false, paginated: false },
    { name: n('wp_media_list', 'wp_media.list_media'), summary: 'List or search the media library', params: [], destructive: false, paginated: true },
  ];
}
