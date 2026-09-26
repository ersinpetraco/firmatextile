import { useState, useRef } from 'react'

// Google lists the mill as "Bengü Tekstil AŞ. Fabr." at 40.240072, 28.935573; the drawn map is
// centred there, so the pin sits at its centre.
const PLACE = 'Bengü Tekstil AŞ. Fabr., Nilüfer, Bursa'
// Browsers keep images for four hours, so bump this whenever scripts/render-map.py redraws the map.
const MAP_VERSION = 2
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(PLACE)
const LIVE_MAP_URL =
  'https://maps.google.com/maps?q=' + encodeURIComponent(PLACE) + '&t=m&z=15&ie=UTF8&iwloc=&output=embed'

export function Contact({ data }) {
  const [note, setNote] = useState({ text: '', type: '' })
  const [sending, setSending] = useState(false)
  const [liveMap, setLiveMap] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const nameRef = useRef()
  const emailRef = useRef()
  const companyRef = useRef()
  const msgRef = useRef()
  const consentRef = useRef()
  const hpRef = useRef()

  async function handleSubmit(e) {
    e.preventDefault()
    if (sending) return
    const form = e.currentTarget
    const name = nameRef.current.value.trim()
    const email = emailRef.current.value.trim()
    const company = companyRef.current.value.trim()
    const msg = msgRef.current.value.trim()
    const consent = consentRef.current.checked
    if (!name || !email || !msg || !consent) {
      setNote({ text: 'Please add your name, email, a short message, and tick consent.', type: 'err' })
      return
    }    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNote({ text: 'Please check your email address.', type: 'err' })
      return
    }
    const to = data?.email || 'info@firmatextile.com'
    setSending(true)
    setNote({ text: 'Sending…', type: '' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, email, message: msg, consent, website: hpRef.current.value })
      })
      if (!res.ok) throw new Error(`contact form: ${res.status}`)
      form.reset()
      setNote({ text: 'Thank you. Your message has been sent and we will reply by email.', type: 'ok' })
    } catch {
      // If direct delivery fails, fall back to the visitor's own email app so the enquiry is not lost.
      const subj = `Website enquiry${company ? `: ${company}` : ''}`
      const body = `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${msg}`
      setNote({ text: `The website could not send your message, so your email app is opening with it instead. You can also write to ${to}.`, type: 'err' })
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
    } finally {
      setSending(false)
    }
  }

  const addressLines = data?.address?.split('\n') || []

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <span className="eyebrow">
          <span className="fleur" /> <span>{data?.eyebrow}</span>
        </span>
        {data?.heading && <h2>{data.heading}</h2>}
        {data?.intro && <p className="intro">{data.intro}</p>}
        <div className="c-body">
          <form className="c-form" id="cform" noValidate onSubmit={handleSubmit}>
            <div className="row2">
              <div>
                <label htmlFor="f-name">Name</label>
                <input id="f-name" ref={nameRef} type="text" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="f-company">Company</label>
                <input id="f-company" ref={companyRef} type="text" autoComplete="organization" />
              </div>
            </div>
            <label htmlFor="f-email">Email</label>
            <input id="f-email" ref={emailRef} type="email" autoComplete="email" />
            <label htmlFor="f-msg">Message</label>
            <textarea id="f-msg" ref={msgRef} />
            <div className="hp" aria-hidden="true">
              <label htmlFor="f-website">Website</label>
              <input id="f-website" ref={hpRef} type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="consent">
              <input id="f-consent" ref={consentRef} type="checkbox" />
              <label htmlFor="f-consent" style={{fontFamily:'var(--serif)',letterSpacing:0,textTransform:'none',fontSize:'13.5px',color:'#cabfae',margin:0}}>
                I have read the <a href="/privacy" target="_blank" rel="noopener">privacy notice</a> and consent to my details being used, and transferred abroad, to answer this enquiry.
              </label>
            </div>
            <button className="btn solid" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</button>
            <p className={`formnote${note.type ? ` ${note.type}` : ''}`} id="formnote" role="status" aria-live="polite">
              {note.text}
            </p>
            {data?.agent && <p className="agent-note">{data.agent}</p>}
          </form>
          <div className="c-details">
            <dl className="c-spec">
              <div className="c-row">
                <dt>Email</dt>
                <dd><a href={`mailto:${data?.email}`}>{data?.email}</a></dd>
              </div>
              {data?.phone && (
                <div className="c-row">
                  <dt>Phone</dt>
                  <dd><a href={`tel:${data.phone.replace(/[^0-9+]/g, '')}`}>{data.phone}</a></dd>
                </div>
              )}
              <div className="c-row">
                <dt>Invoice</dt>
                <dd>
                  {data?.legal && <>{data.legal}<br /></>}
                  {addressLines.map((line, i) => (
                    <span key={i}>{line}{i < addressLines.length - 1 && <br />}</span>
                  ))}
                </dd>
              </div>
            </dl>
            {/* A drawing hosted on this site, so nothing reaches Google until the visitor asks for the live
                map. The privacy notice describes what happens then. */}
            <div className="c-map">
              <a className="c-map-link" href={MAPS_URL} target="_blank" rel="noopener" aria-label="Open Firma Textile in Google Maps">
                <picture>
                  <source type="image/webp" srcSet={`/images/map-bengu.webp?v=${MAP_VERSION}`} />
                  <img
                    src={`/images/map-bengu.jpg?v=${MAP_VERSION}`}
                    alt="Map of Nilüfer Organised Industrial Zone, Bursa, with a pin on Firma Textile, Meşe Caddesi"
                    width="1000"
                    height="650"
                    loading="lazy"
                  />
                </picture>
                <span className="c-map-pin" aria-hidden="true" />
                <span className="c-map-name" aria-hidden="true">Firma Textile</span>
                <span className="c-map-cta">Open in Google Maps ↗</span>
              </a>
              {!mapReady && (
                <button type="button" className="c-map-load" onClick={() => setLiveMap(true)} disabled={liveMap}>
                  {liveMap ? 'Loading map…' : 'Show live map'}
                  {!liveMap && <small>Loads Google Maps</small>}
                </button>
              )}
              {!mapReady && (
                <a className="c-map-osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>
              )}
              {/* Google takes a few seconds to draw, and its frame reports loaded before the tiles are in; the
                  picture stays on top until a moment after that. */}
              {liveMap && (
                <iframe
                  className={`c-map-live${mapReady ? ' on' : ''}`}
                  src={LIVE_MAP_URL}
                  title="Google Maps: Firma Textile, Nilüfer, Bursa"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  onLoad={() => setTimeout(() => setMapReady(true), 1200)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
