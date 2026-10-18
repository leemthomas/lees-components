import { defineQuery } from 'next-sanity'

// Links resolve to a slug or URL in GROQ, so components never deal with references.
// Fragments are inlined (not interpolated) so TypeGen can read every query.

export const SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  title,
  footerNote,
  mainNav[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
}`)

export const PAGE_SLUGS_QUERY = defineQuery(`*[_type == "page" && defined(slug.current)].slug.current`)

export const PAGE_SEO_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{ title, seo }`)

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id,
  _type,
  title,
  "slug": slug.current,
  sections[]{
    ...,
    _type == "heroSlider" => {
      "slides": slides[
        (!defined(publishFrom) || publishFrom <= now()) &&
        (!defined(publishUntil) || publishUntil > now())
      ]{
        ...,
        "mp4": videoFile.asset->url,
        image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions },
        poster{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions },
        buttons[]{ _key, label, style, youtubeId, trackingId, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
      }
    },
    _type == "cardGrid" => {
      cards[]{ ..., image{ ..., "lqip": asset->metadata.lqip }, button{ label, style, youtubeId, trackingId, link{ linkType, external, openInNewTab, "slug": internal->slug.current } } }
    },
    _type == "ctaBanner" => {
      buttons[]{ _key, label, style, youtubeId, trackingId, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "quickLinks" => {
      links[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    }
  }
}`)
