import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Ticker } from './components/Ticker'
import { About } from './components/About'
import { Collections } from './components/Collections'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  const [site, setSite] = useState(null)

  useEffect(() => {
    fetch('/content/site.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.theme) {
          const root = document.documentElement
          const map = {
            gold: '--gold',
            goldHover: '--gold-hover',
            goldLight: '--gold-light',
            ivory: '--ivory',
            brown: '--brown',
            ink: '--ink',
            parchment: '--parchment',
            taupe: '--taupe'
          }
          Object.entries(map).forEach(([k, v]) => {
            if (d.theme[k]) root.style.setProperty(v, d.theme[k])
          })
        }
        setSite(d)
      })
      .catch(() => setSite({}))
  }, [])

  function scrollToContact(e) {
    e?.preventDefault()
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => document.getElementById('f-name')?.focus({ preventScroll: true }), 900)
  }

  return (
    <>
      <Header />
      <Hero data={site?.hero} onContactClick={scrollToContact} />
      <Ticker items={site?.trust} />
      <About data={site?.about} />
      <div className="wrap"><hr className="rule" /></div>
      <Collections data={site?.collections} onContactClick={scrollToContact} />
      <Contact data={site?.contact} />
      <Footer data={site?.footer} />
      <a href="#contact" className="sticky-cta" onClick={scrollToContact}>
        <span className="dot" />Request swatches
      </a>
    </>
  )
}
