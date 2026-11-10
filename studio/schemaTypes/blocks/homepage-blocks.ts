import type { ComponentType } from 'react'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { BellIcon } from '@sanity/icons/Bell'
import { SearchIcon } from '@sanity/icons/Search'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { ImagesIcon } from '@sanity/icons/Images'
import { DownloadIcon } from '@sanity/icons/Download'
import { BarChartIcon } from '@sanity/icons/BarChart'
import { PresentationIcon } from '@sanity/icons/Presentation'
import { UsersIcon } from '@sanity/icons/Users'
import { ThLargeIcon } from '@sanity/icons/ThLarge'
import { UserIcon } from '@sanity/icons/User'
import { DocumentsIcon } from '@sanity/icons/Documents'
import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { BlockElementIcon } from '@sanity/icons/BlockElement'
import { CommentIcon } from '@sanity/icons/Comment'
import { sectionFields, sectionGroup } from '../shared/section-fields'

// The redesigned aqa.org.uk homepage, as page builder blocks.
// Every block draws its own background and spacing, so only the anchor ID
// from the shared "Section" tab applies.

const groups = [{ name: 'content', title: 'Content', default: true }, sectionGroup]
const anchor = (initial?: string) => {
  const [field] = sectionFields({ background: false })
  return initial ? { ...field, initialValue: initial } : field
}

const ICON_HELP = 'A Material Symbols name in lower case, e.g. "school" or "calendar_month". Browse them at fonts.google.com/icons (Sharp, filled).'
const icon = (name = 'icon', title = 'Icon', initialValue?: string) =>
  defineField({ name, title, type: 'string', description: ICON_HELP, initialValue, validation: (rule) => rule.regex(/^[a-z0-9_]+$/, { name: 'icon name' }) })

const str = (name: string, opts: { title?: string; description?: string; initialValue?: string; required?: boolean; max?: number; group?: string } = {}) =>
  defineField({
    name,
    title: opts.title,
    type: 'string',
    group: opts.group,
    description: opts.description,
    initialValue: opts.initialValue,
    validation: (rule) => {
      let r = rule
      if (opts.required) r = r.required()
      if (opts.max) r = r.max(opts.max)
      return r
    },
  })

const txt = (name: string, opts: { title?: string; description?: string; group?: string; rows?: number } = {}) =>
  defineField({ name, title: opts.title, type: 'text', rows: opts.rows ?? 2, group: opts.group, description: opts.description })

const img = (name = 'image', title?: string, group?: string) =>
  defineField({
    name,
    title,
    type: 'image',
    group,
    options: { hotspot: true },
    fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', description: 'Leave blank if the image is decorative.' })],
  })

/** A label and a link, used for every text CTA. */
const cta = (name: string, title?: string, group?: string) =>
  defineField({
    name,
    title,
    type: 'object',
    group,
    options: { collapsible: true, collapsed: false },
    fields: [str('label', { max: 60 }), defineField({ name: 'link', type: 'link' })],
  })

const ctaList = (name: string, title?: string, group?: string) =>
  defineField({
    name,
    title,
    type: 'array',
    group,
    of: [
      defineArrayMember({
        name: 'labelledLink',
        type: 'object',
        fields: [str('label', { required: true, max: 60 }), defineField({ name: 'link', type: 'link' })],
        preview: { select: { title: 'label', subtitle: 'link.external' } },
      }),
    ],
  })

const head = (opts: { eyebrow?: string; heading?: string; intro?: string } = {}) => [
  str('eyebrow', { group: 'content', initialValue: opts.eyebrow, max: 40, description: 'The small red label above the heading.' }),
  str('heading', { group: 'content', initialValue: opts.heading, required: true, max: 90 }),
  ...(opts.intro !== undefined ? [txt('intro', { group: 'content' })] : []),
]

