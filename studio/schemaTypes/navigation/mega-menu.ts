import { defineArrayMember, defineField, defineType } from 'sanity'
import { MenuIcon } from '@sanity/icons/Menu'
import { ThLargeIcon } from '@sanity/icons/ThLarge'
import { LinkIcon } from '@sanity/icons/Link'
import { StarIcon } from '@sanity/icons/Star'
import { SearchIcon } from '@sanity/icons/Search'
import { ListIcon } from '@sanity/icons/List'
import { ArrowRightIcon } from '@sanity/icons/ArrowRight'

/* ---------- A plain label + link, used for footers and utility links ---------- */
export const textLinkType = defineType({
  name: 'textLink',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({ name: 'label', type: 'string', validation: (rule) => rule.required().max(50) }),
    defineField({ name: 'link', type: 'link', validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'label', url: 'link.external', slug: 'link.internal.slug.current' }, prepare: ({ title, url, slug }) => ({ title, subtitle: url || (slug ? `/${slug}` : '') }) },
})

/* ---------- A link in a sub-menu (shown when its parent is selected) ---------- */
export const megaMenuSubLinkType = defineType({
  name: 'megaMenuSubLink',
  title: 'Sub-menu link',
  type: 'object',
  icon: ArrowRightIcon,
  fields: [
    defineField({ name: 'label', type: 'string', validation: (rule) => rule.required().max(70) }),
    defineField({ name: 'link', type: 'link', validation: (rule) => rule.required() }),
    defineField({ name: 'tag', title: 'Code or tag', type: 'string', description: 'e.g. 8461', validation: (rule) => rule.max(12) }),
    defineField({
      name: 'group',
      type: 'string',
      description: 'Links with the same group sit together under it as a small heading, e.g. "GCSE" or "AS and A-level".',
      validation: (rule) => rule.max(30),
    }),
  ],
  preview: {
    select: { title: 'label', tag: 'tag', group: 'group' },
    prepare: ({ title, tag, group }) => ({ title: [title, tag && `(${tag})`].filter(Boolean).join(' '), subtitle: group, media: ArrowRightIcon }),
  },
})

/* ---------- One link inside a column ---------- */
export const megaMenuLinkType = defineType({
  name: 'megaMenuLink',
  title: 'Menu link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({ name: 'label', type: 'string', validation: (rule) => rule.required().max(60) }),
    defineField({ name: 'link', type: 'link', validation: (rule) => rule.required() }),
    defineField({
      name: 'tag',
      title: 'Code or tag',
      type: 'string',
      description: 'Shown as a small grey label after the link, e.g. a spec code like 8461. Search matches it too.',
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: 'description',
      type: 'string',
      description: 'One short line. Only shown when the column style is "Detailed".',
      validation: (rule) => rule.max(90),
    }),
    defineField({
      name: 'badge',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Updated', value: 'updated' },
          { title: 'Popular', value: 'popular' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Extra words people might search for, e.g. "timetable" for Key dates.',
    }),
    defineField({
      name: 'children',
      title: 'Sub-menu',
      type: 'array',
      of: [defineArrayMember({ type: 'megaMenuSubLink' })],
      description: 'Optional. Pointing at (or tapping) this link shows these in a side panel, for a second level of links.',
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: 'childrenIntro',
      title: 'Sub-menu intro',
      type: 'string',
      description: 'One line shown at the top of the sub-menu.',
      hidden: ({ parent }) => !parent?.children?.length,
      validation: (rule) => rule.max(120),
    }),
  ],
  preview: {
    select: { title: 'label', tag: 'tag', description: 'description', badge: 'badge', children: 'children' },
    prepare: ({ title, tag, description, badge, children }) => ({
      title: [title, tag && `(${tag})`].filter(Boolean).join(' '),
      subtitle: [badge && badge.toUpperCase(), children?.length ? `${children.length} sub-menu links` : null, description].filter(Boolean).join(' · '),
      media: LinkIcon,
    }),
  },
})

