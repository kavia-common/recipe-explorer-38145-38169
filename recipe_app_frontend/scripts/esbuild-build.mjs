import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, cpSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

const outdir = resolve(root, 'dist');
mkdirSync(outdir, { recursive: true });

// Build JS bundle from src/main.jsx entry
await build({
  entryPoints: [resolve(root, 'src', 'main.jsx')],
  outdir,
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'esm',
  target: ['es2020'],
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.css': 'css'
  }
});

// Generate an index.html that references the built bundle (main.js)
const original = readFileSync(resolve(root, 'index.html'), 'utf8');
const html = original.replace(
  /<script type="module" src="[^"]+"><\/script>/,
  '<script type="module" src="/main.js"></script>'
);
writeFileSync(resolve(outdir, 'index.html'), html, 'utf8');

// Copy config.xml and public assets if present
try {
  copyFileSync(resolve(root, 'config.xml'), resolve(outdir, 'config.xml'));
} catch {}
try {
  cpSync(resolve(root, 'public'), resolve(outdir), { recursive: true });
} catch {}

console.log('esbuild: Build complete at', outdir);
