#!/usr/bin/env node
/* Publish a version of the download package to the Freemius product.

   Signs requests the way Freemius' own PHP SDK does (developer scope):
     string_to_sign = METHOD \n CONTENT_MD5 \n CONTENT_TYPE \n DATE \n /v1/<path>
     Authorization: FS <dev_id>:<public_key>:<base64url(hex(hmac_sha256(secret)))>
   CONTENT_MD5 is md5(json body) for JSON POST/PUT and empty for multipart.
   Verified against Freemius.php in the PHP SDK: the signed path is the
   canonical path WITHOUT the query string, and CONTENT_TYPE is
   "application/json" for every non-upload request, GET included.

   Env (set as GitHub Actions secrets):
     FREEMIUS_DEV_ID, FREEMIUS_DEV_PUBLIC_KEY, FREEMIUS_DEV_SECRET_KEY
     FREEMIUS_PRODUCT_ID   (default 39849)
   Args: --file <zip> --version <x.y.z> [--release-mode released|beta|pending] */
import fs from 'node:fs';
import path from 'node:path';
import { createHmac, createHash, randomBytes } from 'node:crypto';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const devId = process.env.FREEMIUS_DEV_ID;
const pub = process.env.FREEMIUS_DEV_PUBLIC_KEY;
const secret = process.env.FREEMIUS_DEV_SECRET_KEY;
const productId = process.env.FREEMIUS_PRODUCT_ID || '39849';
const releaseMode = args['release-mode'] || 'released';
if (!devId || !pub || !secret) { console.error('FREEMIUS_DEV_ID / FREEMIUS_DEV_PUBLIC_KEY / FREEMIUS_DEV_SECRET_KEY are required'); process.exit(1); }
if (!args.file || !args.version) { console.error('usage: --file <zip> --version <x.y.z> [--release-mode released]'); process.exit(1); }

const API = 'https://api.freemius.com';
const b64url = (s) => Buffer.from(s).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

function authHeaders(method, canonPath, contentType, bodyForMd5) {
  const date = new Date().toUTCString().replace('GMT', '+0000'); // RFC 2822-ish like PHP date('r')
  const md5 = bodyForMd5 ? createHash('md5').update(bodyForMd5).digest('hex') : '';
  const toSign = [method, md5, contentType, date, canonPath].join('\n');
  const sig = b64url(createHmac('sha256', secret).update(toSign).digest('hex'));
  const h = { Date: date, Authorization: `FS ${devId}:${pub}:${sig}` };
  if (md5) h['Content-MD5'] = md5;
  return h;
}

async function call(method, relPath, { json, file, data } = {}) {
  const canonPath = `/v1/developers/${devId}${relPath}`;
  const signedPath = canonPath.split('?')[0]; // the SDK signs the path without its query string
  let body, contentType, md5Body;
  if (file) {
    const boundary = '----' + randomBytes(12).toString('hex');
    contentType = `multipart/form-data; boundary=${boundary}`;
    const parts = [];
    if (data) parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="data"\r\n\r\n${JSON.stringify(data)}\r\n`));
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${path.basename(file)}"\r\nContent-Type: application/zip\r\n\r\n`));
    parts.push(fs.readFileSync(file));
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
    body = Buffer.concat(parts);
  } else {
    contentType = 'application/json'; // also for GET — the SDK signs and sends it
    if (json) {
      md5Body = JSON.stringify(json);
      body = md5Body;
    }
  }
  const headers = { ...authHeaders(method, signedPath, contentType, md5Body), Accept: 'application/json', 'Content-Type': contentType };
  const res = await fetch(API + canonPath, { method, headers, body });
  const text = await res.text();
  let parsed; try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 500) }; }
  if (!res.ok) throw new Error(`${method} ${canonPath} → HTTP ${res.status}: ${JSON.stringify(parsed)}`);
  return parsed;
}

const existing = await call('GET', `/plugins/${productId}/tags.json?count=50`);
const dup = (existing.tags || []).find((t) => t.version === args.version);
if (dup) { console.log(`Version ${args.version} already on Freemius (tag ${dup.id}); nothing uploaded.`); process.exit(0); }

console.log(`Uploading ${args.file} as version ${args.version} to product ${productId}…`);
const tag = await call('POST', `/plugins/${productId}/tags.json`, { file: args.file, data: { version: args.version } });
console.log(`Created tag ${tag.id} (version ${tag.version}, release_mode ${tag.release_mode})`);
if (releaseMode !== 'pending' && tag.release_mode !== releaseMode) {
  const upd = await call('PUT', `/plugins/${productId}/tags/${tag.id}.json`, { json: { release_mode: releaseMode } });
  console.log(`Release mode → ${upd.release_mode}`);
}