const blockPreview = (subtitle: string, media: ComponentType) => ({
  select: { title: 'heading' },
  prepare: ({ title }: { title?: string }) => ({ title: title || subtitle, subtitle, media }),
})

/* ---------- 0. Exam alert bar ---------- */
export const examAlertType = defineType({
  name: 'examAlert',
  title: 'Exam alert bar',
  type: 'object',
  icon: BellIcon,
  groups,
  description: 'A thin notice bar. It only appears while exams from Key dates are on today or within the next few days.',
  fields: [
    defineField({ name: 'lookAheadDays', title: 'Show this many days before an exam', type: 'number', group: 'content', initialValue: 7, validation: (rule) => rule.min(0).max(30) }),
    str('linkLabel', { group: 'content', initialValue: "See what's on" }),
    str('linkTarget', { group: 'content', initialValue: '#key-dates', description: 'An anchor on this page (#key-dates) or a URL.' }),
    anchor(),
  ],
  preview: { prepare: () => ({ title: 'Exam alert bar', subtitle: 'Appears automatically while exams are on', media: BellIcon }) },
})

/* ---------- 1. Help hub: search, audience tabs, live feed ---------- */
const hubTask = defineArrayMember({
  name: 'hubTask',
  type: 'object',
  fields: [icon('icon', 'Icon', 'arrow_forward'), str('title', { required: true, max: 50 }), str('description', { max: 90 }), defineField({ name: 'link', type: 'link' })],
  preview: { select: { title: 'title', subtitle: 'description' } },
})

const hubAudience = defineArrayMember({
  name: 'hubAudience',
  title: 'Audience',
  type: 'object',
  fields: [
    str('label', { required: true, max: 30, description: 'The tab label, e.g. "Teachers".' }),
    icon('icon', 'Tab icon', 'school'),
    defineField({ name: 'isNew', title: 'Show a "New" badge', type: 'boolean', initialValue: false }),
    defineField({ name: 'tasks', title: 'Top tasks', type: 'array', of: [hubTask], validation: (rule) => rule.max(8) }),
    defineField({
      name: 'promo',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        img('image'),
        icon('badgeIcon', 'Badge icon', 'mail'),
        defineField({ name: 'badgeColour', type: 'string', initialValue: 'red', options: { list: [{ title: 'Red', value: 'red' }, { title: 'Purple', value: 'purple' }], layout: 'radio', direction: 'horizontal' } }),
        str('eyebrow', { max: 40 }),
        str('title', { max: 60 }),
        txt('text'),
        cta('cta', 'Button'),
      ],
    }),
  ],
  preview: {
    select: { title: 'label', tasks: 'tasks', media: 'promo.image' },
    prepare: ({ title, tasks, media }) => ({ title, subtitle: `${tasks?.length ?? 0} tasks`, media }),
  },
})

export const helpHubType = defineType({
  name: 'helpHub',
  title: 'Help hub (search and audiences)',
  type: 'object',
  icon: SearchIcon,
  groups,
  fields: [
    ...head({ eyebrow: 'Start here', heading: 'How can we help you today?', intro: '' }),
    icon('eyebrowIcon', 'Eyebrow icon', 'explore'),
    str('searchPlaceholder', { group: 'content', initialValue: 'Search qualifications, past papers, key dates...' }),
    str('searchUrl', { group: 'content', initialValue: 'https://www.aqa.org.uk/search', description: 'Where "Search" goes. The words typed are added as ?q=' }),
    ctaList('popularLinks', 'Popular links', 'content'),
    defineField({ name: 'audiences', type: 'array', group: 'content', of: [hubAudience], validation: (rule) => rule.min(1).max(8) }),
    str('feedTitle', { group: 'content', title: 'Live feed title', initialValue: 'Right now at AQA', description: 'Leave blank to hide the feed. It shows the next exam, V Levels date and deadline from Key dates, and the latest news.' }),
    anchor(),
  ],
  preview: blockPreview('Help hub', SearchIcon),
})

