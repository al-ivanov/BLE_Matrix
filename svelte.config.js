import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaConfiguration } from './pwa-configuration.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter({ out: 'build' }),

		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		},
		vite: {
			plugins: [VitePWA(pwaConfiguration)]
		}
	}
};

export default config;
