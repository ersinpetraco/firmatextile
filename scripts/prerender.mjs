// Writes the rendered page into dist/index.html after the client build,
// so search engines and AI tools read the content without running JavaScript.
import { readFile, writeFile, rm } from 'node:fs/promises'

const dist = new URL('../dist/', import.meta.url)
const ssrDir = new URL('../dist-ssr/', import.meta.url)

const { render } = await import(new URL('entry-server.js', ssrDir).href)
const site = JSON.parse(await readFile(new URL('content/site.json', dist), 'utf8'))
const html = await readFile(new URL('index.html', dist), 'utf8')

const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error('prerender: <div id="root"></div> not found in dist/index.html')

const data = JSON.stringify(site).replace(/</g, '\\u003c')
// The first hero photo is the largest thing on screen, so ask for it ahead of scripts and styles.
const hero1 = site?.hero?.images?.[0]
const preload = hero1 ? `<link rel="preload" as="image" type="image/webp" href="${hero1}" fetchpriority="high">\n</head>` : '</head>'

const out = html.replace('</head>', () => preload).replace(
  marker,
  () => `<div id="root">${render(site)}</div>\n  <script id="site-data" type="application/json">${data}</script>`
)

await writeFile(new URL('index.html', dist), out)
await rm(ssrDir, { recursive: true, force: true })
console.log('prerender: wrote dist/index.html')
