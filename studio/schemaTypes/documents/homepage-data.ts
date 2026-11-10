import { defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { DownloadIcon } from '@sanity/icons/Download'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'

// Shared data for the homepage blocks. Each one is edited once here and
// used wherever it is needed (the key dates panel, the alert bar, the
// "Right now at AQA" feed, the hub search and the help chat all read key dates).

export const KEY_DATE_CATEGORIES = [
  { title: 'Exam', value: 'exam' },
  { title: 'Entries and admin', value: 'admin' },
  { title: 'Results', value: 'results' },
  { title: 'V Levels and training', value: 'training' },
]

export const keyDateType = defineType({
  name: 'keyDate',
  title: 'Key date',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required().max(140) }),
    defineField({ name: 'date', type: 'date', options: { dateFormat: 'D MMMM YYYY' }, validation: (rule) => rule.required() }),
    defineField({
      name: 'category',
      type: 'string',
      initialValue: 'exam',
      options: { list: KEY_DATE_CATEGORIES, layout: 'radio', direction: 'horizontal' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'series', type: 'string', description: 'e.g. "November 2026 series". Shown under the title.' }),
    defineField({ name: 'detail', type: 'string', description: 'Optional extra line, e.g. the time of a webinar.' }),
    defineField({ name: 'link', type: 'link' }),
    defineField({
      name: 'vLevels',
      title: 'V Levels date',
      type: 'boolean',
      initialValue: false,
      description: 'Shows in the V Levels slot of "Right now at AQA".',
    }),
    defineField({
      name: 'forStudents',
      title: 'Students sit this exam',
      type: 'boolean',
      initialValue: true,
      hidden: ({ parent }) => parent?.category !== 'exam',
      description: 'Used by the students panel to say "Sitting a November exam?" while a series is on.',
    }),
  ],
  orderings: [{ title: 'Date', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', date: 'date', category: 'category' },
    prepare: ({ title, date, category }) => ({
      title,
      subtitle: [date && new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), KEY_DATE_CATEGORIES.find((c) => c.value === category)?.title]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})

export const resourceType = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  icon: DownloadIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'subject', type: 'string', description: 'Used for the subject filter, e.g. "French" or "V Levels".', validation: (rule) => rule.required() }),
    defineField({ name: 'level', type: 'string', description: 'e.g. GCSE, AS and A-level, Vocational.' }),
    defineField({ name: 'specCode', title: 'Specification code', type: 'string' }),
    defineField({ name: 'resourceType', title: 'Type', type: 'string', description: 'e.g. Question paper, Mark scheme, Guide.' }),
    defineField({ name: 'fileSize', type: 'string', description: 'e.g. 284.36 KB' }),
    defineField({ name: 'fileUrl', title: 'File URL', type: 'url', validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }) }),
  ],
  preview: {
    select: { title: 'title', subject: 'subject', level: 'level', size: 'fileSize' },
    prepare: ({ title, subject, level, size }) => ({ title, subtitle: [level, subject, size].filter(Boolean).join(' · ') }),
  },
})

export const newsArticleType = defineType({
  name: 'newsArticle',
  title: 'News or research',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'kind',
      type: 'string',
      initialValue: 'news',
      options: { list: [{ title: 'News', value: 'news' }, { title: 'Research', value: 'research' }], layout: 'radio', direction: 'horizontal' },
    }),
    defineField({ name: 'date', type: 'date', options: { dateFormat: 'D MMMM YYYY' }, validation: (rule) => rule.required() }),
    defineField({ name: 'summary', type: 'text', rows: 2 }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] }),
    defineField({ name: 'link', type: 'link' }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', date: 'date', kind: 'kind', media: 'image' },
    prepare: ({ title, date, kind, media }) => ({ title, subtitle: [kind === 'research' ? 'Research' : 'News', date].filter(Boolean).join(' · '), media }),
  },
})
