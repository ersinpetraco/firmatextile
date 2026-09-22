const FALLBACK = [
  'Made with sustainable yarns',
  'GOTS, GRS & European Flax certified',
  'High-density fabrics, high-twist yarns',
  'Premium print and plain dye collections'
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
