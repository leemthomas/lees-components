'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { LinkValue } from '@/lib/links'
import { searchSharedIndex } from '../mega-menu/search-index'
import {
  Arrow,
  clean,
  href,
  HpImg,
  HpLink,
  Ms,
  toQualifications,
  type Cta,
  type ExtraQualification,
  type HpImage,
  type KeyDate,
  type MenuQualification,
} from './shared'
import { diffDays, fmt, norm, store, upcoming, useToday } from './dates'

type Task = { _key: string; icon?: string | null; title?: string | null; description?: string | null; link?: LinkValue }
type Audience = {
  _key: string
  label?: string | null
  icon?: string | null
  isNew?: boolean | null
  tasks?: Task[] | null
  promo?: { eyebrow?: string | null; title?: string | null; text?: string | null; badgeIcon?: string | null; badgeColour?: string | null; image?: HpImage; cta?: Cta } | null
}
export type HelpHubBlock = {
  eyebrow?: string | null
  eyebrowIcon?: string | null
  heading?: string | null
  intro?: string | null
  searchPlaceholder?: string | null
  searchUrl?: string | null
  popularLinks?: Array<{ _key: string; label?: string | null; link?: LinkValue }> | null
  audiences?: Audience[] | null
  feedTitle?: string | null
  keyDates?: KeyDate[] | null
  latestNews?: { title?: string | null; date?: string | null; link?: LinkValue } | null
  menuQualifications?: MenuQualification[] | null
  extraQualifications?: ExtraQualification[] | null
}

type Option = { href: string; icon: string; label: string; tag?: string; meta?: string }

