'use client'

import { useEffect, useState } from 'react'
import type { KeyDate } from './shared'

const day = (iso: string) => new Date(`${iso}T00:00:00`)

/**
 * Today's date at midnight, once the page is in the browser (so the server
 * and browser never disagree). Add ?today=2026-12-01 to the URL to preview
 * another date.
 */
export function useToday(): Date | null {
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('today')
    const d = p && /^\d{4}-\d{2}-\d{2}$/.test(p) ? day(p) : new Date()
    d.setHours(0, 0, 0, 0)
    setToday(d)
  }, [])
  return today
}

export const diffDays = (iso: string, today: Date) => Math.round((day(iso).getTime() - today.getTime()) / 86400000)
export const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => day(iso).toLocaleDateString('en-GB', o)
export const longDate = (iso: string) => fmt(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const when = (n: number) => (n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`)

export const upcoming = (dates: KeyDate[] | null | undefined, today: Date) =>
  (dates ?? []).filter((d) => d.date && diffDays(d.date, today) >= 0)

export const CATEGORY: Record<KeyDate['category'], { label: string; icon: string }> = {
  exam: { label: 'Exam', icon: 'edit_note' },
  admin: { label: 'Entries and admin', icon: 'assignment' },
  results: { label: 'Results', icon: 'insights' },
  training: { label: 'V Levels and training', icon: 'co_present' },
}

/** Downloads a one-day calendar event for a key date. */
export function downloadIcs(d: KeyDate, url: string) {
  const ymd = d.date.replace(/-/g, '')
  const end = new Date(day(d.date).getTime() + 86400000 + 12 * 3600000).toISOString().slice(0, 10).replace(/-/g, '')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AQA//Key dates//EN',
    'BEGIN:VEVENT',
    `UID:${ymd}-${d._id}@aqa.org.uk`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${ymd}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:AQA: ${d.title}`,
    `DESCRIPTION:${[d.series, d.detail].filter(Boolean).join('. ')}\\n${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([lines], { type: 'text/calendar' }))
  a.download = `aqa-${d.date}.ics`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export const store = {
  get(k: string) {
    try {
      return localStorage.getItem(`aqa-hp:${k}`)
    } catch {
      return null
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(`aqa-hp:${k}`, v)
    } catch {
      /* private mode */
    }
  },
}

export const norm = (s: string) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