/* ---------- 2. Qualification finder ---------- */
export const qualificationFinderType = defineType({
  name: 'qualificationFinder',
  title: 'Qualification finder',
  type: 'object',
  icon: SearchIcon,
  groups,
  description: 'Searches every qualification in the Subjects mega menu, plus any you add below.',
  fields: [
    ...head({ eyebrow: 'Find', heading: 'Find a qualification, specification or past paper', intro: '' }),
    str('placeholder', { group: 'content', initialValue: 'e.g. Biology, 8300 or A-level English' }),
    defineField({ name: 'popularSearches', type: 'array', group: 'content', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'extraQualifications',
      title: 'Extra qualifications',
      type: 'array',
      group: 'content',
      description: 'Qualifications that are not in the mega menu yet, such as V Levels.',
      of: [
        defineArrayMember({
          name: 'extraQualification',
          type: 'object',
          fields: [
            str('title', { required: true }),
            defineField({ name: 'level', type: 'string', initialValue: 'Vocational', options: { list: ['GCSE', 'AS and A-level', 'Vocational', 'Other'] } }),
            str('subject'),
            str('code', { description: 'Specification code. Leave blank for "New".' }),
            defineField({ name: 'link', type: 'link' }),
            defineField({ name: 'registerLink', title: 'Register interest link', type: 'link' }),
          ],
          preview: { select: { title: 'title', subtitle: 'level' } },
        }),
      ],
    }),
    anchor('find'),
  ],
  preview: blockPreview('Qualification finder', SearchIcon),
})

/* ---------- 3. Key dates ---------- */
export const keyDatesPanelType = defineType({
  name: 'keyDatesPanel',
  title: 'Key dates',
  type: 'object',
  icon: CalendarIcon,
  groups,
  description: 'Upcoming dates from "Key dates", styled like the MyAQA dashboard.',
  fields: [
    ...head({ eyebrow: 'Coming up', heading: 'Key dates', intro: '' }),
    cta('calendarLink', 'Calendar PDF link', 'content'),
    cta('allDatesLink', 'All key dates link', 'content'),
    img('image', 'Image under the countdown', 'content'),
    defineField({ name: 'pageSize', title: 'Dates shown before "Show more"', type: 'number', group: 'content', initialValue: 6, validation: (rule) => rule.min(3).max(20) }),
    anchor('key-dates'),
  ],
  preview: blockPreview('Key dates', CalendarIcon),
})

/* ---------- 4. Spotlight carousel ---------- */
export const spotlightCarouselType = defineType({
  name: 'spotlightCarousel',
  title: 'Spotlight carousel',
  type: 'object',
  icon: ImagesIcon,
  groups,
  fields: [
    ...head({ eyebrow: 'In focus', heading: "What's new at AQA" }),
    defineField({
      name: 'slides',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.min(2).max(12),
      of: [
        defineArrayMember({
          name: 'spotlightSlide',
          type: 'object',
          fields: [
            img('image'),
            icon('icon', 'Icon', 'star'),
            str('tag', { max: 30 }),
            defineField({ name: 'tagStyle', type: 'string', initialValue: 'default', options: { list: [{ title: 'Grey', value: 'default' }, { title: 'Red', value: 'red' }], layout: 'radio', direction: 'horizontal' } }),
            str('title', { required: true, max: 70 }),
            txt('text'),
            str('ctaLabel', { title: 'Link text', initialValue: 'Find out more' }),
            defineField({ name: 'link', type: 'link' }),
          ],
          preview: { select: { title: 'title', subtitle: 'tag', media: 'image' } },
        }),
      ],
    }),
    anchor(),
  ],
  preview: blockPreview('Spotlight carousel', ImagesIcon),
})

