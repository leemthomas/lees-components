// The "Mega menu" document: the six aqa.org.uk menus (October 2026) with real links,
// plus icons, spec codes, featured cards and search settings.
// Used by seed.mjs. `refs` maps image names to { id, alt } from uploadImages().

import { randomUUID } from 'node:crypto'

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
  span: 1,
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
  const subjects = [
    ['Accounting', 'accounting', 'accounting'],
    ['Art and Design', 'art-and-design', 'art'],
    ['Biology', 'biology', 'biology'],
    ['Business', 'business', 'business'],
    ['Chemistry', 'chemistry', 'chemistry'],
    ['Computer Science', 'computer-science', 'computing'],
    ['Dance', 'dance', 'dance'],
    ['Design and Technology', 'design-and-technology', 'design-tech'],
    ['Drama', 'drama', 'drama'],
    ['Economics', 'economics', 'economics'],
    ['English', 'english', 'english'],
    ['Food preparation and Nutrition', 'food-preparation-and-nutrition', 'food'],
    ['French', 'french', 'languages'],
    ['Geography', 'geography', 'geography'],
    ['German', 'german', 'languages'],
    ['History', 'history', 'history'],
    ['Languages', 'languages', 'languages'],
    ['Law', 'law', 'law'],
    ['Mathematics', 'mathematics', 'maths'],
    ['Media Studies', 'media-studies', 'media'],
    ['Music', 'music', 'music'],
    ['Physical Education', 'physical-education', 'pe'],
    ['Physics', 'physics', 'physics'],
    ['Politics', 'politics', 'politics'],
    ['Psychology', 'psychology', 'psychology'],
    ['Religious Studies', 'religious-studies', 'religious-studies'],
    ['Science', 'science', 'science'],
    ['Sociology', 'sociology', 'sociology'],
    ['Spanish', 'spanish', 'languages'],
  ]

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
        columns: [
          column(
            null,
            subjects.map(([label, slug, icon]) => link(label, `/subjects/${slug}`, { icon })),
            { span: 3 },
          ),
        ],
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
              link('Biology', '/subjects/biology/gcse/biology-8461', { tag: '8461', icon: 'biology' }),
              link('Chemistry', '/subjects/chemistry/gcse/chemistry-8462', { tag: '8462', icon: 'chemistry' }),
              link('Combined Science: Trilogy', '/subjects/science/gcse/science-8464/specification', { tag: '8464', icon: 'science' }),
              link('English Language', '/subjects/english/gcse/english-8700', { tag: '8700', icon: 'english' }),
              link('English Literature', '/subjects/english/gcse/english-8702', { tag: '8702', icon: 'books' }),
              link('Geography', '/subjects/geography/gcse/geography-8035', { tag: '8035', icon: 'geography' }),
              link('History', '/subjects/history/gcse/history-8145', { tag: '8145', icon: 'history' }),
              link('Mathematics', '/subjects/mathematics/gcse/mathematics-8300', { tag: '8300', icon: 'maths' }),
            ],
            { headingLink: url('/qualifications?level=gcse'), footerLink: { _type: 'textLink', label: 'See all GCSEs', link: url('/qualifications?level=gcse') } },
          ),
          column(
            'AS and A-levels',
            [
              link('Biology', '/subjects/biology/a-level/biology-7402', { tag: '7402', icon: 'biology' }),
              link('Business', '/subjects/business/a-level/business-7138', { tag: '7138', icon: 'business' }),
              link('Chemistry', '/subjects/chemistry/a-level/chemistry-7405', { tag: '7405', icon: 'chemistry' }),
              link('Geography', '/subjects/geography/a-level/geography-7037', { tag: '7037', icon: 'geography' }),
              link('History', '/subjects/history/a-level/history-7042', { tag: '7042', icon: 'history' }),
              link('Physics', '/subjects/physics/a-level/physics-7408', { tag: '7408', icon: 'physics' }),
              link('Psychology', '/subjects/psychology/a-level/psychology-7182', { tag: '7182', icon: 'psychology' }),
              link('Sociology', '/subjects/sociology/a-level/sociology-7192', { tag: '7192', icon: 'sociology' }),
            ],
            { headingLink: url('/qualifications?level=as-and-a-levels'), footerLink: { _type: 'textLink', label: 'See all AS and A-levels', link: url('/qualifications?level=as-and-a-levels') } },
          ),
          column('Other qualifications', [
            link('Applied Generals', '/applied-general', { icon: 'certificate' }),
            link('AQA Certificate Mathematics', '/subjects/mathematics', { icon: 'maths' }),
            link('Entry Level Certificates', '/entry-level-certificates', { icon: 'stack' }),
            link('Project Qualifications', '/subjects/projects', { icon: 'projects', keywords: ['EPQ', 'extended project'] }),
            link('Unit Award Scheme', '/programmes/unit-award-scheme/about', { icon: 'unit-award', keywords: ['UAS'] }),
            link('Vocational', '/vocational', { icon: 'vocational', badge: 'new', keywords: ['V Levels', 'technical'] }),
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
              link('Course finder', '/professional-development/search', { icon: 'research', description: 'Search all courses by subject, level and format', keywords: ['CPD', 'courses'] }),
              link('About our training', '/professional-development/about-our-training', { icon: 'info', description: 'How our courses are designed and delivered' }),
              link('Online training', '/professional-development/online-training', { icon: 'online', description: 'Live and on-demand courses you can join from school' }),
              link('Face-to-face training', '/professional-development/face-to-face-training', { icon: 'users', description: 'Courses at venues around the country' }),
              link('In-school training', '/professional-development/in-school', { icon: 'teacher', description: 'Training delivered for your whole team' }),
              link('Inside assessment', '/professional-development/inside-assessment', { icon: 'insight', description: 'How assessment works, from paper design to marking' }),
            ],
            { style: 'detailed' },
          ),
          column('Courses by theme', [
            link('Preparing for exams', '/professional-development/search?q=preparing+for+2026', { icon: 'exam' }),
            link('Unit Award Scheme', '/professional-development/search?trainingType=Unit+Award+Scheme', { icon: 'unit-award' }),
          ]),
          column('Courses by subject', [
            link('English', '/professional-development/search?qualificationLevel=&subject=English', { icon: 'english' }),
            link('Mathematics', '/professional-development/search?qualificationLevel=&subject=Mathematics', { icon: 'maths' }),
            link('Science', '/professional-development/search?qualificationLevel=&subject=Science', { icon: 'science' }),
            link('Languages', '/professional-development/search?qualificationLevel=&subject=Languages', { icon: 'languages' }),
            link('Design and Technology', '/professional-development/search?qualificationLevel=&subject=Design+and+Technology', { icon: 'design-tech' }),
            link('Physical Education', '/professional-development/search?qualificationLevel=&subject=Physical+Education', { icon: 'pe' }),
            link('Geography', '/professional-development/search?qualificationLevel=&subject=Geography', { icon: 'geography' }),
            link('History', '/professional-development/search?qualificationLevel=&subject=History', { icon: 'history' }),
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
            link('NEA, coursework and controlled assessment', '/exams-administration/coursework-controlled-assessment-nea', { icon: 'notebook', keywords: ['coursework'] }),
            link('Deadlines for non-exam assessment', '/exams-administration/coursework-controlled-assessment-nea/submit-marks-and-grades#submission-deadline', { icon: 'deadline' }),
            link('Record forms', '/exams-administration/coursework-controlled-assessment-nea/candidate-record-forms-and-centre-declaration-sheets', { icon: 'form', keywords: ['candidate record form', 'CRF', 'declaration'] }),
            link('Submit marks', '/exams-administration/coursework-controlled-assessment-nea/submit-marks-and-grades', { icon: 'marks' }),
            link('Submitting student samples', '/exams-administration/coursework-controlled-assessment-nea/sending-samples', { icon: 'send', keywords: ['moderation'] }),
          ]),
          column('Exams', [
            link('Entries', '/exams-administration/entries', { icon: 'checklist' }),
            link('Entry fees', '/exams-administration/entries/entry-fees', { icon: 'fees', keywords: ['prices', 'cost'] }),
            link('Exams guidance', '/exams-administration/exams', { icon: 'exam' }),
            link('Question papers and stationery', '/exams-administration/exams/exam-papers-and-stationery', { icon: 'stationery' }),
            link('Access arrangements', '/exams-administration/special-requirements/access-arrangements', { icon: 'access', keywords: ['extra time', 'SEND'] }),
            link('Special consideration', '/exams-administration/special-requirements/special-consideration', { icon: 'care' }),
          ]),
          column('Results', [
            link('Results days', '/exams-administration/results-days', { icon: 'results' }),
            link('Results slips', '/exams-administration/results-days/results-slips', { icon: 'document' }),
            link('Grade boundaries', '/exams-administration/results-days/grade-boundaries', { icon: 'boundaries', badge: 'popular' }),
            link('Results statistics', '/exams-administration/results-days/results-statistics', { icon: 'statistics' }),
            link('Post-results services', '/exams-administration/after-results/post-results', { icon: 'review', keywords: ['remark', 'review of marking', 'appeal'] }),
            link('Exam certificates', '/exams-administration/after-results/exam-certificates', { icon: 'approved' }),
          ]),
        ],
        quickLinks: [textLink('All Exams Admin', '/exams-administration')],
        featured: [
          feature({
            style: 'purple',
            icon: 'calendar',
            eyebrow: 'Dates',
            heading: 'Dates and timetables',
            text: 'Exam timetables and deadlines for every series.',
            cta: textLink('See timetables', '/exams-administration/dates-and-timetables'),
          }),
          feature({
            style: 'teal',
            icon: 'clock',
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
              link('Centre Services', 'https://onlineservices.aqa.org.uk/', { icon: 'buildings', description: 'Entries, results and admin for your centre' }),
              link('Associate Extranet', 'https://onlineservices.aqa.org.uk/', { icon: 'id-card', description: 'For examiners, moderators and associates' }),
              link('Become an associate', '/join-us/senior-associate-vacancies', { icon: 'handshake', description: 'Mark, moderate or write papers with us' }),
            ],
            { style: 'detailed' },
          ),
          column('Products', [
            link('All About Maths', '/all-about-maths', { icon: 'maths' }),
            link('AlphaPlus', 'https://alphaplus.co.uk/', { icon: 'strategy', newTab: true }),
            link('Data Insights', '/data-insights', { icon: 'data' }),
            link('Exampro', 'https://www.exampro.co.uk', { icon: 'exam', newTab: true }),
            link('Project Q', 'https://projectq.co/home', { icon: 'projects', newTab: true }),
            link('Stride Maths', '/stride', { icon: 'growth' }),
            link('Testbase', 'https://www.testbase.co.uk/', { icon: 'books', newTab: true }),
            link('Unit Award Scheme', '/programmes/unit-award-scheme/about', { icon: 'unit-award' }),
          ]),
          column('News and Insights', [
            link('AQI research and insight', '/aqi', { icon: 'insight' }),
            link('News', '/news', { icon: 'news' }),
            link('Inside Exams Podcast', '/inside-exams-podcasts', { icon: 'podcast' }),
            link('Exams officers podcast', '/exams-administration/exams-officer-podcasts', { icon: 'listen' }),
            link('AQA assessment research', '/about-us/our-research', { icon: 'research' }),
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
            link('Curriculum and assessment', '/assessment-reform-hub', { icon: 'structure' }),
            link('Subject summaries', '/slt-insights/curriculum-and-assessment-review-explained', { icon: 'article' }),
            link('Teacher panels - work with us', '/shape-the-future-together', { icon: 'chat' }),
            link('Assessment reform - the essentials', '/assessment-reform-the-essentials', { icon: 'info' }),
          ]),
          column('Leadership', [
            link('MAT leadership', '/multi-academy-trust-support', { icon: 'buildings', keywords: ['multi-academy trust'] }),
            link('Senior leadership', '/slt-insights', { icon: 'strategy', keywords: ['SLT'] }),
          ]),
          column('Teachers', [
            link('Search subjects', '/subjects', { icon: 'research' }),
            link('Past-paper finder', '/past-papers-and-mark-schemes-finder', { icon: 'exam', badge: 'popular' }),
            link('Digital exams', '/digital-exams', { icon: 'laptop', badge: 'new', keywords: ['on-screen'] }),
          ]),
          column('Learners and parents', [
            link('Revision', '/student-and-parent-support/revision', { icon: 'books' }),
            link('Exam day', '/student-and-parent-support/exam-day', { icon: 'calendar' }),
            link('Results day', '/student-and-parent-support/results-day', { icon: 'results' }),
            link('Private candidates', '/student-and-parent-support/private-candidates', { icon: 'student' }),
          ]),
        ],
        quickLinks: [textLink('Have a question? Contact us', '/contact-us')],
      }),
    ],
  }
}
