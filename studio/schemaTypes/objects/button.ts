import { defineField, defineType } from 'sanity'
import { ArrowRightIcon } from '@sanity/icons/ArrowRight'

// Matches the AQA call-to-action: a 48px pill with a 2px border.
export const buttonType = defineType({
  name: 'button',
  title: 'Button',
  type: 'object',
  icon: ArrowRightIcon,
  fields: [
    defineField({ name: 'label', type: 'string', validation: (rule) => rule.required().max(40) }),
    defineField({ name: 'link', type: 'link' }),
    defineField({
      name: 'style',
      type: 'string',
      initialValue: 'primary',
      options: {
        list: [
          { title: 'Primary (red pill)', value: 'primary' },
          { title: 'Secondary (outline pill)', value: 'secondary' },
          { title: 'Text link', value: 'text' },
          { title: 'Play video', value: 'play' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube video ID',
      type: 'string',
      description: 'The 11 characters after v= in the YouTube URL. Opens in a lightbox.',
      hidden: ({ parent }) => parent?.style !== 'play',
      validation: (rule) => rule.regex(/^[A-Za-z0-9_-]{11}$/, { name: 'YouTube ID' }),
    }),
    defineField({
      name: 'trackingId',
      title: 'Tracking ID',
      type: 'string',
      description: 'Sent to GA4 with the click, e.g. "home-hero-v-levels".',
    }),
  ],
  preview: {
    select: { title: 'label', style: 'style', ext: 'link.external', page: 'link.internal.slug.current' },
    prepare: ({ title, style, ext, page }) => ({
      title: title || 'Button',
      subtitle: [style, page ? `/${page}` : ext].filter(Boolean).join(' · '),
    }),
  },
})
