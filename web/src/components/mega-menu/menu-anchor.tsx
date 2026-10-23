import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react'
import { isInternal } from '@/lib/links'

/**
 * Menu links open in the same tab unless the editor ticked "Open in a new tab".
 * Paths on this site use next/link; everything else is a plain <a>.
 */
export function MenuAnchor({
  href,
  newTab,
  children,
  ...rest
}: { href: string; newTab?: boolean | null; children: ReactNode; ref?: Ref<HTMLAnchorElement> } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  if (newTab) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    )
  }
  return isInternal(href) ? <Link href={href} {...rest}>{children}</Link> : <a href={href} {...rest}>{children}</a>
}
