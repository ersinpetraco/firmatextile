import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Ticker } from './components/Ticker'
import { About } from './components/About'
import { Collections } from './components/Collections'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App({ initialSite = null }) {
  const [site, setSite] = useState(initialSite)
  const [pastHero, setPastHero] = useState(false)
  const [atContact, setAtContact] = useState(false)
  const [atCollCta, setAtCollCta] = useState(false)
  const ctaOn = pastHero && !atContact && !atCollCta
  const ctaRef = useRef(null)
  const dragRef = useRef(null)
  const draggedRef = useRef(false)

  useEffect(() => {
    const heroBtn = document.querySelector('.hero .btn')
    const contact = document.getElementById('contact')
    if (!heroBtn || !contact || !('IntersectionObserver' in window)) {
      setPastHero(true)
      return
    }
    const heroIO = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting))
    const contactIO = new IntersectionObserver(([entry]) => setAtContact(entry.isIntersecting))
    // Two identical buttons on screen at once looks like a mistake, so the floating one steps aside
    // as soon as the Contact us button under the fabrics comes into view.
    const collCta = document.querySelector('.swatch-cta .btn')
    const collIO = new IntersectionObserver(([entry]) => setAtCollCta(entry.isIntersecting))
    heroIO.observe(heroBtn)
    contactIO.observe(contact)
    if (collCta) collIO.observe(collCta)
    return () => {
      heroIO.disconnect()
      contactIO.disconnect()
      collIO.disconnect()
    }
  }, [])

  function ctaPointerDown(e) {
    const el = ctaRef.current
    dragRef.current = {
      sx: e.clientX, sy: e.clientY,
      bx: parseFloat(el.style.getPropertyValue('--dx')) || 0,
      moved: false
    }
    draggedRef.current = false
    try { el.setPointerCapture(e.pointerId) } catch { /* fake or stale pointer */ }
  }

  function ctaPointerMove(e) {
    const d = dragRef.current
    const el = ctaRef.current
    if (!d) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (!d.moved && Math.hypot(dx, dy) < 7) return
    d.moved = true
    el.classList.add('dragging')
    el.style.transition = 'none'
    el.style.setProperty('--dx', `${d.bx + dx}px`)
    el.style.setProperty('--dy', `${dy}px`)
  }

  function ctaPointerUp(e) {
    const d = dragRef.current
    const el = ctaRef.current
    dragRef.current = null
    if (!d?.moved) return
    draggedRef.current = true
    el.classList.remove('dragging')
    el.style.transition = 'transform .55s cubic-bezier(.3,1.4,.55,1)'
    const w = window.innerWidth
    const pw = el.offsetWidth
    const cur = w / 2 + d.bx + (e.clientX - d.sx)
    const anchors = [pw / 2 + 18, w / 2, w - pw / 2 - 18]
    const nearest = anchors.reduce((a, b) => (Math.abs(b - cur) < Math.abs(a - cur) ? b : a))
    el.style.setProperty('--dx', `${nearest - w / 2}px`)
    el.style.setProperty('--dy', '0px')
    setTimeout(() => { el.style.transition = '' }, 600)
  }

  function ctaClick(e) {
    if (draggedRef.current) {
      e.preventDefault()
      draggedRef.current = false
      return
    }
    scrollToContact(e)
  }

  // In-page links scroll to their section without writing #about or #collections into the address,
  // so a refresh (or pull-to-refresh on a phone) always reloads plain firmatextile.com. Someone who
  // arrives with an anchor, e.g. from the old /fabrics address, still lands on that section, and the
  // anchor is then dropped from the address.
  useEffect(() => {
    const clean = () => history.replaceState(history.state, '', location.pathname + location.search)
    function arriveAtHash() {
      if (!location.hash) return
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      clean()
      if (!target) return
      // Scroll now rather than on the next frame (background tabs get no frames), and again once the
      // page has loaded in case anything above the section changed height meanwhile.
      target.scrollIntoView()
      if (document.readyState !== 'complete') window.addEventListener('load', () => target.scrollIntoView(), { once: true })
    }
    arriveAtHash()
    window.addEventListener('hashchange', arriveAtHash)
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest?.('a[href^="#"]')
      if (!a) return
      const target = document.getElementById(a.getAttribute('href').slice(1))
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth' })
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('hashchange', arriveAtHash)
    }
  }, [])

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
      .catch(() => setSite(s => s || {}))
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
      <Collections data={site?.collections} onContactClick={scrollToContact} />
      <Contact data={site?.contact} />
      <Footer data={site?.footer} />
      <a
        href="#contact"
        ref={ctaRef}
        className={`sticky-cta${ctaOn ? ' on' : ''}`}
        onClick={ctaClick}
        onPointerDown={ctaPointerDown}
        onPointerMove={ctaPointerMove}
        onPointerUp={ctaPointerUp}
        onPointerCancel={ctaPointerUp}
      >
        <span className="fleur" aria-hidden="true" />{site?.collections?.ctaLabel || 'Contact us'}
      </a>
    </>
  )
}
