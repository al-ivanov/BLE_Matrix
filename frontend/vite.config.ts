import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { createPwaConfiguration } from './pwa-configuration';

const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
	base,
	plugins: [react(), VitePWA(createPwaConfiguration(base))],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
