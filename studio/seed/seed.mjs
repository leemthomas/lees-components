// Seeds Lee's Components with real-world AQA example content.
// Run from the repo root: npm run seed   (needs SANITY_WRITE_TOKEN in studio/.env)
// Safe to re-run: documents use fixed IDs and are replaced, images are reused.

import { createClient } from '@sanity/client'
import { randomUUID } from 'node:crypto'

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'bf63zuwb',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2026-10-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('Add SANITY_WRITE_TOKEN to studio/.env (an Editor token from sanity.io/manage).')
  process.exit(1)
}

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)
const CDN = 'https://cdn.sanity.io/images/p28bar15/green/'

// Public images from aqa.org.uk, with the site's own alt text
const IMAGES = {
  mechanics: ['95aa3e23b833db0533b8cc1fd4ae1d42464d25dc-1800x1200.jpg', 'Two young mechanics working together on engine repairs in a garage, wearing safety vests'],
  digitalExams: ['d4f8fd966f89f88226c8493f37827f4cd394494f-3000x2000.jpg', 'A row of students at desks taking exams on laptops as a teacher walks by'],
  drama: ['32e3200ad68bee5832baadd417b48e4d999a263f-6000x4000.jpg', 'Three performers on stage in a theatre as audience members look on'],
  vocational: ['395fcc99b8bf033258ff0201ca7e2d3f882f9bcd-1203x803.jpg', 'A group of young people in technical vocational training with a teacher'],
  learner: ['026b3584de557c12ab433c236c8d9acb18b96f5d-1000x667.jpg', 'A learner at a desk with a pen in her hand, looking through an exam paper'],
  reformHub: ['47d8f8e2042cd18bb6d0ae4051a1db57a4e0a6a7-800x489.jpg', 'Curriculum and Assessment Reform Hub'],
  magazine: ['abbb3c31ba79c702229cadba1a6da13c6ece0041-1024x662.png', 'myAQA training and events magazine'],
  examHall: ['e4ce6210b005fa505e96aef31a2ef8b5c909e3e2-1498x806.png', 'Students sat at desks in rows in an exam hall'],
  partners: ['510682e149f5e5a925e89ae7ee75ab3e0d8d92e8-720x404.png', 'Three adults smiling, looking at a piece of paper'],
  copperPipe: ['24d1e618a4400f0efafa107c7e7b796257103a0e-720x404.png', 'A teacher demonstrating how to bend a copper pipe to two students'],
}

