/**
 * Enhanced Service Worker for Offline PWA Support
 * Provides offline editing capabilities with background sync
 */

// TypeScript declarations for Service Worker
declare const self: ServiceWorkerGlobalScope;

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
  tag?: string;
}

interface ExtendableMessageEvent extends MessageEvent {
  waitUntil(promise: Promise<any>): void;
  ports: MessagePort[];
  data: any;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
  waitUntil(promise: Promise<any>): void;
}

interface Client {
  url: string;
  frameType?: string;
  id: string;
  postMessage(message: any, transfer?: Transferable[]): void;
}

declare global {
  interface ServiceWorkerGlobalScope {
    skipWaiting(): void;
    clients: {
      claim(): Promise<void>;
      matchAll(options?: { includeUncontrolled?: boolean }): Promise<Array<Client>>;
    };
    addEventListener(
      type: 'install' | 'activate' | 'fetch' | 'sync' | 'message',
      listener: (event: ExtendableEvent | FetchEvent | ExtendableMessageEvent | any) => any
    ): void;
  }
}

const CACHE_NAME = 'mindmap-web-v1';
const OFFLINE_CACHE = 'mindmap-offline-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Cache strategy types
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('[SW] Initializing offline cache');
        return cache.addAll([]);
      }),
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim(),
    ])
  );
});

/**
 * Fetch event - implement cache strategies
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    // Handle POST requests for offline editing
    if (request.url.includes('/api/') && request.method === 'POST') {
      event.respondWith(handleOfflinePost(request));
    }
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine cache strategy based on request
  const strategy = getCacheStrategy(request);

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(cacheFirst(request));
      break;
    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(request));
      break;
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(request));
      break;
    case CACHE_STRATEGIES.NETWORK_ONLY:
      event.respondWith(networkOnly(request));
      break;
    case CACHE_STRATEGIES.CACHE_ONLY:
      event.respondWith(cacheOnly(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

/**
 * Determine cache strategy for request
 */
function getCacheStrategy(request: Request): string {
  const url = new URL(request.url);

  // Static assets - cache first
  if (request.destination === 'image' || request.destination === 'font') {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // API calls - network first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // HTML documents - network first
  if (request.mode === 'navigate') {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // JS and CSS - stale while revalidate
  if (request.destination === 'script' || request.destination === 'style') {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }

  return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * Cache first strategy
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  console.log('[SW] Cache miss, fetching:', request.url);
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

/**
 * Network first strategy
 */
async function networkFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);

  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html') as Promise<Response>;
    }

    throw error;
  }
}

/**
 * Stale while revalidate strategy
 */
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

/**
 * Network only strategy
 */
async function networkOnly(request: Request): Promise<Response> {
  return fetch(request);
}

/**
 * Cache only strategy
 */
async function cacheOnly(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (!cached) {
    throw new Error('No cached data available');
  }

  return cached;
}

/**
 * Handle POST requests for offline editing
 */
async function handleOfflinePost(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('[SW] Offline - storing request for background sync');

    // Store request for background sync
    const cache = await caches.open(OFFLINE_CACHE);
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now(),
    };

    // Store in IndexedDB via cache
    await cache.put(
      `offline-request-${Date.now()}`,
      new Response(JSON.stringify(requestData))
    );

    // Return success response
    return new Response(
      JSON.stringify({ success: true, offline: true }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 202,
      }
    );
  }
}

/**
 * Background sync event
 */
self.addEventListener('sync', (event: ExtendableEvent) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-offline-requests') {
    event.waitUntil(syncOfflineRequests());
  }
});

/**
 * Sync offline requests when back online
 */
async function syncOfflineRequests(): Promise<void> {
  const cache = await caches.open(OFFLINE_CACHE);
  const requests = await cache.keys();

  console.log(`[SW] Syncing ${requests.length} offline requests`);

  for (const request of requests) {
    try {
      const response = await cache.match(request);
      if (!response) continue;

      const requestData = await response.json();

      const syncResponse = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
      });

      if (syncResponse.ok) {
        console.log('[SW] Successfully synced:', requestData.url);
        await cache.delete(request);
      }
    } catch (error) {
      console.error('[SW] Failed to sync:', error);
    }
  }
}

/**
 * Message event - handle communication from clients
 */
self.addEventListener('message', (event: ExtendableMessageEvent & { tag?: string }) => {
  console.log('[SW] Received message:', event.data);

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_CACHE_SIZE':
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ size });
      });
      break;
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    case 'GET_OFFLINE_REQUESTS':
      getOfflineRequests().then((requests) => {
        event.ports[0].postMessage({ requests });
      });
      break;
  }
});

/**
 * Get cache size
 */
async function getCacheSize(): Promise<number> {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  let size = 0;

  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      size += blob.size;
    }
  }

  return size;
}

/**
 * Clear all caches
 */
async function clearCache(): Promise<void> {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

/**
 * Get offline requests
 */
async function getOfflineRequests(): Promise<any[]> {
  const cache = await caches.open(OFFLINE_CACHE);
  const keys = await cache.keys();
  const requests = [];

  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const data = await response.json();
      requests.push(data);
    }
  }

  return requests;
}

export {};
