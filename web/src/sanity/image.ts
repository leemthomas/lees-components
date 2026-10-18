import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import { dataset, projectId } from './env'

const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => builder.image(source).auto('format')

const WIDTHS = [480, 720, 960, 1280, 1600, 1920, 2400]

/** srcset string for responsive <img> tags, respecting the editor's crop and hotspot. */
export function srcSetFor(source: SanityImageSource, widths = WIDTHS, aspect?: number) {
  return widths
    .map((w) => {
      let img = urlFor(source).width(w).quality(80)
      if (aspect) img = img.height(Math.round(w / aspect)).fit('crop')
      return `${img.url()} ${w}w`
    })
    .join(', ')
}
