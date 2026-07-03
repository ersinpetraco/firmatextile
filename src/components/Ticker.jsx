const FALLBACK = [
  'Weaving & printing in-house',
  'Most contemporary design creations',
  'Fabrics with high twisted yarns',
  'Supplying worldwide'
]

export function Ticker({ items }) {
  const ITEMS = items?.length ? items : FALLBACK
  return (
    <div className="ticker-band" aria-label="Firma Textile capabilities">
      <div className="ticker">
        {[...ITEMS, ...ITEMS].map((text, i) => (
          <div key={i} aria-hidden={i >= ITEMS.length || undefined}>
            {text}<span className="fleur" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  )
}
