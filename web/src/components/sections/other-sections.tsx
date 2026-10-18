import Link from 'next/link'
import { PortableText, stegaClean, type PortableTextBlock } from 'next-sanity'
import { AqaButton, type ButtonValue } from '@/components/aqa-button'
import { isInternal, resolveHref, type LinkValue } from '@/lib/links'
import { srcSetFor, urlFor } from '@/sanity/image'

type Img = { asset?: { _ref: string }; alt?: string; hotspot?: { x: number; y: number }; lqip?: string } | undefined
type HeadingTag = 'h1' | 'h2'

function Picture({ image, aspect, sizes, className }: { image: Img; aspect: number; sizes: string; className?: string }) {
  if (!image?.asset) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={urlFor(image).width(960).height(Math.round(960 / aspect)).fit('crop').url()}
      srcSet={srcSetFor(image, [480, 720, 960, 1280], aspect)}
      sizes={sizes}
      alt={image.alt ?? ''}
      loading="lazy"
      decoding="async"
      style={image.lqip ? { backgroundImage: `url(${image.lqip})`, backgroundSize: 'cover' } : undefined}
    />
  )
}

/* ---------- Stats band ---------- */
type Stat = { _key: string; value?: string; label?: string; description?: string }
export function StatsBand({ block, as: H }: { block: { heading?: string; stats?: Stat[] }; as: HeadingTag }) {
  return (
    <div className="wrapper">
      <H className={block.heading ? 'section-heading' : 'sr-only'}>{block.heading || 'AQA in numbers'}</H>
      <ul className="stats" role="list">
        {block.stats?.map((s) => (
          <li key={s._key} className="stats__item">
            <p className="stats__value">{s.value}</p>
            <p className="stats__label">{s.label}</p>
            {s.description && <p className="stats__desc">{s.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Quick links ---------- */
type QuickLink = { _key: string; label?: string; link?: LinkValue }
export function QuickLinks({ block, as: H }: { block: { heading?: string; links?: QuickLink[] }; as: HeadingTag }) {
  return (
    <div className="wrapper">
      {block.heading && <H className="section-heading">{block.heading}</H>}
      <ul className="quick-links" role="list">
        {block.links?.map((l) => {
          const href = resolveHref(l.link)
          if (!href) return null
          const external = !isInternal(href) || !!l.link?.openInNewTab
          return (
            <li key={l._key}>
              {external ? (
                <a className="quick-link" href={href} target="_blank" rel="noopener noreferrer">{l.label}<span className="sr-only"> (opens in a new tab)</span></a>
              ) : (
                <Link className="quick-link" href={href}>{l.label}</Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ---------- Card grid ---------- */
type Card = { _key: string; image?: Img; eyebrow?: string; title?: string; body?: string; button?: ButtonValue }
export function CardGrid({ block, as: H }: { block: { heading?: string; intro?: string; columns?: number; cards?: Card[] }; as: HeadingTag }) {
  const cols = stegaClean(block.columns) ?? 4
  const CardH = H === 'h1' ? 'h2' : 'h3'
  return (
    <div className="wrapper">
      {(block.heading || block.intro) && (
        <header className="section-head">
          {block.heading && <H className="section-heading">{block.heading}</H>}
          {block.intro && <p className="section-intro">{block.intro}</p>}
        </header>
      )}
      <ul className="cards" role="list" style={{ '--cols': cols } as React.CSSProperties}>
        {block.cards?.map((card) => (
          <li key={card._key} className="card">
            {card.image?.asset && <Picture image={card.image} aspect={16 / 9} sizes={`(max-width: 720px) 100vw, ${Math.round(100 / cols)}vw`} className="card__image" />}
            <div className="card__body">
              {card.eyebrow && <p className="card__eyebrow">{card.eyebrow}</p>}
              <CardH className="card__title">{card.title}</CardH>
              {card.body && <p className="card__text">{card.body}</p>}
              {card.button && <div className="card__action"><AqaButton button={card.button} /></div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- CTA banner ---------- */
export function CtaBanner({
  block,
  onDark,
  as: H,
}: {
  block: { heading?: string; body?: string; image?: Img; imagePosition?: string; buttons?: ButtonValue[] }
  onDark: boolean
  as: HeadingTag
}) {
  const right = stegaClean(block.imagePosition) === 'right'
  return (
    <div className="wrapper">
      <div className={`cta${right ? ' cta--image-right' : ''}${block.image?.asset ? '' : ' cta--no-image'}`}>
        {block.image?.asset && <Picture image={block.image} aspect={16 / 10} sizes="(max-width: 900px) 100vw, 50vw" className="cta__image" />}
        <div className="cta__body">
          <H className="cta__heading">{block.heading}</H>
          {block.body && <p className="cta__text">{block.body}</p>}
          {!!block.buttons?.length && (
            <div className="actions">
              {block.buttons.map((b) => <AqaButton key={b._key} button={b} onDark={onDark} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Rich text ---------- */
export function RichText({ block }: { block: { body?: PortableTextBlock[] } }) {
  if (!block.body) return null
  return (
    <div className="wrapper">
      <div className="prose">
        <PortableText
          value={block.body}
          components={{
            marks: {
              link: ({ value, children }) => {
                const href = (value as { href?: string })?.href ?? '#'
                return isInternal(href) ? <Link href={href}>{children}</Link> : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
              },
            },
          }}
        />
      </div>
    </div>
  )
}
