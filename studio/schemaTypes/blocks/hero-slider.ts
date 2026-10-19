import { defineArrayMember, defineField, defineType } from 'sanity'
import { PresentationIcon } from '@sanity/icons/Presentation'
import { sectionFields, sectionGroup } from '../shared/section-fields'

export const heroSliderType = defineType({
  name: 'heroSlider',
  title: 'Hero slider',
  type: 'object',
  icon: PresentationIcon,
  description: 'Full-width banner with one or more slides. Use one slide for a static hero.',
  groups: [
    { name: 'slides', title: 'Slides', default: true },
    { name: 'behaviour', title: 'Behaviour' },
    sectionGroup,
  ],
  fields: [
    defineField({
      name: 'slides',
      type: 'array',
      group: 'slides',
      of: [defineArrayMember({ type: 'heroSlide' })],
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: 'ariaLabel',
      title: 'Accessible name',
      type: 'string',
      group: 'behaviour',
      initialValue: 'Featured',
      description: 'Read out by screen readers, e.g. "Featured news".',
    }),
    defineField({ name: 'autoplay', type: 'boolean', group: 'behaviour', initialValue: true }),
    defineField({
      name: 'interval',
      title: 'Time per slide (seconds)',
      type: 'number',
      group: 'behaviour',
      initialValue: 7,
      validation: (rule) => rule.min(4).max(30),
    }),
    defineField({
      name: 'speed',
      title: 'Transition speed',
      type: 'number',
      group: 'behaviour',
      initialValue: 900,
      options: {
        list: [
          { title: 'Quick (500ms)', value: 500 },
          { title: 'Medium (700ms)', value: 700 },
          { title: 'Standard (900ms)', value: 900 },
          { title: 'Slow (1200ms)', value: 1200 },
        ],
      },
    }),
    defineField({
      name: 'height',
      type: 'string',
      group: 'behaviour',
      initialValue: 'standard',
      description: 'Desktop height. The hero never goes above 500px, tabs included. On phones it grows to fit the text.',
      options: {
        list: [
          { title: 'Compact (up to 400px)', value: 'compact' },
          { title: 'Standard, as aqa.org.uk (up to 500px)', value: 'standard' },
          { title: 'Tall (420 to 500px)', value: 'tall' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'navigation',
      type: 'string',
      group: 'behaviour',
      initialValue: 'tabs',
      options: {
        list: [
          { title: 'Tabs with labels', value: 'tabs' },
          { title: 'Dots', value: 'dots' },
          { title: 'Numbers', value: 'numbers' },
          { title: 'Thumbnails', value: 'thumbs' },
          { title: 'None', value: 'none' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({ name: 'arrows', type: 'boolean', group: 'behaviour', initialValue: true }),
    defineField({ name: 'progressBar', title: 'Progress line at the top', type: 'boolean', group: 'behaviour', initialValue: false }),
    defineField({ name: 'loop', type: 'boolean', group: 'behaviour', initialValue: true }),
    defineField({ name: 'pauseOnHover', type: 'boolean', group: 'behaviour', initialValue: true }),
    defineField({ name: 'shuffle', title: 'Shuffle slides after the first', type: 'boolean', group: 'behaviour', initialValue: false }),
    ...sectionFields({ background: false, width: true }),
  ],
  preview: {
    select: { slides: 'slides', media: 'slides.0.image', first: 'slides.0.heading', poster: 'slides.0.poster' },
    prepare: ({ slides, media, first, poster }) => {
      const n = Array.isArray(slides) ? slides.length : 0
      return {
        title: (first as string | undefined)?.replace(/\*/g, '') || 'Hero slider',
        subtitle: `Hero slider · ${n} slide${n === 1 ? '' : 's'}`,
        media: media ?? poster ?? PresentationIcon,
      }
    },
  },
})
