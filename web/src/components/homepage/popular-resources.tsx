'use client'

import { useEffect, useRef, useState } from 'react'
import { Arrow, clean, Head, HpLink, Ms, type Cta } from './shared'
import { store } from './dates'

type Resource = { _id: string; title?: string | null; subject?: string | null; level?: string | null; specCode?: string | null; resourceType?: string | null; fileSize?: string | null; fileUrl?: string | null }
export type PopularResourcesBlock = { eyebrow?: string | null; heading?: string | null; intro?: string | null; button?: Cta; finderLink?: Cta; resources?: Array<Resource | null> | null }

// The same PDF icon, download, share and favourite buttons as aqa.org.uk search results
const PDF = (
  <svg className="hp-pdf" viewBox="0 0 42 56" aria-hidden="true">
    <rect fill="#fff" height="35.29" width="40.4" x=".89" y="19.76" />
    <path
      fill="#C8194B"
      d="M19.93 28.01c-.53-1.69-.52-4.96-.21-4.96.89 0 .8 3.9.21 4.96Zm-.18 4.99c-.81 2.13-1.83 4.58-3 6.63 1.93-.74 4.12-1.82 6.65-2.31-1.34-1.02-2.63-2.48-3.65-4.32ZM9.81 46.19c0 .08 1.4-.57 3.69-4.25-.71.67-3.08 2.59-3.69 4.25ZM26.92 17.85h14.37v34.67c0 1.4-1.13 2.53-2.54 2.53H3.25A2.53 2.53 0 0 1 .71 52.52V3.48C.71 2.08 1.84.95 3.25.95h21.13v14.37c0 1.4 1.14 2.53 2.54 2.53Zm-.85 18.16c-2.11-1.29-3.52-3.07-4.51-5.69.48-1.95 1.23-4.92.66-6.78-.5-3.11-4.48-2.8-5.05-.72-.53 1.93-.05 4.66.86 8.14-1.23 2.92-3.04 6.83-4.32 9.07l-.02.01c-2.86 1.47-7.78 4.7-5.76 7.19.59.73 1.69 1.06 2.27 1.06 1.89 0 3.77-1.9 6.46-6.53 2.72-.9 5.71-2.02 8.35-2.45 2.29 1.25 4.98 2.06 6.76 2.06 3.09 0 3.3-3.38 2.08-4.59-1.47-1.43-5.74-1.02-7.78-.76Zm14.48-23.97L30.2 1.69a2.53 2.53 0 0 0-1.8-.74h-.63v13.52h13.53v-.64c0-.67-.27-1.31-.74-1.79Zm-7.83 26.98c.43-.29-.26-1.26-4.52-.95 3.92 1.67 4.52.95 4.52.95Z"
    />
  </svg>
)
const ICON = {
  dl: <path d="M8 10V2M14 10v2.67A1.33 1.33 0 0 1 12.67 14H3.33A1.33 1.33 0 0 1 2 12.67V10M4.67 6.67 8 10l3.33-3.33" />,
  share: (
    <>
      <circle cx="12" cy="3.33" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="12" cy="12.67" r="2" />
      <path d="m5.73 9 4.55 2.66M10.27 4.34 5.73 6.99" />
    </>
  ),
  heart: <path d="M1.33 6.33A3.67 3.67 0 0 1 8 4.2a3.67 3.67 0 0 1 6.67 2.13C14.67 10 8 14 8 14S1.33 10 1.33 6.33Z" />,
}
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    {children}
  </svg>
)

