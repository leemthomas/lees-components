'use client'

import { useEffect, useRef, useState } from 'react'
import type { LinkValue } from '@/lib/links'
import { searchSharedIndex } from '../mega-menu/search-index'
import { clean, href, Ms, type Cta, type KeyDate } from './shared'
import { diffDays, fmt, norm, useToday } from './dates'

type Answer = { _key: string; keywords?: string[] | null; text?: string | null; links?: Array<{ _key: string; label?: string | null; link?: LinkValue }> | null }
export type HelpChatBlock = {
  title?: string | null
  subtitle?: string | null
  greeting?: string | null
  suggestions?: string[] | null
  answers?: Answer[] | null
  contactLink?: Cta
  showBackToTop?: boolean | null
  keyDates?: KeyDate[] | null
}
type Msg = { id: number; me?: boolean; typing?: boolean; text?: string; links?: Array<{ label: string; href: string }> }

/** Help assistant in the corner, matching the MyAQA dashboard. A demo: answers are set in the Studio. */
export function HelpChat({ block }: { block: HelpChatBlock }) {
  const today = useToday()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [value, setValue] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const list = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const nextId = useRef(1)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 900)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight })
  }, [msgs])

  const push = (m: Omit<Msg, 'id'>) => {
    const id = nextId.current++
    setMsgs((x) => [...x, { ...m, id }])
    return id
  }

  function reply(q: string): Omit<Msg, 'id'> {
    const n = norm(q)
    const hit = (block.answers ?? []).find((a) => (a.keywords ?? []).some((k) => n.includes(norm(clean(k)))))
    if (hit) {
      let text = clean(hit.text)
      // "{next exam}" in an answer is replaced with the next exam from Key dates
      if (text.includes('{next exam}')) {
        const exam = today ? (block.keyDates ?? []).find((d) => clean(d.category) === 'exam' && diffDays(d.date, today) >= 0) : undefined
        text = text.replace('{next exam}', exam ? `${clean(exam.title)} on ${fmt(exam.date, { weekday: 'long', day: 'numeric', month: 'long' })}` : 'not until the next series')
      }
      return { text, links: (hit.links ?? []).map((l) => ({ label: clean(l.label), href: href(l.link) })) }
    }
    const found = searchSharedIndex(q, 3)
    if (found.length) return { text: `Here is what I found on aqa.org.uk for “${q}”.`, links: found.map((r) => ({ label: [r.label, r.tag].filter(Boolean).join(' ') + (r.trail ? ` (${r.trail})` : ''), href: r.href })) }
    const links = [{ label: `Search aqa.org.uk for “${q}”`, href: `https://www.aqa.org.uk/search?q=${encodeURIComponent(q)}` }]
    if (block.contactLink?.label) links.push({ label: clean(block.contactLink.label), href: href(block.contactLink.link) })
    return { text: 'I could not find an answer to that. You can search the whole site, or ask to talk to a person.', links }
  }

  function ask(q: string) {
    q = q.trim()
    if (!q) return
    push({ me: true, text: q })
    const typing = push({ typing: true })
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(() => {
      setMsgs((x) => x.filter((m) => m.id !== typing))
      push(reply(q))
    }, reduced ? 0 : 700)
  }

  function show() {
    setOpen(true)
    if (!msgs.length && block.greeting) push({ text: clean(block.greeting) })
    setTimeout(() => input.current?.focus(), 0)
  }
  function hide(focus = true) {
    setOpen(false)
    if (focus) launcher.current?.focus()
  }

  return (
    <aside className="hp-help" aria-label={clean(block.title) || 'Help'}>
      <div
        className="hp-chat"
        role="dialog"
        aria-modal="false"
        aria-label={clean(block.title) || 'Help'}
        hidden={!open}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            hide()
          }
        }}
      >
        <div className="hp-chat__head">
          <Ms name="support_agent" />
          <div className="hp-chat__headtext">
            <p className="hp-chat__title">{block.title}</p>
            {block.subtitle && (
              <p className="hp-chat__sub">
                <span className="hp-chat__dot" aria-hidden="true" />
                {block.subtitle}
              </p>
            )}
          </div>
          <button type="button" className="hp-chat__close" aria-label="Close help" onClick={() => hide()}>
            <Ms name="close" />
          </button>
        </div>
        <div className="hp-chat__list" ref={list} aria-live="polite">
          {msgs.map((m) =>
            m.typing ? (
              <div key={m.id} className="hp-chat__msg">
                <span className="hp-chat__typing" aria-label="Typing">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            ) : (
              <div key={m.id} className={`hp-chat__msg${m.me ? ' hp-chat__msg--me' : ''}`}>
                {!m.me && <span className="hp-chat__who">{block.title}</span>}
                <div className="hp-chat__bubble">{m.text}</div>
                {!!m.links?.length && (
                  <div className="hp-chat__links">
                    {m.links.map((l) => (
                      <a key={l.href + l.label} href={l.href} onClick={() => l.href.startsWith('#') && hide(false)}>
                        {l.label} <span aria-hidden="true">›</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
        {!!block.suggestions?.length && (
          <div className="hp-chat__suggest">
            {block.suggestions.map((s) => (
              <button key={s} type="button" onClick={() => ask(clean(s))}>
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          className="hp-chat__form"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault()
            ask(value)
            setValue('')
          }}
        >
          <label htmlFor="hp-chat-input" className="sr-only">
            Ask a question
          </label>
          <input ref={input} id="hp-chat-input" placeholder="Ask a question" value={value} onChange={(e) => setValue(e.target.value)} />
          <button type="submit" aria-label="Send">
            <Ms name="send" />
          </button>
        </form>
      </div>
      <button
        ref={launcher}
        type="button"
        className="hp-chat__launcher"
        aria-label="Help"
        aria-expanded={open}
        onClick={() => (open ? hide() : show())}
      >
        <Ms name="forum" />
        <span>Help</span>
      </button>
      {block.showBackToTop !== false && (
        <a href="#main" className="hp-top" aria-label="Back to top" data-show={scrolled ? '' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 19V5m-6 6 6-6 6 6" />
          </svg>
        </a>
      )}
    </aside>
  )
}
