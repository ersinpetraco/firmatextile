import { useState, useRef } from 'react'

export function Contact({ data }) {
  const [note, setNote] = useState({ text: '', type: '' })

  const nameRef = useRef()
  const emailRef = useRef()
  const companyRef = useRef()
  const msgRef = useRef()
  const consentRef = useRef()

  function handleSubmit(e) {
    e.preventDefault()
    const name = nameRef.current.value.trim()
    const email = emailRef.current.value.trim()
    const company = companyRef.current.value.trim()
    const msg = msgRef.current.value.trim()
    const consent = consentRef.current.checked
    if (!name || !email || !msg || !consent) {
      setNote({ text: 'Please add your name, email, a short message, and tick consent.', type: 'err' })
      return
    }
    const to = data?.email || 'info@firmatextile.com'
    const subj = 'Sample request' + (company ? ` - ${company}` : '')
    const body = `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${msg}`
    setNote({ text: 'Opening your email app…', type: 'ok' })
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
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
            <textarea id="f-msg" ref={msgRef} placeholder="The fabrics, patterns or project you have in mind…" />
            <div className="consent">
              <input id="f-consent" ref={consentRef} type="checkbox" />
              <label htmlFor="f-consent" style={{fontFamily:'var(--serif)',letterSpacing:0,textTransform:'none',fontSize:'13.5px',color:'#cabfae',margin:0}}>
                I agree that Firma Textile may use my details to respond to this enquiry. See our <a href="/privacy.html" target="_blank" rel="noopener">privacy notice</a>.
              </label>
            </div>
            <button className="btn solid" type="submit">Send request</button>
            <p className={`formnote${note.type ? ` ${note.type}` : ''}`} id="formnote" role="status" aria-live="polite">
              {note.text}
            </p>
          </form>
          <div className="c-details">
            <h3>Direct</h3>
            <p><a href={`mailto:${data?.email}`}>{data?.email}</a></p>
            {data?.phone && <p><a href={`tel:${data.phone.replace(/[^0-9+]/g, '')}`}>{data.phone}</a></p>}
            <p>
              {addressLines.map((line, i) => (
                <span key={i}>{line}{i < addressLines.length - 1 && <br />}</span>
              ))}
            </p>
            {data?.agent && <p className="agent">{data.agent}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
