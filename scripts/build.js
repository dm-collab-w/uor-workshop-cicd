import './check-node.js';
import { rm, mkdir, copyFile, cp } from 'node:fs/promises';

// A static app needs no bundler: assemble only the files the browser needs.
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await copyFile('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
console.log('Built dist/: index.html + src/. Ready to upload.');
