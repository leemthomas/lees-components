import { stegaClean } from 'next-sanity'
import { HeroSliderSection, type HeroSliderBlock } from './sections/hero-slider-section'
import { CardGrid, CtaBanner, QuickLinks, RichText, StatsBand } from './sections/other-sections'
import { SortableSections, type SortableSection } from './sortable-sections'
import { HOMEPAGE_BLOCK_TYPES, HomepageBlock } from './homepage'

// Generated types for the full query live in sanity.types.ts (npm run typegen).
type Block = { _key: string; _type: string; [field: string]: unknown }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockProps<C extends (props: any) => unknown> = Parameters<C>[0]['block']
// Section components declare the fields they use; this narrows the GROQ result to them.
const as = <T,>(block: Block) => block as unknown as T

/**
 * Renders a page's sections. Each block is wrapped in a <section> that applies
 * the shared "Section" settings: anchor ID, background and spacing.
 * The first block on the page owns the h1.
 *
 * Sections can be dragged into a new order in the Presentation tool
 * (hold Shift while dragging to zoom out to the whole page).
 */
export function PageBuilder({
  documentId,
  documentType,
  sections,
}: {
  documentId: string
  documentType: string
  sections?: Block[] | null
}) {
  if (!Array.isArray(sections) || !sections.length) {
    return (
      <div className="wrapper empty-page">
        <p>This page has no sections yet. Add one in the Studio.</p>
      </div>
    )
  }
  // The first real section owns the h1 (an alert bar above the hero doesn't count)
  const firstIndex = Math.max(0, sections.findIndex((b) => b._type !== 'examAlert'))
  const rendered: SortableSection[] = sections.map((block, index) => {
    const isFirst = index === firstIndex
    const heading = isFirst ? 'h1' : 'h2'
    const type = block._type
    const background = stegaClean(block.background as string | undefined) || 'white'
    const spacing = stegaClean(block.spacing as string | undefined) || 'default'
    const onDark = background === 'purple'
    const contained = type === 'heroSlider' && stegaClean(block.width as string | undefined) === 'contained'

    // Homepage blocks draw their own background and spacing
    if (HOMEPAGE_BLOCK_TYPES.has(type)) {
      return {
        key: block._key,
        id: stegaClean(block.anchorId as string | undefined) || undefined,
        className: `section section--${type} section--hp`,
        bg: undefined,
        spacing: 'none',
        content: <HomepageBlock block={block} />,
      }
    }

    let content: React.ReactNode
    switch (type) {
      case 'heroSlider':
        content = <HeroSliderSection block={as<HeroSliderBlock>(block)} isFirst={isFirst} />
        break
      case 'statsBand':
        content = <StatsBand block={as<BlockProps<typeof StatsBand>>(block)} as={heading} />
        break
      case 'quickLinks':
        content = <QuickLinks block={as<BlockProps<typeof QuickLinks>>(block)} as={heading} />
        break
      case 'cardGrid':
        content = <CardGrid block={as<BlockProps<typeof CardGrid>>(block)} as={heading} />
        break
      case 'ctaBanner':
        content = <CtaBanner block={as<BlockProps<typeof CtaBanner>>(block)} onDark={onDark} as={heading} />
        break
      case 'richText':
        content = <RichText block={as<BlockProps<typeof RichText>>(block)} />
        break
      default:
        content = <div className="wrapper unknown-block">Unknown section type: {String(type)}</div>
    }

    return {
      key: block._key,
      id: stegaClean(block.anchorId as string | undefined) || undefined,
      className: `section section--${type}${contained ? ' section--contained' : ''}`,
      bg: type === 'heroSlider' ? undefined : background,
      spacing: type === 'heroSlider' && !contained ? 'none' : spacing,
      content: contained ? <div className="wrapper">{content}</div> : content,
    }
  })

  return <SortableSections documentId={documentId} documentType={documentType} sections={rendered} />
}
