import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

const root = document.getElementById('root')
// Prerendered builds embed the content, so hydrate the static HTML instead of starting empty.
const initialSite = JSON.parse(document.getElementById('site-data')?.textContent || 'null')
const page = window.location.pathname.replace(/\/+$/, '') === '/fabrics' ? 'fabrics' : 'home'

if (initialSite && root.hasChildNodes()) ReactDOM.hydrateRoot(root, <App initialSite={initialSite} page={page} />)
else ReactDOM.createRoot(root).render(<App page={page} />)
