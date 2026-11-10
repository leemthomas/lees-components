import type { SanityImageSource } from '@sanity/image-url'
import { stegaClean } from 'next-sanity'
import { resolveHref, type LinkValue } from '@/lib/links'
import { urlFor } from '@/sanity/image'

/* ---------- types shared by the homepage blocks ---------- */
export type HpImage = (SanityImageSource & { alt?: string | null; lqip?: string | null }) | null | undefined
export type Cta = { label?: string | null; link?: LinkValue } | null | undefined
export type KeyDate = {
  _id: string
  title: string
  date: string
  category: 'exam' | 'admin' | 'results' | 'training'
  series?: string | null
  detail?: string | null
  vLevels?: boolean | null
  forStudents?: boolean | null
  link?: LinkValue
}
export type MenuQualification = {
  _key: string
  label?: string | null
  link?: LinkValue
  children?: Array<{ _key: string; label?: string | null; tag?: string | null; group?: string | null; link?: LinkValue }> | null
}
export type ExtraQualification = {
  _key: string
  title?: string | null
  level?: string | null
  subject?: string | null
  code?: string | null
  link?: LinkValue
  registerLink?: LinkValue
}
export type Qualification = { key: string; label: string; code: string; level: string; subject: string; href: string; register?: string | null }

/* ---------- small pieces ---------- */
export const clean = (s?: string | null) => (s ? stegaClean(s) : '')

/** Material Symbols Sharp icon (filled). The font is loaded once by <MaterialSymbols />. */
export function Ms({ name, className }: { name?: string | null; className?: string }) {
  const n = clean(name)
  if (!n) return null
  return (
    <span className={className ? `ms ${className}` : 'ms'} aria-hidden="true">
      {n}
    </span>
  )
}

export function MaterialSymbols() {
  // React hoists and de-duplicates stylesheet links with a precedence
  return (
    <link
      rel="stylesheet"
      precedence="default"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@24,500,1,0&display=block"
    />
  )
}

export const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12h15m-6-6 6 6-6 6" />
  </svg>
)

export const href = (link?: LinkValue) => resolveHref(link) ?? '#'
export const newTab = (link?: LinkValue) => !!link?.openInNewTab

/** A plain anchor for a Sanity link. External links stay in the same tab unless the editor ticks "Open in a new tab". */
export function HpLink({
  link,
  className,
  children,
  label,
  ...rest
}: { link?: LinkValue; className?: string; children: React.ReactNode; label?: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const blank = newTab(link)
  return (
    <a href={href(link)} className={className} aria-label={label} {...(blank ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
      {blank && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}

/** Cropped image from Sanity at a fixed aspect ratio, with a srcset. */
export function HpImg({ image, w, h, className, priority }: { image: HpImage; w: number; h: number; className?: string; priority?: boolean }) {
  if (!image || !(image as { asset?: unknown }).asset) return null
  const at = (width: number) => urlFor(image).width(width).height(Math.round((width * h) / w)).fit('crop').quality(80).url()
  const widths = [Math.round(w / 2), w, Math.round(w * 1.5), w * 2].filter((x) => x <= 2400)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={at(w)}
      srcSet={widths.map((x) => `${at(x)} ${x}w`).join(', ')}
      sizes={`(max-width: 640px) 100vw, ${w}px`}
      alt={clean(image.alt)}
      width={w}
      height={h}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

export function Head({
  eyebrow,
  eyebrowIcon,
  heading,
  intro,
  id,
  light,
  actions,
}: {
  eyebrow?: string | null
  eyebrowIcon?: string | null
  heading?: string | null
  intro?: string | null
  id: string
  light?: boolean
  actions?: React.ReactNode
}) {
  const inner = (
    <>
      {eyebrow && (
        <p className={`hp-eyebrow${light ? ' hp-eyebrow--light' : ''}`}>
          <Ms name={eyebrowIcon} />
          {eyebrow}
        </p>
      )}
      <h2 id={id} className={`hp-title${light ? ' hp-title--light' : ''}`}>
        {heading}
      </h2>
      {intro && <p className={`hp-lede${light ? ' hp-lede--light' : ''}`}>{intro}</p>}
    </>
  )
  if (!actions) return <div className="hp-head">{inner}</div>
  return (
    <div className="hp-head hp-head--row">
      <div>{inner}</div>
      <div className="hp-head__actions">{actions}</div>
    </div>
  )
}

/** Turns the Subjects mega menu (plus any extras) into one flat list for the finder and hub search. */
export function toQualifications(menu?: MenuQualification[] | null, extras?: ExtraQualification[] | null): Qualification[] {
  const out: Qualification[] = []
  const seen = new Set<string>()
  for (const x of extras ?? []) {
    if (!x.title) continue
    out.push({
      key: x._key,
      label: clean(x.title),
      code: clean(x.code) || 'New',
      level: clean(x.level) || 'Other',
      subject: clean(x.subject),
      href: href(x.link),
      register: x.registerLink ? href(x.registerLink) : null,
    })
  }
  for (const subject of menu ?? []) {
    for (const c of subject.children ?? []) {
      const h = href(c.link)
      if (!c.label || seen.has(h)) continue
      seen.add(h)
      const group = clean(c.group)
      out.push({
        key: c._key,
        label: clean(c.label),
        code: clean(c.tag),
        level: group === 'GCSE' || group === 'AS and A-level' ? group : 'Other',
        subject: clean(subject.label),
        href: h,
      })
    }
  }
  return out
}
