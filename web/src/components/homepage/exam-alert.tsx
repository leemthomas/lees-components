'use client'

import { useEffect, useState } from 'react'
import { clean, type KeyDate } from './shared'
import { diffDays, fmt, store, useToday } from './dates'

export type ExamAlertBlock = {
  lookAheadDays?: number | null
  linkLabel?: string | null
  linkTarget?: string | null
  keyDates?: KeyDate[] | null
}

/** Red notice bar, shown only while exams are on today or within the next few days. */
export function ExamAlert({ block }: { block: ExamAlertBlock }) {
  const today = useToday()
  const [dismissed, setDismissed] = useState<string | null>(null)

  const exams = (block.keyDates ?? []).filter((d) => clean(d.category) === 'exam')
  const ahead = block.lookAheadDays ?? 7
  const onToday = today ? exams.filter((d) => diffDays(d.date, today) === 0) : []
  const next = today ? exams.find((d) => diffDays(d.date, today) > 0 && diffDays(d.date, today) <= ahead) : undefined
  const anchor = onToday[0] ?? next
  const id = anchor ? `alert-${anchor.date}` : ''

  useEffect(() => {
    if (id) setDismissed(store.get(id))
  }, [id])

  if (!today || !anchor || dismissed === 'dismissed') return null
  const series = clean(anchor.series).replace(/ series$/, '')

  return (
    <div className="hp-alert" role="region" aria-label="Exam notice">
      <div className="wrapper hp-alert__inner">
        <span className="hp-alert__pulse" aria-hidden="true" />
        <p className="hp-alert__text">
          <strong>{series ? `${series} exams are under way.` : 'Exams are under way.'}</strong>{' '}
          {onToday.length
            ? `Today: ${onToday.map((d) => d.title).join(', ')}.`
            : `Next: ${next!.title}, ${fmt(next!.date, { weekday: 'long', day: 'numeric', month: 'long' })}.`}
        </p>
        {block.linkLabel && (
          <a className="hp-alert__link" href={clean(block.linkTarget) || '#key-dates'}>
            {block.linkLabel}
          </a>
        )}
        <button
          type="button"
          className="hp-alert__close"
          aria-label="Dismiss this notice"
          onClick={() => {
            store.set(id, 'dismissed')
            setDismissed('dismissed')
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
