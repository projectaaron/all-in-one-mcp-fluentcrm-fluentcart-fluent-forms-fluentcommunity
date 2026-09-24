/** support_report: a paste-ready diagnostic bundle for support requests and
 *  GitHub issues. A user who hits a problem asks their assistant to "run
 *  support_report" and pastes the output into an issue; the maintainer (or
 *  an AI reading the issue) gets the server version, transport, tool mode,
 *  per-product connection checks, and the recent tool-call history with
 *  every error — with the site host, usernames, passwords, tokens and email
 *  addresses redacted before anything leaves the server. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DEFAULT_LOCKED_TOOLS, type ServerConfig } from './config.js';
import { runVerify, type ProductEntry } from './verify.js';
import { SERVER_VERSION } from '../version.js';

export const ISSUES_URL = 'https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/issues';
export const SUPPORT_URL = 'https://upfluent.io/support/';
export const SUPPORT_EMAIL = 'support@upfluent.io';

/** How the server was started — shapes what the call log can cover. */
export type Transport = 'stdio' | 'remote-http' | 'cloudflare-worker' | 'unknown';

export interface CallRecord {
  /** ISO timestamp of when the call finished. */
  at: string;
  /** Tool label, e.g. `crm_contacts_list` or `crm_contacts.list` (grouped mode). */
  tool: string;
  /** HTTP method + endpoint path *template* (`GET /subscribers/{id}`) — never
   *  the filled-in path, so record ids and search terms stay out of the log. */
  endpoint?: string;
  /** HTTP status of the upstream call when known (0 = could not connect). */
  status?: number;
  /** WordPress error code when the API returned one (e.g. rest_forbidden). */
  code?: string;
  outcome: 'ok' | 'error' | 'refused' | 'dry_run';
  /** Wall-clock duration of the tool call in milliseconds. */
  ms: number;
  /** Redacted, truncated error/refusal text. Absent for successful calls. */
  message?: string;
}

const MAX_MESSAGE = 400;

/** Fixed-capacity ring buffer of recent tool calls. One per built server —
 *  never a module global, so a shared deployment can't mix sessions up. */
export class DiagnosticsLog {
  private readonly items: CallRecord[] = [];
  constructor(readonly capacity = 100) {}

  record(rec: CallRecord): void {
    this.items.push(rec);
    if (this.items.length > this.capacity) this.items.splice(0, this.items.length - this.capacity);
  }

  /** Newest first. */
  entries(): CallRecord[] {
    return [...this.items].reverse();
  }

  get size(): number {
    return this.items.length;
  }
}

/** Classify a finished tool result for the log. Errors carry the upstream
 *  status in their text (`API error [401 rest_forbidden] on …`), which is
 *  the only place it survives after err() normalizes them. */
export function classifyResult(result: {
  isError?: boolean;
  content?: Array<{ type: string; text?: string }>;
  structuredContent?: Record<string, unknown>;
}): Pick<CallRecord, 'status' | 'code' | 'outcome' | 'message'> {
  const text = result.content?.find((c) => c.type === 'text')?.text ?? '';
  const sc = result.structuredContent;
  if (!result.isError) {
    return {
      outcome: sc?.dry_run === true ? 'dry_run' : 'ok',
      status: typeof sc?.status === 'number' ? sc.status : undefined,
    };
  }
  const refused = /^(🔒 )?Refused\b|^🔒|requires confirm:true/i.test(text);
  const m = /\[(\d{1,3})(?: ([\w.-]+))?\] on /.exec(text);
  return {
    outcome: refused ? 'refused' : 'error',
    status: m ? Number(m[1]) : undefined,
    code: m?.[2],
    message: text.length > MAX_MESSAGE ? `${text.slice(0, MAX_MESSAGE)}…` : text,
  };
}

/** Build a redactor for one config: masks the site host, every configured
 *  username and password, Authorization headers, application-password and
 *  token-shaped strings, and email addresses. Applied to every string the
 *  report emits — the log messages included — so nothing that identifies
 *  the site or its credentials can be pasted into a public issue. */
