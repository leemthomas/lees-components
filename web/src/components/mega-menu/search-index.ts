import { stegaClean } from 'next-sanity'
import { resolveHref } from '@/lib/links'
import type { Navigation } from './types'

export type IndexEntry = {
  id: string
  label: string
  href: string
  newTab: boolean
  tag?: string
  description?: string
  /** Where it lives in the menu, e.g. "Qualifications › GCSEs" */
  trail: string
  label_n: string
  words: string[]
  tag_n: string
  keywords_n: string
  description_n: string
  trail_n: string
}

export type SearchHit = IndexEntry & { score: number }

export const normalise = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

/** Flattens every link in the menu into one searchable list. Duplicate URLs keep the first place they appear. */
export function buildIndex(nav: Navigation): IndexEntry[] {
  const seen = new Map<string, IndexEntry>()
  const add = (raw: {
    key: string
    label?: string | null
    link?: Parameters<typeof resolveHref>[0]
    tag?: string | null
    description?: string | null
    keywords?: Array<string> | null
    trail: string
  }) => {
    const href = resolveHref(raw.link)
    const label = stegaClean(raw.label ?? '')
    if (!href || !label) return
    const id = `${href}|${normalise(label)}`
    if (seen.has(id)) return
    const tag = stegaClean(raw.tag ?? '') || undefined
    const description = stegaClean(raw.description ?? '') || undefined
    const keywords = (raw.keywords ?? []).map((k) => stegaClean(k)).join(' ')
    seen.set(id, {
      id: raw.key,
      label,
      href,
      newTab: !!raw.link?.openInNewTab,
      tag,
      description,
      trail: raw.trail,
      label_n: normalise(label),
      words: normalise(label).split(' '),
      tag_n: normalise(tag ?? ''),
      keywords_n: normalise(keywords),
      description_n: normalise(description ?? ''),
      trail_n: normalise(raw.trail),
    })
  }

  for (const menu of nav.menus ?? []) {
    const menuLabel = stegaClean(menu.label ?? '')
    for (const col of menu.columns ?? []) {
      const trail = [menuLabel, stegaClean(col.heading ?? '')].filter(Boolean).join(' › ')
      for (const l of col.links ?? []) {
        add({ ...l, key: l._key, trail })
        // Sub-menu links: "Subjects › Biology › GCSE"
        for (const k of l.children ?? []) {
          const subTrail = [stegaClean(l.label ?? ''), stegaClean(k.group ?? '')].filter(Boolean).join(' › ')
          add({ ...k, key: k._key, keywords: [stegaClean(l.label ?? '')], trail: [menuLabel, subTrail].filter(Boolean).join(' › ') })
        }
      }
      if (col.footerLink) add({ ...col.footerLink, key: `${col._key}-foot`, trail: menuLabel })
    }
    for (const q of menu.quickLinks ?? []) add({ ...q, key: q._key, trail: menuLabel })
    for (const ft of menu.featured ?? []) {
      if (ft.cta) add({ key: ft._key, label: ft.heading, link: ft.cta.link, description: ft.text, trail: `${menuLabel} › Featured` })
    }
  }
  for (const u of nav.utilityLinks ?? []) add({ ...u, key: u._key, trail: 'Top bar' })
  return [...seen.values()]
}

/** One-letter typos: "biolgy", "chemsitry". Only for words of 4+ letters. */
function nearly(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false
  const s = b.slice(0, a.length + 1)
  // Damerau-Levenshtein distance <= 1 against a prefix of b of similar length
  const check = (x: string, y: string) => {
    let i = 0
    while (i < x.length && i < y.length && x[i] === y[i]) i++
    if (i === x.length || i === y.length) return Math.abs(x.length - y.length) <= 1
    return (
      x.slice(i + 1) === y.slice(i + 1) || // swap one letter
      x.slice(i + 1) === y.slice(i) || // extra letter
      x.slice(i) === y.slice(i + 1) || // missing letter
      (x[i] === y[i + 1] && x[i + 1] === y[i] && x.slice(i + 2) === y.slice(i + 2)) // transposed
    )
  }
  return check(a, s) || check(a, b)
}

/** Common abbreviations people type, mapped to the words used in the menu. */
const SYNONYMS: Record<string, string[]> = {
  maths: ['mathematics', 'mathematical'],
  math: ['mathematics', 'mathematical'],
  pe: ['physical'],
  re: ['religious'],
  rs: ['religious'],
  dt: ['design'],
  cs: ['computer'],
  ict: ['computer'],
  epq: ['project'],
  nea: ['non', 'coursework'],
  alevel: ['a', 'level'],
  timetable: ['timetables', 'dates'],
  results: ['result'],
}

const startsWord = (haystack: string, token: string) => haystack === token || haystack.startsWith(token) || haystack.includes(` ${token}`)

export function searchIndex(index: IndexEntry[], query: string, limit = 8): SearchHit[] {
  const q = normalise(query)
  if (!q) return []
  const tokens = q.split(' ')

  const run = (fuzzy: boolean) => {
    const hits: SearchHit[] = []
    for (const e of index) {
      let score = 0
      let ok = true
      for (const tok of tokens) {
        let s = 0
        for (const t of [tok, ...(SYNONYMS[tok] ?? [])]) {
          s = Math.max(s, scoreToken(e, t, fuzzy))
          if (s) break
        }
        if (!s) { ok = false; break }
        score += s
      }
      if (!ok) continue
      if (e.label_n.startsWith(q)) score += 15
      if (e.label_n === q) score += 10
      // Shorter labels first when scores tie: "Biology" before "Biology (7402)"
      score -= e.label_n.length / 100
      hits.push({ ...e, score })
    }
    // The same qualification can sit under two subjects (e.g. Biology and Science): show it once
    const seen = new Set<string>()
    return hits
      .sort((a, b) => b.score - a.score)
      .filter((h) => {
        const k = `${h.label_n}|${h.tag_n}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      .slice(0, limit)
  }

  const exact = run(false)
  return exact.length ? exact : run(true)
}

function scoreToken(e: IndexEntry, t: string, fuzzy: boolean) {
  if (e.words.some((w) => w.startsWith(t))) return 10
  if (e.tag_n && e.tag_n.startsWith(t)) return 12
  if (startsWord(e.keywords_n, t)) return 6
  if (startsWord(e.description_n, t)) return 3
  if (startsWord(e.trail_n, t)) return 2
  if (fuzzy && t.length >= 4 && e.words.some((w) => w.length >= 4 && nearly(t, w))) return 5
  return 0
}

/** Splits a label so the parts that match the query can be wrapped in <mark>. */
export function highlight(label: string, query: string): Array<{ text: string; hit: boolean }> {
  const tokens = normalise(query).split(' ').filter(Boolean)
  if (!tokens.length) return [{ text: label, hit: false }]
  const lower = label.toLowerCase()
  const marks = new Array(label.length).fill(false)
  for (const t of tokens) {
    let from = 0
    while (from < lower.length) {
      const i = lower.indexOf(t, from)
      if (i === -1) break
      // Only highlight from the start of a word
      if (i === 0 || /[^\p{L}\p{N}]/u.test(lower[i - 1])) for (let k = i; k < i + t.length; k++) marks[k] = true
      from = i + 1
    }
  }
  const out: Array<{ text: string; hit: boolean }> = []
  for (let i = 0; i < label.length; i++) {
    const last = out[out.length - 1]
    if (last && last.hit === marks[i]) last.text += label[i]
    else out.push({ text: label[i], hit: marks[i] })
  }
  return out
}
