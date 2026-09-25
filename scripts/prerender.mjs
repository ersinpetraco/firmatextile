// Writes each page's rendered HTML after the client build, so search engines and AI tools read
// the content without running JavaScript. The home page goes to dist/index.html; other pages get
// their own folder with an index.html and a head that names them rather than the home page.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'

const dist = new URL('../dist/', import.meta.url)
const ssrDir = new URL('../dist-ssr/', import.meta.url)
const origin = 'https://www.firmatextile.com'

const { render } = await import(new URL('entry-server.js', ssrDir).href)
const site = JSON.parse(await readFile(new URL('content/site.json', dist), 'utf8'))
const template = await readFile(new URL('index.html', dist), 'utf8')

const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error('prerender: <div id="root"></div> not found in dist/index.html')
const data = JSON.stringify(site).replace(/</g, '\\u003c')

const pages = [
  { page: 'home', out: 'index.html' },
  {
    page: 'fabrics',
    out: 'fabrics/index.html',
    path: '/fabrics',
    title: 'All fabrics · Firma Textile',
    description: 'All Firma Textile fabrics in one place: florals, stripes, dots and animal prints.'
  }
]

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

for (const p of pages) {
  let html = template.replace(
    marker,
    () => `<div id="root">${render(site, p.page)}</div>\n  <script id="site-data" type="application/json">${data}</script>`
  )
  if (p.path) {
    const url = origin + p.path
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(p.description)}`)
      .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(p.description)}`)
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(p.title)}`)
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    await mkdir(new URL(p.out.replace(/[^/]+$/, ''), dist), { recursive: true })
  }
  await writeFile(new URL(p.out, dist), html)
  console.log(`prerender: wrote dist/${p.out}`)
}

await rm(ssrDir, { recursive: true, force: true })
