import type { StructureResolver } from 'sanity/structure'
import { CogIcon } from '@sanity/icons/Cog'
import { DocumentsIcon } from '@sanity/icons/Documents'
import { HomeIcon } from '@sanity/icons/Home'

export const SINGLETONS = ['siteSettings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('AQA sandbox')
    .items([
      S.listItem()
        .title('Homepage')
        .icon(HomeIcon)
        .child(S.document().schemaType('page').documentId('page-home').title('Homepage')),
      S.listItem()
        .title('All pages')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('page').title('Pages').defaultOrdering([{ field: 'title', direction: 'asc' }])),
      S.divider(),
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
    ])
