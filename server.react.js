import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, 'frontend', 'dist');

const app = express();

app.set('trust proxy', 1);

app.get('/healthcheck', (_req, res) => {
	res.end('ok');
});

app.use(express.static(dist, { index: false }));

app.get('*', (_req, res) => {
	res.sendFile(path.join(dist, 'index.html'));
});

const port = Number(process.env.PORT) || 8080;

app.listen(port, () => {
	console.log(`React app listening on port ${port}`);
});
