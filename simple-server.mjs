import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const publicPath = path.join(__dirname, 'dist');

app.use(express.static(publicPath, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.js')   res.set('Content-Type', 'application/javascript; charset=utf-8');
    if (ext === '.css')  res.set('Content-Type', 'text/css; charset=utf-8');
    if (ext === '.html') res.set('Content-Type', 'text/html; charset=utf-8');
    if (ext === '.json') res.set('Content-Type', 'application/json; charset=utf-8');
    if (ext === '.svg')  res.set('Content-Type', 'image/svg+xml; charset=utf-8');
  }
}));

app.get('*', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(3002, '127.0.0.1', () => {
  console.log('[aegis-static] Server running at http://127.0.0.1:3002');
});
