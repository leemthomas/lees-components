// The "Mega menu" document: the six aqa.org.uk menus (October 2026) with real links,
// plus spec codes, sub-menus, featured cards and search settings.
// Used by seed.mjs. `refs` maps image names to { id, alt } from uploadImages().

import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

// Qualifications for each subject, taken from the subject pages on aqa.org.uk (October 2026)
const QUALS = JSON.parse(readFileSync(new URL('./subject-qualifications.json', import.meta.url), 'utf8'))

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)
const AQA = 'https://www.aqa.org.uk'
const url = (path, openInNewTab = false) => ({
  _type: 'link',
  linkType: 'external',
  external: path.startsWith('http') ? path : AQA + path,
  openInNewTab,
})
const textLink = (label, path, newTab) => ({ _type: 'textLink', _key: key(), label, link: url(path, newTab) })
const link = (label, path, extra = {}) => {
  const { newTab, ...rest } = extra
  return { _type: 'megaMenuLink', _key: key(), label, link: url(path, newTab), ...rest }
}
const column = (heading, links, extra = {}) => ({
  _type: 'megaMenuColumn',
  _key: key(),
  ...(heading ? { heading } : {}),
  style: 'compact',
  links,
  ...extra,
})
const image = (refs, name) => ({
  _type: 'image',
  asset: { _type: 'reference', _ref: refs[name].id },
  alt: refs[name].alt,
})
const feature = (fields) => ({ _type: 'megaMenuFeature', _key: key(), style: 'image', ...fields })
const menu = (fields) => ({ _type: 'megaMenu', _key: key(), kind: 'panel', ...fields })

