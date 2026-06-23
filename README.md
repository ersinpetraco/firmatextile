# Firma Textile — demo site

Static single-page site. No build step, no dependencies.

## Files
- `index.html` — the page (CSS, fonts, logo and ornament are embedded; photos load from `assets/`)
- `assets/` — images + `menu.js` (mobile menu + contact form)
- `robots.txt` — blocks all search engines and known AI crawlers
- `vercel.json` — sets `X-Robots-Tag: noindex` + security headers (HSTS, CSP, X-Frame-Options, etc.)
- `.htaccess` — same headers for Apache hosts (ignore on Vercel/Netlify)

## Deploy
- **Vercel / Netlify:** drag this folder into the dashboard, or connect a Git repo. `vercel.json` is applied automatically; on Netlify rename it to `_headers` syntax or keep `.htaccess` is not used — see notes below.
- **Any static host / Apache:** upload the folder contents; `.htaccess` applies the headers.

## Stays out of search (as requested)
`index.html` carries `noindex` meta tags, `robots.txt` blocks crawlers, and `vercel.json`/`.htaccess` add the `X-Robots-Tag` header (the only hard guarantee). For a fully private preview, also turn on the host's password/deployment protection.

## Before it goes fully live
The contact form collects personal data, so the consent checkbox links to a `privacy notice` (currently `#`). Add a real privacy page there. For a German/Austrian-facing business an Impressum is also expected.

The contact form opens the visitor's email app addressed to hello@firmatextile.com — no backend, no third-party data processor. To handle submissions server-side instead, give the `<form>` an action/method (see the comment in `assets/menu.js`).
