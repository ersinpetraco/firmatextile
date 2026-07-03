import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Ticker } from './components/Ticker'
import { About } from './components/About'
import { Collections } from './components/Collections'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  const [site, setSite] = useState(null)
  const [ctaOn, setCtaOn] = useState(false)
  const ctaRef = useRef(null)
  const dragRef = useRef(null)
  const draggedRef = useRef(false)

  useEffect(() => {
    const heroBtn = document.querySelector('.hero .btn')
    if (!heroBtn || !('IntersectionObserver' in window)) {
      setCtaOn(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => setCtaOn(!entry.isIntersecting))
    io.observe(heroBtn)
    return () => io.disconnect()
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
    let tx = 0
    if (window.matchMedia('(max-width:820px)').matches) {
      const w = window.innerWidth
      const pw = el.offsetWidth
      const cur = w / 2 + d.bx + (e.clientX - d.sx)
      const anchors = [pw / 2 + 16, w / 2, w - pw / 2 - 16]
      const nearest = anchors.reduce((a, b) => (Math.abs(b - cur) < Math.abs(a - cur) ? b : a))
      tx = nearest - w / 2
    }
    el.style.setProperty('--dx', `${tx}px`)
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
        <span className="dot" /><span className="fleur" aria-hidden="true" />Request swatches
      </a>
    </>
  )
}