export function HelpHub({ block }: { block: HelpHubBlock }) {
  const uid = useId()
  const today = useToday()
  const audiences = block.audiences ?? []
  const [active, setActive] = useState(0)
  const [remember, setRemember] = useState('')
  const tabs = useRef<Array<HTMLButtonElement | null>>([])

  // Come back to the audience chosen last time
  useEffect(() => {
    const saved = store.get('role')
    const i = audiences.findIndex((a) => clean(a.label) === saved)
    if (i > 0) {
      setActive(i)
      setRemember(`Showing ${clean(audiences[i].label)}, as last time.`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const choose = (i: number, focus = false) => {
    setActive(i)
    const label = clean(audiences[i]?.label)
    store.set('role', label)
    setRemember(`We'll show ${label} first next time you visit.`)
    if (focus) tabs.current[i]?.focus()
  }
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const n = audiences.length
    const to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (to >= 0) {
      e.preventDefault()
      choose(to, true)
    }
  }

  return (
    <div className="hp-section hp-router hp-lilac">
      <div className="wrapper">
        <div className="hp-hub">
          <div className="hp-hub__intro">
            {block.eyebrow && (
              <p className="hp-eyebrow">
                <Ms name={block.eyebrowIcon} />
                {block.eyebrow}
              </p>
            )}
            <h2 className="hp-title">{block.heading}</h2>
            {block.intro && <p className="hp-lede">{block.intro}</p>}
          </div>
          <div className="hp-hub__search">
            <HubSearch block={block} today={today} />
            {!!block.popularLinks?.length && (
              <div className="hp-hub__popular">
                <span className="hp-hub__plabel">Popular:</span>
                {block.popularLinks.map((l) => (
                  <HpLink key={l._key} link={l.link}>
                    {l.label}
                  </HpLink>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="hp-remember" aria-live="polite">
          {remember}
        </p>

        <div className="hp-tabs" role="tablist" aria-label="Choose who you are">
          {audiences.map((a, i) => (
            <button
              key={a._key}
              ref={(el) => {
                tabs.current[i] = el
              }}
              role="tab"
              type="button"
              className="hp-tab"
              id={`${uid}-tab-${i}`}
              aria-controls={`${uid}-panel-${i}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              onClick={() => choose(i)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <Ms name={a.icon} />
              {a.label}
              {a.isNew && <span className="hp-tab__new">New</span>}
            </button>
          ))}
        </div>

        {audiences.map((a, i) => (
          <div key={a._key} className="hp-panel" role="tabpanel" id={`${uid}-panel-${i}`} aria-labelledby={`${uid}-tab-${i}`} tabIndex={0} hidden={i !== active}>
            <ul className="hp-tasks" role="list">
              {(a.tasks ?? []).map((t) => (
                <li key={t._key}>
                  <HpLink className="hp-task" link={t.link}>
                    <span className="hp-task__icon">
                      <Ms name={t.icon} />
                    </span>
                    <span className="hp-task__body">
                      <span className="hp-task__t">{t.title}</span>
                      {t.description && <span className="hp-task__d">{t.description}</span>}
                    </span>
                  </HpLink>
                </li>
              ))}
            </ul>
            {a.promo?.title && (
              <div className={`hp-promo${clean(a.promo.badgeColour) === 'purple' ? ' hp-promo--v' : ''}`}>
                <div className="hp-promo__media">
                  <HpImg image={a.promo.image} w={720} h={405} />
                  {a.promo.badgeIcon && (
                    <span className="hp-promo__badge">
                      <Ms name={a.promo.badgeIcon} />
                    </span>
                  )}
                </div>
                <div className="hp-promo__body">
                  {a.promo.eyebrow && <p className="hp-promo__eyebrow">{a.promo.eyebrow}</p>}
                  <p className="hp-promo__title">{a.promo.title}</p>
                  {a.promo.text && <p className="hp-promo__text">{a.promo.text}</p>}
                  {a.promo.cta?.label && (
                    <HpLink className="hp-btn hp-btn--dark" link={a.promo.cta.link}>
                      {a.promo.cta.label} <Arrow />
                    </HpLink>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {block.feedTitle && <Feed block={block} today={today} />}
      </div>
    </div>
  )
}

/* ---------- search: qualifications, menu pages and key dates ---------- */
function HubSearch({ block, today }: { block: HelpHubBlock; today: Date | null }) {
  const uid = useId()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const form = useRef<HTMLFormElement>(null)
  const searchUrl = clean(block.searchUrl) || 'https://www.aqa.org.uk/search'

  const quals = useMemo(
    () => toQualifications(block.menuQualifications, block.extraQualifications).map((x) => ({ ...x, hay: norm(`${x.label} ${x.code} ${x.subject} ${x.level}`) })),
    [block.menuQualifications, block.extraQualifications],
  )
  const dates = useMemo(
    () => (today ? upcoming(block.keyDates, today) : []).map((d) => ({ ...d, hay: norm(`${d.title} ${d.series ?? ''} ${clean(d.category)}`) })),
    [block.keyDates, today],
  )

  const groups = useMemo(() => {
    const toks = norm(q).split(' ').filter(Boolean)
    if (!toks.length) return []
    const match = (hay: string) => toks.every((t) => hay.split(' ').some((w) => w.startsWith(t)))
    const out: Array<{ title: string; options: Option[] }> = []
    const qs = quals.filter((x) => match(x.hay)).slice(0, 4)
    if (qs.length)
      out.push({
        title: 'Qualifications',
        options: qs.map((x) => ({ href: x.href, icon: x.level === 'Vocational' ? 'construction' : 'school', label: x.label, meta: x.code === 'New' ? 'New from September 2027' : `${x.level} ${x.code}` })),
      })
    const pages = searchSharedIndex(q, 4)
    if (pages.length) out.push({ title: 'Pages', options: pages.map((p) => ({ href: p.href, icon: 'article', label: p.label, tag: p.tag, meta: p.trail })) })
    const ds = dates.filter((x) => match(x.hay)).slice(0, 3)
    if (ds.length)
      out.push({ title: 'Key dates', options: ds.map((d) => ({ href: href(d.link), icon: 'event', label: d.title, meta: fmt(d.date, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) })) })
    out.push({ title: '', options: [{ href: `${searchUrl}?q=${encodeURIComponent(q.trim())}`, icon: 'search', label: `Search aqa.org.uk for “${q.trim()}”` }] })
    return out
  }, [q, quals, dates, searchUrl])

  const flat = groups.flatMap((g) => g.options)
  const show = open && flat.length > 0

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!form.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  let k = -1
  return (
    <form
      ref={form}
      className="hp-hubsearch"
      role="search"
      action={searchUrl}
      onSubmit={(e) => {
        if (active >= 0 && flat[active]) {
          e.preventDefault()
          window.location.href = flat[active].href
        }
      }}
    >
      <label htmlFor={`${uid}-q`} className="sr-only">
        Search qualifications, resources, key dates and guidance
      </label>
      <Ms name="search" className="hp-hubsearch__icon" />
      <input
        id={`${uid}-q`}
        name="q"
        type="search"
        autoComplete="off"
        placeholder={clean(block.searchPlaceholder)}
        role="combobox"
        aria-controls={`${uid}-results`}
        aria-expanded={show}
        aria-autocomplete="list"
        aria-activedescendant={show && active >= 0 ? `${uid}-opt-${active}` : undefined}
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && flat.length) {
            e.preventDefault()
            setOpen(true)
            setActive((a) => (a + 1) % flat.length)
          } else if (e.key === 'ArrowUp' && flat.length) {
            e.preventDefault()
            setActive((a) => (a - 1 + flat.length) % flat.length)
          } else if (e.key === 'Escape') setOpen(false)
        }}
      />
      <button type="submit" className="hp-hubsearch__go">
        Search
      </button>
      <div className="hp-hubsearch__results" id={`${uid}-results`} role="listbox" aria-label="Suggestions" hidden={!show}>
        {groups.map((g, gi) => {
          const opts = g.options.map((o) => {
            k += 1
            const i = k
            return (
              <a key={i} id={`${uid}-opt-${i}`} className={`hp-hubres${o.icon === 'search' && !g.title ? ' hp-hubres--all' : ''}`} role="option" aria-selected={i === active} href={o.href}>
                <Ms name={o.icon} />
                <span>
                  <span className="hp-hubres__l">
                    {o.label}
                    {o.tag && <span className="hp-hubres__tag">{o.tag}</span>}
                  </span>
                  {o.meta && <span className="hp-hubres__m">{o.meta}</span>}
                </span>
              </a>
            )
          })
          return g.title ? (
            <div key={gi} className="hp-hubres__g">
              <p className="hp-hubres__gt">{g.title}</p>
              {opts}
            </div>
          ) : (
            <div key={gi}>{opts}</div>
          )
        })}
      </div>
    </form>
  )
}

/* ---------- Right now at AQA ---------- */
function Feed({ block, today }: { block: HelpHubBlock; today: Date | null }) {
  const items: Array<{ k: string; icon: string; tag: string; t: string; d: string; href: string }> = []
  if (today) {
    const up = upcoming(block.keyDates, today)
    const rel = (iso: string) => {
      const n = diffDays(iso, today)
      return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n < 14 ? `in ${n} days` : fmt(iso, { day: 'numeric', month: 'long' })
    }
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
    const exam = up.find((d) => clean(d.category) === 'exam')
    if (exam)
      items.push({ k: 'exam', icon: 'edit_note', tag: diffDays(exam.date, today) === 0 ? 'Exam today' : 'Next exam', t: exam.title, d: `${cap(rel(exam.date))}${exam.series ? `, ${clean(exam.series).replace(/ series$/, '')}` : ''}`, href: '#key-dates' })
    const v = up.find((d) => d.vLevels && clean(d.category) === 'training')
    if (v) items.push({ k: 'v', icon: 'construction', tag: 'V Levels', t: v.title.replace(/^V Levels webinar: /, ''), d: `Free webinar, ${rel(v.date)}`, href: href(v.link) })
    const adm = up.find((d) => clean(d.category) === 'admin' && diffDays(d.date, today) > 0)
    if (adm) items.push({ k: 'admin', icon: 'assignment', tag: 'Deadline', t: adm.title, d: cap(rel(adm.date)), href: href(adm.link) })
  }
  const news = block.latestNews
  if (news?.title) items.push({ k: 'news', icon: 'newspaper', tag: 'Latest news', t: news.title, d: news.date ? fmt(news.date, { day: 'numeric', month: 'long' }) : '', href: href(news.link) })

  return (
    <section className="hp-feed" aria-label={clean(block.feedTitle)}>
      <h3 className="hp-feed__title">
        <span className="hp-feed__live" aria-hidden="true" />
        {block.feedTitle}
      </h3>
      <ul className="hp-feed__list" role="list">
        {items.map((x) => (
          <li key={x.k} className={`hp-feed__item hp-feed__item--${x.k}`}>
            <span className="hp-feed__icon">
              <Ms name={x.icon} />
            </span>
            <span className="hp-feed__body">
              <span className="hp-feed__tag">{x.tag}</span>
              <a className="hp-feed__t" href={x.href}>
                {x.t}
              </a>
              <span className="hp-feed__d">{x.d}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
