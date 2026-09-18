import { describe, expect, it } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { assertSafeSourceUrl, isBlockedIPv4, isBlockedIPv6, registerWpMediaTool } from '../../src/core/media.js';
import { makeClient, mockFetch, type CapturedRequest } from '../helpers.js';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);

async function callTool(fetchImpl: Parameters<typeof makeClient>[0], args: Record<string, unknown>) {
  const server = new McpServer({ name: 't', version: '0' });
  registerWpMediaTool(server, makeClient(fetchImpl));
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  const res = (await client.callTool({ name: 'wp_media', arguments: args })) as {
    isError?: boolean;
    content: Array<{ text: string }>;
    structuredContent?: { data?: unknown };
  };
  await client.close();
  await server.close();
  return res;
}

describe('assertSafeSourceUrl', () => {
  it('allows public http(s) and rejects everything else', () => {
    expect(assertSafeSourceUrl('https://cdn.shopify.com/s/files/1/photo.jpg').hostname).toBe('cdn.shopify.com');
    for (const bad of [
      'file:///etc/passwd',
      'ftp://example.com/x.jpg',
      'http://localhost/x.jpg',
      'http://127.0.0.1/x.jpg',
      'http://10.0.0.5/x.jpg',
      'http://172.16.1.1/x.jpg',
      'http://192.168.1.10/x.jpg',
      'http://169.254.169.254/latest/meta-data',
      'http://100.100.100.200/metadata', // CGNAT metadata (Alibaba)
      'http://0.0.0.0/x.jpg',
      'http://224.0.0.1/x.jpg',
      'http://[::1]/x.jpg',
      'http://[::]/x.jpg',
      'http://[::ffff:127.0.0.1]/x.jpg', // IPv4-mapped loopback
      'http://[::ffff:7f00:1]/x.jpg', // same, hex form
      'http://[64:ff9b::7f00:1]/x.jpg', // NAT64 to loopback
      'http://[fd00::1]/x.jpg', // ULA
      'http://[fe80::1]/x.jpg', // link-local
      'http://169.254.169.254.nip.io/x.jpg', // wildcard-DNS metadata alias
      'http://metadata.google.internal/computeMetadata/v1/',
      'http://user:pw@cdn.example.com/x.jpg',
      'not a url',
    ]) {
      expect(() => assertSafeSourceUrl(bad), bad).toThrow();
    }
    // Public IPv6 and decimal IPv4 forms that normalise to private space
    expect(assertSafeSourceUrl('http://[2606:4700::6810:84e5]/x.jpg').hostname).toBe('[2606:4700::6810:84e5]');
    expect(() => assertSafeSourceUrl('http://2130706433/x.jpg')).toThrow(); // 127.0.0.1 as a decimal
    expect(() => assertSafeSourceUrl('http://0x7f000001/x.jpg')).toThrow(); // hex
  });

  it('range helpers classify v4/v6 literals', () => {
    expect(isBlockedIPv4('8.8.8.8')).toBe(false);
    expect(isBlockedIPv4('100.63.255.255')).toBe(false);
    expect(isBlockedIPv4('100.64.0.1')).toBe(true);
    expect(isBlockedIPv4('198.18.0.1')).toBe(true);
    expect(isBlockedIPv6('2001:4860:4860::8888')).toBe(false);
    expect(isBlockedIPv6('[fc00::1]')).toBe(true);
    expect(isBlockedIPv6('::ffff:8.8.8.8')).toBe(false);
    expect(isBlockedIPv6('::ffff:10.0.0.1')).toBe(true);
  });
});

describe('wp_media.upload_from_url redirect and size guards', () => {
  it('re-validates every redirect hop and refuses a bounce to a private address', async () => {
    const { calls, fetchImpl } = mockFetch((req: CapturedRequest) => {
      if (req.url === 'https://cdn.example.com/a.png') {
        return { status: 302, body: '', headers: { location: 'http://169.254.169.254/latest/meta-data' } };
      }
      return { status: 200, body: PNG.buffer, headers: { 'content-type': 'image/png' } };
    });
    const res = await callTool(fetchImpl, { action: 'upload_from_url', source_url: 'https://cdn.example.com/a.png' });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/private, loopback or link-local/);
    expect(calls.map((c) => c.url)).toEqual(['https://cdn.example.com/a.png']);
    expect(calls[0].redirect).toBe('manual');
  });

  it('follows a public redirect and uploads the final image', async () => {
    const { calls, fetchImpl } = mockFetch((req: CapturedRequest) => {
      if (req.url === 'https://cdn.example.com/a.png') {
        return { status: 301, body: '', headers: { location: '/b.png' } };
      }
      if (req.url === 'https://cdn.example.com/b.png') {
        return { status: 200, body: PNG.buffer, headers: { 'content-type': 'image/png' } };
      }
      return { status: 201, body: { id: 5, source_url: 'https://example.com/wp-content/uploads/b.png' } };
    });
    const res = await callTool(fetchImpl, { action: 'upload_from_url', source_url: 'https://cdn.example.com/a.png' });
    expect(res.isError).toBeFalsy();
    expect(calls.map((c) => c.url)).toEqual([
      'https://cdn.example.com/a.png',
      'https://cdn.example.com/b.png',
      expect.stringContaining('/wp-json/wp/v2/media'),
    ]);
  });

  it('refuses an oversized image without buffering it (content-length precheck)', async () => {
    const { calls, fetchImpl } = mockFetch(() => ({
      status: 200,
      body: PNG.buffer,
      headers: { 'content-type': 'image/png', 'content-length': String(16 * 1024 * 1024) },
    }));
    const res = await callTool(fetchImpl, { action: 'upload_from_url', source_url: 'https://cdn.example.com/huge.png' });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/upload cap/);
    expect(calls).toHaveLength(1);
  });

  it('aborts a streamed body that exceeds the cap even without content-length', async () => {
    const big = new Uint8Array(16 * 1024 * 1024);
    const { calls, fetchImpl } = mockFetch(() => ({ status: 200, body: big.buffer, headers: { 'content-type': 'image/png' } }));
    const res = await callTool(fetchImpl, { action: 'upload_from_url', source_url: 'https://cdn.example.com/huge.png' });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/exceeds|cap/);
    expect(calls).toHaveLength(1);
  });
});

