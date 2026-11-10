'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { LinkValue } from '@/lib/links'
import { Arrow, clean, Head, HpImg, HpLink, Ms, type HpImage } from './shared'

type Slide = { _key: string; icon?: string | null; tag?: string | null; tagStyle?: string | null; title?: string | null; text?: string | null; ctaLabel?: string | null; image?: HpImage; link?: LinkValue }
export type SpotlightCarouselBlock = { eyebrow?: string | null; heading?: string | null; slides?: Slide[] | null }

/** Scroll-snap carousel: three cards on desktop, two on tablet, one and a bit on mobile. */
export function SpotlightCarousel({ block }: { block: SpotlightCarouselBlock }) {
  const slides = block.slides ?? []
  const track = useRef<HTMLDivElement>(null)
  const [state, setState] = useState({ current: 0, perView: 3, pages: 1 })

  const measure = useCallback(() => {
    const t = track.current
    const els = t ? Array.from(t.children) as HTMLElement[] : []
    if (!t || els.length < 2) return
    const step = els[1].offsetLeft - els[0].offsetLeft
    const perView = Math.max(1, Math.round(t.clientWidth / els[0].getBoundingClientRect().width))
    const pages = Math.max(1, els.length - perView + 1)
    const current = Math.min(pages - 1, Math.round(t.scrollLeft / step))
    setState({ current, perView, pages })
  }, [])

  useEffect(() => {
    measure()
    const t = track.current
    let timer: ReturnType<typeof setTimeout>
    const onScroll = () => {
      clearTimeout(timer)
      timer = setTimeout(measure, 80)
    }
    t?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      t?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [measure, slides.length])

  const go = (i: number) => {
    const t = track.current
    const els = t ? Array.from(t.children) as HTMLElement[] : []
    if (!t || !els.length) return
    const to = Math.max(0, Math.min(state.pages - 1, i))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    t.scrollTo({ left: els[to].offsetLeft - els[0].offsetLeft, behavior: reduced ? 'auto' : 'smooth' })
  }

  const { current, perView, pages } = state
  return (
    <div className="hp-section hp-spotlight">
      <div className="wrapper">
        <Head
          eyebrow={block.eyebrow}
          heading={block.heading}
          id="spot-title"
          actions={
            <div className="hp-car__nav">
              <button type="button" className="hp-car__btn" aria-label="Previous items" disabled={current <= 0} onClick={() => go(current - perView)}>
                <Ms name="arrow_back" />
              </button>
              <button type="button" className="hp-car__btn" aria-label="Next items" disabled={current >= pages - 1} onClick={() => go(current + perView)}>
                <Ms name="arrow_forward" />
              </button>
            </div>
          }
        />
        <div className="hp-car" aria-roledescription="carousel" aria-label={clean(block.heading)}>
          <div
            className="hp-car__track"
            ref={track}
            tabIndex={0}
            aria-label="Spotlight items, scroll or use the arrow keys"
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return
              if (e.key === 'ArrowRight') {
                e.preventDefault()
                go(current + 1)
              }
              if (e.key === 'ArrowLeft') {
                e.preventDefault()
                go(current - 1)
              }
            }}
          >
            {slides.map((s, k) => {
              const visible = k >= current && k < current + perView
              return (
                <div
                  key={s._key}
                  className="hp-car__slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${k + 1} of ${slides.length}: ${clean(s.title)}`}
                  aria-hidden={!visible}
                  inert={!visible}
                >
                  <article className="hp-car__card">
                    <div className="hp-car__media">
                      <HpImg image={s.image} w={800} h={450} />
                      {s.icon && (
                        <span className="hp-car__icon">
                          <Ms name={s.icon} />
                        </span>
                      )}
                    </div>
                    <div className="hp-car__body">
                      {s.tag && <span className={`hp-tag${clean(s.tagStyle) === 'red' ? ' hp-tag--red' : ''}`}>{s.tag}</span>}
                      <h3>
                        <HpLink className="hp-stretch" link={s.link}>
                          {s.title}
                        </HpLink>
                      </h3>
                      {s.text && <p>{s.text}</p>}
                      {s.ctaLabel && (
                        <span className="hp-cta">
                          {s.ctaLabel} <Arrow />
                        </span>
                      )}
                    </div>
                  </article>
                </div>
              )
            })}
          </div>
          {pages > 1 && (
            <div className="hp-car__dots" role="group" aria-label="Choose slide">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className="hp-car__dot"
                  aria-label={`Show item ${i + 1}${pages < slides.length ? ` to ${i + perView}` : ''}`}
                  aria-current={i === current}
                  onClick={() => go(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
