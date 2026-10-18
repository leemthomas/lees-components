import { stegaClean } from 'next-sanity'
import { HeroSliderSection, type HeroSliderBlock } from './sections/hero-slider-section'
import { CardGrid, CtaBanner, QuickLinks, RichText, StatsBand } from './sections/other-sections'

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
 */
export function PageBuilder({ sections }: { sections?: Block[] | null }) {
  if (!Array.isArray(sections) || !sections.length) {
    return (
      <div className="wrapper empty-page">
        <p>This page has no sections yet. Add one in the Studio.</p>
      </div>
    )
  }
  return (
    <>
      {sections.map((block, index) => {
        const isFirst = index === 0
        const heading = isFirst ? 'h1' : 'h2'
        const type = block._type
        const background = stegaClean(block.background as string | undefined) || 'white'
        const spacing = stegaClean(block.spacing as string | undefined) || 'default'
        const onDark = background === 'purple'
        const contained = type === 'heroSlider' && stegaClean(block.width as string | undefined) === 'contained'

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

        return (
          <section
            key={block._key}
            id={stegaClean(block.anchorId as string | undefined) || undefined}
            className={`section section--${type}${contained ? ' section--contained' : ''}`}
            data-bg={type === 'heroSlider' ? undefined : background}
            data-spacing={type === 'heroSlider' && !contained ? 'none' : spacing}
          >
            {contained ? <div className="wrapper">{content}</div> : content}
          </section>
        )
      })}
    </>
  )
}
