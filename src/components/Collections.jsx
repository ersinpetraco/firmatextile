function Swatch({ item, className = '', style }) {
  return (
    <figure className={`swatch ${className}`} style={style}>
      <picture>
        <source type="image/webp" srcSet={item.image} />
        <img
          src={item.image?.replace(/\.webp$/, '.jpg')}
          alt={item.name}
          loading="lazy"
          width="760"
          height="760"
        />
      </picture>
      {item.name && <span className="swatch-name">{item.name}</span>}
    </figure>
  )
}

export function Collections({ data, onContactClick }) {
  const groups = data?.groups || []

  return (
    <section className="coll" id="collections">
      <div className="coll-intro">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">
              <span className="fleur" /> <span>{data?.eyebrow}</span>
            </span>
            <h2>{data?.heading}</h2>
            {data?.sub && <p>{data.sub}</p>}
          </div>
        </div>
      </div>

      <div className="coll-band">
        <div className="wrap">
          {groups.map((group, i) => (
            <div className="fab-group" key={i}>
              {(group.items || []).map((item, j) => (
                <Swatch key={item.name || j} item={item} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className="swatch-cta">
          {data?.note && <p className="coll-note">{data.note}</p>}
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
        </div>
      </div>
    </section>
  )
}
