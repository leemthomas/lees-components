'use client';

import Link from 'next/link';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { HeroButton, HeroOptions, HeroSlide, ImageSource } from './types';
import './hero-slider.css';

const DEFAULTS: Required<HeroOptions> = {
  ariaLabel: 'Featured',
  autoplay: true,
  interval: 7000,
  speed: 900,
  loop: true,
  pauseOnHover: true,
  height: 'standard',
  navigation: 'tabs',
  arrows: true,
  progressBar: false,
  swipe: true,
  keyboard: true,
  shuffle: false,
  embedsAllowed: true,
  firstHeadingLevel: 'h2',
  contained: false,
};

const MEASURE = { narrow: '28rem', standard: '36rem', wide: '46rem' } as const;

type Props = { slides: HeroSlide[]; options?: HeroOptions };

export default function HeroSlider({ slides: input, options }: Props) {
  // Ignore undefined values so blank CMS fields fall back to the defaults.
  const o = { ...DEFAULTS, ...Object.fromEntries(Object.entries(options ?? {}).filter(([, v]) => v != null)) } as Required<HeroOptions>;
  const [order, setOrder] = useState(() => input.map((_, i) => i));
  const slides = useMemo(() => order.map((i) => input[i]).filter(Boolean), [order, input]);
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  const [cycle, setCycle] = useState(0); // restarts timer and progress fills
  const [navigated, setNavigated] = useState(false);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Pause sources. Any one of them pauses the slider.
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rootRef = useRef<HTMLElement>(null);
  const mediaRefs = useRef<Array<HTMLVideoElement | HTMLIFrameElement | null>>([]);
  const leaveTimer = useRef<number | undefined>(undefined);
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const swiped = useRef(false);

  const autoplay = o.autoplay && !reducedMotion && count > 1;
  const paused =
    userPaused || (o.pauseOnHover && hover) || focusWithin || hidden || offscreen || lightbox !== null;

  const current = slides[index];
  const interval = current?.duration ?? o.interval;
  const transition = reducedMotion ? 'fade' : current?.transition ?? 'fade';
  const advanceOnVideo = current?.background.type === 'video' && current.background.advanceOnEnd;

  /* ---------- navigation ---------- */
  const goTo = useCallback(
    (target: number, direction?: 'next' | 'prev') => {
      if (count < 2) return;
      let next = target;
      if (o.loop) next = (target + count) % count;
      else if (target < 0 || target >= count) return;
      if (next === index) return;
      setDir(direction ?? (next > index ? 'next' : 'prev'));
      setNavigated(true);
      setLeaving(index);
      setIndex(next);
      setCycle((c) => c + 1);
      setLoaded((s) => new Set(s).add(next).add((next + 1) % count));
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = window.setTimeout(() => setLeaving(null), o.speed + 50);
    },
    [count, index, o.loop, o.speed],
  );
  const next = useCallback(() => goTo(index + 1, 'next'), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, 'prev'), [goTo, index]);

  /* ---------- environment listeners ---------- */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => setReducedMotion(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), { threshold: 0.25 });
    if (rootRef.current) io.observe(rootRef.current);
    return () => {
      mq.removeEventListener('change', onMq);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
      window.clearTimeout(leaveTimer.current);
    };
  }, []);

  // Shuffle after hydration (keeps server and client markup identical).
  useEffect(() => {
    if (!o.shuffle || input.length < 3) return;
    const rest = input.map((_, i) => i).slice(1);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    setOrder([0, ...rest]);
  }, [o.shuffle, input]);

  // Preload the second slide once the page is idle.
  useEffect(() => {
    if (count < 2) return;
    const id = window.setTimeout(() => setLoaded((s) => new Set(s).add(1)), 1500);
    return () => window.clearTimeout(id);
  }, [count]);

  /* ---------- play and pause background video ---------- */
  useEffect(() => {
    slides.forEach((slide, i) => {
      const el = mediaRefs.current[i];
      if (!el) return;
      const shouldPlay = i === index && !userPaused && !hidden && !offscreen;
      if (el instanceof HTMLVideoElement) {
        if (shouldPlay) el.play().catch(() => {});
        else el.pause();
        if (i !== index && slide.background.type === 'video' && slide.background.advanceOnEnd) el.currentTime = 0;
      } else if (el instanceof HTMLIFrameElement && el.contentWindow) {
        const t = slide.background.type;
        const msg =
          t === 'youtube'
            ? JSON.stringify({ event: 'command', func: shouldPlay ? 'playVideo' : 'pauseVideo', args: [] })
            : JSON.stringify({ method: shouldPlay ? 'play' : 'pause' });
        el.contentWindow.postMessage(msg, '*');
      }
    });
  }, [index, userPaused, hidden, offscreen, slides, loaded]);

  /* ---------- input handlers ---------- */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!o.keyboard) return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (!o.swipe || e.pointerType === 'mouse') return;
    swipe.current = { x: e.clientX, y: e.clientY, moved: false };
    swiped.current = false;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      if (dx < 0) next(); else prev();
    }
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (swiped.current) { e.preventDefault(); e.stopPropagation(); swiped.current = false; }
  };

  const onButton = (b: HeroButton, e: React.MouseEvent) => {
    const w = window as unknown as { dataLayer?: object[] };
    w.dataLayer?.push({ event: 'hero_click', hero_slide: current?.id, hero_button: b.trackingId ?? b.label });
    if (b.style === 'play' && b.youtubeId) { e.preventDefault(); setLightbox(b.youtubeId); }
  };

  if (!count) return null;

  return (
    <section
      ref={rootRef}
      className={o.contained ? 'hs hs--contained' : 'hs'}
      aria-roledescription="carousel"
      aria-label={o.ariaLabel}
      data-height={o.height}
      data-transition={transition}
      data-dir={dir}
      data-initial={String(!navigated)}
      data-autoplay={String(autoplay && !advanceOnVideo)}
      data-paused={String(paused)}
      style={{ '--hs-interval': `${interval}ms`, '--hs-speed': `${o.speed}ms`, '--hs-count': count } as CSSProperties}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => setFocusWithin(safeMatches(e.target, ':focus-visible'))}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false); }}
    >
      <div
        className="hs-viewport"
        aria-live={autoplay && !paused ? 'off' : 'polite'}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {slides.map((slide, i) => (
          <Slide
            key={slide.id}
            slide={slide}
            i={i}
            count={count}
            active={i === index}
            leaving={i === leaving}
            shouldLoad={loaded.has(i)}
            embedsAllowed={o.embedsAllowed}
            priority={i === 0}
            firstHeadingLevel={o.firstHeadingLevel}
            mediaRef={(el) => { mediaRefs.current[i] = el; }}
            onVideoEnd={i === index ? next : undefined}
            onButton={onButton}
          />
        ))}

        {o.progressBar && autoplay && (
          <div className="hs-progress is-current" key={`p${cycle}`} aria-hidden="true"><div className="hs-fill" /></div>
        )}

        {autoplay && !advanceOnVideo && (
          <div key={`t${cycle}`} className="hs-timer is-running" onAnimationEnd={next} aria-hidden="true" />
        )}

        {count > 1 && (o.navigation !== 'tabs' || o.arrows || autoplay) && (
          <div className="hs-controls" data-tone={current.tone === 'dark' && current.layout !== 'split-left' && current.layout !== 'split-right' ? 'dark' : 'light'}>
            <div className="hs-ctrl-group">
              {o.navigation === 'dots' && (
                <div className="hs-dots">
                  {slides.map((s, i) => (
                    <button key={s.id} type="button" className={`hs-dot${i === index ? ' is-current' : ''}`} aria-current={i === index} aria-label={`Show slide ${i + 1}: ${s.navLabel ?? plain(s.heading)}`} onClick={() => goTo(i)}>
                      <span className="hs-fill" key={i === index ? cycle : 'x'} />
                    </button>
                  ))}
                </div>
              )}
              {o.navigation === 'numbers' && (
                <div className="hs-count" aria-hidden="true"><b>{pad(index + 1)}</b><span>/ {pad(count)}</span></div>
              )}
              {o.navigation === 'thumbs' && (
                <div className="hs-thumbs">
                  {slides.map((s, i) => (
                    <button key={s.id} type="button" className={`hs-thumb${i === index ? ' is-current' : ''}`} aria-current={i === index} aria-label={`Show slide ${i + 1}: ${s.navLabel ?? plain(s.heading)}`} onClick={() => goTo(i)}>
                      <Thumb slide={s} />
                      <span className="hs-fill" key={i === index ? cycle : 'x'} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hs-ctrl-group">
              {autoplay && (
                <button type="button" className="hs-icon-btn" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}>
                  {userPaused ? <Icon name="play" /> : <Icon name="pause" />}
                </button>
              )}
              {o.arrows && (
                <>
                  <button type="button" className="hs-icon-btn" onClick={prev} aria-label="Previous slide" disabled={!o.loop && index === 0}><Icon name="prev" /></button>
                  <button type="button" className="hs-icon-btn" onClick={next} aria-label="Next slide" disabled={!o.loop && index === count - 1}><Icon name="next" /></button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {o.navigation === 'tabs' && count > 1 && (
        <div className="hs-tabs">
          {slides.map((s, i) => (
            <button key={s.id} type="button" className={`hs-tab${i === index ? ' is-current' : ''}`} aria-current={i === index} onClick={() => goTo(i)}>
              <span className="hs-track" aria-hidden="true"><span className="hs-fill" key={i === index ? cycle : 'x'} /></span>
              <small>{pad(i + 1)}</small>
              <span>{s.navLabel ?? plain(s.heading)}</span>
            </button>
          ))}
        </div>
      )}

      {lightbox && <Lightbox id={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}

/* ===================================================================== */

type SlideProps = {
  slide: HeroSlide;
  i: number;
  count: number;
  active: boolean;
  leaving: boolean;
  shouldLoad: boolean;
  embedsAllowed: boolean;
  priority: boolean;
  firstHeadingLevel: 'h1' | 'h2';
  mediaRef: (el: HTMLVideoElement | HTMLIFrameElement | null) => void;
  onVideoEnd?: () => void;
  onButton: (b: HeroButton, e: React.MouseEvent) => void;
};

function Slide({ slide: s, i, count, active, leaving, shouldLoad, embedsAllowed, priority, firstHeadingLevel, mediaRef, onVideoEnd, onButton }: SlideProps) {
  const layout = s.layout ?? 'overlay';
  const ratio = s.splitRatio ?? 50;
  const Heading = i === 0 ? firstHeadingLevel : 'h2';
  let layer = 0;

  const style = {
    '--hs-measure': MEASURE[s.maxWidth ?? 'standard'],
    '--hs-split': layout === 'split-left' ? `${ratio}fr ${100 - ratio}fr` : `${100 - ratio}fr ${ratio}fr`,
    ...(s.panelColour ? { '--hs-panel': s.panelColour } : {}),
  } as CSSProperties;

  const inertProps = active ? {} : ({ inert: '' } as Record<string, string>);

  return (
    <div
      className={`hs-slide${active ? ' is-active' : ''}${leaving ? ' is-leaving' : ''}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${i + 1} of ${count}: ${s.navLabel ?? plain(s.heading)}`}
      aria-hidden={!active}
      {...inertProps}
      data-layout={layout}
      data-edge={s.splitEdge ?? 'straight'}
      data-pos={layout.startsWith('split') ? (s.position?.[0] ?? 'm') + 'l' : s.position ?? 'bl'}
      data-mpos={s.mobilePosition ?? 'bl'}
      data-tone={s.tone ?? 'light'}
      data-layers={s.layerAnimation ?? 'fade-up'}
      {...(s.motion && s.motion !== 'none' ? { 'data-motion': s.motion } : {})}
      style={style}
    >
      <div className="hs-media" aria-hidden="true">
        <div className="hs-media-inner">
          <Media slide={s} active={active} shouldLoad={shouldLoad} embedsAllowed={embedsAllowed} priority={priority} mediaRef={mediaRef} onVideoEnd={onVideoEnd} />
        </div>
        <OverlayLayer slide={s} />
      </div>

      <div className="hs-inner">
        <div className="hs-content">
          {s.badge && <span className="hs-badge hs-layer" style={{ '--i': layer++ } as CSSProperties}>{s.badge}</span>}
          {s.eyebrow && <span className="hs-eyebrow hs-layer" style={{ '--i': layer++ } as CSSProperties}>{s.eyebrow}</span>}
          <Heading className="hs-title hs-layer" style={{ '--i': layer++ } as CSSProperties}>{highlight(s.heading)}</Heading>
          {s.subheading && <p className="hs-sub hs-layer" style={{ '--i': layer++ } as CSSProperties}>{s.subheading}</p>}
          {!!s.buttons?.length && (
            <div className="hs-actions">
              {s.buttons.map((b, bi) => (
                <ButtonLink key={bi} b={b} style={{ '--i': layer++ } as CSSProperties} onClick={(e) => onButton(b, e)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Media({ slide, active, shouldLoad, embedsAllowed, priority, mediaRef, onVideoEnd }: {
  slide: HeroSlide; active: boolean; shouldLoad: boolean; embedsAllowed: boolean; priority: boolean;
  mediaRef: SlideProps['mediaRef']; onVideoEnd?: () => void;
}) {
  const bg = slide.background;
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  // Hide the poster only once the player reports that it is actually playing,
  // so a blocked or failed embed still shows the poster image.
  useEffect(() => {
    if (bg.type !== 'youtube' && bg.type !== 'vimeo') return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return;
      let data: { event?: string; info?: { playerState?: number } | number } | null = null;
      try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch { return; }
      if (!data) return;
      const ytPlaying =
        (data.event === 'onStateChange' && data.info === 1) ||
        (data.event === 'infoDelivery' && typeof data.info === 'object' && data.info?.playerState === 1);
      if (ytPlaying || data.event === 'play' || data.event === 'playProgress') setPlaying(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [bg.type]);

  const listen = () => {
    const w = frameRef.current?.contentWindow;
    if (!w) return;
    if (bg.type === 'youtube') w.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
    else w.postMessage(JSON.stringify({ method: 'addEventListener', value: 'play' }), '*');
  };

  if (bg.type === 'colour') return <div className="hs-art" style={{ background: bg.colour }} />;
  if (bg.type === 'image') return <Picture image={bg.image} priority={priority} />;

  const poster = bg.poster ? <div className="hs-poster"><Picture image={bg.poster} priority={priority} /></div> : null;

  if (bg.type === 'video') {
    return (
      <>
        {shouldLoad && (
          <video
            ref={mediaRef}
            muted
            playsInline
            loop={!bg.advanceOnEnd}
            preload={active ? 'auto' : 'metadata'}
            poster={bg.poster?.src}
            onEnded={onVideoEnd}
            style={{ objectPosition: `${(bg.poster?.focalX ?? 0.5) * 100}% ${(bg.poster?.focalY ?? 0.5) * 100}%` }}
          >
            {bg.webm && <source src={bg.webm} type="video/webm" />}
            <source src={bg.mp4} type="video/mp4" />
          </video>
        )}
        {!shouldLoad && poster}
      </>
    );
  }

  // YouTube / Vimeo: poster first, iframe only with consent and once needed.
  const src =
    bg.type === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${bg.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${bg.videoId}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1${bg.start ? `&start=${bg.start}` : ''}${bg.end ? `&end=${bg.end}` : ''}`
      : `https://player.vimeo.com/video/${bg.videoId}?background=1&autoplay=1&muted=1&loop=1&dnt=1`;

  return (
    <div className={playing ? 'hs-embed is-playing' : 'hs-embed'} style={{ position: 'absolute', inset: 0 }}>
      {embedsAllowed && shouldLoad && (
        <iframe
          ref={(el) => { frameRef.current = el; mediaRef(el); }}
          src={src}
          title=""
          tabIndex={-1}
          allow="autoplay; encrypted-media; picture-in-picture"
          onLoad={listen}
        />
      )}
      {poster && <div style={{ position: 'absolute', inset: 0, transition: 'opacity .6s', opacity: playing ? 0 : 1 }}>{poster}</div>}
    </div>
  );
}

function Picture({ image, priority }: { image: ImageSource & { srcSet?: string; mobileSrcSet?: string }; priority: boolean }) {
  const pos = `${(image.focalX ?? 0.5) * 100}% ${(image.focalY ?? 0.5) * 100}%`;
  return (
    <picture>
      {image.mobileSrc && <source media="(max-width: 720px)" srcSet={image.mobileSrcSet ?? image.mobileSrc} sizes="100vw" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes="100vw"
        alt=""
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        style={{ objectPosition: pos, ...(image.blurDataURL ? { backgroundImage: `url(${image.blurDataURL})`, backgroundSize: 'cover' } : {}) }}
      />
    </picture>
  );
}

function OverlayLayer({ slide }: { slide: HeroSlide }) {
  const ov = slide.overlay ?? { type: 'gradient' };
  return (
    <div
      className="hs-overlay"
      data-type={ov.type}
      style={{
        ...(ov.colour ? { '--hs-ov-c': ov.colour } : {}),
        '--hs-ov-o': ov.opacity ?? 0.55,
        ...(ov.direction ? { '--hs-ov-dir': ov.direction } : {}),
      } as CSSProperties}
    />
  );
}

function ButtonLink({ b, style, onClick }: { b: HeroButton; style: CSSProperties; onClick: (e: React.MouseEvent) => void }) {
  const kind = b.style ?? 'primary';
  const content: ReactNode =
    kind === 'play' ? (
      <><span className="hs-play-dot"><Icon name="play" /></span>{b.label}</>
    ) : (
      <>{b.label}{kind !== 'text' && <Icon name={b.newTab ? 'external' : 'arrow'} />}</>
    );
  const common = { className: 'hs-btn hs-layer', 'data-style': kind, style, onClick };
  const external = b.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  if (b.href.startsWith('/') && !b.newTab) return <Link href={b.href} {...common}>{content}</Link>;
  return (
    <a href={b.href} {...common} {...external}>
      {content}
      {b.newTab && <span className="hs-sr"> (opens in a new tab)</span>}
    </a>
  );
}

function Thumb({ slide }: { slide: HeroSlide }) {
  const bg = slide.background;
  const img = bg.type === 'image' ? bg.image : 'poster' in bg ? bg.poster : undefined;
  // eslint-disable-next-line @next/next/no-img-element
  if (img) return <img src={img.src} alt="" loading="lazy" />;
  return <span style={{ background: bg.type === 'colour' ? bg.colour : 'var(--hs-brand)' }} />;
}

function Lightbox({ id, onClose }: { id: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [onClose]);
  return (
    <div className="hs-lightbox" role="dialog" aria-modal="true" aria-label="Video" onClick={onClose}>
      <div className="hs-lightbox-frame" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="hs-icon-btn hs-lightbox-close" onClick={onClose} aria-label="Close video"><Icon name="close" /></button>
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title="Video player" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function highlight(text: string): ReactNode {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? <mark key={i} className="hs-hl">{part.slice(1, -1)}</mark> : <Fragment key={i}>{part}</Fragment>,
  );
}
const plain = (t: string) => t.replace(/\*/g, '');
// Pause on keyboard focus only, so a mouse click on an arrow does not stop the slideshow.
const safeMatches = (el: EventTarget, sel: string) => {
  try { return (el as HTMLElement).matches(sel); } catch { return true; }
};
const pad = (n: number) => String(n).padStart(2, '0');

const PATHS: Record<string, string> = {
  prev: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  external: 'M14 4h6v6m0-6L10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 4.5v15l13-7.5z',
  close: 'M6 6l12 12M18 6 6 18',
};
function Icon({ name }: { name: keyof typeof PATHS | string }) {
  const filled = name === 'play';
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  );
}
