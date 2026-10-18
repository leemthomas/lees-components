import { stegaClean } from 'next-sanity'

export type LinkValue = {
  linkType?: string | null
  external?: string | null
  openInNewTab?: boolean | null
  slug?: string | null
} | null | undefined

/** Turns a resolved link object into an href. Home is "/". */
export function resolveHref(link: LinkValue): string | null {
  if (!link) return null
  if (stegaClean(link.linkType) === 'external') return stegaClean(link.external) || null
  const slug = stegaClean(link.slug)
  if (!slug) return null
  return slug === 'home' ? '/' : `/${slug}`
}

export const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//')
