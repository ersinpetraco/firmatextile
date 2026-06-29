export function About({ data }) {
  return (
    <section className="about" id="about">
      <div className="wrap">
        <div className="grid">
          <div className="text">
            <span className="eyebrow">
              <span className="fleur" /> <span>{data?.eyebrow}</span>
            </span>
            <h2><span>{data?.line1}</span><br /><span>{data?.line2}</span></h2>
            <p>{data?.p1}</p>
            <p>{data?.p2}</p>
            <a className="more" href="#collections">
              <span>{data?.linkLabel}</span> <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="photo">
            <div className="frame">
              <picture>
                <source type="image/webp" srcSet={data?.image} />
                <img
                  id="a-img"
                  src={data?.image?.replace(/\.webp$/, '.jpg')}
                  alt="Firma Textile production floor"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
