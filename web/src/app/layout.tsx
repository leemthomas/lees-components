import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { SanityLive, sanityFetch } from '@/sanity/live'
import { SETTINGS_QUERY } from '@/sanity/queries'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { DisableDraftMode } from '@/components/disable-draft-mode'
import './globals.css'

// AQA uses Open Sans across aqa.org.uk
const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-open-sans', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'AQA Sanity Sandbox', template: '%s | AQA Sandbox' },
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await sanityFetch({ query: SETTINGS_QUERY })
  const isDraft = (await draftMode()).isEnabled

  return (
    <html lang="en-GB" className={openSans.variable}>
      <body>
        <SiteHeader settings={settings} />
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
