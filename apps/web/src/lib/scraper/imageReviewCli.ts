#!/usr/bin/env tsx

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { ResearchedProduct } from './imageResearch'

type ResearchManifest = {
  products: ResearchedProduct[]
}

async function main() {
  const input = resolve(readArg('--input=') ?? '../../data/catalogue-enrichment/first-100-image-research.json')
  const output = resolve(readArg('--output=') ?? '../../data/catalogue-enrichment/first-100-image-review.html')
  const manifest = JSON.parse(await readFile(input, 'utf8')) as ResearchManifest
  const payload = JSON.stringify(manifest.products).replaceAll('<', '\\u003c')

  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, renderHtml(payload), 'utf8')
  console.log(JSON.stringify({ input, output, products: manifest.products.length }, null, 2))
}

function readArg(prefix: string) {
  return process.argv.slice(2).find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
}

function renderHtml(payload: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Catalogue image review</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 18px; background: #e5e7eb; color: #111827; font: 13px Arial, sans-serif; }
    header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; }
    h1 { margin: 0; font-size: 22px; }
    #summary { color: #475569; }
    main { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    article { position: relative; min-height: 270px; overflow: hidden; border: 1px solid #cbd5e1; border-radius: 8px; background: white; padding: 9px; }
    .number { position: absolute; top: 7px; left: 7px; z-index: 2; border-radius: 12px; background: #111827; color: white; padding: 3px 7px; }
    img { display: block; width: 100%; height: 155px; object-fit: contain; background: #f8fafc; }
    h2 { margin: 8px 0 4px; font-size: 13px; line-height: 1.25; }
    p { margin: 0 0 5px; color: #475569; font-size: 11px; }
    small { display: block; color: #64748b; font-size: 10px; line-height: 1.2; }
    .missing { display: grid; height: 155px; place-items: center; background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <header>
    <h1>Catalogue image review</h1>
    <div id="summary"></div>
  </header>
  <main id="grid"></main>
  <script>
    const products = ${payload};
    const pageSize = 20;
    const page = Math.max(1, Math.min(Math.ceil(products.length / pageSize), Number(new URLSearchParams(location.search).get('page')) || 1));
    const offset = (page - 1) * pageSize;
    const rows = products.slice(offset, offset + pageSize);
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    document.getElementById('summary').textContent = 'Page ' + page + ' of ' + Math.ceil(products.length / pageSize) + ' | Products ' + (offset + 1) + '-' + (offset + rows.length);
    document.getElementById('grid').innerHTML = rows.map((row, index) => {
      const image = row.selected?.thumbnail || row.selected?.image;
      const media = image
        ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(row.product.title) + '">'
        : '<div class="missing">No image selected</div>';
      return '<article><div class="number">' + (offset + index + 1) + '</div>' + media
        + '<h2>' + escapeHtml(row.product.title) + '</h2>'
        + '<p>' + escapeHtml(row.product.brandName) + ' | ' + escapeHtml(row.product.mpn || row.product.sku) + '</p>'
        + '<small>' + escapeHtml(row.selected?.title || 'Manual review required') + '</small></article>';
    }).join('');
  </script>
</body>
</html>
`
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
