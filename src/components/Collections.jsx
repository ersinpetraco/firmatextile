export function Collections({ data, onContactClick }) {
  return (
    <section className="coll" id="collections">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">
            <span className="fleur" /> <span>{data?.eyebrow}</span>
          </span>
          <h2>{data?.heading}</h2>
          <p>{data?.sub}</p>
          {data?.note && <p className="demo-note">{data.note}</p>}
        </div>
        <div className="coll-grid">
          {(data?.items || []).map((item, i) => (
            <div className="card" key={i}>
              <figure>
                <picture>
                  <source type="image/webp" srcSet={item.image} />
                  <img
                    src={item.image?.replace(/\.webp$/, '.jpg')}
                    alt={`${item.title} pattern fabric`}
                  />
                </picture>
              </figure>
              <figcaption>{item.title}</figcaption>
            </div>
          ))}
        </div>
        <div className="swatch-cta">
          <a
            className="btn dark"
            href="#contact"
            onClick={e => {
              e.preventDefault()
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {data?.ctaLabel}
          </a>
          <span className="micro">{data?.micro}</span>
        </div>
      </div>
    </section>
  )
}