describe('wp_media.upload_from_url', () => {
  it('fetches the image and sideloads it into /wp/v2/media with auth + filename', async () => {
    const { calls, fetchImpl } = mockFetch((req: CapturedRequest) => {
      if (req.url.startsWith('https://cdn.shopify.com/')) {
        return { status: 200, body: PNG.buffer, headers: { 'content-type': 'image/png' } };
      }
      if (req.url.includes('/wp-json/wp/v2/media') && req.method === 'POST' && !/media\/\d+/.test(req.url)) {
        return { status: 201, body: { id: 9001, source_url: 'https://example.com/wp-content/uploads/lilly.png', mime_type: 'image/png' } };
      }
      // title/alt follow-up
      return { status: 200, body: { id: 9001, source_url: 'https://example.com/wp-content/uploads/lilly.png', mime_type: 'image/png', alt_text: 'Lilly print', title: { rendered: 'Lilly 8x10' } } };
    });

    const res = await callTool(fetchImpl, {
      action: 'upload_from_url',
      source_url: 'https://cdn.shopify.com/s/files/1/lilly-print.png',
      title: 'Lilly 8x10',
      alt_text: 'Lilly print',
    });

    expect(res.isError).toBeFalsy();
    // image fetched without auth; upload authenticated with the right headers
    const imageCall = calls[0];
    expect(imageCall.headers.Authorization).toBeUndefined();
    const uploadCall = calls[1];
    expect(uploadCall.url).toContain('/wp-json/wp/v2/media');
    expect(uploadCall.headers.Authorization).toContain('Basic ');
    expect(uploadCall.headers['Content-Type']).toBe('image/png');
    expect(uploadCall.headers['Content-Disposition']).toContain('filename="lilly-print.png"');
    // follow-up set title/alt, and the result text carries the attachment
    expect(calls[2].url).toContain('/wp-json/wp/v2/media/9001');
    expect(res.content[0].text).toContain('9001');
    expect(res.content[0].text).toContain('Lilly 8x10');
  });

  it('refuses non-image content types and unsafe URLs', async () => {
    const { fetchImpl } = mockFetch([{ status: 200, body: '<html>', headers: { 'content-type': 'text/html' } }]);
    const html = await callTool(fetchImpl, { action: 'upload_from_url', source_url: 'https://example.org/page' });
    expect(html.isError).toBe(true);
    expect(html.content[0].text).toContain('image/*');

    const ssrf = await callTool(fetchImpl, { action: 'upload_from_url', source_url: 'http://169.254.169.254/x.jpg' });
    expect(ssrf.isError).toBe(true);
  });

  it('lists media with summary projection', async () => {
    const { calls, fetchImpl } = mockFetch([
      {
        status: 200,
        body: [
          { id: 1, source_url: 'https://x/1.jpg', mime_type: 'image/jpeg', title: { rendered: 'One' }, guid: { rendered: 'noise' }, description: { rendered: 'long'.repeat(500) } },
        ],
      },
    ]);
    const res = await callTool(fetchImpl, { action: 'list_media', query: { search: 'lilly' } });
    expect(res.isError).toBeFalsy();
    expect(calls[0].url).toContain('search=lilly');
    const items = (res.structuredContent?.data ?? []) as Array<Record<string, unknown>>;
    expect(items[0]).toMatchObject({ id: 1, mime_type: 'image/jpeg', title: 'One' });
    expect(items[0]).not.toHaveProperty('guid');
  });
});

describe('wp_media response shaping (detail/fields conventions)', () => {
  const RAW = { id: 5, source_url: 'https://x/y.png', mime_type: 'image/png', caption: { rendered: 'A caption' }, extra: 'kept-only-in-full' };

  it('fields project from the RAW attachment, not the summary', async () => {
    const { fetchImpl } = mockFetch([{ status: 200, body: RAW }]);
    const res = await callTool(fetchImpl, { action: 'get_media', id: 5, fields: ['caption'] });
    expect(res.isError).toBeUndefined();
    expect(res.structuredContent?.data).toEqual({ id: 5, caption: { rendered: 'A caption' } });
  });

  it('detail:"full" returns the raw attachment; default stays summarized', async () => {
    const { fetchImpl } = mockFetch([{ status: 200, body: RAW }]);
    const full = await callTool(fetchImpl, { action: 'get_media', id: 5, detail: 'full' });
    expect(full.structuredContent?.data).toEqual(RAW);
    const { fetchImpl: f2 } = mockFetch([{ status: 200, body: RAW }]);
    const summary = await callTool(f2, { action: 'get_media', id: 5 });
    expect((summary.structuredContent?.data as Record<string, unknown>).extra).toBeUndefined();
  });
});
