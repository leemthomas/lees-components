import type { LinkValue } from '@/lib/links'
import { Arrow, clean, Head, HpImg, HpLink, Ms, type Cta, type HpImage } from './shared'

// Homepage blocks with no interactivity: rendered on the server.

type Labelled = { _key: string; label?: string | null; link?: LinkValue }
type Button = { _key: string; label?: string | null; style?: string | null; link?: LinkValue }

/* ---------- Training and events ---------- */
export type TrainingPanelBlock = {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
  button?: Cta
  cards?: Array<{ _key: string; icon?: string | null; kicker?: string | null; title?: string | null; text?: string | null; ctaLabel?: string | null; highlight?: boolean | null; link?: LinkValue }> | null
  feature?: { tag?: string | null; title?: string | null; text?: string | null; ctaLabel?: string | null; image?: HpImage; link?: LinkValue } | null
}

export function TrainingPanel({ block }: { block: TrainingPanelBlock }) {
  const f = block.feature
  return (
    <div className="hp-section hp-training">
      <div className="wrapper">
        <Head
          eyebrow={block.eyebrow}
          heading={block.heading}
          intro={block.intro}
          id="train-title"
          actions={
            block.button?.label ? (
              <HpLink className="hp-btn hp-btn--outline" link={block.button.link}>
                {block.button.label} <Arrow />
              </HpLink>
            ) : undefined
          }
        />
        <div className="hp-train">
          <ul className="hp-train__grid" role="list">
            {(block.cards ?? []).map((c) => (
              <li key={c._key}>
                <HpLink className={`hp-train__card${c.highlight ? ' hp-train__card--v' : ''}`} link={c.link}>
                  <span className="hp-train__icon">
                    <Ms name={c.icon} />
                  </span>
                  {c.kicker && <span className="hp-train__k">{c.kicker}</span>}
                  <span className="hp-train__t">{c.title}</span>
                  {c.text && <span className="hp-train__d">{c.text}</span>}
                  {c.ctaLabel && (
                    <span className="hp-cta">
                      {c.ctaLabel} <Arrow />
                    </span>
                  )}
                </HpLink>
              </li>
            ))}
          </ul>
          {f?.title && (
            <HpLink className="hp-mag" link={f.link}>
              <HpImg image={f.image} w={720} h={404} />
              <span className="hp-mag__body">
                {f.tag && <span className="hp-tag hp-tag--red">{f.tag}</span>}
                <span className="hp-mag__t">{f.title}</span>
                {f.text && <span className="hp-mag__d">{f.text}</span>}
                {f.ctaLabel && (
                  <span className="hp-cta">
                    {f.ctaLabel} <span aria-hidden="true">{f.link?.openInNewTab ? '↗' : '→'}</span>
                  </span>
                )}
              </span>
            </HpLink>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Family of services ---------- */
export type FamilyServicesBlock = {
  eyebrow?: string | null
  heading?: string | null
  services?: Array<{ _key: string; icon?: string | null; title?: string | null; text?: string | null; link?: LinkValue }> | null
}

export function FamilyServices({ block }: { block: FamilyServicesBlock }) {
  return (
    <div className="hp-section hp-family">
      <div className="wrapper">
        <Head eyebrow={block.eyebrow} heading={block.heading} id="fam-title" />
        <ul className="hp-fam" role="list">
          {(block.services ?? []).map((s) => (
            <li key={s._key}>
              <HpLink className="hp-fam__card" link={s.link}>
                <span className="hp-fam__mono">
                  <Ms name={s.icon} />
                </span>
                <span className="hp-fam__t">
                  {s.title}
                  {s.link?.openInNewTab && <span aria-hidden="true"> ↗</span>}
                </span>
                {s.text && <span className="hp-fam__d">{s.text}</span>}
              </HpLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------- Become an examiner ---------- */
export type ExaminerPromoBlock = { eyebrow?: string | null; heading?: string | null; intro?: string | null; points?: string[] | null; image?: HpImage; buttons?: Button[] | null }

export function ExaminerPromo({ block }: { block: ExaminerPromoBlock }) {
  return (
    <div className="hp-section hp-examiner">
      <div className="hp-examiner__inner">
        <div className="hp-examiner__media">
          <HpImg image={block.image} w={800} h={450} />
        </div>
        <div className="hp-examiner__body">
          {block.eyebrow && <p className="hp-eyebrow hp-eyebrow--light">{block.eyebrow}</p>}
          <h2 className="hp-title hp-title--light">{block.heading}</h2>
          {block.intro && <p className="hp-lede hp-lede--light">{block.intro}</p>}
          {!!block.points?.length && (
            <ul className="hp-ticks" role="list" data-icons="">
              {block.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          {!!block.buttons?.length && (
            <div className="hp-actions">
              {block.buttons.map((b) => (
                <HpLink key={b._key} className={`hp-btn ${clean(b.style) === 'secondary' ? 'hp-btn--ghost' : 'hp-btn--primary'}`} link={b.link}>
                  {b.label} {clean(b.style) !== 'secondary' && <Arrow />}
                </HpLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- News and research ---------- */
type Article = { _id: string; title?: string | null; date?: string | null; summary?: string | null; image?: HpImage; link?: LinkValue }
export type NewsResearchBlock = {
  eyebrow?: string | null
  heading?: string | null
  researchLink?: Cta
  allNewsLink?: Cta
  allResearchLink?: Cta
  newsCount?: number | null
  researchHeading?: string | null
  researchCount?: number | null
  news?: Article[] | null
  research?: Article[] | null
}

const longDate = (iso?: string | null) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' }) : ''

export function NewsResearch({ block }: { block: NewsResearchBlock }) {
  const news = (block.news ?? []).slice(0, block.newsCount ?? 5)
  const research = (block.research ?? []).slice(0, block.researchCount ?? 2)
  const [lead, ...rest] = news
  return (
    <div className="hp-section hp-news">
      <div className="wrapper">
        <Head
          eyebrow={block.eyebrow}
          heading={block.heading}
          id="news-title"
          actions={
            <>
              {block.researchLink?.label && (
                <HpLink className="hp-link" link={block.researchLink.link}>
                  {block.researchLink.label}
                </HpLink>
              )}
              {block.allNewsLink?.label && (
                <HpLink className="hp-btn hp-btn--outline" link={block.allNewsLink.link}>
                  {block.allNewsLink.label} <Arrow />
                </HpLink>
              )}
            </>
          }
        />
        <div className="hp-news__grid">
          {lead && (
            <article className="hp-news__lead">
              <HpImg image={lead.image} w={960} h={600} />
              <div className="hp-news__meta">
                <span className="hp-tag hp-tag--red">News</span>
                <time dateTime={lead.date ?? undefined}>{longDate(lead.date)}</time>
              </div>
              <h3>
                <HpLink className="hp-stretch" link={lead.link}>
                  {lead.title}
                </HpLink>
              </h3>
              {lead.summary && <p>{lead.summary}</p>}
            </article>
          )}
          <ul className="hp-news__list" role="list">
            {rest.map((n) => (
              <li key={n._id}>
                <article className="hp-news__item">
                  <HpImg image={n.image} w={224} h={168} />
                  <div>
                    <div className="hp-news__meta">
                      <span className="hp-tag">News</span>
                      <time dateTime={n.date ?? undefined}>{longDate(n.date)}</time>
                    </div>
                    <h3>
                      <HpLink className="hp-stretch" link={n.link}>
                        {n.title}
                      </HpLink>
                    </h3>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {!!research.length && (
            <section className="hp-research" aria-label={clean(block.researchHeading) || 'Research'}>
              {block.researchHeading && <h3 className="hp-research__h">{block.researchHeading}</h3>}
              {research.map((r) => (
                <article key={r._id} className="hp-research__item">
                  <div className="hp-news__meta">
                    <span className="hp-tag">Research</span>
                    <time dateTime={r.date ?? undefined}>{longDate(r.date)}</time>
                  </div>
                  <h3>
                    <HpLink className="hp-stretch" link={r.link}>
                      {r.title}
                    </HpLink>
                  </h3>
                  {r.summary && <p>{r.summary}</p>}
                </article>
              ))}
              {block.allResearchLink?.label && (
                <HpLink className="hp-link" link={block.allResearchLink.link}>
                  {block.allResearchLink.label}
                </HpLink>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- AQA footer ---------- */
export type AqaFooterBlock = {
  columns?: Array<{ _key: string; heading?: string | null; links?: Labelled[] | null }> | null
  legalLinks?: Labelled[] | null
  linkedin?: string | null
  youtube?: string | null
  copyright?: string | null
  notice?: string | null
}

export function AqaFooter({ block }: { block: AqaFooterBlock }) {
  return (
    <div className="hp-footer">
      <div className="wrapper">
        <div className="hp-footer__top">
          <a href="#main" className="hp-footer__logo" aria-label="Back to the top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aqa-logo.svg" alt="" width={110} height={64} />
          </a>
          <nav className="hp-footer__cols" aria-label="Footer">
            {(block.columns ?? []).map((c) => (
              <div key={c._key}>
                <h2>{c.heading}</h2>
                <ul role="list">
                  {(c.links ?? []).map((l) => (
                    <li key={l._key}>
                      <HpLink link={l.link}>{l.label}</HpLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="hp-footer__mid">
          <ul className="hp-footer__legal" role="list">
            {(block.legalLinks ?? []).map((l) => (
              <li key={l._key}>
                <HpLink link={l.link}>{l.label}</HpLink>
              </li>
            ))}
          </ul>
          <ul className="hp-footer__social" role="list">
            {block.linkedin && (
              <li>
                <a href={clean(block.linkedin)} aria-label="AQA on LinkedIn">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" stroke="none" d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3.25a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92zM20.44 13.4c0-3.1-1.66-4.54-3.87-4.54-1.78 0-2.58.98-3.03 1.67V8.5h-3.38c.05.95 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.69.13-.93.27-.69.89-1.4 1.94-1.4 1.37 0 1.92 1.05 1.92 2.58V20h3.38v-6.6z" />
                  </svg>
                </a>
              </li>
            )}
            {block.youtube && (
              <li>
                <a href={clean(block.youtube)} aria-label="AQA on YouTube">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" stroke="none" d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.3 5 12 5 12 5s-6.3 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.7 19 12 19 12 19s6.3 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
                  </svg>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      {(block.copyright || block.notice) && (
        <div className="hp-footer__base">
          <div className="wrapper">
            {block.copyright && <p>{block.copyright}</p>}
            {block.notice && <p>{block.notice}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
