import { useState, useRef } from 'react'
import { FirmaLogo } from './FirmaLogo'

export function Contact({ data }) {
  const [note, setNote] = useState({ text: '', type: '' })
  const [sending, setSending] = useState(false)

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
        <h2>{data?.heading}</h2>
        <p className="intro">{data?.intro}</p>
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
            <FirmaLogo className="c-logo" />
            <h3>Direct</h3>
            <p className="c-email"><a href={`mailto:${data?.email}`}>{data?.email}</a></p>
            {data?.phone && <p><a href={`tel:${data.phone.replace(/[^0-9+]/g, '')}`}>{data.phone}</a></p>}
            <div className="c-legal">
              <h3 className="second">Invoicing</h3>
              {data?.legal && <p>{data.legal}</p>}
              <p>
                {addressLines.map((line, i) => (
                  <span key={i}>{line}{i < addressLines.length - 1 && <br />}</span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
