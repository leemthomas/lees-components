import { defineArrayMember, defineField, defineType } from 'sanity'
import { BarChartIcon } from '@sanity/icons/BarChart'
import { BlockContentIcon } from '@sanity/icons/BlockContent'
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'
import { LinkIcon } from '@sanity/icons/Link'
import { ThLargeIcon } from '@sanity/icons/ThLarge'
import { sectionFields, sectionGroup } from '../shared/section-fields'

const groups = [{ name: 'content', title: 'Content', default: true }, sectionGroup]
const strip = (s?: string) => s?.replace(/\*/g, '')

/* ---------- Stats band: "120 years history", "92% UK schools" ---------- */
export const statsBandType = defineType({
  name: 'statsBand',
  title: 'Stats band',
  type: 'object',
  icon: BarChartIcon,
  groups,
  fields: [
    defineField({ name: 'heading', type: 'string', group: 'content', description: 'Optional, visually hidden if left blank.' }),
    defineField({
      name: 'stats',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.min(2).max(4),
      of: [
        defineArrayMember({
          name: 'stat',
          type: 'object',
          fields: [
            defineField({ name: 'value', type: 'string', description: 'e.g. 92% or 1m+', validation: (rule) => rule.required().max(8) }),
            defineField({ name: 'label', type: 'string', validation: (rule) => rule.required().max(30) }),
            defineField({ name: 'description', type: 'string', validation: (rule) => rule.max(90) }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    ...sectionFields(),
  ],
  preview: {
    select: { a: 'stats.0.value', b: 'stats.1.value', c: 'stats.2.value' },
    prepare: ({ a, b, c }) => ({ title: [a, b, c].filter(Boolean).join(' · ') || 'Stats', subtitle: 'Stats band', media: BarChartIcon }),
  },
})

/* ---------- Quick links: "My Quick Links" pills ---------- */
export const quickLinksType = defineType({
  name: 'quickLinks',
  title: 'Quick links',
  type: 'object',
  icon: LinkIcon,
  groups,
  fields: [
    defineField({ name: 'heading', type: 'string', group: 'content', initialValue: 'Quick links' }),
    defineField({
      name: 'links',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.min(1).max(16),
      of: [
        defineArrayMember({
          name: 'quickLink',
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', validation: (rule) => rule.required().max(40) }),
            defineField({ name: 'link', type: 'link' }),
          ],
          preview: { select: { title: 'label', subtitle: 'link.external' } },
        }),
      ],
    }),
    ...sectionFields(),
  ],
  preview: {
    select: { title: 'heading', links: 'links' },
    prepare: ({ title, links }) => ({ title: title || 'Quick links', subtitle: `Quick links · ${links?.length ?? 0}`, media: LinkIcon }),
  },
})

/* ---------- Card grid: "Services", news cards ---------- */
export const cardGridType = defineType({
  name: 'cardGrid',
  title: 'Card grid',
  type: 'object',
  icon: ThLargeIcon,
  groups,
  fields: [
    defineField({ name: 'heading', type: 'string', group: 'content' }),
    defineField({ name: 'intro', type: 'text', rows: 2, group: 'content' }),
    defineField({
      name: 'columns',
      type: 'number',
      group: 'content',
      initialValue: 4,
      options: { list: [2, 3, 4], layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'cards',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.min(1).max(12),
      of: [
        defineArrayMember({
          name: 'card',
          type: 'object',
          fields: [
            defineField({ name: 'image', type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', type: 'string', title: 'Alternative text' })] }),
            defineField({ name: 'eyebrow', type: 'string', description: 'e.g. News, Blog post' }),
            defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'body', type: 'text', rows: 3 }),
            defineField({ name: 'button', type: 'button' }),
          ],
          preview: { select: { title: 'title', subtitle: 'eyebrow', media: 'image' } },
        }),
      ],
    }),
    ...sectionFields(),
  ],
  preview: {
    select: { title: 'heading', cards: 'cards', media: 'cards.0.image' },
    prepare: ({ title, cards, media }) => ({ title: title || 'Card grid', subtitle: `Card grid · ${cards?.length ?? 0} cards`, media: media ?? ThLargeIcon }),
  },
})

/* ---------- CTA banner: "Switch to AQA today" ---------- */
export const ctaBannerType = defineType({
  name: 'ctaBanner',
  title: 'Call to action banner',
  type: 'object',
  icon: BulbOutlineIcon,
  groups,
  fields: [
    defineField({ name: 'heading', type: 'string', group: 'content', validation: (rule) => rule.required() }),
    defineField({ name: 'body', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'image', type: 'image', group: 'content', options: { hotspot: true }, fields: [defineField({ name: 'alt', type: 'string', title: 'Alternative text' })] }),
    defineField({
      name: 'imagePosition',
      type: 'string',
      group: 'content',
      initialValue: 'left',
      options: { list: ['left', 'right'], layout: 'radio', direction: 'horizontal' },
    }),
    defineField({ name: 'buttons', type: 'array', group: 'content', of: [defineArrayMember({ type: 'button' })], validation: (rule) => rule.max(2) }),
    ...sectionFields(),
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare: ({ title, media }) => ({ title: strip(title) || 'Call to action', subtitle: 'Call to action banner', media: media ?? BulbOutlineIcon }),
  },
})

/* ---------- Rich text ---------- */
export const richTextType = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'object',
  icon: BlockContentIcon,
  groups,
  fields: [
    defineField({
      name: 'body',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            annotations: [
              defineArrayMember({
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [defineField({ name: 'href', type: 'url', validation: (rule) => rule.uri({ allowRelative: true }) })],
              }),
            ],
          },
        }),
      ],
    }),
    ...sectionFields(),
  ],
  preview: {
    select: { blocks: 'body' },
    prepare: ({ blocks }) => {
      const first = (blocks as Array<{ _type: string; children?: Array<{ text: string }> }> | undefined)?.find((b) => b._type === 'block')
      return { title: first?.children?.map((c) => c.text).join('') || 'Rich text', subtitle: 'Rich text', media: BlockContentIcon }
    },
  },
})
