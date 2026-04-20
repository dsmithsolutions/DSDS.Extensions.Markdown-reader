/**
 * Debug script: renders sample.md and writes a self-contained preview.html
 * that loads KaTeX and Mermaid from node_modules (file:// paths, not webview URIs).
 *
 * Usage: node scripts/preview-debug.js
 * Then open preview.html in a browser to check rendering.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { createRenderer } = require('../out/renderer/index.js');

const ROOT = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'sample.md'), 'utf8');

const md = createRenderer();
const renderedHtml = md.render(src);

// ── Log every element that carries a data-katex or mermaid attribute ─────────
console.log('\n=== Rendered data-katex / mermaid elements ===\n');
const lines = renderedHtml.split('\n');
lines.forEach((line, i) => {
  if (line.includes('data-katex') || line.includes('ado-mermaid') || line.includes('data-mermaid')) {
    console.log(`line ${i + 1}: ${line}`);
  }
});

// ── Build a self-contained HTML preview (file:// safe) ───────────────────────
const katexCssPath = path.join(ROOT, 'node_modules', 'katex', 'dist', 'katex.min.css');
const katexJsPath  = path.join(ROOT, 'node_modules', 'katex', 'dist', 'katex.min.js');
const mermaidJsPath = path.join(ROOT, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');
const adoCssPath   = path.join(ROOT, 'media', 'ado.css');

// Inline the small CSS; load the large JS files from node_modules via file://
const adoCss   = fs.readFileSync(adoCssPath, 'utf8');

// Use the compiled main.js (same code that runs in the webview)
const mainJsPath = path.join(ROOT, 'out', 'webview', 'main.js');
const clientScript = fs.readFileSync(mainJsPath, 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${katexCssPath.replace(/\\/g, '/')}">
  <style>${adoCss}</style>
  <title>ADO Preview Debug</title>
</head>
<body>
  <div id="preview">${renderedHtml}</div>
  <script src="${katexJsPath.replace(/\\/g, '/')}"></script>
  <script src="${mermaidJsPath.replace(/\\/g, '/')}"></script>
  <script>${clientScript}</script>
</body>
</html>`;

const outPath = path.join(ROOT, 'preview.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`\nPreview written to: ${outPath}`);
console.log('Open it in a browser to inspect KaTeX and Mermaid rendering.\n');
