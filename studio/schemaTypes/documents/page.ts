import { defineArrayMember, defineField, defineType } from 'sanity'
import { DocumentIcon } from '@sanity/icons/Document'

export const PAGE_BUILDER_BLOCKS = ['heroSlider', 'statsBand', 'quickLinks', 'cardGrid', 'ctaBanner', 'richText'] as const

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      description: 'Use "home" for the homepage.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      description: 'Build the page from components. Drag to reorder.',
      of: PAGE_BUILDER_BLOCKS.map((type) => defineArrayMember({ type })),
      options: {
        insertMenu: {
          filter: true,
          groups: [
            { name: 'heroes', title: 'Heroes', of: ['heroSlider'] },
            { name: 'content', title: 'Content', of: ['richText', 'cardGrid', 'ctaBanner'] },
            { name: 'navigation', title: 'Navigation', of: ['quickLinks'] },
            { name: 'data', title: 'Data', of: ['statsBand'] },
          ],
          views: [{ name: 'list' }],
        },
      },
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', sections: 'sections' },
    prepare: ({ title, slug, sections }) => ({
      title,
      subtitle: `/${slug === 'home' ? '' : slug ?? ''} · ${sections?.length ?? 0} sections`,
    }),
  },
})