export function makeRedactor(config: Pick<ServerConfig, 'siteUrl' | 'credentials'>): (text: string) => string {
  const secrets = new Set<string>();
  const names = new Set<string>();
  const hosts = new Set<string>();
  if (config.siteUrl) {
    try {
      // hostname, not host: with a port in the URL, `host` is "shop.com:8443"
      // and the bare "shop.com" in a DNS error would slip through.
      const hostname = new URL(config.siteUrl).hostname;
      hosts.add(hostname);
      if (hostname.startsWith('www.')) hosts.add(hostname.slice(4));
    } catch {
      secrets.add(config.siteUrl);
    }
  }
  for (const cred of Object.values(config.credentials)) {
    if (!cred) continue;
    if (cred.username) names.add(cred.username);
    if (cred.password) {
      // Long secrets are masked wherever they appear; a very short one can
      // only be masked as a whole word, or every "p" in the report would go.
      if (cred.password.length >= 6) secrets.add(cred.password);
      else names.add(cred.password);
      // Application Passwords work with or without their spaces.
      const compact = cred.password.replace(/\s+/g, '');
      if (compact.length >= 8) secrets.add(compact);
    }
  }
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const longestFirst = (set: Set<string>) => [...set].sort((a, b) => b.length - a.length).map(escape);
  // Passwords are masked wherever they occur, even inside a longer string.
  const secretRe = secrets.size ? new RegExp(longestFirst(secrets).join('|'), 'g') : undefined;
  // Usernames are masked as whole words, case-insensitively: a username that
  // also sits inside a longer word (the repository owner in the issues URL)
  // is left alone, and a short username like "wp" can't shred every sentence.
  const nameRe = names.size ? new RegExp(`(?<![A-Za-z0-9_])(?:${longestFirst(names).join('|')})(?![A-Za-z0-9_])`, 'gi') : undefined;
  const hostRe = hosts.size ? new RegExp(longestFirst(hosts).join('|'), 'gi') : undefined;

  return (text: string) => {
    let out = text;
    if (secretRe) out = out.replace(secretRe, '[redacted]');
    // Emails before usernames, so "jane@site.com" becomes [email] rather
    // than "[redacted]@site.com". URL-encoded "@" (%40) counts too.
    out = out.replace(/%40/gi, '@');
    out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]');
    if (nameRe) out = out.replace(nameRe, '[redacted]');
    if (hostRe) out = out.replace(hostRe, '[site]');
    out = out.replace(/\b(Basic|Bearer)\s+[A-Za-z0-9+/=_.-]{8,}/g, '$1 [redacted]');
    // WordPress application passwords: six groups of four alphanumerics.
    out = out.replace(/\b(?:[A-Za-z0-9]{4} ){5}[A-Za-z0-9]{4}\b/g, '[app-password]');
    // Long opaque tokens (hex / base64url), e.g. remote-server tokens.
    // (must mix letters and digits, so long tool names like
    // cart_customer_portal_get_transaction_billing_address survive)
    out = out.replace(/\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{32,}\b/g, '[token]');
    return out;
  };
}

export interface SupportContext {
  transport: Transport;
  /** Total registered tools, for the header. */
  toolCount: number;
  diagnostics: DiagnosticsLog;
  /** FLUENT_LOCKED_TOOLS entries that match no tool — they lock nothing. */
  unknownLocks?: string[];
}

function runtimeLine(): string {
  const g = globalThis as { process?: { version?: string; platform?: string; arch?: string }; navigator?: { userAgent?: string } };
  const node = g.process?.version;
  const platform = g.process?.platform;
  const arch = g.process?.arch;
  const ua = g.navigator?.userAgent;
  if (ua && /Cloudflare-Workers/i.test(ua)) return `Cloudflare Workers${node ? ` (nodejs_compat, ${node})` : ''}`;
  if (node) return `Node ${node} on ${platform ?? '?'} ${arch ?? ''}`.trim();
  return ua ?? 'unknown runtime';
}

