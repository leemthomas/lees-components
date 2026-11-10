'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { clean, toQualifications, type ExtraQualification, type MenuQualification } from './shared'
import { norm } from './dates'

export type QualificationFinderBlock = {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
  placeholder?: string | null
  popularSearches?: string[] | null
  extraQualifications?: ExtraQualification[] | null
  menuQualifications?: MenuQualification[] | null
}

const LEVELS = [
  { value: 'all', label: 'All levels' },
  { value: 'GCSE', label: 'GCSE' },
  { value: 'AS and A-level', label: 'AS and A-level' },
  { value: 'Vocational', label: 'V Levels and vocational', isNew: true },
  { value: 'Other', label: 'Other qualifications' },
]
const SYN: Record<string, string> = { maths: 'mathematics', math: 'mathematics', pe: 'physical', re: 'religious', rs: 'religious', dt: 'design', cs: 'computer', alevel: 'a level' }

function Mark({ text, toks }: { text: string; toks: string[] }) {
  if (!toks.length) return <>{text}</>
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${toks.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'giu')
  const parts: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(re)) {
    const start = (m.index ?? 0) + m[1].length
    parts.push(text.slice(last, start), <mark key={start}>{m[2]}</mark>)
    last = start + m[2].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}

export function QualificationFinder({ block }: { block: QualificationFinderBlock }) {
  const uid = useId()
  const [q, setQ] = useState('')
  const [level, setLevel] = useState('all')
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)

  const all = useMemo(
    () => toQualifications(block.menuQualifications, block.extraQualifications).map((x) => ({ ...x, hay: norm(`${x.label} ${x.code} ${x.subject} ${x.level}`) })),
    [block.menuQualifications, block.extraQualifications],
  )
  const levels = LEVELS.filter((l) => l.value === 'all' || all.some((x) => x.level === l.value))

  const toks = norm(q).split(' ').filter(Boolean).map((t) => SYN[t] || t).join(' ').split(' ').filter(Boolean)
  const active = !!q.trim() || level !== 'all'
  const results = active
    ? all
        .filter((x) => (level === 'all' || x.level === level) && toks.every((t) => x.hay.split(' ').some((w) => w.startsWith(t))))
        .sort((a, b) => Number(norm(b.code) === norm(q)) - Number(norm(a.code) === norm(q)) || a.label.localeCompare(b.label))
    : []

  return (
    <div className="hp-section hp-finder">
      <div className="wrapper hp-finder__inner">
        <div className="hp-finder__intro">
          {block.eyebrow && <p className="hp-eyebrow hp-eyebrow--light">{block.eyebrow}</p>}
          <h2 className="hp-title hp-title--light">{block.heading}</h2>
          {block.intro && <p className="hp-lede hp-lede--light">{block.intro}</p>}
        </div>
        <div className="hp-finder__box">
          <form
            className="hp-finder__form"
            role="search"
            action="https://www.aqa.org.uk/search"
            method="get"
            onSubmit={(e) => {
              const first = list.current?.querySelector<HTMLAnchorElement>('.hp-q__links a')
              if (first) {
                e.preventDefault()
                window.location.href = first.href
              }
            }}
          >
            <label htmlFor={`${uid}-q`} className="sr-only">
              Subject, qualification or code
            </label>
            <svg className="hp-finder__icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              ref={input}
              id={`${uid}-q`}
              name="q"
              type="search"
              autoComplete="off"
              placeholder={clean(block.placeholder)}
              aria-describedby={`${uid}-count`}
              aria-controls={`${uid}-results`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="hp-btn hp-btn--primary">
              Search
            </button>
          </form>
          <div className="hp-chips" role="group" aria-label="Filter by level">
            {levels.map((l) => (
              <button key={l.value} type="button" className="hp-chip" aria-pressed={level === l.value} onClick={() => setLevel(l.value)}>
                {l.label}
                {l.isNew && <span className="hp-chip__new">New</span>}
              </button>
            ))}
          </div>
          <p className="hp-finder__count" id={`${uid}-count`} aria-live="polite">
            {results.length ? `${results.length} qualification${results.length === 1 ? '' : 's'}${q.trim() ? ` matching “${q.trim()}”` : ''}` : ''}
          </p>
          <ul className="hp-finder__results" id={`${uid}-results`} role="list" ref={list}>
            {active && !results.length && (
              <li className="hp-finder__empty">
                No qualifications match “{q}”. <a href={`https://www.aqa.org.uk/search?q=${encodeURIComponent(q)}`}>Search the whole site</a>.
              </li>
            )}
            {results.slice(0, 40).map((x) => (
              <li key={x.key} className="hp-q">
                <div>
                  <p className="hp-q__name">
                    <Mark text={x.label} toks={toks} />
                  </p>
                  <div className="hp-q__meta">
                    <span className="hp-tag">{x.level === 'Other' ? x.subject : x.level}</span>
                    {x.code !== 'New' ? <span className="hp-tag">{x.code}</span> : <span className="hp-tag hp-tag--red">New</span>}
                  </div>
                </div>
                <div className="hp-q__links">
                  <a href={x.href} aria-label={`${x.label}: overview`}>
                    Overview
                  </a>
                  {x.register && (
                    <a href={x.register} aria-label={`${x.label}: register interest`}>
                      Register interest
                    </a>
                  )}
                  {x.code !== 'New' && (
                    <>
                      <a href={`${x.href}/specification`} aria-label={`${x.label}: specification`}>
                        Specification
                      </a>
                      <a href="https://www.aqa.org.uk/past-papers-and-mark-schemes-finder" aria-label={`${x.label}: past papers`}>
                        Past papers
                      </a>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {!q.trim() && !!block.popularSearches?.length && (
            <p className="hp-finder__popular">
              Popular:{' '}
              {block.popularSearches.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQ(clean(s))
                    input.current?.focus()
                  }}
                >
                  {s}
                </button>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
