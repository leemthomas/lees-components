import { pageType } from './documents/page'
import { siteSettingsType } from './documents/site-settings'
import { linkType } from './objects/link'
import { buttonType } from './objects/button'
import { seoType } from './objects/seo'
import { heroSlideType } from './blocks/hero-slide'
import { heroSliderType } from './blocks/hero-slider'
import { cardGridType, ctaBannerType, quickLinksType, richTextType, statsBandType } from './blocks/other-blocks'

export const schemaTypes = [
  // documents
  pageType,
  siteSettingsType,
  // objects
  linkType,
  buttonType,
  seoType,
  // page builder blocks
  heroSlideType,
  heroSliderType,
  statsBandType,
  quickLinksType,
  cardGridType,
  ctaBannerType,
  richTextType,
]
