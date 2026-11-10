'use client'

import type { LinkValue } from '@/lib/links'
import { Arrow, clean, HpImg, HpLink, Ms, type HpImage, type KeyDate } from './shared'
import { diffDays, fmt, useToday } from './dates'

type Button = { _key: string; label?: string | null; style?: string | null; link?: LinkValue }
type Step = { _key: string; icon?: string | null; title?: string | null; text?: string | null; ctaLabel?: string | null; image?: HpImage; link?: LinkValue }
export type StudentsPanelBlock = {
  eyebrow?: string | null
  eyebrowIcon?: string | null
  heading?: string | null
  intro?: string | null
  seasonal?: boolean | null
  image?: HpImage
  buttons?: Button[] | null
  steps?: Step[] | null
  callout?: { tag?: string | null; tagIcon?: string | null; title?: string | null; text?: string | null; ctaLabel?: string | null; image?: HpImage; link?: LinkValue } | null
  keyDates?: KeyDate[] | null
}

export function StudentsPanel({ block }: { block: StudentsPanelBlock }) {
  const today = useToday()

  // While a series is on (an exam in the next 10 days), speak to students sitting it
  let heading: React.ReactNode = block.heading
  let intro: React.ReactNode = block.intro
  if (block.seasonal !== false && today) {
    const live = (block.keyDates ?? []).filter((d) => clean(d.category) === 'exam' && d.forStudents !== false && diffDays(d.date, today) >= 0 && diffDays(d.date, today) <= 10)
    const last = live[live.length - 1]
    if (last) {
      const series = clean(last.series).replace(/ series$/, '')
      if (series) {
        heading = `Sitting a ${series.split(' ')[0]} exam?`
        intro = `The ${series} exams run until ${fmt(last.date, { weekday: 'long', day: 'numeric', month: 'long' })}. Check what to bring on the day, and how to make the most of your revision.`
      }
    }
  }

  return (
    <div className="hp-section hp-students hp-lilac">
      <div className="wrapper">
        <div className="hp-stu__intro">
          <div className="hp-stu__lead">
            <HpImg image={block.image} w={900} h={560} />
          </div>
          <div className="hp-stu__copy">
            {block.eyebrow && (
              <p className="hp-eyebrow">
                <Ms name={block.eyebrowIcon} /> {block.eyebrow}
              </p>
            )}
            <h2 className="hp-title">{heading}</h2>
            {intro && <p className="hp-lede">{intro}</p>}
            {!!block.buttons?.length && (
              <div className="hp-actions">
                {block.buttons.map((b) => (
                  <HpLink key={b._key} className={`hp-btn ${clean(b.style) === 'secondary' ? 'hp-btn--outline' : 'hp-btn--primary'}`} link={b.link}>
                    {b.label} {clean(b.style) !== 'secondary' && <Arrow />}
                  </HpLink>
                ))}
              </div>
            )}
          </div>
        </div>
        {!!block.steps?.length && (
          <ol className="hp-steps" role="list">
            {block.steps.map((s, i) => (
              <li key={s._key}>
                <HpLink className="hp-step" link={s.link}>
                  <span className="hp-step__media">
                    <HpImg image={s.image} w={600} h={338} />
                    <span className="hp-step__n">{i + 1}</span>
                  </span>
                  <span className="hp-step__body">
                    <span className="hp-step__t">
                      <Ms name={s.icon} />
                      {s.title}
                    </span>
                    {s.text && <span className="hp-step__d">{s.text}</span>}
                    {s.ctaLabel && (
                      <span className="hp-cta">
                        {s.ctaLabel} <Arrow />
                      </span>
                    )}
                  </span>
                </HpLink>
              </li>
            ))}
          </ol>
        )}
        {block.callout?.title && (
          <HpLink className="hp-vcall" link={block.callout.link}>
            <span className="hp-vcall__media">
              <HpImg image={block.callout.image} w={640} h={360} />
            </span>
            <span className="hp-vcall__body">
              {block.callout.tag && (
                <span className="hp-vcall__tag">
                  <Ms name={block.callout.tagIcon} />
                  {block.callout.tag}
                </span>
              )}
              <span className="hp-vcall__t">{block.callout.title}</span>
              {block.callout.text && <span className="hp-vcall__d">{block.callout.text}</span>}
              {block.callout.ctaLabel && (
                <span className="hp-cta">
                  {block.callout.ctaLabel} <Arrow />
                </span>
              )}
            </span>
          </HpLink>
        )}
      </div>
    </div>
  )
}
