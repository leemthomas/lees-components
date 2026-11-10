import { defineQuery } from 'next-sanity'

// Links resolve to a slug or URL in GROQ, so components never deal with references.
// Fragments are inlined (not interpolated) so TypeGen can read every query.

export const SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  title,
  footerNote,
  mainNav[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
}`)

// The mega menu. Every link resolves to a slug or URL here, like the page queries.
export const NAVIGATION_QUERY = defineQuery(`*[_id == "navigation"][0]{
  strapline,
  utilityLinks[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
  loginLink{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
  search{ enabled, placeholder, resultsUrl, popular, includePages, suggested[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } } },
  menus[]{
    _key, label, kind, linkLabel, intro, showFilter, filterPlaceholder, columnCount,
    link{ linkType, external, openInNewTab, "slug": internal->slug.current },
    columns[]{
      _key, heading, style,
      headingLink{ linkType, external, openInNewTab, "slug": internal->slug.current },
      footerLink{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      links[]{
        _key, label, tag, description, badge, keywords, childrenIntro, link{ linkType, external, openInNewTab, "slug": internal->slug.current },
        children[]{ _key, label, tag, group, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
      }
    },
    quickLinks[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
    featured[]{
      _key, style, eyebrow, heading, text,
      image{ ..., "lqip": asset->metadata.lqip },
      cta{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    }
  }
}`)

// Live search: pages whose title or description match every word typed.
export const PAGE_SEARCH_QUERY = defineQuery(`*[_type == "page" && defined(slug.current) && (title match $terms || seo.metaDescription match $terms)]
  | score(boost(title match $terms, 3), seo.metaDescription match $terms)
  | order(_score desc)[0...6]{ _id, title, "slug": slug.current, "description": seo.metaDescription }`)

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
    },
    _type == "examAlert" => {
      "keyDates": *[_type == "keyDate" && defined(date)] | order(date asc){ _id, title, date, category, series, detail, vLevels, forStudents, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "helpHub" => {
      popularLinks[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      audiences[]{ _key, label, icon, isNew, tasks[]{ _key, icon, title, description, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }, promo{ eyebrow, title, text, badgeIcon, badgeColour, image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions }, cta{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } } } },
      "keyDates": *[_type == "keyDate" && defined(date)] | order(date asc){ _id, title, date, category, series, detail, vLevels, forStudents, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      "latestNews": *[_type == "newsArticle" && kind == "news"] | order(date desc)[0]{ title, date, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      "menuQualifications": *[_id == "navigation"][0].menus[label == "Subjects"][0].columns[].links[defined(children)]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current }, children[]{ _key, label, tag, group, link{ linkType, external, openInNewTab, "slug": internal->slug.current } } },
      "extraQualifications": ^.sections[_type == "qualificationFinder"][0].extraQualifications[]{ _key, title, level, subject, code, link{ linkType, external, openInNewTab, "slug": internal->slug.current }, registerLink{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "qualificationFinder" => {
      extraQualifications[]{ _key, title, level, subject, code, link{ linkType, external, openInNewTab, "slug": internal->slug.current }, registerLink{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      "menuQualifications": *[_id == "navigation"][0].menus[label == "Subjects"][0].columns[].links[defined(children)]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current }, children[]{ _key, label, tag, group, link{ linkType, external, openInNewTab, "slug": internal->slug.current } } }
    },
    _type == "keyDatesPanel" => {
      calendarLink{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }, allDatesLink{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }, image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions },
      "keyDates": *[_type == "keyDate" && defined(date)] | order(date asc){ _id, title, date, category, series, detail, vLevels, forStudents, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "spotlightCarousel" => {
      slides[]{ _key, icon, tag, tagStyle, title, text, ctaLabel, image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions }, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "popularResources" => {
      button{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }, finderLink{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      resources[]->{ _id, title, subject, level, specCode, resourceType, fileSize, fileUrl }
    },
    _type == "proofBand" => {
      cta{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }, backgroundImage{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions }
    },
    _type == "trainingPanel" => {
      button{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      cards[]{ _key, icon, kicker, title, text, ctaLabel, highlight, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      feature{ tag, title, text, ctaLabel, image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions }, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "studentsPanel" => {
      image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions },
      buttons[]{ _key, label, style, youtubeId, trackingId, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      steps[]{ _key, icon, title, text, ctaLabel, image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions }, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      callout{ tag, tagIcon, title, text, ctaLabel, image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions }, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      "keyDates": *[_type == "keyDate" && defined(date)] | order(date asc){ _id, title, date, category, series, detail, vLevels, forStudents, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "familyServices" => {
      services[]{ _key, icon, title, text, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "examinerPromo" => {
      image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions },
      buttons[]{ _key, label, style, youtubeId, trackingId, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "newsResearch" => {
      researchLink{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }, allNewsLink{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }, allResearchLink{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      "news": *[_type == "newsArticle" && kind == "news"] | order(date desc)[0...9]{ _id, title, date, summary, image{ ..., "lqip": asset->metadata.lqip, "dims": asset->metadata.dimensions }, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      "research": *[_type == "newsArticle" && kind == "research"] | order(date desc)[0...4]{ _id, title, date, summary, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "aqaFooter" => {
      columns[]{ _key, heading, links[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } } },
      legalLinks[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    },
    _type == "helpChat" => {
      answers[]{ _key, keywords, text, links[]{ _key, label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } } },
      contactLink{ label, link{ linkType, external, openInNewTab, "slug": internal->slug.current } },
      "keyDates": *[_type == "keyDate" && defined(date)] | order(date asc){ _id, title, date, category, series, detail, vLevels, forStudents, link{ linkType, external, openInNewTab, "slug": internal->slug.current } }
    }
  }
}`)