/* ---------- A column of links with an optional heading ---------- */
export const megaMenuColumnType = defineType({
  name: 'megaMenuColumn',
  title: 'Section',
  type: 'object',
  icon: ListIcon,
  fields: [
    defineField({ name: 'heading', type: 'string', description: 'The section title, e.g. "Sciences". Sections flow into columns with a divider between each column.', validation: (rule) => rule.max(40) }),
    defineField({ name: 'headingLink', title: 'Heading links to', type: 'link', description: 'Optional. Makes the heading a link.' }),
    defineField({
      name: 'style',
      type: 'string',
      initialValue: 'compact',
      options: {
        list: [
          { title: 'Compact: one line per link', value: 'compact' },
          { title: 'Detailed: label with a description line', value: 'detailed' },
        ],
        layout: 'radio',
      },
    }),
    defineField({ name: 'links', type: 'array', of: [defineArrayMember({ type: 'megaMenuLink' })], validation: (rule) => rule.min(1).max(40) }),
    defineField({ name: 'footerLink', title: 'Footer link', type: 'textLink', description: 'Bold "See all" link under the list.' }),
  ],
  preview: {
    select: { title: 'heading', links: 'links', style: 'style' },
    prepare: ({ title, links, style }) => ({
      title: title || 'Section (no heading)',
      subtitle: `${links?.length ?? 0} links · ${style === 'detailed' ? 'Detailed' : 'Compact'}`,
      media: ListIcon,
    }),
  },
})

