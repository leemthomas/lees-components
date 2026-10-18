import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation'

const pathFor = (slug?: string) => (!slug || slug === 'home' ? '/' : `/${slug}`)

export const resolve: PresentationPluginOptions['resolve'] = {
  // Opening a URL in Presentation selects the matching page document
  mainDocuments: defineDocuments([
    { route: '/', filter: `_type == "page" && slug.current == "home"` },
    { route: '/:slug', filter: `_type == "page" && slug.current == $slug` },
  ]),
  // Shows "Used on" links at the top of each page document
  locations: {
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || 'Untitled', href: pathFor(doc?.slug) }],
      }),
    }),
  },
}
