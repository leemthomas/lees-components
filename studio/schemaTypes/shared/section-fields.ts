import { defineField } from 'sanity'
import { SECTION_BACKGROUNDS } from './options'

// Every page builder block gets the same "Section" tab, so editors control
// spacing, background and anchor links the same way on every component.
export const sectionGroup = { name: 'section', title: 'Section' }

export function sectionFields(opts: { background?: boolean; width?: boolean } = {}) {
  const { background = true, width = false } = opts
  return [
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'string',
      group: 'section',
      description: 'Optional. Lets you link straight to this section, e.g. "v-levels" for /page#v-levels.',
      validation: (rule) =>
        rule.regex(/^[a-z0-9-]+$/, { name: 'lowercase letters, numbers and hyphens' }),
    }),
    ...(background
      ? [
          defineField({
            name: 'background',
            type: 'string',
            group: 'section',
            initialValue: 'white',
            options: { list: SECTION_BACKGROUNDS, layout: 'radio', direction: 'horizontal' },
          }),
        ]
      : []),
    ...(width
      ? [
          defineField({
            name: 'width',
            type: 'string',
            group: 'section',
            initialValue: 'full',
            description: 'Full width runs edge to edge. Contained sits inside the page grid with rounded corners.',
            options: {
              list: [
                { title: 'Full width', value: 'full' },
                { title: 'Contained', value: 'contained' },
              ],
              layout: 'radio',
              direction: 'horizontal',
            },
          }),
        ]
      : []),
    defineField({
      name: 'spacing',
      type: 'string',
      group: 'section',
      initialValue: 'default',
      options: {
        list: [
          { title: 'None', value: 'none' },
          { title: 'Small', value: 'small' },
          { title: 'Default', value: 'default' },
          { title: 'Large', value: 'large' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
  ]
}
