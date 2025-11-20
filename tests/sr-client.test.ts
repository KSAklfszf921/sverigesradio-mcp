import { afterEach, expect, test, vi } from 'vitest';
import { SRClient } from '../src/lib/sr-client.js';

afterEach(() => {
  vi.restoreAllMocks();
});

function mockResponse(status: number, body: any, headers: Record<string, string> = {}) {
  const headerMap = new Map<string, string>();
  Object.entries(headers).forEach(([k, v]) => headerMap.set(k.toLowerCase(), v));

  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (key: string) => headerMap.get(key.toLowerCase()) ?? null,
      entries: () => headerMap.entries(),
    },
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as any;
}

test('returns cached data on 304 responses using ETag', async () => {
  const client = new SRClient();

  const firstResponse = mockResponse(200, { value: 1 }, { etag: 'abc', 'cache-control': 'max-age=60' });
  const secondResponse = mockResponse(304, '', { 'cache-control': 'max-age=60' });

  const fetchMock = vi.fn().mockResolvedValueOnce(firstResponse).mockResolvedValueOnce(secondResponse);
  vi.stubGlobal('fetch', fetchMock);

  const first = await client.fetch('channels');
  const second = await client.fetch('channels');

  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(second).toEqual(first);

  const etagHeader = (fetchMock.mock.calls[1]?.[1] as any)?.headers?.['If-None-Match'];
  expect(etagHeader).toBe('abc');
});

test('throws after retries on network error', async () => {
  const client = new SRClient();
  const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
  vi.stubGlobal('fetch', fetchMock);

  await expect(client.fetch('channels')).rejects.toThrow(/network/i);
});