/* ---------- 5. Popular resources ---------- */
export const popularResourcesType = defineType({
  name: 'popularResources',
  title: 'Popular resources',
  type: 'object',
  icon: DownloadIcon,
  groups,
  description: 'Download rows in the same style as aqa.org.uk search results.',
  fields: [
    ...head({ eyebrow: 'Download', heading: 'Popular teaching and assessment resources', intro: '' }),
    cta('button', 'Button', 'content'),
    cta('finderLink', 'Search all resources link', 'content'),
    defineField({ name: 'resources', type: 'array', group: 'content', of: [defineArrayMember({ type: 'reference', to: [{ type: 'resource' }] })], validation: (rule) => rule.min(1).max(20) }),
    anchor(),
  ],
  preview: blockPreview('Popular resources', DownloadIcon),
})

/* ---------- 6. Proof band ---------- */
export const proofBandType = defineType({
  name: 'proofBand',
  title: 'Proof band (numbers and switch)',
  type: 'object',
  icon: BarChartIcon,
  groups,
  fields: [
    str('heading', { group: 'content', initialValue: 'AQA in numbers', description: 'For screen readers only.' }),
    defineField({
      name: 'stats',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.max(4),
      of: [
        defineArrayMember({
          name: 'proofStat',
          type: 'object',
          fields: [
            icon('icon'),
            defineField({ name: 'value', type: 'number', validation: (rule) => rule.required() }),
            str('suffix', { description: 'e.g. % or m+', max: 4 }),
            str('label', { required: true, max: 30 }),
            str('description', { max: 90 }),
          ],
          preview: { select: { v: 'value', s: 'suffix', subtitle: 'label' }, prepare: ({ v, s, subtitle }) => ({ title: `${v ?? ''}${s ?? ''}`, subtitle }) },
        }),
      ],
    }),
    txt('quote', { group: 'content', rows: 3 }),
    str('quoteFooter', { group: 'content' }),
    str('ctaTitle', { group: 'content', title: 'Panel title' }),
    txt('ctaText', { group: 'content', title: 'Panel text' }),
    cta('cta', 'Panel button', 'content'),
    img('backgroundImage', 'Background photo', 'content'),
    anchor(),
  ],
  preview: blockPreview('Proof band', BarChartIcon),
})

/* ---------- 7. Training ---------- */
export const trainingPanelType = defineType({
  name: 'trainingPanel',
  title: 'Training and events',
  type: 'object',
  icon: PresentationIcon,
  groups,
  fields: [
    ...head({ eyebrow: 'Professional development', heading: 'Training that fits your week', intro: '' }),
    cta('button', 'Button', 'content'),
    defineField({
      name: 'cards',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.max(6),
      of: [
        defineArrayMember({
          name: 'trainingCard',
          type: 'object',
          fields: [
            icon('icon'),
            str('kicker', { max: 40 }),
            str('title', { required: true, max: 60 }),
            str('text', { max: 100 }),
            str('ctaLabel', { title: 'Link text' }),
            defineField({ name: 'link', type: 'link' }),
            defineField({ name: 'highlight', title: 'Highlight this card', type: 'boolean', initialValue: false }),
          ],
          preview: { select: { title: 'title', subtitle: 'kicker' } },
        }),
      ],
    }),
    defineField({
      name: 'feature',
      title: 'Feature panel',
      type: 'object',
      group: 'content',
      options: { collapsible: true },
      fields: [img('image'), str('tag'), str('title'), txt('text'), str('ctaLabel', { title: 'Link text' }), defineField({ name: 'link', type: 'link' })],
    }),
    anchor(),
  ],
  preview: blockPreview('Training and events', PresentationIcon),
})

