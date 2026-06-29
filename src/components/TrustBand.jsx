import React from 'react'

export function TrustBand({ items = [] }) {
  return (
    <div className="trust">
      <div className="row">
        {items.map((text, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="fleur" />}
            <span>{text}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
