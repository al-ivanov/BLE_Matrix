/// <reference types="vite-plugin-pwa/client" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();

registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({
		cacheName: 'images',
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200],
			}),
			new ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 30 * 24 * 60 * 60,
			}),
		],
	}),
);

registerRoute(
	({ url }) => url.pathname.startsWith('/img/'),
	new CacheFirst({
		cacheName: 'image-cache',
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200],
			}),
		],
	}),
);

self.addEventListener('message', (event) => {
	void event.data;
});

self.addEventListener('push', (event) => {
	try {
		const body = event.data?.text() ?? '';
		event.waitUntil(
			self.registration.showNotification(body, {
				body,
			}),
		);
	} catch {
		// ignore malformed push payloads
	}
});
