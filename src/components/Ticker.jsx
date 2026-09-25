const FALLBACK = [
  'Made with sustainable yarns',
  'GOTS, GRS & European Flax certified',
  'High-density fabrics, high-twist yarns'
]

// The loop scrolls by half the track, so each half has to be wider than the widest screen or the
// band shows a gap before the items come round again. Three short items are about 1150px, so a
// half repeats them until it clears 3000px, and the duration grows with it to keep the same speed.
const HALF_MIN_ITEMS = 9
const SECONDS_PER_ITEM = 7.5

export function Ticker({ items }) {
  const ITEMS = items?.length ? items : FALLBACK
  const reps = Math.max(1, Math.ceil(HALF_MIN_ITEMS / ITEMS.length))
  const half = Array.from({ length: reps }, () => ITEMS).flat()
  return (
    <div className="ticker-band" aria-label="Firma Textile capabilities">
      <div className="ticker" style={{ animationDuration: `${half.length * SECONDS_PER_ITEM}s` }}>
        {[...half, ...half].map((text, i) => (
          <div key={i} aria-hidden={i >= ITEMS.length || undefined}>
            {text}<span className="fleur" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  )
}