async function uploadImages() {
  const refs = {}
  for (const [name, [file, alt]] of Object.entries(IMAGES)) {
    const existing = await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $file][0]._id`, { file })
    let id = existing
    if (!id) {
      const res = await fetch(CDN + file)
      if (!res.ok) throw new Error(`Could not download ${file}: ${res.status}`)
      const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {
        filename: file,
        source: { name: 'aqa.org.uk', id: file, url: CDN + file },
      })
      id = asset._id
      console.log('  uploaded', name)
    }
    refs[name] = { id, alt }
  }
  return refs
}

/* ---------- builders ---------- */
const img = (r, name, hotspot) => ({
  _type: 'image',
  asset: { _type: 'reference', _ref: r[name].id },
  alt: r[name].alt,
  ...(hotspot ? { hotspot: { _type: 'sanity.imageHotspot', x: hotspot[0], y: hotspot[1], width: 1, height: 1 } } : {}),
})
const internal = (ref) => ({ _type: 'link', linkType: 'internal', internal: { _type: 'reference', _ref: ref } })
const external = (url, openInNewTab = false) => ({ _type: 'link', linkType: 'external', external: url, openInNewTab })
const button = (label, link, style = 'primary', extra = {}) => ({ _type: 'button', _key: key(), label, link, style, ...extra })
const block = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
const overlay = (type, colour = 'neutral', opacity = 0.65, direction = '90deg') => ({ type, colour, opacity, direction })
const slide = (fields) => ({
  _type: 'heroSlide', _key: key(),
  backgroundType: 'image', layout: 'overlay', position: 'ml', mobilePosition: 'bl', tone: 'light',
  maxWidth: 'standard', transition: 'fade', layerAnimation: 'fade-up', motion: 'none',
  overlay: overlay('gradient'),
  ...fields,
})
const hero = (fields) => ({
  _type: 'heroSlider', _key: key(),
  ariaLabel: 'Featured', autoplay: true, interval: 7, speed: 900, height: 'standard', navigation: 'tabs',
  arrows: true, progressBar: false, loop: true, pauseOnHover: true, shuffle: false, width: 'full', spacing: 'none',
  ...fields,
})
const richText = (blocks, extra = {}) => ({ _type: 'richText', _key: key(), body: blocks, background: 'white', spacing: 'default', ...extra })

/* ---------- documents ---------- */
function documents(r) {
  const home = {
    _id: 'page-home', _type: 'page', title: 'Home', slug: { _type: 'slug', current: 'home' },
    seo: { metaTitle: "Lee's Components", metaDescription: 'Test homepage for the new AQA hero slider and page builder components.' },
    sections: [
      hero({
        ariaLabel: 'Featured on AQA',
        slides: [
          slide({
            navLabel: 'V Levels', badge: 'From September 2027', eyebrow: 'Vocational qualifications',
            heading: 'Futures *start here*',
            subheading: 'Introducing V Levels, Level 2 Foundation and Occupational Certificates.',
            image: img(r, 'mechanics', [0.62, 0.45]),
            overlay: overlay('gradient', 'neutral', 0.8, '90deg'),
            motion: 'zoom-in',
            buttons: [
              button('Explore V Levels', internal('page-v-levels'), 'primary', { trackingId: 'home-hero-v-levels' }),
              button('Watch the film', external('https://www.youtube.com/watch?v=2t_8V_Yvx7M', true), 'play', { youtubeId: '2t_8V_Yvx7M', trackingId: 'home-hero-v-levels-film' }),
            ],
          }),
          slide({
            navLabel: 'Assessment reform hub', eyebrow: 'Curriculum and assessment review',
            heading: 'Your assessment *reform hub*',
            subheading: 'Bringing practical support to schools and teachers, subject by subject.',
            image: img(r, 'reformHub'),
            layout: 'split-left', splitRatio: 50, splitEdge: 'angle', panelColour: 'purple',
            overlay: overlay('none'), transition: 'wipe', layerAnimation: 'mask',
            buttons: [
              button('Visit the hub', external('https://www.aqa.org.uk/assessment-reform-hub'), 'primary', { trackingId: 'home-hero-reform-hub' }),
              button('Subject summaries', external('https://www.aqa.org.uk/slt-insights/curriculum-and-assessment-review-explained'), 'secondary'),
            ],
          }),
          slide({
            navLabel: 'myAQA magazine', badge: 'Win in-school training', eyebrow: 'myAQA magazine · Autumn 2026',
            heading: 'Courses, events, features *and news*',
            subheading: 'Flip through your school’s copy or read the digital edition.',
            image: img(r, 'magazine'),
            layout: 'card', position: 'mr', maxWidth: 'narrow',
            overlay: overlay('solid', 'purple', 0.35), transition: 'zoom', layerAnimation: 'blur', motion: 'pan',
            buttons: [button('Read and download', external('https://www.flipsnack.com/7D55C6ED75E/myaqa-magazine-autumn-2026', true), 'primary', { trackingId: 'home-hero-myaqa' })],
          }),
          slide({
            navLabel: 'Digital exams', eyebrow: 'Digital exams',
            heading: 'Safer, greener and more *inclusive* exams',
            subheading: 'Read our response to Ofqual’s consultation on regulating on-screen assessment.',
            image: img(r, 'digitalExams', [0.5, 0.4]),
            position: 'bl', overlay: overlay('scrim', 'neutral', 0.9, '0deg'),
            transition: 'slide', layerAnimation: 'slide-side', maxWidth: 'wide',
            buttons: [
              button('Read our response', external('https://www.aqa.org.uk/news/safer-greener-more-inclusive-digital-exams'), 'primary'),
              button('About digital exams', external('https://www.aqa.org.uk/digital-exams'), 'text'),
            ],
          }),
        ],
      }),
      {
        _type: 'statsBand', _key: key(), heading: 'AQA in numbers', background: 'white', spacing: 'default',
        stats: [
          { _type: 'stat', _key: key(), value: '120', label: 'years history', description: 'AQA is an independent non-profit charity' },
          { _type: 'stat', _key: key(), value: '1m+', label: 'students', description: '1 million+ students sat our qualifications last year' },
          { _type: 'stat', _key: key(), value: '92%', label: 'UK schools', description: '92% of UK schools take AQA qualifications' },
          { _type: 'stat', _key: key(), value: '50%', label: 'UK exam papers', description: 'We set more than half of all GCSE and A-level papers' },
        ],
      },
      {
        _type: 'quickLinks', _key: key(), heading: 'My quick links', background: 'grey', spacing: 'default',
        links: [
          ['Assessment reform', 'https://www.aqa.org.uk/assessment-reform-hub'],
          ['Past papers', 'https://www.aqa.org.uk/past-papers-and-mark-schemes-finder'],
          ['Dates and timetables', 'https://www.aqa.org.uk/exams-administration/dates-and-timetables'],
          ['Subjects', 'https://www.aqa.org.uk/subjects'],
          ['Course finder', 'https://www.aqa.org.uk/professional-development/search'],
          ['Get Resit Ready', 'https://www.aqa.org.uk/resit-ready'],
          ['Results days', 'https://www.aqa.org.uk/exams-administration/results-days'],
          ['Grade boundaries', 'https://www.aqa.org.uk/exams-administration/results-days/grade-boundaries'],
        ].map(([label, url]) => ({ _type: 'quickLink', _key: key(), label, link: external(url) })),
      },
      {
        _type: 'cardGrid', _key: key(), heading: 'Services', columns: 4, background: 'white', spacing: 'default',
        cards: [
          ['Stride Maths', 'Step into the future of maths learning. Diagnostic tests that find and fix maths gaps.', 'Learn more', 'https://www.aqa.org.uk/stride'],
          ['All About Maths', 'Hundreds of free teaching resources to help you plan and teach our qualifications.', 'All About Maths', 'https://www.aqa.org.uk/all-about-maths'],
          ['Exampro', 'Find past paper questions and build assessments for revision, homework and topic tests.', 'Go to Exampro', 'https://www.exampro.co.uk/'],
          ['Teacher Access', 'Get early access to the most recent question papers and mark schemes in Centre Services.', 'Log in to Centre Services', 'https://onlineservices.aqa.org.uk/'],
        ].map(([title, body, label, url]) => ({ _type: 'card', _key: key(), title, body, button: button(label, external(url), 'text') })),
      },
      {
        _type: 'cardGrid', _key: key(), heading: 'News, thoughts and insights', columns: 3, background: 'purple-tint', spacing: 'default',
        cards: [
          ['examHall', 'Changes to assessments from summer 2027 onwards', 'Improving the accessibility of our question papers.', 'https://www.aqa.org.uk/news/changes-to-assessments-from-summer-2027-onwards'],
          ['partners', 'Launch of AQA’s Purpose-Driven Partnerships Programme', 'A one-year funding opportunity for organisations working to improve education.', 'https://www.aqa.org.uk/news/launch-of-aqa-purpose-driven-partnerships-programme'],
          ['copperPipe', 'AQA to develop and award new V Levels', 'New vocational qualifications, available in stages from September 2027.', 'https://www.aqa.org.uk/news/aqa-to-develop-new-v-levels'],
        ].map(([image, title, body, url]) => ({ _type: 'card', _key: key(), image: img(r, image), eyebrow: 'News', title, body, button: button('Read more', external(url), 'text') })),
      },
      {
        _type: 'ctaBanner', _key: key(), heading: 'Switch to AQA today', background: 'white', spacing: 'large',
        body: 'When you join us, you join the largest teaching community around.',
        image: img(r, 'learner'), imagePosition: 'left',
        buttons: [
          button('Switch to AQA', external('https://www.aqa.org.uk/switch-to-aqa-today'), 'primary'),
          button('Become an examiner', external('https://www.aqa.org.uk/join-us/become-an-examiner'), 'secondary'),
        ],
      },
    ],
  }

  const examples = {
    _id: 'page-hero-examples', _type: 'page', title: 'Hero slider examples', slug: { _type: 'slug', current: 'hero-examples' },
    seo: { metaTitle: 'Hero slider examples', metaDescription: 'Every hero slider option in one place for testing.' },
    sections: [
      hero({
        navigation: 'none', arrows: false, autoplay: false, height: 'compact',
        slides: [
          slide({
            navLabel: 'Static hero', eyebrow: 'Example 1 · One slide',
            heading: 'A static banner, like the *current hero*',
            subheading: 'One slide turns the slider off: no arrows, no tabs, no autoplay. This one uses a 50/50 split with the image on the left.',
            image: img(r, 'vocational'), layout: 'split-right', splitRatio: 50, splitEdge: 'straight', panelColour: 'purple',
            overlay: overlay('none'),
            buttons: [button('See the V Levels page', internal('page-v-levels'), 'primary')],
          }),
        ],
      }),
      richText([block('Contained width, brand colour backgrounds and dots', 'h2'), block('The next hero sits inside the page grid with rounded corners. Each slide has a flat AQA colour and a different transition: slide, stack and blinds.')], { spacing: 'small' }),
      hero({
        width: 'contained', height: 'compact', navigation: 'dots', interval: 6, spacing: 'small',
        slides: [
          slide({ navLabel: 'Purple', backgroundType: 'colour', colour: 'purple', overlay: overlay('pattern', 'purple-secondary', 0.6), heading: 'Entries for summer 2027 *open soon*', eyebrow: 'Exams admin', subheading: 'Check the key dates and get your entries ready.', transition: 'slide', buttons: [button('Key dates', external('https://www.aqa.org.uk/exams-administration/dates-and-timetables/search'), 'primary'), button('Entry fees', external('https://www.aqa.org.uk/exams-administration/entries/entry-fees'), 'secondary')] }),
          slide({ navLabel: 'Neutral', backgroundType: 'colour', colour: 'neutral', overlay: overlay('none'), heading: 'Inside Exams *podcast*', eyebrow: 'Listen', subheading: 'Conversations about assessment, marking and what happens after the exam.', transition: 'stack', position: 'mc', layerAnimation: 'scale', buttons: [button('Listen now', external('https://www.aqa.org.uk/inside-exams-podcasts'), 'primary')] }),
          slide({ navLabel: 'Secondary purple', backgroundType: 'colour', colour: 'purple-secondary', overlay: overlay('none'), heading: 'Become an *examiner*', eyebrow: 'Join us', subheading: 'Develop your subject knowledge and earn extra income.', transition: 'blinds', position: 'mr', layerAnimation: 'slide-side', buttons: [button('Find out more', external('https://www.aqa.org.uk/join-us/become-an-examiner'), 'primary')] }),
        ],
      }),
      richText([block('YouTube background, numbers and a progress line', 'h2'), block('The first slide plays a muted YouTube video behind the text, with a poster image until it loads. The second uses a white card over a slow pan.')], { spacing: 'small' }),
      hero({
        height: 'tall', navigation: 'numbers', progressBar: true, interval: 9,
        slides: [
          slide({
            navLabel: 'V Levels film', backgroundType: 'youtube', videoId: '2t_8V_Yvx7M', poster: img(r, 'vocational'),
            eyebrow: 'Example 3 · YouTube background', heading: 'Technical futures, *built here*',
            subheading: 'Video backgrounds are muted, play inline and pause when the hero scrolls out of view.',
            overlay: overlay('gradient', 'purple', 0.85, '90deg'),
            buttons: [button('Explore vocational', external('https://www.aqa.org.uk/vocational'), 'primary'), button('Watch with sound', external('https://www.youtube.com/watch?v=2t_8V_Yvx7M', true), 'play', { youtubeId: '2t_8V_Yvx7M' })],
          }),
          slide({
            navLabel: 'Drama', image: img(r, 'drama', [0.5, 0.35]), layout: 'card', position: 'bl', maxWidth: 'narrow',
            eyebrow: 'A-level Drama and Theatre', heading: 'Two new prescribed *practitioners*',
            subheading: 'Updated specification for first teaching from September 2026.',
            overlay: overlay('none'), motion: 'pan', transition: 'iris', layerAnimation: 'mask',
            buttons: [button('Read the update', external('https://www.aqa.org.uk/news/a-level-drama-updated-specification-for-september-2026'), 'primary')],
          }),
        ],
      }),
      richText([block('Thumbnails, parallax and text positions', 'h2'), block('Three image slides with the text placed centre, bottom right and top centre, using parallax, zoom and slide transitions.')], { spacing: 'small' }),
      hero({
        navigation: 'thumbs', interval: 6,
        slides: [
          slide({ navLabel: 'Exam hall', image: img(r, 'digitalExams', [0.5, 0.4]), position: 'mc', mobilePosition: 'mc', overlay: overlay('solid', 'neutral', 0.6), transition: 'parallax', heading: 'Clearer papers *from 2027*', eyebrow: 'Accessibility', subheading: 'Improving the accessibility of our question papers.', buttons: [button('What’s changing', external('https://www.aqa.org.uk/news/changes-to-assessments-from-summer-2027-onwards'), 'primary')] }),
          slide({ navLabel: 'Learner', image: img(r, 'learner', [0.35, 0.4]), position: 'br', overlay: overlay('gradient', 'neutral', 0.85, '270deg'), transition: 'zoom', layerAnimation: 'blur', motion: 'zoom-out', heading: 'Extra time in *exams*', eyebrow: 'AQI research', subheading: 'Receiving extra time and benefiting from it do not always go hand in hand.', buttons: [button('Read the blog', external('https://www.aqa.org.uk/blog/extra-time-in-exams-are-we-asking-the-right-question'), 'secondary')] }),
          slide({ navLabel: 'Mechanics', image: img(r, 'mechanics', [0.5, 0.6]), position: 'tc', mobilePosition: 'tc', overlay: overlay('gradient', 'purple', 0.85, '180deg'), transition: 'slide', layerAnimation: 'fade-up', heading: 'Approved by *Ofqual*', eyebrow: 'Vocational', subheading: 'New level 2 and 3 vocational qualifications for 16 to 19 year olds.', buttons: [button('Read the news', external('https://www.aqa.org.uk/news/aqa-to-deliver-new-vocational-qualifications-from-2027'), 'primary')] }),
        ],
      }),
    ],
  }

  const vLevels = {
    _id: 'page-v-levels', _type: 'page', title: 'V Levels', slug: { _type: 'slug', current: 'v-levels' },
    seo: { metaTitle: 'V Levels from AQA', metaDescription: 'New V Levels, Level 2 Foundation Certificates and Occupational Certificates from AQA, available from September 2027.' },
    sections: [
      hero({
        navigation: 'none', arrows: false, autoplay: false, height: 'standard',
        slides: [
          slide({
            navLabel: 'V Levels', badge: 'From September 2027', eyebrow: 'Vocational qualifications',
            heading: 'V Levels from *AQA*',
            subheading: 'New level 3 vocational qualifications for 16 to 19 year olds, approved by Ofqual.',
            image: img(r, 'copperPipe'), overlay: overlay('gradient', 'purple', 0.9, '90deg'), motion: 'zoom-in',
            buttons: [button('Register your interest', external('https://www.aqa.org.uk/vocational'), 'primary'), button('Watch the film', external('https://www.youtube.com/watch?v=2t_8V_Yvx7M', true), 'play', { youtubeId: '2t_8V_Yvx7M' })],
          }),
        ],
      }),
      richText([
        block('What are V Levels?', 'h2'),
        block('V Levels are new level 3 qualifications that sit alongside A-levels and T Levels. AQA will offer them, together with Level 2 Foundation Certificates and Occupational Certificates, in stages from September 2027.'),
        block('This page is sandbox content. It shows a single-slide hero used as a static page banner, followed by ordinary page sections.'),
      ], { anchorId: 'about' }),
      {
        _type: 'cardGrid', _key: key(), heading: 'The new qualifications', columns: 3, background: 'grey', spacing: 'default',
        cards: [
          ['V Levels', 'Level 3 qualifications for students aged 16 to 19, taken alongside or instead of A-levels.'],
          ['Level 2 Foundation Certificates', 'A stepping stone for students who need a level 2 route before level 3.'],
          ['Occupational Certificates', 'Qualifications linked to specific occupations and the skills employers need.'],
        ].map(([title, body]) => ({ _type: 'card', _key: key(), title, body, button: button('Find out more', external('https://www.aqa.org.uk/vocational'), 'text') })),
      },
      {
        _type: 'ctaBanner', _key: key(), heading: 'Get ready for September 2027', background: 'white', spacing: 'large',
        body: 'Sign up for updates and be first to hear about specifications, training and support.',
        image: img(r, 'mechanics'), imagePosition: 'right',
        buttons: [button('Register your interest', external('https://www.aqa.org.uk/vocational'), 'primary')],
      },
    ],
  }

  const settings = {
    _id: 'siteSettings', _type: 'siteSettings', title: 'AQA',
    footerNote: "Lee's Components. Test content for internal development only.",
    mainNav: [
      { _type: 'navItem', _key: key(), label: 'Home', link: internal('page-home') },
      { _type: 'navItem', _key: key(), label: 'Hero examples', link: internal('page-hero-examples') },
      { _type: 'navItem', _key: key(), label: 'V Levels', link: internal('page-v-levels') },
      { _type: 'navItem', _key: key(), label: 'aqa.org.uk', link: external('https://www.aqa.org.uk') },
    ],
  }

  return [vLevels, examples, home, settings]
}

console.log('Uploading images…')
const refs = await uploadImages()
console.log('Writing documents…')
const tx = client.transaction()
for (const doc of documents(refs)) tx.createOrReplace(doc)
await tx.commit({ autoGenerateArrayKeys: true })
console.log('Done. Open the Studio and look under Homepage and All pages.')
