'use client'

import { stegaClean } from 'next-sanity'
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { ArrowRightIcon, ArrowUpRightIcon, FileTextIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { resolveHref } from '@/lib/links'
import { MenuAnchor } from './menu-anchor'
import { MENU_ICONS } from '@/lib/menu-icons'
import { buildIndex, highlight, searchIndex } from './search-index'
import type { Navigation } from './types'

type PageHit = { id: string; title: string; href: string; description?: string | null }
type Option = { key: string; label: string; href: string; newTab: boolean; kind: 'menu' | 'page' | 'all'; icon?: string; tag?: string; meta?: string }

export function MenuSearch({
  nav,
  query,
  setQuery,
  inputRef,
  onNavigate,
  variant = 'panel',
}: {
  nav: Navigation
  query: string
  setQuery: (q: string) => void
  inputRef?: RefObject<HTMLInputElement | null>
  onNavigate: () => void
  variant?: 'panel' | 'drawer'
}) {
  const settings = nav.search
  const id = useId()
  const listId = `${id}-results`
  const index = useMemo(() => buildIndex(nav), [nav])
  const [pages, setPages] = useState<PageHit[]>([])
  const [active, setActive] = useState(-1)
  const listRef = useRef<HTMLDivElement>(null)

  const q = query.trim()
  const menuHits = useMemo(() => searchIndex(index, q, variant === 'drawer' ? 6 : 8), [index, q, variant])

  // Pages on this site, from Sanity. Debounced and cancelled as you type.
  useEffect(() => {
    if (!settings?.includePages || q.length < 2) {
      setPages([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        if (res.ok) setPages((await res.json()).results ?? [])
      } catch {
        /* aborted or offline: menu results still show */
      }
    }, 180)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q, settings?.includePages])

  const resultsUrl = stegaClean(settings?.resultsUrl) || 'https://www.aqa.org.uk/search?q='
  const fullSearchHref = `${resultsUrl}${encodeURIComponent(q)}`

  const options: Option[] = useMemo(() => {
    if (!q) return []
    const menuHrefs = new Set(menuHits.map((h) => h.href))
    return [
      ...menuHits.map((h) => ({ key: `m-${h.id}`, label: h.label, href: h.href, newTab: h.newTab, kind: 'menu' as const, icon: h.icon, tag: h.tag, meta: h.trail })),
      ...pages
        .filter((p) => !menuHrefs.has(p.href))
        .map((p) => ({ key: `p-${p.id}`, label: p.title, href: p.href, newTab: false, kind: 'page' as const, meta: p.description ?? 'Page on this site' })),
      { key: 'all', label: `Search aqa.org.uk for “${q}”`, href: fullSearchHref, newTab: false, kind: 'all' as const },
    ]
  }, [q, menuHits, pages, fullSearchHref])

  useEffect(() => setActive(-1), [q])
  useEffect(() => {
    if (active < 0) return
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (i: number) => {
    const el = listRef.current?.querySelector<HTMLAnchorElement>(`[data-index="${i}"]`)
    if (el) el.click()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (options.length ? (a + 1) % options.length : -1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (options.length ? (a <= 0 ? options.length - 1 : a - 1) : -1))
    } else if (e.key === 'Enter' && q) {
      e.preventDefault()
      go(active >= 0 ? active : options.length - 1)
    } else if (e.key === 'Escape' && q) {
      // First Escape clears the box; the menu handles the next one
      e.stopPropagation()
      setQuery('')
    }
  }

  const menuOpts = options.filter((o) => o.kind === 'menu')
  const pageOpts = options.filter((o) => o.kind === 'page')
  const allOpt = options.find((o) => o.kind === 'all')
  const indexOf = (o: Option) => options.indexOf(o)

  const renderOption = (o: Option) => {
    const i = indexOf(o)
    const def = o.icon ? MENU_ICONS[o.icon] : undefined
    const Icon = o.kind === 'page' ? FileTextIcon : o.kind === 'all' ? MagnifyingGlassIcon : def?.icon
    const external = o.newTab || o.kind === 'all'
    return (
      <MenuAnchor
        key={o.key}
        href={o.href}
        newTab={o.newTab}
        id={`${id}-opt-${i}`}
        role="option"
        aria-selected={active === i}
        data-index={i}
        data-active={active === i || undefined}
        className={`mm-result mm-result--${o.kind}`}
        onMouseMove={() => setActive(i)}
        onClick={onNavigate}
      >
        <span className="mm-tile mm-tile--sm" aria-hidden="true">{Icon ? <Icon weight="fill" /> : <ArrowRightIcon weight="bold" />}</span>
        <span className="mm-result__text">
          <span className="mm-result__label">
            <span>{o.kind === 'all' ? o.label : highlight(o.label, q).map((p, k) => (p.hit ? <mark key={k}>{p.text}</mark> : <span key={k}>{p.text}</span>))}</span>
            {o.tag && <span className="mm-tag">{o.tag}</span>}
          </span>
          {o.meta && <span className="mm-result__meta">{o.meta}</span>}
        </span>
        {external ? <ArrowUpRightIcon className="mm-result__go" weight="bold" aria-hidden="true" /> : <ArrowRightIcon className="mm-result__go" weight="bold" aria-hidden="true" />}
      </MenuAnchor>
    )
  }

  const popular = (settings?.popular ?? []).filter(Boolean)
  const suggested = settings?.suggested ?? []

  return (
    <div className={`mm-search mm-search--${variant}`}>
      <form
        role="search"
        className="mm-search__form"
        action={resultsUrl.split('?')[0]}
        onSubmit={(e) => {
          e.preventDefault()
          if (q) go(active >= 0 ? active : options.length - 1)
        }}
      >
        <MagnifyingGlassIcon className="mm-search__icon" weight="bold" aria-hidden="true" />
        <label htmlFor={`${id}-input`} className="sr-only">Search AQA</label>
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="search"
          name="q"
          className="mm-search__input"
          placeholder={settings?.placeholder ?? 'Search'}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={!!q}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button type="button" className="mm-search__clear" onClick={() => { setQuery(''); inputRef?.current?.focus() }} aria-label="Clear search">
            <XIcon weight="bold" />
          </button>
        )}
        {variant === 'panel' && <kbd className="mm-search__kbd" aria-hidden="true">Esc</kbd>}
      </form>

      <div className="mm-search__body">
        {q ? (
          <div id={listId} role="listbox" aria-label="Search results" ref={listRef} className="mm-search__results">
            {menuOpts.length > 0 && (
              <div role="group" aria-labelledby={`${id}-g1`} className="mm-search__group">
                <p id={`${id}-g1`} className="mm-search__group-title">In the menu</p>
                {menuOpts.map(renderOption)}
              </div>
            )}
            {pageOpts.length > 0 && (
              <div role="group" aria-labelledby={`${id}-g2`} className="mm-search__group">
                <p id={`${id}-g2`} className="mm-search__group-title">Pages</p>
                {pageOpts.map(renderOption)}
              </div>
            )}
            {menuOpts.length + pageOpts.length === 0 && <p className="mm-search__empty">Nothing in the menu matches “{q}”.</p>}
            {allOpt && <div className="mm-search__group mm-search__group--all">{renderOption(allOpt)}</div>}
          </div>
        ) : (
          <div className="mm-search__start">
            {popular.length > 0 && (
              <div>
                <p className="mm-search__group-title">Popular searches</p>
                <ul role="list" className="mm-chips">
                  {popular.map((p, i) => (
                    <li key={i}>
                      <button type="button" className="mm-chip" onClick={() => { setQuery(stegaClean(p)); inputRef?.current?.focus() }}>
                        <MagnifyingGlassIcon weight="bold" aria-hidden="true" />
                        {p}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {suggested.length > 0 && (
              <div>
                <p className="mm-search__group-title">Quick links</p>
                <ul role="list" className="mm-search__quick">
                  {suggested.map((s) => {
                    const href = resolveHref(s.link)
                    if (!href) return null
                    return (
                      <li key={s._key}>
                        <MenuAnchor href={href} newTab={s.link?.openInNewTab} onClick={onNavigate}>
                          {s.label}
                          <ArrowRightIcon weight="bold" aria-hidden="true" />
                        </MenuAnchor>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {q ? `${menuOpts.length + pageOpts.length} results` : ''}
      </p>
    </div>
  )
}
