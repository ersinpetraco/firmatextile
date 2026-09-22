export function About({ data }) {
  // Only certifications that have an official logo file are shown.
  const certs = (data?.certifications || []).filter(c => c?.logo)

  return (
    <section className="about" id="about">
      <div className="wrap">
        <div className="grid">
          <div className="text">
            <span className="eyebrow">
              <span className="fleur" /> <span>{data?.eyebrow}</span>
            </span>
            <h2>
              <span>{data?.line1}</span>
              {data?.line2 && <><br /><span>{data.line2}</span></>}
            </h2>
            {data?.p1 && <p>{data.p1}</p>}
            {data?.p2 && <p>{data.p2}</p>}
            {certs.length > 0 && (
              <div className="certs">
                <ul>
                  {certs.map((c, i) => (
                    <li key={c.name || i}>
                      <img src={c.logo} alt={`${c.name} certification logo`} loading="lazy" />
                    </li>
                  ))}
                </ul>
                {certs.some(c => c.licence) && (
                  <p className="cert-lic">
                    {certs.filter(c => c.licence).map((c, i, arr) => (
                      <span key={c.name || i}>
                        {c.verify
                          ? <a href={c.verify} target="_blank" rel="noopener noreferrer"
                               title={`Verify ${c.name} in the public register`}>{c.name} {c.licence}</a>
                          : <>{c.name} {c.licence}</>}
                        {i < arr.length - 1 && <span aria-hidden="true"> · </span>}
                      </span>
                    ))}
                  </p>
                )}
                {data?.certNote && <p className="cert-note">{data.certNote}</p>}
              </div>
            )}
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
