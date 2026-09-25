import { Swatch } from './Collections'

export function Fabrics({ data }) {
  const groups = data?.groups || []
  return (
    <section className="coll fab-page" id="fabrics">
      <div className="coll-intro">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">
              <span className="fleur" /> <span>{data?.eyebrow}</span>
            </span>
            <h1>{data?.heading}</h1>
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
    </section>
  )
}
