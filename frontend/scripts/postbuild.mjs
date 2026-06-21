import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const dist = join(process.cwd(), 'dist');
const index = join(dist, 'index.html');
const notFound = join(dist, '404.html');

if (!existsSync(index)) {
	console.error('postbuild: dist/index.html not found');
	process.exit(1);
}

copyFileSync(index, notFound);
console.log('postbuild: copied index.html → 404.html (SPA fallback for GitHub Pages)');
