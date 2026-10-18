import { defineField, defineType } from 'sanity'

export const seoType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({ name: 'metaTitle', title: 'Page title for search', type: 'string', validation: (rule) => rule.max(60).warning('Keep under 60 characters') }),
    defineField({ name: 'metaDescription', title: 'Description for search', type: 'text', rows: 3, validation: (rule) => rule.max(160).warning('Keep under 160 characters') }),
    defineField({ name: 'noIndex', title: 'Hide from search engines', type: 'boolean', initialValue: false }),
  ],
})
