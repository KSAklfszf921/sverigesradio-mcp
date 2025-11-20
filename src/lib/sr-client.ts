/**
 * Sveriges Radio API Client
 * Handles HTTP requests, caching (ETags), and error handling
 */

import { SR_API_BASE, DEFAULT_PARAMS } from '../constants.js';
import { handleAPIError } from './errors.js';

interface CacheEntry {
  data: any;
  etag: string | null;
  expiresAt: number;
}

interface RequestParams {
  [key: string]: string | number | boolean | undefined;
}

const DEFAULT_TIMEOUT_MS = Number(process.env.SR_API_TIMEOUT_MS || 8000);
const MAX_RETRIES = 2;
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_CACHE_ENTRIES = 300;

export class SRClient {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Build full URL with query parameters
   */
  private buildURL(endpoint: string, params?: RequestParams): string {
    const url = new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, SR_API_BASE);

    const finalParams = { ...DEFAULT_PARAMS, ...params };

    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * Generate cache key from URL
   */
  private getCacheKey(url: string): string {
    return url;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Calculate cache expiry based on response headers
   * Default to 5 minutes if no cache headers present
   */
  private calculateExpiry(headers: Headers): number {
    const cacheControl = headers.get('cache-control');
    if (cacheControl) {
      const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        return Date.now() + parseInt(maxAgeMatch[1]) * 1000;
      }
    }

    // Default: 5 minutes
    return Date.now() + 5 * 60 * 1000;
  }

  /**
   * Fetch data from SR API with caching support
   */
  async fetch<T = any>(endpoint: string, params?: RequestParams): Promise<T> {
    const url = this.buildURL(endpoint, params);
    const cacheKey = this.getCacheKey(url);
    const cached = this.cache.get(cacheKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'sverigesradio-mcp/1.0.0',
      };

      // Add If-None-Match header if we have cached ETag
      if (cached && !this.isExpired(cached) && cached.etag) {
        headers['If-None-Match'] = cached.etag;
      }

      const response = await this.fetchWithRetries(url, headers, controller.signal);

      // 304 Not Modified - return cached data
      if (response.status === 304 && cached) {
        cached.expiresAt = this.calculateExpiry(response.headers);
        return cached.data;
      }

      if (!response.ok) {
        const body = await response.text();
        handleAPIError({
          response: {
            status: response.status,
            data: body,
            headers: Object.fromEntries(response.headers.entries()),
          },
          config: { url },
        });
      }

      const data = (await response.json()) as T;

      this.setCache(cacheKey, {
        data,
        etag: response.headers.get('etag'),
        expiresAt: this.calculateExpiry(response.headers),
      });

      return data;
    } catch (error) {
      // If we have expired cache, return it as fallback
      if (cached) {
        console.warn('API request failed, returning expired cache', error);
        return cached.data;
      }

      handleAPIError(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Fetch paginated data
   */
  async fetchPaginated<T = any>(
    endpoint: string,
    params?: RequestParams & { page?: number; size?: number }
  ): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...params,
      pagination: true,
    }) as Promise<T>;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    let expired = 0;
    let valid = 0;

    this.cache.forEach((entry) => {
      if (this.isExpired(entry)) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      total: this.cache.size,
      valid,
      expired,
    };
  }

  private async fetchWithRetries(url: string, headers: Record<string, string>, signal: AbortSignal) {
    let attempt = 0;
    let lastError: any | undefined;

    while (attempt <= MAX_RETRIES) {
      try {
        const response = await fetch(url, { headers, signal });

        if (RETRY_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
          await this.delay((attempt + 1) * 200);
          attempt++;
          continue;
        }

        return response;
      } catch (error: any) {
        lastError = error;
        if (error?.name === 'AbortError' || attempt === MAX_RETRIES) {
          throw lastError;
        }
        await this.delay((attempt + 1) * 200);
        attempt++;
      }
    }

    throw lastError;
  }

  private setCache(key: string, entry: CacheEntry) {
    this.cache.set(key, entry);
    if (this.cache.size > MAX_CACHE_ENTRIES) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const srClient = new SRClient();
