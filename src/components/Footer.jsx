import { FirmaLogo } from './FirmaLogo'

export function Footer({ data }) {
  return (
    <footer>
      <div className="wrap">
        <FirmaLogo className="logo-svg" />
        <div className="footnav">
          <a href="#about">About</a>
          <span className="dot">•</span>
          <a href="#collections">Collections</a>
          <span className="dot">•</span>
          <a href="#contact">Contact</a>
          <span className="dot">•</span>
          <a href="/privacy.html">Privacy</a>
        </div>
        <div className="copyright">{data?.copyright}</div>
      </div>
    </footer>
  )
}