function lockedSummary(config: ServerConfig): string {
  const locked = config.lockedTools;
  const defaults = new Set<string>(DEFAULT_LOCKED_TOOLS);
  const isDefault = locked.size === defaults.size && [...locked].every((t) => defaults.has(t));
  if (isDefault) return `${locked.size} (the default list)`;
  if (locked.size === 0) return '0 (FLUENT_LOCKED_TOOLS=none — every default lock is open)';
  const extra = [...locked].filter((t) => !defaults.has(t));
  const removed = [...defaults].filter((t) => !locked.has(t));
  return `${locked.size} (custom: +${extra.length} added, -${removed.length} of the defaults removed)`;
}

function cell(s: string | undefined): string {
  return (s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

/** Assemble the Markdown report. Exported so tests can drive it without a transport. */
export async function buildSupportReport(
  entries: ProductEntry[],
  config: ServerConfig,
  ctx: SupportContext,
  opts: { probe: boolean; calls: number }
): Promise<{ markdown: string; errorCount: number; ok: boolean | undefined }> {
  const redact = makeRedactor(config);
  const siteDesc = (() => {
    if (!config.siteUrl) return 'NOT SET (FLUENT_SITE_URL is empty — no product can connect)';
    try {
      const u = new URL(config.siteUrl);
      return `${u.protocol}//[site]${u.pathname === '/' ? '' : u.pathname}${u.protocol === 'http:' ? ' (plain HTTP — Application Passwords need HTTPS on most hosts)' : ''}`;
    } catch {
      return 'set, but not a valid URL';
    }
  })();

  const lines: string[] = [];
  lines.push('## All-In-One MCP for Fluent Suite — support report');
  lines.push('');
  lines.push(
    `Generated ${new Date().toISOString()}. Site host, usernames, passwords, tokens and email addresses have been redacted. ` +
      `Paste this whole block into a new issue (${ISSUES_URL}/new) or send it to ${SUPPORT_EMAIL}.`
  );
  lines.push('');
  lines.push('### Server');
  lines.push(`- Version: ${SERVER_VERSION}`);
  lines.push(`- Transport: ${ctx.transport}`);
  lines.push(`- Runtime: ${runtimeLine()}`);
  lines.push(`- Tool mode: ${config.toolMode} (${ctx.toolCount} tools registered)`);
  lines.push(`- Locked tools: ${lockedSummary(config)}`);
  if (ctx.unknownLocks?.length) {
    lines.push(`- ⚠ FLUENT_LOCKED_TOOLS names that match no tool (they lock nothing — check the spelling): ${ctx.unknownLocks.join(', ')}`);
  }
  lines.push(`- HTTP: timeout ${config.timeoutMs} ms, retries ${config.maxRetries}`);
  lines.push(`- Site URL: ${siteDesc}`);
  const sharedCreds = config.presentEnv.includes('FLUENT_API_USERNAME') && config.presentEnv.includes('FLUENT_API_PASSWORD');
  const overrides = entries.filter((e) => config.presentEnv.includes(`${e.module.envPrefix}_API_USERNAME`)).map((e) => e.module.envPrefix);
  lines.push(`- Credentials: shared FLUENT_API_USERNAME/PASSWORD ${sharedCreds ? 'set' : 'not set'}${overrides.length ? `; per-product overrides for ${overrides.join(', ')}` : ''}`);
  lines.push(`- Environment variables present (names only): ${config.presentEnv.length ? config.presentEnv.join(', ') : 'none'}`);
  lines.push('');

  lines.push('### Products');
  let ok: boolean | undefined;
  if (opts.probe) {
    const verify = await runVerify(entries, config);
    ok = verify.ok;
    lines.push('| Product | Status | Namespace detected | Test read | Detail |');
    lines.push('|---|---|---|---|---|');
    for (const r of verify.reports) {
      const ns = r.namespace_detected === undefined ? '?' : r.namespace_detected ? 'yes' : 'no';
      lines.push(`| ${r.title} | ${r.status} | ${ns} | ${cell(r.test_read)} | ${cell(redact(r.detail ?? ''))} |`);
    }
  } else {
    for (const e of entries) {
      lines.push(`- ${e.module.title}: ${e.status.configured ? 'configured' : `not configured (missing ${e.status.missing.join(', ')})`}`);
    }
    lines.push('');
    lines.push('_Live connection checks skipped (probe:false)._');
  }
  lines.push('');

  const all = ctx.diagnostics.entries();
  const errors = all.filter((c) => c.outcome === 'error');
  const shown = all.slice(0, opts.calls);
  lines.push(`### Recent tool calls (${shown.length} of ${ctx.diagnostics.size} logged, newest first — ${errors.length} error${errors.length === 1 ? '' : 's'})`);
  if (ctx.transport === 'cloudflare-worker') {
    lines.push('_The Worker builds a fresh server per request, so this log only covers the current request. Reproduce the problem, then run support_report in the same message for a fuller log._');
  }
  if (!shown.length) {
    lines.push('_No tool calls yet in this session. Reproduce the problem first, then run support_report again._');
  } else {
    lines.push('| Time | Tool | Endpoint | Status | Result | ms | Message |');
    lines.push('|---|---|---|---|---|---|---|');
    for (const c of shown) {
      lines.push(
        `| ${c.at.slice(11, 19)} | ${cell(c.tool)} | ${cell(c.endpoint)} | ${c.status ?? ''} | ${c.outcome}${c.code ? ` (${c.code})` : ''} | ${c.ms} | ${cell(c.message ? redact(c.message) : '')} |`
      );
    }
  }
  lines.push('');
  lines.push('### Next steps');
  lines.push(`1. Describe what you asked the assistant to do and what you expected.`);
  lines.push(`2. Paste this report into a new issue: ${ISSUES_URL}/new — or, without a GitHub account, send it through ${SUPPORT_URL} or to ${SUPPORT_EMAIL}.`);
  lines.push('3. If a product shows auth_failed or plugin_missing, the Troubleshooting table in the README covers the usual fixes. not_installed just means that Fluent plugin is not on your site.');

  // Our own support address must survive the email redactor: swap it for a
  // token that no redaction pattern matches, then put it back.
  const markdown = redact(lines.join('\n').split(SUPPORT_EMAIL).join('\u0000\u0001\u0000')).split(
    '\u0000\u0001\u0000'
  ).join(SUPPORT_EMAIL);
  return { markdown, errorCount: errors.length, ok };
}

export function registerSupportReport(server: McpServer, entries: ProductEntry[], config: ServerConfig, ctx: SupportContext): void {
  server.registerTool(
    'support_report',
    {
      description:
        'Generate a redacted, paste-ready diagnostic report for support or a GitHub issue: server version and transport, per-product connection checks, and the recent tool-call log with every error. ' +
        'Site host, usernames, passwords, tokens and emails are masked. Reproduce the problem first, then run this and show the user the full output unchanged.',
      inputSchema: {
        probe: z
          .boolean()
          .optional()
          .describe('Run the live connection checks (same as verify_setup). Default true; set false if the site is unreachable and you only want the call log.'),
        calls: z.number().int().min(1).max(100).optional().describe('How many recent tool calls to include (default 25, max 100).'),
      },
      outputSchema: {
        version: z.string(),
        transport: z.string(),
        ok: z.boolean().optional(),
        error_count: z.number(),
        markdown: z.string(),
        issues_url: z.string(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      const { markdown, errorCount, ok } = await buildSupportReport(entries, config, ctx, {
        probe: args.probe !== false,
        calls: args.calls ?? 25,
      });
      return {
        content: [{ type: 'text' as const, text: markdown }],
        structuredContent: {
          version: SERVER_VERSION,
          transport: ctx.transport,
          ok,
          error_count: errorCount,
          markdown,
          issues_url: `${ISSUES_URL}/new`,
        },
      };
    }
  );
}
