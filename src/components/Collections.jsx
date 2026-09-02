export function Collections({ data, onContactClick }) {
  const categories = data?.categories || []

  return (
    <section className="coll" id="collections">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">
            <span className="fleur" /> <span>{data?.eyebrow}</span>
          </span>
          <h2>{data?.heading}</h2>
          <p>{data?.sub}</p>
          {(data?.policy1 || data?.policy2) && (
            <p className="coll-policy">
              {data?.policy1}
              {data?.policy1 && data?.policy2 && <br />}
              {data?.policy2}
            </p>
          )}
        </div>
      </div>

      <div className="coll-band">
        <div className="wrap">
          {categories.map((cat, i) => (
            <div className="cat-row" key={cat.title || i}>
              <div className="cat-meta">
                <span className="cat-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{cat.title}</h3>
                {cat.blurb && <p>{cat.blurb}</p>}
              </div>
              <div className="cat-strip">
                {(cat.items || []).map((item, j) => (
                  <figure className="swatch" key={item.name || j}>
                    <picture>
                      <source type="image/webp" srcSet={item.image} />
                      <img
                        src={item.image?.replace(/\.webp$/, '.jpg')}
                        alt={`${item.name} printed fabric swatch`}
                        loading="lazy"
                        width="760"
                        height="760"
                      />
                    </picture>
                    <figcaption>{item.name}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap">
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
