import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { SanityLive, sanityFetch } from '@/sanity/live'
import { NAVIGATION_QUERY, SETTINGS_QUERY } from '@/sanity/queries'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import type { Navigation } from '@/components/mega-menu/types'
import { DisableDraftMode } from '@/components/disable-draft-mode'
import './globals.css'

// AQA uses Open Sans across aqa.org.uk
const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-open-sans', display: 'swap' })

export const metadata: Metadata = {
  title: { default: "Lee's Components", template: "%s | Lee's Components" },
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ data: settings }, { data: navigation }] = await Promise.all([
    sanityFetch({ query: SETTINGS_QUERY }),
    sanityFetch({ query: NAVIGATION_QUERY }),
  ])
  const isDraft = (await draftMode()).isEnabled

  return (
    <html lang="en-GB" className={openSans.variable}>
      <body>
        {/* Stega-tagged strings are still strings at runtime; the menu cleans them where it compares values */}
        <SiteHeader settings={settings} navigation={navigation as unknown as Navigation | null} />
        <main id="main">{children}</main>
        <SiteFooter settings={settings} />
        <SanityLive />
        {isDraft && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  )
}
