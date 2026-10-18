import { defineArrayMember, defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons/Cog'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({ name: 'title', type: 'string', initialValue: 'AQA' }),
    defineField({
      name: 'mainNav',
      title: 'Main navigation',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'navItem',
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'link', type: 'link' }),
          ],
          preview: { select: { title: 'label' } },
        }),
      ],
    }),
    defineField({ name: 'footerNote', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
})
