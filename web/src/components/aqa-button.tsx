import Link from 'next/link'
import { stegaClean } from 'next-sanity'
import { isInternal, resolveHref, type LinkValue } from '@/lib/links'

export type ButtonValue = {
  _key?: string
  label?: string | null
  style?: string | null
  youtubeId?: string | null
  trackingId?: string | null
  link?: LinkValue
}

/** AQA call to action: 48px pill, 2px border, semibold label. */
export function AqaButton({ button, onDark = false }: { button: ButtonValue; onDark?: boolean }) {
  const href = resolveHref(button.link) ?? (button.youtubeId ? `https://www.youtube.com/watch?v=${stegaClean(button.youtubeId)}` : null)
  if (!href || !button.label) return null
  const style = stegaClean(button.style) || 'primary'
  const newTab = !!button.link?.openInNewTab || !isInternal(href)
  const className = `aqa-btn aqa-btn--${style}${onDark ? ' aqa-btn--on-dark' : ''}`
  const inner = (
    <>
      {style === 'play' && (
        <span className="aqa-btn__dot" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
        </span>
      )}
      <span>{button.label}</span>
      {style !== 'play' && (
        <svg className="aqa-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={newTab ? 'M14 4h6v6m0-6L10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5' : 'M4 12h15m-6-6 6 6-6 6'} />
        </svg>
      )}
      {newTab && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  )
  if (isInternal(href) && !newTab) {
    return <Link href={href} className={className} data-track={stegaClean(button.trackingId) || undefined}>{inner}</Link>
  }
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" data-track={stegaClean(button.trackingId) || undefined}>
      {inner}
    </a>
  )
}
