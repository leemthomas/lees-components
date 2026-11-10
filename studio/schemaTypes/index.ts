import { pageType } from './documents/page'
import { siteSettingsType } from './documents/site-settings'
import { linkType } from './objects/link'
import { buttonType } from './objects/button'
import { seoType } from './objects/seo'
import { megaMenuTypes } from './navigation/mega-menu'
import { heroSlideType } from './blocks/hero-slide'
import { heroSliderType } from './blocks/hero-slider'
import { keyDateType, newsArticleType, resourceType } from './documents/homepage-data'
import { homepageBlockTypes } from './blocks/homepage-blocks'
import { cardGridType, ctaBannerType, quickLinksType, richTextType, statsBandType } from './blocks/other-blocks'

export const schemaTypes = [
  // documents
  pageType,
  siteSettingsType,
  // homepage data
  keyDateType,
  resourceType,
  newsArticleType,
  // mega menu (navigation singleton and its objects)
  ...megaMenuTypes,
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
  // redesigned aqa.org.uk homepage
  ...homepageBlockTypes,
]
