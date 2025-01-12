import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRequestEvent } from './request-event';
import type { ServerRequestEvent, QwikSerializer, EnvGetter } from './types';

describe('requestEvent', () => {
  let requestEvent: ReturnType<typeof createRequestEvent>;
  let serverRequestEvent: ServerRequestEvent;
  let qwikSerializer: QwikSerializer;

  describe('redirect', () => {
    beforeEach(() => {
      serverRequestEvent = {
        url: new URL('http://localhost'),
        request: new Request('http://localhost'),
        platform: {},
        env: {} as EnvGetter,
        mode: 'dev',
        locale: 'en',
        getClientConn: vi.fn(),
        getWritableStream: vi.fn().mockReturnValue({
          getWriter: vi.fn().mockReturnValue({
            write: vi.fn(),
            close: vi.fn(),
          }),
        }),
      } as ServerRequestEvent;

      qwikSerializer = {} as QwikSerializer;

      requestEvent = createRequestEvent(
        serverRequestEvent,
        null,
        [],
        undefined,
        false,
        '',
        qwikSerializer,
        vi.fn()
      );
    });

    it('should set the correct status and location header', () => {
      requestEvent.redirect(302, 'https://example.com');
      expect(requestEvent.status()).toBe(302);
      expect(requestEvent.headers.get('Location')).toBe('https://example.com');
    });

    it('should not set Cache-Control header for status codes <= 301', () => {
      requestEvent.redirect(301, 'https://example.com');
      expect(requestEvent.headers.has('Cache-Control')).toBe(false);
    });

    it('should set Cache-Control header to no-store for status codes > 301', () => {
      requestEvent.redirect(302, 'https://example.com');
      expect(requestEvent.headers.get('Cache-Control')).toBe('no-store');
    });

    it('should properly encode the location header', () => {
      requestEvent.redirect(301, 'https://example.com/lócation?foo=baš');
      expect(requestEvent.headers.get('Location')).toBe(
        'https://example.com/l%C3%B3cation?foo=ba%C5%A1'
      );
    });
  });
});
