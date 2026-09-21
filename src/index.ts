#!/usr/bin/env node
/** All-In-One MCP for Fluent Suite — stdio entry point (local install: Claude Desktop extension,
 *  Claude Code, any stdio MCP client). Products with credentials present are
 *  enabled; the rest are skipped and reported by verify_setup as not
 *  configured. stdout is reserved for MCP JSON-RPC; logging goes to stderr. */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { buildServer, enablementSummary, readConfig } from './server.js';

const built = buildServer(readConfig(), { transport: 'stdio' });
const transport = new StdioServerTransport();
await built.server.connect(transport);
console.error(enablementSummary(built));
