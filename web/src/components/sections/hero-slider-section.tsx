import { stegaClean } from 'next-sanity'
import HeroSlider from '@/components/hero-slider/hero-slider'
import type { HeroOptions, HeroSlide, ImageSource } from '@/components/hero-slider/types'
import { urlFor, srcSetFor } from '@/sanity/image'
import { aqaColour } from '@/lib/colours'
import { resolveHref } from '@/lib/links'
import type { ButtonValue } from '@/components/aqa-button'

/* Loose shape of the GROQ result. Run `npm run typegen` for generated types. */
type SanityImage = {
  asset?: { _ref: string }
  hotspot?: { x: number; y: number }
  crop?: unknown
  alt?: string
  mobile?: SanityImage
  lqip?: string
  dims?: { width: number; height: number }
}
type RawSlide = Record<string, unknown> & {
  _key: string
  backgroundType?: string
  image?: SanityImage
  poster?: SanityImage
  buttons?: ButtonValue[]
  overlay?: { type?: string; colour?: string; opacity?: number; direction?: string }
}
export type HeroSliderBlock = Record<string, unknown> & { _key: string; slides?: RawSlide[] }

const c = <T,>(v: T) => stegaClean(v)

function toImage(img?: SanityImage): (ImageSource & { srcSet?: string; mobileSrcSet?: string }) | undefined {
  if (!img?.asset) return undefined
  return {
    src: urlFor(img).width(1920).quality(80).url(),
    srcSet: srcSetFor(img),
    alt: img.alt ?? '',
    focalX: img.hotspot?.x ?? 0.5,
    focalY: img.hotspot?.y ?? 0.5,
    width: img.dims?.width,
    height: img.dims?.height,
    blurDataURL: img.lqip,
    mobileSrc: img.mobile?.asset ? urlFor(img.mobile).width(900).url() : undefined,
    mobileSrcSet: img.mobile?.asset ? srcSetFor(img.mobile, [480, 720, 900, 1200]) : undefined,
  }
}

function toSlide(s: RawSlide): HeroSlide {
  const type = c(s.backgroundType) ?? 'image'
  const poster = toImage(s.poster)
  const background: HeroSlide['background'] =
    type === 'video' ? { type: 'video', mp4: String(s.mp4 ?? ''), poster, advanceOnEnd: !!s.advanceOnEnd }
    : type === 'youtube' ? { type: 'youtube', videoId: c(String(s.videoId ?? '')), start: s.start as number, end: s.end as number, poster }
    : type === 'vimeo' ? { type: 'vimeo', videoId: c(String(s.videoId ?? '')), poster }
    : type === 'colour' ? { type: 'colour', colour: aqaColour(s.colour as string) }
    : toImage(s.image) ? { type: 'image', image: toImage(s.image)! }
    : { type: 'colour', colour: 'var(--aqa-purple)' }

  const ov = s.overlay ?? {}
  return {
    id: s._key,
    navLabel: s.navLabel as string,
    badge: s.badge as string | undefined,
    eyebrow: s.eyebrow as string | undefined,
    heading: (s.heading as string) ?? '',
    subheading: s.subheading as string | undefined,
    buttons: (s.buttons ?? [])
      .map((b) => ({
        label: b.label ?? '',
        href: resolveHref(b.link) ?? '#',
        style: (c(b.style) ?? 'primary') as 'primary' | 'secondary' | 'text' | 'play',
        newTab: !!b.link?.openInNewTab,
        youtubeId: c(b.youtubeId) ?? undefined,
        trackingId: c(b.trackingId) ?? undefined,
      }))
      .filter((b) => b.label),
    background,
    motion: c(s.motion as HeroSlide['motion']),
    overlay: {
      type: (c(ov.type) ?? 'gradient') as NonNullable<HeroSlide['overlay']>['type'],
      colour: aqaColour(ov.colour, 'var(--aqa-neutral)'),
      opacity: ov.opacity ?? 0.65,
      direction: c(ov.direction) ?? '90deg',
    },
    layout: c(s.layout as HeroSlide['layout']),
    splitRatio: s.splitRatio as number | undefined,
    splitEdge: c(s.splitEdge as HeroSlide['splitEdge']),
    panelColour: s.panelColour ? aqaColour(s.panelColour as string) : undefined,
    position: c(s.position as HeroSlide['position']),
    mobilePosition: c(s.mobilePosition as HeroSlide['mobilePosition']),
    tone: c(s.tone as HeroSlide['tone']),
    maxWidth: c(s.maxWidth as HeroSlide['maxWidth']),
    transition: c(s.transition as HeroSlide['transition']),
    layerAnimation: c(s.layerAnimation as HeroSlide['layerAnimation']),
    duration: typeof s.duration === 'number' ? s.duration * 1000 : undefined,
  }
}

export function HeroSliderSection({ block, isFirst }: { block: HeroSliderBlock; isFirst: boolean }) {
  const slides = (block.slides ?? []).map(toSlide)
  if (!slides.length) return null
  const options: HeroOptions = {
    ariaLabel: c(block.ariaLabel as string) || 'Featured',
    autoplay: block.autoplay as boolean | undefined,
    interval: typeof block.interval === 'number' ? block.interval * 1000 : undefined,
    speed: block.speed as number | undefined,
    height: c(block.height as HeroOptions['height']),
    navigation: c(block.navigation as HeroOptions['navigation']),
    arrows: block.arrows as boolean | undefined,
    progressBar: block.progressBar as boolean | undefined,
    loop: block.loop as boolean | undefined,
    pauseOnHover: block.pauseOnHover as boolean | undefined,
    shuffle: block.shuffle as boolean | undefined,
    firstHeadingLevel: isFirst ? 'h1' : 'h2',
    contained: c(block.width as string) === 'contained',
  }
  return <HeroSlider slides={slides} options={options} />
}