/* ---------- Featured card on the right of a panel ---------- */
export const megaMenuFeatureType = defineType({
  name: 'megaMenuFeature',
  title: 'Featured card',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'style',
      type: 'string',
      initialValue: 'image',
      options: {
        list: [
          { title: 'Image card', value: 'image' },
          { title: 'Purple', value: 'purple' },
          { title: 'Teal', value: 'teal' },
          { title: 'Light', value: 'light' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({ name: 'eyebrow', type: 'string', description: 'Small label above the heading, e.g. "New for 2027".', validation: (rule) => rule.max(30) }),
    defineField({ name: 'heading', type: 'string', validation: (rule) => rule.required().max(60) }),
    defineField({ name: 'text', type: 'text', rows: 2, validation: (rule) => rule.max(140) }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.style !== 'image',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', description: 'Leave blank if the image is decorative.' })],
    }),
    defineField({ name: 'cta', title: 'Link', type: 'textLink' }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow', media: 'image', style: 'style' },
    prepare: ({ title, subtitle, media, style }) => ({ title, subtitle: [style, subtitle].filter(Boolean).join(' · '), media: media ?? StarIcon }),
  },
})

/* ---------- One top-level menu item and its panel ---------- */
export const megaMenuType = defineType({
  name: 'megaMenu',
  title: 'Menu',
  type: 'object',
  icon: ThLargeIcon,
  groups: [
    { name: 'links', title: 'Links', default: true },
    { name: 'featured', title: 'Featured' },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'label', type: 'string', group: ['links', 'settings'], validation: (rule) => rule.required().max(30) }),
    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      group: 'settings',
      initialValue: 'panel',
      options: {
        list: [
          { title: 'Opens a mega menu panel', value: 'panel' },
          { title: 'Plain link, no panel', value: 'link' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'link',
      title: 'Overview page',
      type: 'link',
      group: 'settings',
      description: 'Where the "View all" link in the panel goes. Required for a plain link.',
      validation: (rule) =>
        rule.custom((value, { parent }) => ((parent as { kind?: string })?.kind === 'link' && !value ? 'Add a link' : true)),
    }),
    defineField({
      name: 'linkLabel',
      title: 'Overview link text',
      type: 'string',
      group: 'settings',
      description: 'Text for the overview link in the panel, e.g. "All subjects". Defaults to "View all".',
      hidden: ({ parent }) => parent?.kind === 'link' || !parent?.link,
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'intro',
      title: 'Intro text',
      type: 'text',
      rows: 2,
      group: 'links',
      description: 'Optional one or two lines at the top of the panel, next to the "View all" link.',
      validation: (rule) => rule.max(160),
      hidden: ({ parent }) => parent?.kind === 'link',
    }),
    defineField({
      name: 'columns',
      title: 'Sections',
      type: 'array',
      group: 'links',
      of: [defineArrayMember({ type: 'megaMenuColumn' })],
      description: 'Each section has a title and a list of links. Sections flow down into columns, with a divider between columns.',
      hidden: ({ parent }) => parent?.kind === 'link',
      validation: (rule) =>
        rule.custom((cols: unknown[] | undefined, { parent }) =>
          (parent as { kind?: string })?.kind !== 'link' && !cols?.length ? 'Add at least one section' : true,
        ),
    }),
    defineField({
      name: 'columnCount',
      title: 'Number of columns',
      type: 'number',
      group: 'settings',
      description: 'Leave blank to fit automatically (up to 3 next to a featured or sub-menu area, otherwise 4).',
      options: { list: [1, 2, 3, 4], layout: 'radio', direction: 'horizontal' },
      hidden: ({ parent }) => parent?.kind === 'link',
    }),
    defineField({
      name: 'quickLinks',
      title: 'Bottom bar links',
      type: 'array',
      group: 'links',
      of: [defineArrayMember({ type: 'textLink' })],
      description: 'Bold links along the bottom of the panel, e.g. "All subjects", "Find past papers".',
      validation: (rule) => rule.max(4),
      hidden: ({ parent }) => parent?.kind === 'link',
    }),
    defineField({
      name: 'featured',
      title: 'Featured cards',
      type: 'array',
      group: 'featured',
      of: [defineArrayMember({ type: 'megaMenuFeature' })],
      description: 'Up to two cards in a column on the right of the panel.',
      validation: (rule) => rule.max(2),
      hidden: ({ parent }) => parent?.kind === 'link',
    }),
    defineField({
      name: 'showFilter',
      title: 'Show a filter box',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description: 'Adds a "Filter subjects" style box that narrows the links in this panel as you type. Useful for long lists.',
      hidden: ({ parent }) => parent?.kind === 'link',
    }),
    defineField({
      name: 'filterPlaceholder',
      type: 'string',
      group: 'settings',
      initialValue: 'Filter this list',
      hidden: ({ parent }) => !parent?.showFilter || parent?.kind === 'link',
    }),
  ],
  preview: {
    select: { title: 'label', kind: 'kind', columns: 'columns', featured: 'featured' },
    prepare: ({ title, kind, columns, featured }) => {
      const links = (columns as Array<{ links?: unknown[] }> | undefined)?.reduce((n, c) => n + (c.links?.length ?? 0), 0) ?? 0
      return {
        title,
        subtitle: kind === 'link' ? 'Plain link' : `${columns?.length ?? 0} sections · ${links} links${featured?.length ? ` · ${featured.length} featured` : ''}`,
        media: ThLargeIcon,
      }
    },
  },
})

/* ---------- The navigation singleton ---------- */
export const navigationType = defineType({
  name: 'navigation',
  title: 'Mega menu',
  type: 'document',
  icon: MenuIcon,
  groups: [
    { name: 'menus', title: 'Menus', default: true },
    { name: 'utility', title: 'Top bar' },
    { name: 'search', title: 'Search', icon: SearchIcon },
  ],
  fields: [
    defineField({
      name: 'menus',
      type: 'array',
      group: 'menus',
      of: [defineArrayMember({ type: 'megaMenu' })],
      validation: (rule) => rule.max(8),
    }),
    defineField({ name: 'strapline', type: 'string', group: 'utility', initialValue: 'Most chosen general qualifications exam board in England.' }),
    defineField({ name: 'utilityLinks', title: 'Top bar links', type: 'array', group: 'utility', of: [defineArrayMember({ type: 'textLink' })], validation: (rule) => rule.max(6) }),
    defineField({ name: 'loginLink', title: 'Log in link', type: 'textLink', group: 'utility' }),
    defineField({
      name: 'search',
      type: 'object',
      group: 'search',
      fields: [
        defineField({ name: 'enabled', type: 'boolean', initialValue: true }),
        defineField({ name: 'placeholder', type: 'string', initialValue: 'Search subjects, qualifications, dates…' }),
        defineField({
          name: 'resultsUrl',
          title: 'Full search page',
          type: 'url',
          initialValue: 'https://www.aqa.org.uk/search?q=',
          description: 'Pressing Enter goes here with the search words added to the end.',
          validation: (rule) => rule.uri({ allowRelative: true }),
        }),
        defineField({
          name: 'popular',
          title: 'Popular searches',
          type: 'array',
          of: [{ type: 'string' }],
          options: { layout: 'tags' },
          description: 'Shown as chips before anyone types.',
        }),
        defineField({ name: 'suggested', title: 'Suggested links', type: 'array', of: [defineArrayMember({ type: 'textLink' })], description: 'Shown before anyone types.', validation: (rule) => rule.max(6) }),
        defineField({ name: 'includePages', title: 'Also search pages on this site', type: 'boolean', initialValue: true }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Mega menu' }) },
})

export const megaMenuTypes = [textLinkType, megaMenuSubLinkType, megaMenuLinkType, megaMenuColumnType, megaMenuFeatureType, megaMenuType, navigationType]
