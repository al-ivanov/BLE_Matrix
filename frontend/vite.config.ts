import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaConfiguration } from './pwa-configuration';

export default defineConfig({
	plugins: [react(), VitePWA(pwaConfiguration)],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
