import { defineField, defineType } from 'sanity'
import { LinkIcon } from '@sanity/icons/Link'

export const linkType = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'linkType',
      title: 'Link to',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          { title: 'A page on this site', value: 'internal' },
          { title: 'Another website or path', value: 'external' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'internal',
      title: 'Page',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
      validation: (rule) =>
        rule.custom((value, { parent }) =>
          (parent as { linkType?: string })?.linkType === 'internal' && !value ? 'Choose a page' : true,
        ),
    }),
    defineField({
      name: 'external',
      title: 'URL',
      type: 'url',
      description: 'Full URL (https://…) or a path on aqa.org.uk (/subjects).',
      hidden: ({ parent }) => parent?.linkType !== 'external',
      validation: (rule) =>
        rule
          .uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] })
          .custom((value, { parent }) =>
            (parent as { linkType?: string })?.linkType === 'external' && !value ? 'Add a URL' : true,
          ),
    }),
    defineField({ name: 'openInNewTab', title: 'Open in a new tab', type: 'boolean', initialValue: false }),
  ],
})