export function navigationDoc(refs) {
  // Subjects grouped into sections. Each subject's qualifications become its sub-menu.
  const SUBJECT_GROUPS = [
    ['Sciences', [['Biology', 'biology'], ['Chemistry', 'chemistry'], ['Physics', 'physics'], ['Science', 'science']]],
    ['Maths and computing', [['Mathematics', 'mathematics'], ['Computer Science', 'computer-science']]],
    ['English and languages', [['English', 'english'], ['French', 'french'], ['German', 'german'], ['Spanish', 'spanish'], ['Languages', 'languages']]],
    ['Humanities and social sciences', [['Geography', 'geography'], ['History', 'history'], ['Politics', 'politics'], ['Psychology', 'psychology'], ['Religious Studies', 'religious-studies'], ['Sociology', 'sociology']]],
    ['Business, economics and law', [['Accounting', 'accounting'], ['Business', 'business'], ['Economics', 'economics'], ['Law', 'law']]],
    ['Arts and media', [['Art and Design', 'art-and-design'], ['Dance', 'dance'], ['Drama', 'drama'], ['Media Studies', 'media-studies'], ['Music', 'music']]],
    ['Technology and PE', [['Design and Technology', 'design-and-technology'], ['Food preparation and Nutrition', 'food-preparation-and-nutrition'], ['Physical Education', 'physical-education']]],
  ]
  const levelGroup = (label) =>
    label.startsWith('GCSE ') ? 'GCSE' : /^(AS|A-level) /.test(label) ? 'AS and A-level' : 'Other qualifications'
  const ORDER = { GCSE: 0, 'AS and A-level': 1, 'Other qualifications': 2 }
  const subjectLink = (label, slug) => {
    const quals = (QUALS[slug] ?? [])
      .map((q, i) => ({ ...q, group: levelGroup(q.label), i }))
      .sort((x, y) => ORDER[x.group] - ORDER[y.group] || x.i - y.i)
      .slice(0, 14)
    return link(label, `/subjects/${slug}`, {
      ...(quals.length
        ? {
            childrenIntro: 'Choose a qualification for its specification, past papers and teaching resources.',
            children: quals.map((q) => ({ _type: 'megaMenuSubLink', _key: key(), label: q.label, tag: q.tag, group: q.group, link: url(q.path) })),
          }
        : {}),
    })
  }

  return {
    _id: 'navigation',
    _type: 'navigation',
    strapline: 'Most chosen general qualifications exam board in England.',
    utilityLinks: [
      textLink('About AQA', '/about-us'),
      textLink('Centre Services', 'https://onlineservices.aqa.org.uk/'),
      textLink('Join Us', '/join-us'),
      textLink('Contact Us', '/contact-us'),
    ],
    loginLink: { _type: 'textLink', label: 'Log in', link: url('https://onlineservices.aqa.org.uk/') },
    search: {
      enabled: true,
      placeholder: 'Search subjects, qualifications, dates…',
      resultsUrl: `${AQA}/search?q=`,
      includePages: true,
      popular: ['Past papers', 'Grade boundaries', 'Key dates', 'V Levels', 'Results days', 'Entry fees'],
      suggested: [
        textLink('Find past papers and mark schemes', '/past-papers-and-mark-schemes-finder'),
        textLink('Dates and timetables', '/exams-administration/dates-and-timetables'),
        textLink('Grade boundaries', '/exams-administration/results-days/grade-boundaries'),
        textLink('Contact us', '/contact-us'),
      ],
    },
    menus: [
      /* ---------- Subjects ---------- */
      menu({
        label: 'Subjects',
        link: url('/subjects'),
        linkLabel: 'All subjects',
        intro: 'Specifications, teaching resources, past papers and training for every subject we offer.',
        showFilter: true,
        filterPlaceholder: 'Filter subjects',
        columns: SUBJECT_GROUPS.map(([heading, items]) => column(heading, items.map(([label, slug]) => subjectLink(label, slug)))),
        quickLinks: [
          textLink('All subjects', '/subjects'),
          textLink('Find past papers', '/past-papers-and-mark-schemes-finder'),
        ],
        featured: [
          feature({
            eyebrow: 'Exam preparation',
            heading: 'Past papers and mark schemes',
            text: 'Search every past paper, mark scheme and examiner report by subject and level.',
            image: image(refs, 'learner'),
            cta: textLink('Find past papers', '/past-papers-and-mark-schemes-finder'),
          }),
        ],
      }),

      /* ---------- Qualifications ---------- */
      menu({
        label: 'Qualifications',
        link: url('/qualifications'),
        linkLabel: 'All qualifications',
        showFilter: true,
        filterPlaceholder: 'Filter by subject or code',
        columns: [
          column(
            'GCSEs',
            [
              link('Biology', '/subjects/biology/gcse/biology-8461', { tag: '8461' }),
              link('Chemistry', '/subjects/chemistry/gcse/chemistry-8462', { tag: '8462' }),
              link('Combined Science: Trilogy', '/subjects/science/gcse/science-8464/specification', { tag: '8464' }),
              link('English Language', '/subjects/english/gcse/english-8700', { tag: '8700' }),
              link('English Literature', '/subjects/english/gcse/english-8702', { tag: '8702' }),
              link('Geography', '/subjects/geography/gcse/geography-8035', { tag: '8035' }),
              link('History', '/subjects/history/gcse/history-8145', { tag: '8145' }),
              link('Mathematics', '/subjects/mathematics/gcse/mathematics-8300', { tag: '8300' }),
            ],
            { headingLink: url('/qualifications?level=gcse'), footerLink: { _type: 'textLink', label: 'See all GCSEs', link: url('/qualifications?level=gcse') } },
          ),
          column(
            'AS and A-levels',
            [
              link('Biology', '/subjects/biology/a-level/biology-7402', { tag: '7402' }),
              link('Business', '/subjects/business/a-level/business-7138', { tag: '7138' }),
              link('Chemistry', '/subjects/chemistry/a-level/chemistry-7405', { tag: '7405' }),
              link('Geography', '/subjects/geography/a-level/geography-7037', { tag: '7037' }),
              link('History', '/subjects/history/a-level/history-7042', { tag: '7042' }),
              link('Physics', '/subjects/physics/a-level/physics-7408', { tag: '7408' }),
              link('Psychology', '/subjects/psychology/a-level/psychology-7182', { tag: '7182' }),
              link('Sociology', '/subjects/sociology/a-level/sociology-7192', { tag: '7192' }),
            ],
            { headingLink: url('/qualifications?level=as-and-a-levels'), footerLink: { _type: 'textLink', label: 'See all AS and A-levels', link: url('/qualifications?level=as-and-a-levels') } },
          ),
          column('Other qualifications', [
            link('Applied Generals', '/applied-general', {}),
            link('AQA Certificate Mathematics', '/subjects/mathematics', {}),
            link('Entry Level Certificates', '/entry-level-certificates', {}),
            link('Project Qualifications', '/subjects/projects', { keywords: ['EPQ', 'extended project'] }),
            link('Unit Award Scheme', '/programmes/unit-award-scheme/about', { keywords: ['UAS'] }),
            link('Vocational', '/vocational', { badge: 'new', keywords: ['V Levels', 'technical'] }),
          ]),
        ],
        quickLinks: [
          textLink('All qualifications', '/qualifications'),
          textLink('Find past papers', '/past-papers-and-mark-schemes-finder'),
        ],
        featured: [
          feature({
            eyebrow: 'New qualification',
            heading: 'V Levels',
            text: 'Our new vocational qualifications, built with employers and teachers.',
            image: image(refs, 'mechanics'),
            cta: textLink('Learn more', '/vocational'),
          }),
        ],
      }),

      /* ---------- Professional Development ---------- */
      menu({
        label: 'Professional Development',
        link: url('/professional-development'),
        linkLabel: 'All professional development',
        columns: [
          column(
            'Our training',
            [
              link('Course finder', '/professional-development/search', { description: 'Search all courses by subject, level and format', keywords: ['CPD', 'courses'] }),
              link('About our training', '/professional-development/about-our-training', { description: 'How our courses are designed and delivered' }),
              link('Online training', '/professional-development/online-training', { description: 'Live and on-demand courses you can join from school' }),
              link('Face-to-face training', '/professional-development/face-to-face-training', { description: 'Courses at venues around the country' }),
              link('In-school training', '/professional-development/in-school', { description: 'Training delivered for your whole team' }),
              link('Inside assessment', '/professional-development/inside-assessment', { description: 'How assessment works, from paper design to marking' }),
            ],
            { style: 'detailed' },
          ),
          column('Courses by theme', [
            link('Preparing for exams', '/professional-development/search?q=preparing+for+2026', {}),
            link('Unit Award Scheme', '/professional-development/search?trainingType=Unit+Award+Scheme', {}),
          ]),
          column('Courses by subject', [
            link('English', '/professional-development/search?qualificationLevel=&subject=English', {}),
            link('Mathematics', '/professional-development/search?qualificationLevel=&subject=Mathematics', {}),
            link('Science', '/professional-development/search?qualificationLevel=&subject=Science', {}),
            link('Languages', '/professional-development/search?qualificationLevel=&subject=Languages', {}),
            link('Design and Technology', '/professional-development/search?qualificationLevel=&subject=Design+and+Technology', {}),
            link('Physical Education', '/professional-development/search?qualificationLevel=&subject=Physical+Education', {}),
            link('Geography', '/professional-development/search?qualificationLevel=&subject=Geography', {}),
            link('History', '/professional-development/search?qualificationLevel=&subject=History', {}),
          ]),
        ],
        featured: [
          feature({
            eyebrow: 'Autumn 2026',
            heading: 'myAQA training and events magazine',
            text: 'This term’s courses, events and updates in one place.',
            image: image(refs, 'magazine'),
            cta: textLink('Read and download', 'https://www.flipsnack.com/7D55C6ED75E/myaqa-magazine-autumn-2026', true),
          }),
        ],
      }),

      /* ---------- Exams Admin ---------- */
      menu({
        label: 'Exams Admin',
        link: url('/exams-administration'),
        linkLabel: 'All Exams Admin',
        intro: 'Everything exams officers need, from entries to certificates.',
        columns: [
          column('Non-exam assessment (NEA)', [
            link('NEA, coursework and controlled assessment', '/exams-administration/coursework-controlled-assessment-nea', { keywords: ['coursework'] }),
            link('Deadlines for non-exam assessment', '/exams-administration/coursework-controlled-assessment-nea/submit-marks-and-grades#submission-deadline', {}),
            link('Record forms', '/exams-administration/coursework-controlled-assessment-nea/candidate-record-forms-and-centre-declaration-sheets', { keywords: ['candidate record form', 'CRF', 'declaration'] }),
            link('Submit marks', '/exams-administration/coursework-controlled-assessment-nea/submit-marks-and-grades', {}),
            link('Submitting student samples', '/exams-administration/coursework-controlled-assessment-nea/sending-samples', { keywords: ['moderation'] }),
          ]),
          column('Exams', [
            link('Entries', '/exams-administration/entries', {}),
            link('Entry fees', '/exams-administration/entries/entry-fees', { keywords: ['prices', 'cost'] }),
            link('Exams guidance', '/exams-administration/exams', {}),
            link('Question papers and stationery', '/exams-administration/exams/exam-papers-and-stationery', {}),
            link('Access arrangements', '/exams-administration/special-requirements/access-arrangements', { keywords: ['extra time', 'SEND'] }),
            link('Special consideration', '/exams-administration/special-requirements/special-consideration', {}),
          ]),
          column('Results', [
            link('Results days', '/exams-administration/results-days', {}),
            link('Results slips', '/exams-administration/results-days/results-slips', {}),
            link('Grade boundaries', '/exams-administration/results-days/grade-boundaries', { badge: 'popular' }),
            link('Results statistics', '/exams-administration/results-days/results-statistics', {}),
            link('Post-results services', '/exams-administration/after-results/post-results', { keywords: ['remark', 'review of marking', 'appeal'] }),
            link('Exam certificates', '/exams-administration/after-results/exam-certificates', {}),
          ]),
        ],
        quickLinks: [textLink('All Exams Admin', '/exams-administration')],
        featured: [
          feature({
            style: 'purple',
            eyebrow: 'Dates',
            heading: 'Dates and timetables',
            text: 'Exam timetables and deadlines for every series.',
            cta: textLink('See timetables', '/exams-administration/dates-and-timetables'),
          }),
          feature({
            style: 'teal',
            heading: 'Key dates',
            text: 'Search the deadlines that matter to your centre.',
            cta: textLink('Find key dates', '/exams-administration/dates-and-timetables/search'),
          }),
        ],
      }),

      /* ---------- Services ---------- */
      menu({
        label: 'Services',
        columns: [
          column(
            'Assessment Services',
            [
              link('Centre Services', 'https://onlineservices.aqa.org.uk/', { description: 'Entries, results and admin for your centre' }),
              link('Associate Extranet', 'https://onlineservices.aqa.org.uk/', { description: 'For examiners, moderators and associates' }),
              link('Become an associate', '/join-us/senior-associate-vacancies', { description: 'Mark, moderate or write papers with us' }),
            ],
            { style: 'detailed' },
          ),
          column('Products', [
            link('All About Maths', '/all-about-maths', {}),
            link('AlphaPlus', 'https://alphaplus.co.uk/', { newTab: true }),
            link('Data Insights', '/data-insights', {}),
            link('Exampro', 'https://www.exampro.co.uk', { newTab: true }),
            link('Project Q', 'https://projectq.co/home', { newTab: true }),
            link('Stride Maths', '/stride', {}),
            link('Testbase', 'https://www.testbase.co.uk/', { newTab: true }),
            link('Unit Award Scheme', '/programmes/unit-award-scheme/about', {}),
          ]),
          column('News and Insights', [
            link('AQI research and insight', '/aqi', {}),
            link('News', '/news', {}),
            link('Inside Exams Podcast', '/inside-exams-podcasts', {}),
            link('Exams officers podcast', '/exams-administration/exams-officer-podcasts', {}),
            link('AQA assessment research', '/about-us/our-research', {}),
          ]),
        ],
        featured: [
          feature({
            eyebrow: 'Partnerships',
            heading: 'Purpose Driven Partnerships',
            text: 'Working with schools and organisations to support every learner.',
            image: image(refs, 'partners'),
            cta: textLink('Find out more', '/aqa-purpose-driven-partnerships-programme'),
          }),
        ],
      }),

      /* ---------- Support for ---------- */
      menu({
        label: 'Support for',
        columns: [
          column('Assessment reform', [
            link('Curriculum and assessment', '/assessment-reform-hub', {}),
            link('Subject summaries', '/slt-insights/curriculum-and-assessment-review-explained', {}),
            link('Teacher panels - work with us', '/shape-the-future-together', {}),
            link('Assessment reform - the essentials', '/assessment-reform-the-essentials', {}),
          ]),
          column('Leadership', [
            link('MAT leadership', '/multi-academy-trust-support', { keywords: ['multi-academy trust'] }),
            link('Senior leadership', '/slt-insights', { keywords: ['SLT'] }),
          ]),
          column('Teachers', [
            link('Search subjects', '/subjects', {}),
            link('Past-paper finder', '/past-papers-and-mark-schemes-finder', { badge: 'popular' }),
            link('Digital exams', '/digital-exams', { badge: 'new', keywords: ['on-screen'] }),
          ]),
          column('Learners and parents', [
            link('Revision', '/student-and-parent-support/revision', {}),
            link('Exam day', '/student-and-parent-support/exam-day', {}),
            link('Results day', '/student-and-parent-support/results-day', {}),
            link('Private candidates', '/student-and-parent-support/private-candidates', {}),
          ]),
        ],
        quickLinks: [textLink('Have a question? Contact us', '/contact-us')],
      }),
    ],
  }
}
