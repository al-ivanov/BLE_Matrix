import type { VitePWAOptions } from 'vite-plugin-pwa';

const manifestIcons = [
	{ src: 'icons/android-chrome-36x36.png', sizes: '36x36', type: 'image/png' },
	{ src: 'icons/android-chrome-48x48.png', sizes: '48x48', type: 'image/png' },
	{ src: 'icons/android-chrome-72x72.png', sizes: '72x72', type: 'image/png' },
	{ src: 'icons/android-chrome-96x96.png', sizes: '96x96', type: 'image/png' },
	{ src: 'icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
	{ src: 'icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
	{ src: 'icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
	{ src: 'icons/android-chrome-384x384.png', sizes: '384x384', type: 'image/png' },
	{ src: 'icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
];

export function createPwaConfiguration(base: string): Partial<VitePWAOptions> {
	const scope = base.endsWith('/') ? base : `${base}/`;
	const startUrl = scope;

	return {
		registerType: 'autoUpdate',
		injectRegister: 'auto',
		strategies: 'injectManifest',
		srcDir: 'src',
		filename: 'sw.ts',
		includeAssets: [
			'icons/favicon.ico',
			'icons/*.png',
			'icons/*.svg',
			'robots.txt',
			'browserconfig.xml',
			'manifest.json',
		],
		manifest: {
			name: 'BLE Матрица',
			short_name: 'BLE Матрица',
			description: 'Приложение для управлением панелью по блютузу',
			theme_color: '#3071a9',
			background_color: '#312e81',
			display: 'standalone',
			scope,
			start_url: startUrl,
			lang: 'ru',
			orientation: 'any',
			icons: manifestIcons,
		},
		injectManifest: {
			globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,txt,xml}'],
		},
		workbox: {
			navigateFallback: `${scope}index.html`,
			globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,txt,xml}'],
		},
	};
}
