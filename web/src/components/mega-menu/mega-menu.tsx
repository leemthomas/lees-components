'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { stegaClean } from 'next-sanity'
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import {
  ArrowRightIcon,
  CaretDownIcon,
  FunnelSimpleIcon,
  ListIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  XIcon,
} from '@phosphor-icons/react'
import { resolveHref } from '@/lib/links'
import { MENU_ICONS } from '@/lib/menu-icons'
import { urlFor } from '@/sanity/image'
import { MenuAnchor } from './menu-anchor'
import { MenuSearch } from './menu-search'
import { highlight, normalise } from './search-index'
import type { Menu, MenuColumn, MenuFeature, MenuLink, Navigation, SandboxLink } from './types'
import './mega-menu.css'

const OPEN_DELAY = 140 // hover this long before a panel opens
const SWITCH_DELAY = 70 // moving between items while a panel is open
const CLOSE_DELAY = 300 // grace period when the pointer leaves the menu
const SEARCH = 'search'

/* ------------------------------------------------------------------ */

export function MegaMenu({ nav, sandboxLinks = [] }: { nav: Navigation; sandboxLinks?: SandboxLink[] }) {
  const uid = useId()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const triggerRefs = useRef(new Map<string, HTMLElement>())
  const searchInputRef = useRef<HTMLInputElement>(null)
  const drawerSearchRef = useRef<HTMLInputElement>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const openedAt = useRef(0)

  const [active, setActive] = useState<string | null>(null)
  const [instant, setInstant] = useState(false)
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [top, setTop] = useState(160)

  const menus = nav.menus ?? []
  const searchOn = nav.search?.enabled !== false

  const clearTimers = () => {
    clearTimeout(openTimer.current)
    clearTimeout(closeTimer.current)
  }

  const measure = useCallback(() => {
    const bar = headerRef.current?.querySelector('.mm-bar')
    if (bar) setTop(Math.max(0, bar.getBoundingClientRect().bottom))
  }, [])

  const open = useCallback(
    (key: string) => {
      clearTimers()
      measure()
      setActive((prev) => {
        setInstant(prev !== null && prev !== key)
        if (prev !== key) setFilter('')
        return key
      })
      openedAt.current = Date.now()
    },
    [measure],
  )

  const close = useCallback((returnFocus = false) => {
    clearTimers()
    setActive((prev) => {
      if (returnFocus && prev) triggerRefs.current.get(prev)?.focus()
      return null
    })
    setFilter('')
  }, [])

  // Close everything when the page changes
  useEffect(() => {
    close()
    setDrawer(false)
    setQuery('')
  }, [pathname, close])

  // Esc closes; "/" or Ctrl/Cmd+K opens search from anywhere on the page
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))
      if (e.key === 'Escape') {
        if (active) close(true)
        else if (drawer) setDrawer(false)
      } else if (searchOn && ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)))) {
        e.preventDefault()
        if (window.matchMedia('(min-width: 1024px)').matches) open(SEARCH)
        else setDrawer(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, drawer, close, open, searchOn])

  // Click outside closes
  useEffect(() => {
    if (!active) return
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [active, close])

  // Focus the search box when search opens
  useEffect(() => {
    if (active === SEARCH) requestAnimationFrame(() => searchInputRef.current?.focus())
  }, [active])

  // Mobile drawer: lock page scroll, close desktop panels, reset when the screen gets wide
  useEffect(() => {
    if (!drawer) return
    measure()
    close()
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mq.matches && setDrawer(false)
    mq.addEventListener('change', onChange)
    return () => {
      document.documentElement.style.overflow = prev
      mq.removeEventListener('change', onChange)
    }
  }, [drawer, measure, close])

  /* ---------- pointer: hover intent ---------- */
  const onTriggerEnter = (key: string, pointerType: string) => {
    if (pointerType !== 'mouse') return
    clearTimeout(closeTimer.current)
    if (active === key || active === SEARCH) return
    clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => open(key), active ? SWITCH_DELAY : OPEN_DELAY)
  }
  const onTriggerLeave = () => clearTimeout(openTimer.current)
  const onHeaderLeave = (pointerType: string) => {
    if (pointerType !== 'mouse' || !active || active === SEARCH) return
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => close(), CLOSE_DELAY)
  }
  const onHeaderEnter = () => clearTimeout(closeTimer.current)

  const onTriggerClick = (key: string) => {
    // A hover may have opened it a moment ago; don't let the click shut it again
    if (active === key && Date.now() - openedAt.current > 400) close()
    else open(key)
  }

  /* ---------- keyboard on the top-level items ---------- */
  const keys = [...menus.map((m) => m._key), ...(searchOn ? [SEARCH] : [])]
  const onTriggerKey = (e: KeyboardEvent, key: string) => {
    const i = keys.indexOf(key)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const next = keys[(i + (e.key === 'ArrowRight' ? 1 : keys.length - 1)) % keys.length]
      triggerRefs.current.get(next)?.focus()
      if (active && active !== SEARCH && next !== SEARCH && menus.find((m) => m._key === next)?.kind !== 'link') open(next)
    } else if (e.key === 'ArrowDown' && key !== SEARCH) {
      e.preventDefault()
      open(key)
      requestAnimationFrame(() =>
        document.getElementById(`${uid}-panel-${key}`)?.querySelector<HTMLElement>('input, a[href]')?.focus(),
      )
    }
  }

  // Leaving the whole header with Tab closes the panel
  const onHeaderBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null
    if (next && !headerRef.current?.contains(next)) close()
  }

  const afterNavigate = () => {
    close()
    setDrawer(false)
    setQuery('')
  }

  const searchAll = (q: string) => {
    setQuery(q)
    open(SEARCH)
  }

  const login = nav.loginLink ? resolveHref(nav.loginLink.link) : null
  const strap = nav.strapline

  return (
    <>
      <header
        ref={headerRef}
        className="mm"
        data-open={active ? 'true' : undefined}
        data-drawer={drawer ? 'true' : undefined}
        style={{ '--mm-top': `${top}px` } as CSSProperties}
        onPointerEnter={onHeaderEnter}
        onPointerLeave={(e) => onHeaderLeave(e.pointerType)}
        onBlur={onHeaderBlur}
      >
        <a href="#main" className="skip-link">Skip to main content</a>

        {/* ---------- Purple top bar ---------- */}
        <div className="mm-utility">
          <div className="wrapper mm-utility__inner">
            {strap && <p className="mm-utility__strap">{strap}</p>}
            <ul role="list" className="mm-utility__links">
              {nav.utilityLinks?.map((u) => {
                const href = resolveHref(u.link)
                return href ? (
                  <li key={u._key}>
                    <MenuAnchor href={href} newTab={u.link?.openInNewTab}>{u.label}</MenuAnchor>
                  </li>
                ) : null
              })}
              {login && (
                <li>
                  <MenuAnchor href={login} newTab={nav.loginLink?.link?.openInNewTab} className="mm-utility__login">
                    {nav.loginLink?.label}
                    <UserCircleIcon weight="fill" aria-hidden="true" />
                  </MenuAnchor>
                </li>
              )}
              {sandboxLinks.length > 0 && (
                <li>
                  <SandboxMenu links={sandboxLinks} />
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ---------- Main bar ---------- */}
        <div className="mm-bar">
          <div className="wrapper mm-bar__inner">
            <Link href="/" className="mm-logo" aria-label="AQA home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/aqa-logo.svg" alt="" width={110} height={64} />
            </Link>

            <nav aria-label="Main" className="mm-nav">
              <ul role="list" className="mm-nav__list">
                {menus.map((m) => {
                  const key = m._key
                  const isOpen = active === key
                  if (stegaClean(m.kind) === 'link') {
                    const href = resolveHref(m.link)
                    return href ? (
                      <li key={key} className="mm-nav__item">
                        <MenuAnchor
                          href={href}
                          newTab={m.link?.openInNewTab}
                          className="mm-nav__trigger"
                          ref={(el: HTMLAnchorElement | null) => { if (el) triggerRefs.current.set(key, el) }}
                          onKeyDown={(e) => onTriggerKey(e, key)}
                          onPointerEnter={() => active && active !== SEARCH && close()}
                        >
                          {m.label}
                        </MenuAnchor>
                      </li>
                    ) : null
                  }
                  return (
                    <li key={key} className="mm-nav__item">
                      <button
                        type="button"
                        className="mm-nav__trigger"
                        aria-expanded={isOpen}
                        aria-controls={`${uid}-panel-${key}`}
                        data-active={isOpen || undefined}
                        ref={(el) => { if (el) triggerRefs.current.set(key, el) }}
                        onPointerEnter={(e) => onTriggerEnter(key, e.pointerType)}
                        onPointerLeave={onTriggerLeave}
                        onClick={() => onTriggerClick(key)}
                        onKeyDown={(e) => onTriggerKey(e, key)}
                      >
                        {m.label}
                        <CaretDownIcon className="mm-nav__caret" weight="bold" aria-hidden="true" />
                      </button>
                      <div
                        id={`${uid}-panel-${key}`}
                        className="mm-panel"
                        hidden={!isOpen}
                        data-instant={instant || undefined}
                        role="region"
                        aria-label={stegaClean(m.label) ?? undefined}
                      >
                        <Panel menu={m} filter={isOpen ? filter : ''} setFilter={setFilter} onNavigate={afterNavigate} onSearchAll={searchAll} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="mm-bar__actions">
              {searchOn && (
                <button
                  type="button"
                  className="mm-iconbtn mm-iconbtn--search"
                  aria-expanded={active === SEARCH}
                  aria-controls={`${uid}-panel-search`}
                  data-active={active === SEARCH || undefined}
                  ref={(el) => { if (el) triggerRefs.current.set(SEARCH, el) }}
                  onClick={() => (active === SEARCH ? close() : open(SEARCH))}
                  onKeyDown={(e) => onTriggerKey(e, SEARCH)}
                  aria-label={active === SEARCH ? 'Close search' : 'Search'}
                  title="Search ( / )"
                >
                  {active === SEARCH ? <XIcon weight="bold" /> : <MagnifyingGlassIcon weight="bold" />}
                </button>
              )}
              {searchOn && (
                <button type="button" className="mm-iconbtn mm-mobile-only" aria-label="Search" onClick={() => { setDrawer(true); requestAnimationFrame(() => drawerSearchRef.current?.focus()) }}>
                  <MagnifyingGlassIcon weight="bold" />
                </button>
              )}
              <button
                type="button"
                className="mm-iconbtn mm-burger mm-mobile-only"
                aria-expanded={drawer}
                aria-controls={`${uid}-drawer`}
                aria-label={drawer ? 'Close menu' : 'Open menu'}
                onClick={() => setDrawer((d) => !d)}
              >
                {drawer ? <XIcon weight="bold" /> : <ListIcon weight="bold" />}
              </button>
            </div>

            {searchOn && (
              <div id={`${uid}-panel-search`} className="mm-panel mm-panel--search" hidden={active !== SEARCH} data-instant={instant || undefined} role="region" aria-label="Search">
                <div className="wrapper mm-panel__inner">
                  <MenuSearch nav={nav} query={query} setQuery={setQuery} inputRef={searchInputRef} onNavigate={afterNavigate} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------- Mobile drawer ---------- */}
        {drawer && (
          <div id={`${uid}-drawer`} className="mm-drawer">
            {searchOn && <MenuSearch nav={nav} query={query} setQuery={setQuery} inputRef={drawerSearchRef} onNavigate={afterNavigate} variant="drawer" />}
            {!query.trim() && (
              <>
                <ul role="list" className="mm-acc">
                  {menus.map((m) => {
                    const href = resolveHref(m.link)
                    if (stegaClean(m.kind) === 'link') {
                      return href ? (
                        <li key={m._key}>
                          <MenuAnchor href={href} newTab={m.link?.openInNewTab} className="mm-acc__trigger" onClick={afterNavigate}>{m.label}</MenuAnchor>
                        </li>
                      ) : null
                    }
                    const isOpen = expanded === m._key
                    return (
                      <li key={m._key}>
                        <button type="button" className="mm-acc__trigger" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : m._key)}>
                          {m.label}
                          <CaretDownIcon weight="bold" aria-hidden="true" />
                        </button>
                        {isOpen && (
                          <div className="mm-acc__panel">
                            {href && (
                              <MenuAnchor href={href} newTab={m.link?.openInNewTab} className="mm-viewall" onClick={afterNavigate}>
                                {m.linkLabel || 'View all'}
                                <ArrowRightIcon weight="bold" aria-hidden="true" />
                              </MenuAnchor>
                            )}
                            {m.columns?.map((c) => <Column key={c._key} col={c} filter="" onNavigate={afterNavigate} compact />)}
                            <QuickLinks menu={m} onNavigate={afterNavigate} />
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
                <ul role="list" className="mm-drawer__utility">
                  {nav.utilityLinks?.map((u) => {
                    const href = resolveHref(u.link)
                    return href ? (
                      <li key={u._key}><MenuAnchor href={href} newTab={u.link?.openInNewTab} onClick={afterNavigate}>{u.label}</MenuAnchor></li>
                    ) : null
                  })}
                  {login && (
                    <li>
                      <MenuAnchor href={login} newTab={nav.loginLink?.link?.openInNewTab} className="mm-drawer__login" onClick={afterNavigate}>
                        <UserCircleIcon weight="fill" aria-hidden="true" />
                        {nav.loginLink?.label}
                      </MenuAnchor>
                    </li>
                  )}
                </ul>
                {sandboxLinks.length > 0 && (
                  <div className="mm-drawer__sandbox">
                    <p>Sandbox pages</p>
                    <ul role="list">
                      {sandboxLinks.map((s) => (
                        <li key={s.key}><MenuAnchor href={s.href} onClick={afterNavigate}>{s.label}</MenuAnchor></li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </header>
      <div className="mm-backdrop" data-show={active ? 'true' : undefined} aria-hidden="true" onClick={() => close()} />
    </>
  )
}

/* ------------------------------------------------------------------ */

function matches(l: MenuLink, f: string) {
  if (!f) return true
  const hay = normalise([l.label, l.tag, l.description, ...(l.keywords ?? [])].map((x) => stegaClean(x ?? '')).join(' '))
  const words = hay.split(' ')
  return f.split(' ').every((t) => words.some((w) => w.startsWith(t)))
}

function Panel({
  menu,
  filter,
  setFilter,
  onNavigate,
  onSearchAll,
}: {
  menu: Menu
  filter: string
  setFilter: (f: string) => void
  onNavigate: () => void
  onSearchAll: (q: string) => void
}) {
  const id = useId()
  const viewAll = resolveHref(menu.link)
  const featured = menu.featured ?? []
  const f = normalise(filter)
  const columns = (menu.columns ?? [])
    .map((c) => ({ ...c, links: (c.links ?? []).filter((l) => matches(l, f)) }))
    .filter((c) => !f || c.links.length > 0)
  const used = (menu.columns ?? []).reduce((n, c) => n + (stegaClean(c.span) ?? 1), 0)
  const gridCols = Math.min(featured.length ? 3 : 4, Math.max(used, 1))

  return (
    <div className="wrapper mm-panel__inner">
      <div className="mm-panel__head">
        <div className="mm-panel__title">
          <h2>{menu.label}</h2>
          {menu.intro && <p>{menu.intro}</p>}
        </div>
        {menu.showFilter && (
          <div className="mm-filter">
            <FunnelSimpleIcon weight="bold" aria-hidden="true" />
            <label htmlFor={`${id}-filter`} className="sr-only">{menu.filterPlaceholder || 'Filter this list'}</label>
            <input
              id={`${id}-filter`}
              type="search"
              autoComplete="off"
              placeholder={stegaClean(menu.filterPlaceholder) || 'Filter this list'}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && filter) {
                  e.stopPropagation()
                  setFilter('')
                }
              }}
            />
          </div>
        )}
        {viewAll && (
          <MenuAnchor href={viewAll} newTab={menu.link?.openInNewTab} className="mm-viewall" onClick={onNavigate}>
            {menu.linkLabel || 'View all'}
            <ArrowRightIcon weight="bold" aria-hidden="true" />
          </MenuAnchor>
        )}
      </div>

      <div className="mm-panel__body" data-featured={featured.length > 0 || undefined}>
        <div className="mm-cols" style={{ '--mm-cols': gridCols } as CSSProperties}>
          {columns.map((c) => (
            <Column key={c._key} col={c} filter={f ? filter : ''} onNavigate={onNavigate} maxSpan={gridCols} />
          ))}
          {f && columns.length === 0 && (
            <div className="mm-nomatch">
              <p>Nothing here matches “{filter}”.</p>
              <button type="button" className="mm-viewall" onClick={() => onSearchAll(filter)}>
                Search everything for “{filter}”
                <MagnifyingGlassIcon weight="bold" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        {featured.length > 0 && (
          <aside className="mm-featured" aria-label="Featured">
            {featured.map((ft) => <Feature key={ft._key} feature={ft} onNavigate={onNavigate} />)}
          </aside>
        )}
      </div>

      <QuickLinks menu={menu} onNavigate={onNavigate} />
    </div>
  )
}

function QuickLinks({ menu, onNavigate }: { menu: Menu; onNavigate: () => void }) {
  const links = (menu.quickLinks ?? []).map((q) => ({ ...q, href: resolveHref(q.link) })).filter((q) => q.href)
  if (!links.length) return null
  return (
    <ul role="list" className="mm-panel__foot">
      {links.map((q) => (
        <li key={q._key}>
          <MenuAnchor href={q.href!} newTab={q.link?.openInNewTab} onClick={onNavigate}>
            {q.label}
            <ArrowRightIcon weight="bold" aria-hidden="true" />
          </MenuAnchor>
        </li>
      ))}
    </ul>
  )
}

const BADGES: Record<string, string> = { new: 'New', updated: 'Updated', popular: 'Popular' }

function Column({ col, filter, onNavigate, compact = false, maxSpan = 4 }: { col: MenuColumn; filter: string; onNavigate: () => void; compact?: boolean; maxSpan?: number }) {
  const style = compact ? 'compact' : stegaClean(col.style) || 'compact'
  const span = compact ? 1 : Math.min(stegaClean(col.span) || 1, maxSpan)
  const headingHref = resolveHref(col.headingLink)
  const footHref = col.footerLink ? resolveHref(col.footerLink.link) : null
  const links = col.links ?? []

  return (
    <section className="mm-col" data-style={style} style={{ '--span': span } as CSSProperties} aria-label={col.heading ? undefined : 'Links'}>
      {col.heading && (
        <h3 className="mm-col__heading">
          {headingHref ? (
            <MenuAnchor href={headingHref} newTab={col.headingLink?.openInNewTab} onClick={onNavigate}>
              {col.heading}
              <ArrowRightIcon weight="bold" aria-hidden="true" />
            </MenuAnchor>
          ) : (
            col.heading
          )}
        </h3>
      )}
      <ul role="list" className="mm-links">
        {links.map((l) => {
          const href = resolveHref(l.link)
          if (!href) return null
          const def = l.icon ? MENU_ICONS[stegaClean(l.icon)] : undefined
          const Icon = def?.icon
          const badge = stegaClean(l.badge ?? '')
          return (
            <li key={l._key}>
              <MenuAnchor href={href} newTab={l.link?.openInNewTab} className="mm-link" data-has-icon={Icon ? 'true' : undefined} onClick={onNavigate}>
                {Icon && (
                  <span className="mm-tile" aria-hidden="true">
                    <Icon weight="fill" />
                  </span>
                )}
                <span className="mm-link__text">
                  <span className="mm-link__label">
                    {filter
                      ? highlight(l.label ?? '', filter).map((p, i) => (p.hit ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))
                      : l.label}{' '}
                    {l.tag && <span className="mm-tag">{l.tag}</span>}
                    {badge && BADGES[badge] && <span className={`mm-badge mm-badge--${badge}`}>{BADGES[badge]}</span>}
                  </span>
                  {style === 'detailed' && l.description && <span className="mm-link__desc">{l.description}</span>}
                </span>
                <ArrowRightIcon className="mm-link__arrow" weight="bold" aria-hidden="true" />
              </MenuAnchor>
            </li>
          )
        })}
      </ul>
      {footHref && (
        <MenuAnchor href={footHref} newTab={col.footerLink?.link?.openInNewTab} className="mm-col__foot" onClick={onNavigate}>
          {col.footerLink?.label}
          <ArrowRightIcon weight="bold" aria-hidden="true" />
        </MenuAnchor>
      )}
    </section>
  )
}

function Feature({ feature, onNavigate }: { feature: MenuFeature; onNavigate: () => void }) {
  const style = stegaClean(feature.style) || 'image'
  const href = feature.cta ? resolveHref(feature.cta.link) : null
  const def = feature.icon ? MENU_ICONS[stegaClean(feature.icon)] : undefined
  const Icon = def?.icon
  const img = feature.image?.asset ? feature.image : null

  return (
    <article className={`mm-feature mm-feature--${style}`} data-link={href ? 'true' : undefined}>
      {style === 'image' && img && (
        <div className="mm-feature__media" style={img.lqip ? { backgroundImage: `url(${img.lqip})` } : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(img).width(640).height(360).fit('crop').quality(80).url()}
            srcSet={`${urlFor(img).width(400).height(225).fit('crop').quality(80).url()} 400w, ${urlFor(img).width(640).height(360).fit('crop').quality(80).url()} 640w`}
            sizes="320px"
            alt={img.alt ?? ''}
            width={640}
            height={360}
            loading="lazy"
          />
        </div>
      )}
      {style !== 'image' && Icon && (
        <span className="mm-feature__icon" aria-hidden="true">
          <Icon weight="fill" />
        </span>
      )}
      <div className="mm-feature__body">
        {feature.eyebrow && <p className="mm-feature__eyebrow">{feature.eyebrow}</p>}
        <h3 className="mm-feature__heading">
          {href ? (
            <MenuAnchor href={href} newTab={feature.cta?.link?.openInNewTab} className="mm-feature__link" onClick={onNavigate}>
              {feature.heading}
            </MenuAnchor>
          ) : (
            feature.heading
          )}
        </h3>
        {feature.text && <p className="mm-feature__text">{feature.text}</p>}
        {href && feature.cta?.label && (
          <span className="mm-feature__cta" aria-hidden="true">
            {feature.cta.label}
            <ArrowRightIcon weight="bold" />
          </span>
        )}
      </div>
    </article>
  )
}

function SandboxMenu({ links }: { links: SandboxLink[] }) {
  const ref = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])
  return (
    <details className="mm-sandbox" ref={ref}>
      <summary>Sandbox<CaretDownIcon weight="bold" aria-hidden="true" /></summary>
      <ul role="list">
        {links.map((s) => (
          <li key={s.key}>
            <MenuAnchor href={s.href} onClick={() => { if (ref.current) ref.current.open = false }}>{s.label}</MenuAnchor>
          </li>
        ))}
      </ul>
    </details>
  )
}
