#!/usr/bin/env node
/* Post-install smoke test — READ-ONLY. Run after filling in .env:
     node --env-file=.env scripts/smoke-test.mjs
   (or export the env vars and run `npm run smoke`).

   Spawns the built server over stdio like a real MCP client, runs
   verify_setup, then one harmless read per configured product. Exits 0 when
   everything configured works, 1 otherwise. Nothing is created or modified. */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!existsSync('dist/index.js')) {
  console.error('dist/index.js missing — run `npm run build` first.');
  process.exit(1);
}

const READS = {
  fluentcrm: { tool: 'crm_tags_list', args: { per_page: 1 }, label: 'FluentCRM: list 1 tag' },
  fluentcart: { tool: 'cart_labels_attributes_list', args: { per_page: 1 }, label: 'FluentCart: list 1 label' },
};

// Pin the individual surface — the READS table uses individual tool names,
// which a FLUENT_TOOL_MODE=grouped in the caller's env would break.
const child = spawn(process.execPath, ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, FLUENT_TOOL_MODE: 'individual' },
});
let nextId = 0;
const pending = new Map();
let buffer = '';
child.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line) continue;
    const msg = JSON.parse(line);
    if (msg.id !== undefined && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});

function rpc(method, params) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, (msg) => (msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)));
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pending.delete(id)) reject(new Error(`${method} timed out after 60s`));
    }, 60000).unref();
  });
}

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`❌ ${msg}`);
};

try {
  await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'fluentmcp-smoke', version: '0' },
  });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  console.log('✅ server initialized over stdio');

  const { tools } = await rpc('tools/list', {});
  console.log(`✅ tools/list → ${tools.length} tools`);

  const verify = await rpc('tools/call', { name: 'verify_setup', arguments: {} });
  console.log('--- verify_setup ---\n' + verify.content[0].text + '\n--------------------');
  const products = verify.structuredContent?.products ?? [];
  if (!products.length) fail('verify_setup returned no products');

  for (const report of products) {
    if (report.status === 'not_configured') {
      console.log(`⏭️  ${report.title}: not configured — skipping read test`);
      continue;
    }
    if (report.status !== 'ok') {
      fail(`${report.title}: verify_setup says ${report.status} — ${report.detail ?? ''}`);
      continue;
    }
    const read = READS[report.product];
    if (!read) continue;
    const res = await rpc('tools/call', { name: read.tool, arguments: read.args });
    if (res.isError) fail(`${read.label} → ${res.content[0].text}`);
    else console.log(`✅ ${read.label} → ${res.content[0].text}`);
  }

  if (!products.some((p) => p.status === 'ok')) {
    fail('No product is configured and working. Fill in .env (see .env.example) and re-run.');
  }
} catch (err) {
  fail(err.message);
} finally {
  child.kill();
}
console.log(failures ? `\nSmoke test FAILED (${failures} problem${failures > 1 ? 's' : ''}).` : '\nSmoke test passed.');
process.exit(failures ? 1 : 0);
