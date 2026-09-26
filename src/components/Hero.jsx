import { useEffect } from 'react'

export function Hero({ data, onContactClick }) {
  // Keyed on the list of photos, not the data object, so a refetch of identical content does not
  // restart the rotation or the downloads.
  const imagesKey = (data?.images || []).join('|')

  // Only the first photo is in the page markup, so it is the only one fetched before first paint.
  // The rest start downloading once the page has finished loading, and each slide is marked ready
  // only when its photo has fully arrived, so the rotation never fades into an empty slide.
  useEffect(() => {
    const slides = [...document.querySelectorAll('#hero-slides .slide')]
    if (!slides.length) return
    const start = webp => {
      if (!webp && slides[0]) slides[0].style.backgroundImage = `url('${slides[0].dataset.fb}')`
      const loadRest = () => slides.slice(1).forEach(el => {
        const src = webp ? el.dataset.src : el.dataset.fb
        const img = new Image()
        img.onload = () => {
          el.style.backgroundImage = `url('${src}')`
          el.dataset.ready = '1'
        }
        img.src = src
      })
      if (document.readyState === 'complete') loadRest()
      else window.addEventListener('load', loadRest, { once: true })
    }
    const probe = new Image()
    probe.onload = () => start(true)
    probe.onerror = () => start(false)
    probe.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAkA4JZACdAEO/gHOAAA='
  }, [imagesKey])

  useEffect(() => {
    const slides = document.querySelectorAll('.hero .slide')
    const rm = window.matchMedia?.('(prefers-reduced-motion:reduce)').matches
    if (rm || slides.length < 2) return
    let i = 0
    const ms = (data?.rotateSeconds || 7.5) * 1000
    const timer = setInterval(() => {
      let next = (i + 1) % slides.length
      while (next !== i && !slides[next].dataset.ready) next = (next + 1) % slides.length
      if (next === i) return
      slides[i].classList.remove('on')
      i = next
      slides[i].classList.add('on')
    }, ms)
    return () => clearInterval(timer)
  }, [imagesKey])

  return (
    <section className="hero" aria-label="Introduction">
      <div id="hero-slides">
        {(data?.images || []).map((src, i) => (
          <div
            key={i}
            className={`slide${i === 0 ? ' on' : ''}`}
            style={i === 0 ? { backgroundImage: `url('${src}')` } : undefined}
            data-src={src}
            data-fb={src.replace(/\.webp$/, '.jpg')}
            data-ready={i === 0 ? '1' : undefined}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="scrim" />
      <div className="wrap">
        <h1><span>{data?.line1}</span><br /><span>{data?.line2}</span></h1>
        <div className="div"><i /><span className="fleur" /><i /></div>
        <p className="lede">{data?.lede}</p>
        <div className="actions">
          <button className="btn" onClick={onContactClick}>
            {data?.ctaLabel || 'Get in touch'}
          </button>
        </div>
      </div>
    </section>
  )
}
