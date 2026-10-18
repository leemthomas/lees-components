// Types for the AQA Hero Slider. The shape mirrors the Sanity schema, so
// the GROQ query result can be passed straight in after mapSanityHero().

export type Position = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br';

export type Transition =
  | 'fade' | 'slide' | 'zoom' | 'wipe' | 'iris' | 'blinds' | 'parallax' | 'stack';

export type LayerAnimation = 'fade-up' | 'slide-side' | 'blur' | 'mask' | 'scale' | 'none';

export type Layout = 'overlay' | 'card' | 'split-left' | 'split-right';

export type ImageSource = {
  src: string;
  alt: string;
  /** Focal point 0–1, taken from the Sanity hotspot. */
  focalX?: number;
  focalY?: number;
  /** Optional art-directed crop for small screens. */
  mobileSrc?: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
};

export type Background =
  | { type: 'image'; image: ImageSource }
  | { type: 'video'; mp4: string; webm?: string; poster?: ImageSource; advanceOnEnd?: boolean }
  | { type: 'youtube'; videoId: string; start?: number; end?: number; poster?: ImageSource }
  | { type: 'vimeo'; videoId: string; poster?: ImageSource }
  | { type: 'colour'; colour: string };

export type Overlay = {
  type: 'none' | 'solid' | 'gradient' | 'scrim' | 'duotone' | 'pattern';
  colour?: string;
  /** 0–1 */
  opacity?: number;
  /** CSS angle, for gradient and pattern. 90deg = dark on the left. */
  direction?: string;
};

export type HeroButton = {
  label: string;
  href: string;
  style?: 'primary' | 'secondary' | 'text' | 'play';
  newTab?: boolean;
  /** For style "play": YouTube ID opened in a lightbox instead of navigating. */
  youtubeId?: string;
  /** Sent to the dataLayer on click. */
  trackingId?: string;
};

export type HeroSlide = {
  id: string;
  /** Short name shown in the tabs strip and announced to screen readers. */
  navLabel?: string;
  badge?: string;
  eyebrow?: string;
  /** Wrap words in *asterisks* to highlight them. */
  heading: string;
  subheading?: string;
  buttons?: HeroButton[];

  background: Background;
  motion?: 'none' | 'zoom-in' | 'zoom-out' | 'pan';
  overlay?: Overlay;

  layout?: Layout;
  /** Ratio of content to media in split layouts, e.g. 50, 40, 60. */
  splitRatio?: number;
  splitEdge?: 'straight' | 'angle' | 'curve';
  panelColour?: string;
  position?: Position;
  mobilePosition?: Position;
  tone?: 'light' | 'dark';
  maxWidth?: 'narrow' | 'standard' | 'wide';

  transition?: Transition;
  layerAnimation?: LayerAnimation;
  /** Overrides the slider interval for this slide (ms). */
  duration?: number;

  /** Scheduling: slide is hidden outside this window. ISO strings. */
  publishFrom?: string;
  publishUntil?: string;
};

export type HeroOptions = {
  ariaLabel?: string;
  autoplay?: boolean;
  interval?: number;
  speed?: number;
  loop?: boolean;
  pauseOnHover?: boolean;
  height?: 'compact' | 'standard' | 'tall' | 'viewport';
  navigation?: 'tabs' | 'dots' | 'numbers' | 'thumbs' | 'none';
  arrows?: boolean;
  progressBar?: boolean;
  swipe?: boolean;
  keyboard?: boolean;
  /** Shuffle slide order per visit, keeping the first slide fixed. */
  shuffle?: boolean;
  /** Only load YouTube/Vimeo once the visitor has accepted those cookies. */
  embedsAllowed?: boolean;
  /** Heading level for the first slide. The page decides this: h1 when the hero opens the page. */
  firstHeadingLevel?: 'h1' | 'h2';
  /** Shown as a rounded panel inside the page grid instead of edge to edge. */
  contained?: boolean;
};
