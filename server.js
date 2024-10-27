import { handler } from './build/handler.js';
import express from 'express';

const app = express();

app.set('trust proxy', 1);

app.get('/healthcheck', (req, res) => {
  res.end('ok');
});

app.use(handler);

app.listen(8080, () => {
  console.log('listening on port 8080');
});