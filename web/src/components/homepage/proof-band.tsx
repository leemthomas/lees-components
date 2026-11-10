'use client'

import { useEffect, useRef } from 'react'
import { stegaClean } from 'next-sanity'
import { urlFor } from '@/sanity/image'
import { Arrow, HpLink, Ms, type Cta, type HpImage } from './shared'

type Stat = { _key: string; icon?: string | null; value?: number | null; suffix?: string | null; label?: string | null; description?: string | null }
export type ProofBandBlock = {
  heading?: string | null
  stats?: Stat[] | null
  quote?: string | null
  quoteFooter?: string | null
  ctaTitle?: string | null
  ctaText?: string | null
  cta?: Cta
  backgroundImage?: HpImage
}

/** Purple band with counting numbers, a quote and the "Switch to AQA" panel. */
export function ProofBand({ block }: { block: ProofBandBlock }) {
  const list = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const nums = Array.from(list.current?.querySelectorAll<HTMLElement>('[data-count]') ?? [])
    if (!nums.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          io.unobserve(e.target)
          const el = e.target as HTMLElement
          const to = Number(el.dataset.count)
          const suf = el.dataset.suffix ?? ''
          const t0 = performance.now()
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / 1200)
            el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }),
      { threshold: 0.6 },
    )
    nums.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [block.stats])

  const bg = block.backgroundImage && (block.backgroundImage as { asset?: unknown }).asset ? urlFor(block.backgroundImage).width(1600).height(900).fit('crop').url() : null

  return (
    <div
      className="hp-section hp-proof"
      style={bg ? ({ '--hp-proof-img': `url("${bg}")` } as React.CSSProperties) : undefined}
      data-photo={bg ? '' : undefined}
    >
      <div className="wrapper">
        <h2 className="sr-only">{block.heading || 'AQA in numbers'}</h2>
        <ul className="hp-stats" role="list" ref={list}>
          {(block.stats ?? []).map((s) => {
            const suffix = stegaClean(s.suffix ?? '')
            return (
              <li key={s._key}>
                <span className="hp-stats__icon">
                  <Ms name={s.icon} />
                </span>
                <p className="hp-stats__n" data-count={s.value ?? 0} data-suffix={suffix} aria-label={`${s.value ?? ''}${suffix}`}>
                  {s.value}
                  {suffix}
                </p>
                <p className="hp-stats__l">{s.label}</p>
                {s.description && <p className="hp-stats__d">{s.description}</p>}
              </li>
            )
          })}
        </ul>
        {(block.quote || block.ctaTitle) && (
          <div className="hp-proof__row">
            {block.quote && (
              <blockquote className="hp-proof__quote">
                <p>{block.quote}</p>
                {block.quoteFooter && <footer>{block.quoteFooter}</footer>}
              </blockquote>
            )}
            {block.ctaTitle && (
              <div className="hp-proof__cta">
                <p className="hp-proof__cta-title">{block.ctaTitle}</p>
                {block.ctaText && <p>{block.ctaText}</p>}
                {block.cta?.label && (
                  <HpLink className="hp-btn hp-btn--primary" link={block.cta.link}>
                    {block.cta.label} <Arrow />
                  </HpLink>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
