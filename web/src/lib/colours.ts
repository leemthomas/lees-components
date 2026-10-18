import { stegaClean } from 'next-sanity'

// Named colours in the Studio map to the AQA CSS variables in globals.css.
const MAP: Record<string, string> = {
  purple: 'var(--aqa-purple)',
  'purple-secondary': 'var(--aqa-purple-secondary)',
  neutral: 'var(--aqa-neutral)',
  red: 'var(--aqa-red)',
  teal: 'var(--aqa-teal)',
  blue: 'var(--aqa-blue)',
  grey: 'var(--aqa-grey)',
  white: '#ffffff',
}

export function aqaColour(name?: string | null, fallback = 'var(--aqa-purple)') {
  const key = stegaClean(name)
  if (!key) return fallback
  return MAP[key] ?? key
}
