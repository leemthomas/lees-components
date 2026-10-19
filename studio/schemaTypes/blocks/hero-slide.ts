import { defineArrayMember, defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons/Image'
import { PlayIcon } from '@sanity/icons/Play'
import { ColorWheelIcon } from '@sanity/icons/ColorWheel'
import { AQA_COLOURS, LAYER_ANIMATIONS, POSITIONS, TRANSITIONS } from '../shared/options'

type Parent = { backgroundType?: string; layout?: string } | undefined
const bg = (parent: unknown) => (parent as Parent)?.backgroundType
const isSplit = (parent: unknown) => !!(parent as Parent)?.layout?.startsWith('split')

const imageField = (name: string, title: string, hidden: (p: unknown) => boolean, description?: string) =>
  defineField({
    name,
    title,
    type: 'image',
    group: 'background',
    description,
    options: { hotspot: true },
    hidden: ({ parent }) => hidden(parent),
    fields: [
      defineField({
        name: 'alt',
        title: 'Alternative text',
        type: 'string',
        description: 'Leave blank if the image is decorative. The heading already describes the slide.',
      }),
      defineField({
        name: 'mobile',
        title: 'Mobile crop (optional)',
        type: 'image',
        options: { hotspot: true },
        description: 'A tighter or portrait crop used on screens under 720px wide.',
      }),
    ],
  })

export const heroSlideType = defineType({
  name: 'heroSlide',
  title: 'Slide',
  type: 'object',
  icon: ImageIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'background', title: 'Background' },
    { name: 'layout', title: 'Layout' },
    { name: 'motion', title: 'Motion' },
    { name: 'schedule', title: 'Schedule' },
  ],
  fields: [
    // ---------- Content ----------
    defineField({
      name: 'navLabel',
      title: 'Tab label',
      type: 'string',
      group: 'content',
      description: 'Short name for the tabs under the hero and for screen readers, e.g. "V Levels".',
      validation: (rule) => rule.required().max(32),
    }),
    defineField({ name: 'badge', type: 'string', group: 'content', description: 'Small label above the heading, e.g. "From September 2027".', validation: (rule) => rule.max(32) }),
    defineField({ name: 'eyebrow', type: 'string', group: 'content', validation: (rule) => rule.max(60) }),
    defineField({
      name: 'heading',
      type: 'string',
      group: 'content',
      description: 'Wrap words in *asterisks* to underline them in teal, e.g. "Futures *start here*". Over 40 characters uses a smaller size.',
      validation: (rule) => [rule.required().max(90), rule.max(60).warning('Long headings may not fit in the 500px hero. Aim for under 60 characters.')],
    }),
    defineField({ name: 'subheading', title: 'Intro', type: 'text', rows: 2, group: 'content', validation: (rule) => rule.max(180) }),
    defineField({
      name: 'buttons',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'button' })],
      validation: (rule) => rule.max(3),
    }),

    // ---------- Background ----------
    defineField({
      name: 'backgroundType',
      title: 'Background',
      type: 'string',
      group: 'background',
      initialValue: 'image',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video file (MP4)', value: 'video' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Vimeo', value: 'vimeo' },
          { title: 'Brand colour', value: 'colour' },
        ],
        layout: 'radio',
      },
    }),
    imageField('image', 'Image', (p) => bg(p) !== 'image'),
    defineField({
      name: 'videoFile',
      title: 'Video (MP4)',
      type: 'file',
      group: 'background',
      options: { accept: 'video/mp4' },
      description: 'Under 6 MB, 1920×1080, no audio track. Plays muted on a loop.',
      hidden: ({ parent }) => bg(parent) !== 'video',
    }),
    defineField({
      name: 'advanceOnEnd',
      title: 'Move to the next slide when the video ends',
      type: 'boolean',
      group: 'background',
      hidden: ({ parent }) => bg(parent) !== 'video',
    }),
    defineField({
      name: 'videoId',
      title: 'Video ID',
      type: 'string',
      group: 'background',
      description: 'YouTube: the 11 characters after v= . Vimeo: the number at the end of the URL.',
      hidden: ({ parent }) => !['youtube', 'vimeo'].includes(bg(parent) ?? ''),
    }),
    defineField({ name: 'start', title: 'Start at (seconds)', type: 'number', group: 'background', hidden: ({ parent }) => bg(parent) !== 'youtube' }),
    defineField({ name: 'end', title: 'Stop at (seconds)', type: 'number', group: 'background', hidden: ({ parent }) => bg(parent) !== 'youtube' }),
    imageField(
      'poster',
      'Poster image',
      (p) => !['video', 'youtube', 'vimeo'].includes(bg(p) ?? ''),
      'Shown while the video loads, and instead of the video until cookies are accepted.',
    ),
    defineField({
      name: 'colour',
      type: 'string',
      group: 'background',
      initialValue: 'purple',
      options: { list: AQA_COLOURS },
      hidden: ({ parent }) => bg(parent) !== 'colour',
    }),
    defineField({
      name: 'overlay',
      type: 'object',
      group: 'background',
      options: { collapsible: true, collapsed: false },
      description: 'Darkens the background so text stays readable.',
      fields: [
        defineField({
          name: 'type',
          type: 'string',
          initialValue: 'gradient',
          options: {
            list: [
              { title: 'None', value: 'none' },
              { title: 'Solid tint', value: 'solid' },
              { title: 'Gradient', value: 'gradient' },
              { title: 'Bottom scrim', value: 'scrim' },
              { title: 'Brand duotone', value: 'duotone' },
              { title: 'Dot pattern', value: 'pattern' },
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
        }),
        defineField({ name: 'colour', type: 'string', initialValue: 'neutral', options: { list: AQA_COLOURS } }),
        defineField({
          name: 'opacity',
          title: 'Strength (0 to 1)',
          type: 'number',
          initialValue: 0.65,
          validation: (rule) => rule.min(0).max(1),
        }),
        defineField({
          name: 'direction',
          type: 'string',
          initialValue: '90deg',
          options: {
            list: [
              { title: 'Darkest on the left', value: '90deg' },
              { title: 'Darkest on the right', value: '270deg' },
              { title: 'Darkest at the bottom', value: '0deg' },
              { title: 'Darkest at the top', value: '180deg' },
            ],
          },
        }),
      ],
    }),

    // ---------- Layout ----------
    defineField({
      name: 'layout',
      type: 'string',
      group: 'layout',
      initialValue: 'overlay',
      options: {
        list: [
          { title: 'Text over the background', value: 'overlay' },
          { title: 'Text on a white card', value: 'card' },
          { title: 'Split: text left, media right', value: 'split-left' },
          { title: 'Split: media left, text right', value: 'split-right' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'splitRatio',
      title: 'Text column width',
      type: 'number',
      group: 'layout',
      initialValue: 50,
      options: { list: [{ title: '40%', value: 40 }, { title: '50%', value: 50 }, { title: '60%', value: 60 }], layout: 'radio', direction: 'horizontal' },
      hidden: ({ parent }) => !isSplit(parent),
    }),
    defineField({
      name: 'splitEdge',
      title: 'Media edge',
      type: 'string',
      group: 'layout',
      initialValue: 'straight',
      options: { list: ['straight', 'angle', 'curve'], layout: 'radio', direction: 'horizontal' },
      hidden: ({ parent }) => !isSplit(parent),
    }),
    defineField({
      name: 'panelColour',
      title: 'Text panel colour',
      type: 'string',
      group: 'layout',
      initialValue: 'purple',
      options: { list: AQA_COLOURS.filter((c) => !['white', 'grey'].includes(c.value)) },
      hidden: ({ parent }) => !isSplit(parent),
    }),
    defineField({
      name: 'position',
      title: 'Text position (desktop)',
      type: 'string',
      group: 'layout',
      initialValue: 'ml',
      options: { list: POSITIONS },
      description: 'Split layouts use the vertical part only.',
    }),
    defineField({
      name: 'mobilePosition',
      title: 'Text position (mobile)',
      type: 'string',
      group: 'layout',
      initialValue: 'bl',
      options: { list: POSITIONS.filter((p) => !p.value.endsWith('r')) },
    }),
    defineField({
      name: 'tone',
      title: 'Text colour',
      type: 'string',
      group: 'layout',
      initialValue: 'light',
      options: { list: [{ title: 'White', value: 'light' }, { title: 'Dark', value: 'dark' }], layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'maxWidth',
      title: 'Text width',
      type: 'string',
      group: 'layout',
      initialValue: 'standard',
      options: { list: ['narrow', 'standard', 'wide'], layout: 'radio', direction: 'horizontal' },
    }),

    // ---------- Motion ----------
    defineField({ name: 'transition', title: 'Transition into this slide', type: 'string', group: 'motion', initialValue: 'fade', options: { list: TRANSITIONS } }),
    defineField({ name: 'layerAnimation', title: 'Text animation', type: 'string', group: 'motion', initialValue: 'fade-up', options: { list: LAYER_ANIMATIONS } }),
    defineField({
      name: 'motion',
      title: 'Background movement',
      type: 'string',
      group: 'motion',
      initialValue: 'none',
      options: {
        list: [
          { title: 'None', value: 'none' },
          { title: 'Slow zoom in', value: 'zoom-in' },
          { title: 'Slow zoom out', value: 'zoom-out' },
          { title: 'Slow pan', value: 'pan' },
        ],
      },
    }),
    defineField({
      name: 'duration',
      title: 'Time on screen (seconds)',
      type: 'number',
      group: 'motion',
      description: 'Leave blank to use the slider default.',
      validation: (rule) => rule.min(4).max(30),
    }),

    // ---------- Schedule ----------
    defineField({ name: 'publishFrom', title: 'Show from', type: 'datetime', group: 'schedule' }),
    defineField({
      name: 'publishUntil',
      title: 'Show until',
      type: 'datetime',
      group: 'schedule',
      validation: (rule) =>
        rule.custom((until, { parent }) => {
          const from = (parent as { publishFrom?: string })?.publishFrom
          return from && until && until <= from ? '"Show until" must be after "Show from"' : true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      label: 'navLabel',
      type: 'backgroundType',
      layout: 'layout',
      transition: 'transition',
      image: 'image',
      poster: 'poster',
      until: 'publishUntil',
    },
    prepare: ({ title, label, type, layout, transition, image, poster, until }) => ({
      title: (title as string | undefined)?.replace(/\*/g, '') || 'Untitled slide',
      subtitle: [label, layout, transition, until && `until ${new Date(until).toLocaleDateString('en-GB')}`]
        .filter(Boolean)
        .join(' · '),
      media: image ?? poster ?? (type === 'colour' ? ColorWheelIcon : type ? PlayIcon : ImageIcon),
    }),
  },
})
