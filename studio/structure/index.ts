import type { StructureResolver } from 'sanity/structure'
import { CogIcon } from '@sanity/icons/Cog'
import { DocumentsIcon } from '@sanity/icons/Documents'
import { HomeIcon } from '@sanity/icons/Home'
import { MenuIcon } from '@sanity/icons/Menu'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { DownloadIcon } from '@sanity/icons/Download'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'

export const SINGLETONS = ['siteSettings', 'navigation']

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Lee's Components")
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
        .title('Key dates')
        .icon(CalendarIcon)
        .child(S.documentTypeList('keyDate').title('Key dates').defaultOrdering([{ field: 'date', direction: 'asc' }])),
      S.listItem()
        .title('Resources')
        .icon(DownloadIcon)
        .child(S.documentTypeList('resource').title('Resources')),
      S.listItem()
        .title('News and research')
        .icon(DocumentTextIcon)
        .child(S.documentTypeList('newsArticle').title('News and research').defaultOrdering([{ field: 'date', direction: 'desc' }])),
      S.divider(),
      S.listItem()
        .title('Mega menu')
        .icon(MenuIcon)
        .child(S.document().schemaType('navigation').documentId('navigation').title('Mega menu')),
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
    ])
