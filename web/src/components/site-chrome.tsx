import Link from 'next/link'
import { isInternal, resolveHref, type LinkValue } from '@/lib/links'

type Settings = {
  title?: string | null
  footerNote?: string | null
  mainNav?: Array<{ _key: string; label?: string | null; link?: LinkValue }> | null
} | null

function NavLink({ label, link }: { label?: string | null; link?: LinkValue }) {
  const href = resolveHref(link)
  if (!href || !label) return null
  return isInternal(href) ? <Link href={href}>{label}</Link> : <a href={href}>{label}</a>
}

export function SiteHeader({ settings }: { settings: Settings }) {
  return (
    <header className="site-header">
      <a href="#main" className="skip-link">Skip to main content</a>
      <div className="wrapper site-header__inner">
        <Link href="/" className="site-header__logo" aria-label="AQA home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aqa-logo.svg" alt="" width={110} height={64} />
        </Link>
        <nav aria-label="Main" className="site-header__nav">
          <ul role="list">
            {settings?.mainNav?.map((item) => (
              <li key={item._key}><NavLink label={item.label} link={item.link} /></li>
            ))}
          </ul>
        </nav>
        <span className="sandbox-pill">Sandbox</span>
      </div>
    </header>
  )
}

export function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="site-footer">
      <div className="wrapper site-footer__inner">
        <p>{settings?.footerNote || 'AQA Sanity Sandbox. Test content only.'}</p>
        <p className="site-footer__owner">Owner: Lee Thomas</p>
      </div>
    </footer>
  )
}
