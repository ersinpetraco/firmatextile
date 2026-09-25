import { renderToString } from 'react-dom/server'
import App from './App'

// Used at build time by scripts/prerender.mjs to write the page as static HTML.
export function render(site) {
  return renderToString(<App initialSite={site} />)
}
