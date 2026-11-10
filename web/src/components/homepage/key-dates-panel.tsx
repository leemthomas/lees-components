'use client'

import { useEffect, useRef, useState } from 'react'
import { clean, Head, href, HpImg, HpLink, Ms, type Cta, type HpImage, type KeyDate } from './shared'
import { CATEGORY, diffDays, downloadIcs, fmt, longDate, upcoming, useToday, when } from './dates'

export type KeyDatesPanelBlock = {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
  calendarLink?: Cta
  allDatesLink?: Cta
  image?: HpImage
  pageSize?: number | null
  keyDates?: KeyDate[] | null
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'exam', label: 'Exams' },
  { value: 'admin', label: 'Entries and admin' },
  { value: 'results', label: 'Results' },
  { value: 'training', label: 'V Levels and training' },
] as const

const cat = (d: KeyDate) => (clean(d.category) || 'exam') as KeyDate['category']

function Tag({ c }: { c: KeyDate['category'] }) {
  const t = CATEGORY[c] ?? CATEGORY.exam
  return (
    <span className={`kd-tag kd-tag--${c}`}>
      <Ms name={t.icon} />
      {t.label}
    </span>
  )
}

const whenColour = (n: number) => (n === 0 ? 'var(--aqa-red)' : n <= 14 ? 'var(--hp-amber)' : 'var(--aqa-purple)')

