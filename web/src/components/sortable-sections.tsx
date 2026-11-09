'use client'

import { createDataAttribute } from 'next-sanity'
import { useOptimistic } from 'next-sanity/hooks'

export type SortableSection = {
  key: string
  id?: string
  className: string
  bg?: string
  spacing?: string
  content: React.ReactNode
}

type Props = {
  documentId: string
  documentType: string
  sections: SortableSection[]
}

/**
 * Wraps the page's sections so they can be dragged into a new order in the
 * Presentation tool. Each section is still rendered on the server; this only
 * adds the data-sanity attributes Presentation needs and reorders the
 * rendered sections straight away while the change saves.
 *
 * Outside Presentation the attributes do nothing and the order never changes.
 */
export function SortableSections({ documentId, documentType, sections }: Props) {
  const keys = sections.map((s) => s.key)

  const order = useOptimistic<string[], { sections?: { _key: string }[] }>(keys, (state, action) => {
    if (action.id !== documentId || !Array.isArray(action.document?.sections)) return state
    return action.document.sections.map((s) => s._key)
  })

  const byKey = new Map(sections.map((s) => [s.key, s]))
  const attr = createDataAttribute({ id: documentId, type: documentType })

  return (
    <div className="page-sections" data-sanity={attr('sections')}>
      {order.map((key) => {
        // A section added in the Studio appears once the page refreshes from Sanity Live
        const s = byKey.get(key)
        if (!s) return null
        return (
          <section
            key={s.key}
            id={s.id}
            className={s.className}
            data-bg={s.bg}
            data-spacing={s.spacing}
            data-sanity={attr(`sections[_key=="${s.key}"]`)}
          >
            {s.content}
          </section>
        )
      })}
    </div>
  )
}