/* ---------- 8. Students and parents ---------- */
export const studentsPanelType = defineType({
  name: 'studentsPanel',
  title: 'Students and parents',
  type: 'object',
  icon: UsersIcon,
  groups,
  fields: [
    ...head({ eyebrow: 'Students and parents', heading: 'Support from revision to results', intro: '' }),
    icon('eyebrowIcon', 'Eyebrow icon', 'backpack'),
    defineField({
      name: 'seasonal',
      title: 'Change the heading while exams are on',
      type: 'boolean',
      group: 'content',
      initialValue: true,
      description: 'Shows "Sitting a November exam?" during a series, using Key dates.',
    }),
    img('image', 'Main image', 'content'),
    defineField({ name: 'buttons', type: 'array', group: 'content', of: [defineArrayMember({ type: 'button' })], validation: (rule) => rule.max(2) }),
    defineField({
      name: 'steps',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.max(4),
      of: [
        defineArrayMember({
          name: 'studentStep',
          type: 'object',
          fields: [img('image'), icon('icon'), str('title', { required: true, max: 30 }), str('text', { max: 80 }), str('ctaLabel', { title: 'Link text', initialValue: 'Read more' }), defineField({ name: 'link', type: 'link' })],
          preview: { select: { title: 'title', subtitle: 'text', media: 'image' } },
        }),
      ],
    }),
    defineField({
      name: 'callout',
      type: 'object',
      group: 'content',
      options: { collapsible: true },
      fields: [img('image'), icon('tagIcon', 'Tag icon', 'alt_route'), str('tag'), str('title'), txt('text', { rows: 3 }), str('ctaLabel', { title: 'Link text' }), defineField({ name: 'link', type: 'link' })],
    }),
    anchor(),
  ],
  preview: blockPreview('Students and parents', UsersIcon),
})

/* ---------- 9. Family of services ---------- */
export const familyServicesType = defineType({
  name: 'familyServices',
  title: 'Family of services',
  type: 'object',
  icon: ThLargeIcon,
  groups,
  fields: [
    ...head({ eyebrow: 'The AQA family', heading: 'Tools and services for schools' }),
    defineField({
      name: 'services',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          name: 'familyService',
          type: 'object',
          fields: [icon('icon'), str('title', { required: true, max: 40 }), str('text', { max: 80 }), defineField({ name: 'link', type: 'link' })],
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
    }),
    anchor(),
  ],
  preview: blockPreview('Family of services', ThLargeIcon),
})

/* ---------- 10. Examiner promo ---------- */
export const examinerPromoType = defineType({
  name: 'examinerPromo',
  title: 'Become an examiner',
  type: 'object',
  icon: UserIcon,
  groups,
  fields: [
    ...head({ eyebrow: 'Join us', heading: 'Become an examiner', intro: '' }),
    defineField({ name: 'points', type: 'array', group: 'content', of: [{ type: 'string' }], validation: (rule) => rule.max(5) }),
    img('image', 'Image', 'content'),
    defineField({ name: 'buttons', type: 'array', group: 'content', of: [defineArrayMember({ type: 'button' })], validation: (rule) => rule.max(2) }),
    anchor(),
  ],
  preview: blockPreview('Become an examiner', UserIcon),
})

/* ---------- 11. News and research ---------- */
export const newsResearchType = defineType({
  name: 'newsResearch',
  title: 'News and research',
  type: 'object',
  icon: DocumentsIcon,
  groups,
  description: 'The newest items from "News and research".',
  fields: [
    ...head({ eyebrow: 'Latest', heading: 'News, research and insight' }),
    cta('researchLink', 'Research link', 'content'),
    cta('allNewsLink', 'All news button', 'content'),
    defineField({ name: 'newsCount', title: 'News stories', type: 'number', group: 'content', initialValue: 5, validation: (rule) => rule.min(1).max(9) }),
    str('researchHeading', { group: 'content', initialValue: 'From our researchers' }),
    defineField({ name: 'researchCount', title: 'Research items', type: 'number', group: 'content', initialValue: 2, validation: (rule) => rule.min(0).max(4) }),
    cta('allResearchLink', 'All research link', 'content'),
    anchor(),
  ],
  preview: blockPreview('News and research', DocumentsIcon),
})

