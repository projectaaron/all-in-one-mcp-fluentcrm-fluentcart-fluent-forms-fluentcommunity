#!/usr/bin/env node
/* Build the end-user download package: a ZIP holding the Claude Desktop
   extension (.mcpb), a plain-text readme and the license. This is what
   Freemius / upfluent.io hand out.

   Usage: node scripts/pack-download.mjs <path/to/fluentmcp-<version>.mcpb>
   Writes: all-in-one-mcp-for-fluent-suite-<version>.zip (cwd)          */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const mcpb = process.argv[2];
if (!mcpb || !fs.existsSync(mcpb)) {
  console.error('usage: node scripts/pack-download.mjs <fluentmcp-<version>.mcpb>');
  process.exit(1);
}
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const dir = 'all-in-one-mcp-for-fluent-suite';
const out = `${dir}-${version}.zip`;
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir);
fs.copyFileSync(mcpb, path.join(dir, `fluentmcp-${version}.mcpb`));
fs.copyFileSync('LICENSE', path.join(dir, 'LICENSE.txt'));
fs.writeFileSync(path.join(dir, 'readme.txt'), fs.readFileSync('packaging/readme.txt', 'utf8').replaceAll('{{VERSION}}', version));
fs.rmSync(out, { force: true });
execFileSync('zip', ['-q', '-r', out, dir]);
fs.rmSync(dir, { recursive: true, force: true });
console.log(`${out} (${(fs.statSync(out).size / 1048576).toFixed(1)} MB)`);
