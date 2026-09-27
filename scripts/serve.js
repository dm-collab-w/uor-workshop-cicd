import './check-node.js';
import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const args = process.argv.slice(2);
const root = resolve(args[0] === 'dist' ? 'dist' : '.');
const portIndex = args.indexOf('--port');
const port = Number(portIndex < 0 ? 3000 : args[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Use a port from 1 to 65535, e.g. npm start -- --port 3001');
  process.exit(1);
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    // Serve browser assets only; never expose repository files or hidden files.
    if (relative !== 'index.html' && !relative.startsWith('src/')) throw new Error('Not public');
    const path = await realpath(resolve(root, relative));
    if (path !== resolve(root, 'index.html') && !path.startsWith(resolve(root, 'src') + sep)) throw new Error('Not public');
    if (!types[extname(path)] || relative.split('/').some(part => part.startsWith('.'))) throw new Error('Not public');
    const content = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)] + '; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Port busy. Stop the other server or use npm start -- --port 3001' : error.message);
  process.exit(1);
});
server.listen(port, '127.0.0.1', () => console.log(`App running at http://localhost:${port}`));
