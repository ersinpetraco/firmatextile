import { FirmaLogo } from './FirmaLogo'

export function Header() {
  return (
    <header>
      <div className="navbar">
        <FirmaLogo className="logo-svg" />
        <nav>
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#collections">Collections</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
