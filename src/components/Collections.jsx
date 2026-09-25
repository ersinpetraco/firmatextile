// Small tile cells, in order, for a story whose large lead sits on the left or right.
const SMALL_CELLS = {
  left: [[1, 3], [2, 3], [3, 1], [3, 2], [3, 3]],
  right: [[1, 1], [2, 1], [3, 1], [3, 2], [3, 3]],
}

export function Swatch({ item, className = '', style }) {
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
  const stories = data?.stories || []

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
            {(data?.policy1 || data?.policy2) && (
              <p className="coll-policy">
                {data?.policy1}
                {data?.policy1 && data?.policy2 && <br />}
                {data?.policy2}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="coll-band">
        <div className="wrap">
          {stories.map((story, i) => {
            const side = story.heroSide === 'right' ? 'right' : 'left'
            const [lead, ...rest] = story.items || []
            return (
              <div className="story-block" key={i}>
                {lead && (
                  <Swatch
                    item={lead}
                    className="lead"
                    style={{ gridRow: '1 / 3', gridColumn: side === 'right' ? '2 / 4' : '1 / 3' }}
                  />
                )}
                {rest.slice(0, 5).map((item, j) => (
                  <Swatch
                    key={item.name || j}
                    item={item}
                    style={{ gridRow: SMALL_CELLS[side][j][0], gridColumn: SMALL_CELLS[side][j][1] }}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      <div className="wrap">
        <div className="swatch-cta">
          {data?.note && <p className="coll-note">{data.note}</p>}
          {data?.allLabel && (
            <a className="all-link" href="/fabrics">
              <span>{data.allLabel}</span> <span aria-hidden="true">→</span>
            </a>
          )}
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