export function PopularResources({ block }: { block: PopularResourcesBlock }) {
  const all = (block.resources ?? []).filter((r): r is Resource => !!r?.title && !!r.fileUrl)
  const subjects = [...new Set(all.map((r) => clean(r.subject)).filter(Boolean))]
  const [subject, setSubject] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const [favs, setFavs] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    try {
      setFavs(new Set(JSON.parse(store.get('favs') || '[]')))
    } catch {
      /* ignore */
    }
  }, [])

  const say = (m: string) => {
    setToast(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 2400)
  }
  const rows = all.filter((r) => subject === 'all' || clean(r.subject) === subject)
  const showAll = expanded || rows.length <= 4

  return (
    <div className="hp-section hp-resources">
      <div className="wrapper">
        <Head
          eyebrow={block.eyebrow}
          heading={block.heading}
          intro={block.intro}
          id="res-title"
          actions={
            block.button?.label ? (
              <HpLink className="hp-btn hp-btn--outline" link={block.button.link}>
                {block.button.label} <Arrow />
              </HpLink>
            ) : undefined
          }
        />
        <div className="hp-chips" role="group" aria-label="Filter resources">
          <button type="button" className="hp-chip" aria-pressed={subject === 'all'} onClick={() => { setSubject('all'); setExpanded(false) }}>
            All subjects<span className="hp-chip__n">{all.length}</span>
          </button>
          {subjects.map((s) => (
            <button key={s} type="button" className="hp-chip" aria-pressed={subject === s} onClick={() => { setSubject(s); setExpanded(false) }}>
              {s}
              {s === 'V Levels' ? <span className="hp-chip__new">New</span> : <span className="hp-chip__n">{all.filter((r) => clean(r.subject) === s).length}</span>}
            </button>
          ))}
        </div>
        <div className="hp-resbar">
          <p className="hp-resbar__count" aria-live="polite">
            Showing <strong>{rows.length}</strong> popular resource{rows.length === 1 ? '' : 's'}
            {subject !== 'all' && (
              <>
                {' '}
                for <strong>{subject}</strong>
              </>
            )}
          </p>
          {block.finderLink?.label && (
            <HpLink className="hp-resbar__finder" link={block.finderLink.link}>
              <Ms name="manage_search" />
              {block.finderLink.label}
            </HpLink>
          )}
        </div>
        <ul className="hp-res" role="list" data-all={showAll ? '' : undefined}>
          {rows.map((r, k) => {
            const url = clean(r.fileUrl)
            const fav = favs.has(url)
            const qual = clean(r.subject) === 'V Levels' ? 'V Levels and vocational' : [r.level, r.subject].filter(Boolean).join(' ')
            const title = clean(r.title).replace(' : ', ': ')
            const addSubject = clean(r.subject) !== 'V Levels' && !title.includes(clean(r.subject))
            return (
              <li key={r._id} className="hp-res__item" data-extra={k >= 4 ? '' : undefined}>
                <a className="hp-res__main" href={url} target="_blank" rel="noopener noreferrer">
                  <span className="hp-res__icon">{PDF}</span>
                  <span className="hp-res__text">
                    <span className="hp-res__t">
                      {r.title}
                      {addSubject && ` - ${clean(r.subject)}`}
                      <span className="sr-only"> (PDF{r.fileSize ? `, ${clean(r.fileSize)}` : ''}, opens in a new tab)</span>
                    </span>
                    <span className="hp-res__meta">
                      <span>
                        {qual}
                        {r.specCode && ` (${clean(r.specCode)})`}
                      </span>
                      <span className="hp-res__dot" aria-hidden="true">•</span>
                      <span className="hp-res__pill">PDF</span>
                      {r.fileSize && (
                        <>
                          <span className="hp-res__dot" aria-hidden="true">•</span>
                          <span>{r.fileSize}</span>
                        </>
                      )}
                      {r.resourceType && (
                        <>
                          <span className="hp-res__dot" aria-hidden="true">•</span>
                          <span>{r.resourceType}</span>
                        </>
                      )}
                    </span>
                  </span>
                </a>
                <div className="hp-res__actions">
                  <a className="hp-res__dl" href={url} target="_blank" rel="noopener noreferrer" download>
                    <Svg>{ICON.dl}</Svg>
                    <span>Download</span>
                    <span className="sr-only">: {title}</span>
                  </a>
                  <button
                    type="button"
                    className="hp-res__btn"
                    aria-label={`Share: ${title}`}
                    title="Share"
                    onClick={async () => {
                      try {
                        if (navigator.share) await navigator.share({ title, url })
                        else {
                          await navigator.clipboard.writeText(url)
                          say('Link copied to your clipboard')
                        }
                      } catch {
                        /* share sheet closed */
                      }
                    }}
                  >
                    <Svg>{ICON.share}</Svg>
                  </button>
                  <button
                    type="button"
                    className="hp-res__btn hp-res__fav"
                    aria-pressed={fav}
                    aria-label={`Add to favourites: ${title}`}
                    title="Add to favourites"
                    onClick={() => {
                      const next = new Set(favs)
                      if (fav) next.delete(url)
                      else next.add(url)
                      setFavs(next)
                      store.set('favs', JSON.stringify([...next]))
                      say(fav ? 'Removed from your favourites' : 'Added to your favourites')
                    }}
                  >
                    <Svg>{ICON.heart}</Svg>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        {!showAll && (
          <button type="button" className="hp-more hp-more--sm" onClick={() => setExpanded(true)}>
            Show all {rows.length} resources
          </button>
        )}
        <p className="hp-res__toast" role="status" aria-live="polite" data-show={toast ? '' : undefined}>
          {toast}
        </p>
      </div>
    </div>
  )
}
