const CACHE_NAME = 'fluxo-pwa-v2';
const ASSETS_STATIC = [
  '/manifest.webmanifest',
  '/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-apple.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Caching resiliente para não abortar a instalação do PWA caso algum arquivo falhe
      for (const asset of ASSETS_STATIC) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[PWA SW] Não foi possível pré-armazenar:', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignora chamadas que não são GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignora chamadas de autenticação e API dinâmica para sempre consultar a rede
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ erro: 'Sem conexão de rede' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Estratégia Network First com Fallback para Cache para páginas e assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for 200 e for do mesmo domínio, clonamos e salvamos no cache
        if (response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar a rede (offline), busca no cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se for uma navegação HTML e não estiver em cache, retorna a página inicial ou offline
          if (event.request.mode === 'navigate') {
            return caches.match('/').then((homeResponse) => {
              return homeResponse || new Response('Offline', { status: 503, statusText: 'Offline' });
            });
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