/* ---------- 12. Newsletter sign-up ---------- */
export const newsletterSignupType = defineType({
  name: 'newsletterSignup',
  title: 'Newsletter sign-up',
  type: 'object',
  icon: EnvelopeIcon,
  groups,
  description: 'A demo form: it checks for a work email address but does not send anything.',
  fields: [
    str('heading', { group: 'content', required: true, initialValue: 'Get free resources, tools and guidance straight to your inbox' }),
    txt('intro', { group: 'content' }),
    str('emailHint', { group: 'content', initialValue: 'Use your school or college email.' }),
    defineField({ name: 'roles', type: 'array', group: 'content', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    str('buttonLabel', { group: 'content', initialValue: 'Sign up' }),
    anchor('newsletter'),
  ],
  preview: blockPreview('Newsletter sign-up', EnvelopeIcon),
})

/* ---------- 13. AQA footer ---------- */
export const aqaFooterType = defineType({
  name: 'aqaFooter',
  title: 'AQA footer',
  type: 'object',
  icon: BlockElementIcon,
  groups,
  fields: [
    defineField({
      name: 'columns',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.max(5),
      of: [
        defineArrayMember({
          name: 'footerColumn',
          type: 'object',
          fields: [str('heading', { required: true }), ctaList('links')],
          preview: { select: { title: 'heading' } },
        }),
      ],
    }),
    ctaList('legalLinks', 'Legal links', 'content'),
    defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url', group: 'content' }),
    defineField({ name: 'youtube', title: 'YouTube URL', type: 'url', group: 'content' }),
    txt('copyright', { group: 'content' }),
    txt('notice', { group: 'content', rows: 3 }),
    anchor(),
  ],
  preview: { prepare: () => ({ title: 'AQA footer', media: BlockElementIcon }) },
})

/* ---------- 14. Help chat ---------- */
export const helpChatType = defineType({
  name: 'helpChat',
  title: 'Help chat',
  type: 'object',
  icon: CommentIcon,
  groups,
  description: 'A "Help" button fixed to the bottom corner. Answers come from the list below, then from the mega menu search.',
  fields: [
    str('title', { group: 'content', initialValue: 'AQA help' }),
    str('subtitle', { group: 'content', initialValue: 'Answers from AQA guidance, with a person if you need one' }),
    txt('greeting', { group: 'content' }),
    defineField({ name: 'suggestions', type: 'array', group: 'content', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'answers',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          name: 'chatAnswer',
          type: 'object',
          fields: [
            defineField({ name: 'keywords', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, description: 'Any of these words in a question picks this answer. Answers higher up win.' }),
            txt('text', { rows: 4 }),
            ctaList('links'),
          ],
          preview: { select: { k: 'keywords', subtitle: 'text' }, prepare: ({ k, subtitle }) => ({ title: (k ?? []).join(', '), subtitle }) },
        }),
      ],
    }),
    cta('contactLink', 'Contact link (used when nothing matches)', 'content'),
    defineField({ name: 'showBackToTop', title: 'Show a back to top button', type: 'boolean', group: 'content', initialValue: true }),
    anchor(),
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: title || 'Help chat', subtitle: 'Help chat', media: CommentIcon }) },
})

export const HOMEPAGE_BLOCKS = [
  'examAlert',
  'helpHub',
  'qualificationFinder',
  'keyDatesPanel',
  'spotlightCarousel',
  'popularResources',
  'proofBand',
  'trainingPanel',
  'studentsPanel',
  'familyServices',
  'examinerPromo',
  'newsResearch',
  'newsletterSignup',
  'aqaFooter',
  'helpChat',
] as const

export const homepageBlockTypes = [
  examAlertType,
  helpHubType,
  qualificationFinderType,
  keyDatesPanelType,
  spotlightCarouselType,
  popularResourcesType,
  proofBandType,
  trainingPanelType,
  studentsPanelType,
  familyServicesType,
  examinerPromoType,
  newsResearchType,
  newsletterSignupType,
  aqaFooterType,
  helpChatType,
]
