import { useEffect } from 'react'

export function Hero({ data, onContactClick }) {
  useEffect(() => {
    const img = new Image()
    img.onerror = () => {
      document.querySelectorAll('#hero-slides .slide[data-fb]').forEach(el => {
        el.style.backgroundImage = `url('${el.dataset.fb}')`
      })
    }
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAkA4JZACdAEO/gHOAAA='
  }, [])

  useEffect(() => {
    const slides = document.querySelectorAll('.hero .slide')
    const rm = window.matchMedia?.('(prefers-reduced-motion:reduce)').matches
    if (rm || slides.length < 2) return
    let i = 0
    const ms = (data?.rotateSeconds || 7.5) * 1000
    const timer = setInterval(() => {
      slides[i].classList.remove('on')
      i = (i + 1) % slides.length
      slides[i].classList.add('on')
    }, ms)
    return () => clearInterval(timer)
  }, [data?.images])

  return (
    <section className="hero" aria-label="Introduction">
      <div id="hero-slides">
        {(data?.images || []).map((src, i) => (
          <div
            key={i}
            className={`slide${i === 0 ? ' on' : ''}`}
            style={{ backgroundImage: `url('${src}')` }}
            data-fb={src.replace(/\.webp$/, '.jpg')}
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
            {data?.ctaLabel || 'Request the collection'}
          </button>
        </div>
      </div>
    </section>
  )
}