/** Key dates in the MyAQA dashboard style: a countdown to the next date and a filterable list. */
export function KeyDatesPanel({ block }: { block: KeyDatesPanelBlock }) {
  const today = useToday()
  const [filter, setFilter] = useState<string>('all')
  const [step, setStep] = useState(block.pageSize ?? 6)
  const [shown, setShown] = useState(step)
  const list = useRef<HTMLOListElement>(null)
  const focusFrom = useRef<number | null>(null)

  useEffect(() => {
    const s = window.matchMedia('(max-width: 640px)').matches ? 4 : (block.pageSize ?? 6)
    setStep(s)
    setShown(s)
  }, [block.pageSize])

  useEffect(() => {
    if (focusFrom.current == null) return
    list.current?.children[focusFrom.current]?.querySelector('a')?.focus()
    focusFrom.current = null
  }, [shown])

  const up = today ? upcoming(block.keyDates, today) : []
  const items = up.filter((d) => filter === 'all' || cat(d) === filter)
  const ics = (d: KeyDate) => downloadIcs(d, new URL(href(d.link), window.location.href).href)

  const calendar = block.calendarLink?.label ? (
    <HpLink className="hp-link" link={block.calendarLink.link}>
      <Ms name="picture_as_pdf" /> {block.calendarLink.label}
    </HpLink>
  ) : undefined

  return (
    <div className="hp-section hp-dates">
      <div className="wrapper">
        <Head eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} id="kd-title" actions={calendar} />
        <div className="kd">
          <section className="kd-next" aria-label="Next key date">
            {today && up[0] && <NextDate d={up[0]} up={up} today={today} image={block.image} onIcs={ics} />}
          </section>
          <section className="kd-card" aria-label="Upcoming key dates">
            <div className="kd-card__head">
              <h3 className="kd-card__title">Upcoming</h3>
              <div className="kd-filter" role="group" aria-label="Show">
                {FILTERS.filter((f) => f.value === 'all' || up.some((d) => cat(d) === f.value)).map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className="kd-chip"
                    aria-pressed={filter === f.value}
                    onClick={() => {
                      setFilter(f.value)
                      setShown(step)
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <ol className="kd-list" ref={list}>
              {today && !items.length && (
                <li className="kd-empty">
                  No upcoming dates of this type.{' '}
                  {block.allDatesLink?.link && (
                    <HpLink className="hp-link" link={block.allDatesLink.link}>
                      Search all key dates
                    </HpLink>
                  )}
                </li>
              )}
              {today &&
                items.slice(0, shown).map((d, k) => {
                  const n = diffDays(d.date, today)
                  return (
                    <li key={d._id} className="kd-row" data-today={n === 0 ? '' : undefined} style={{ animationDelay: `${Math.min(k, 6) * 40}ms` }}>
                      <span className="kd-date" aria-hidden="true">
                        <span className="kd-date__m">{fmt(d.date, { month: 'short' })}</span>
                        <span className="kd-date__d">{fmt(d.date, { day: 'numeric' })}</span>
                        <span className="kd-date__w">{fmt(d.date, { weekday: 'short' })}</span>
                      </span>
                      <div className="kd-row__body">
                        <Tag c={cat(d)} />
                        <h4 className="kd-row__title">
                          <HpLink link={d.link}>
                            <span className="sr-only">{longDate(d.date)}: </span>
                            {d.title}
                          </HpLink>
                        </h4>
                        <p className="kd-row__meta">
                          <span className="kd-row__when" style={{ color: whenColour(n) }}>
                            {when(n)}
                          </span>
                          {d.series && <span className="kd-row__detail">{d.series}</span>}
                        </p>
                      </div>
                      <button type="button" className="kd-ics" aria-label={`Add to calendar: ${clean(d.title)}`} title="Add to calendar" onClick={() => ics(d)}>
                        <Ms name="calendar_add_on" />
                      </button>
                    </li>
                  )
                })}
            </ol>
            <div className="kd-card__foot">
              <button
                type="button"
                className="kd-more"
                hidden={items.length <= shown}
                onClick={() => {
                  focusFrom.current = shown
                  setShown(shown + step)
                }}
              >
                Show more dates ({Math.max(0, items.length - shown)})
              </button>
              {block.allDatesLink?.label && (
                <HpLink className="kd-all" link={block.allDatesLink.link}>
                  {block.allDatesLink.label} <span aria-hidden="true">›</span>
                </HpLink>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function NextDate({ d, up, today, image, onIcs }: { d: KeyDate; up: KeyDate[]; today: Date; image?: HpImage; onIcs: (d: KeyDate) => void }) {
  const n = diffDays(d.date, today)
  const c = cat(d)
  const sameDay = up.filter((x) => x.date === d.date && x !== d)
  const left = up.filter((x) => cat(x) === 'exam' && clean(x.series) === clean(d.series)).length
  const adm = up.find((x) => cat(x) === 'admin' && diffDays(x.date, today) > 0)
  const res = up.find((x) => cat(x) === 'results')
  const cells: Array<[string, React.ReactNode]> = []
  if (c === 'exam') cells.push(['Exams left this series', left])
  if (adm) cells.push(['Next admin deadline', <>{diffDays(adm.date, today)} <small>days</small></>])
  if (cells.length < 2 && res) cells.push(['Next results date', <>{diffDays(res.date, today)} <small>days</small></>])

  return (
    <>
      <p className="kd-next__eyebrow">
        <Ms name="event_upcoming" />
        Next key date
      </p>
      <p className="kd-next__count">
        {n === 0 ? (
          <span className="kd-next__number">Today</span>
        ) : (
          <>
            <span className="kd-next__number">{n}</span>
            <span className="kd-next__unit">{n === 1 ? 'day' : 'days'} to go</span>
          </>
        )}
      </p>
      <div>
        <Tag c={c} />
      </div>
      <p className="kd-next__title">{d.title}</p>
      <p className="kd-next__detail">{longDate(d.date)}</p>
      {d.series && <p className="kd-next__series">{d.series}</p>}
      {!!cells.length && (
        <dl className="kd-next__stats">
          {cells.map(([k, v]) => (
            <div key={k} className="kd-next__stat">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {!!sameDay.length && (
        <ul className="kd-next__list" aria-label="Also on this day">
          {sameDay.map((x) => (
            <li key={x._id}>
              <Ms name="add_circle" />
              {x.title}
            </li>
          ))}
        </ul>
      )}
      <HpImg image={image} w={640} h={300} className="kd-next__img" />
      <div className="kd-next__actions">
        <HpLink className="kd-next__link" link={d.link}>
          Find out more<span className="sr-only">: {d.title}</span>
        </HpLink>
        <button type="button" className="kd-next__link" onClick={() => onIcs(d)}>
          Add to calendar<span className="sr-only">: {d.title}</span>
        </button>
      </div>
    </>
  )
}
