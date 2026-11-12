import type { ReactNode } from 'react';

export type NameSource = 'attribute' | 'displayName';

/** Size of badge text and of the toggle card. `normal` is 1x, `large` 1.35x, `xlarge` 1.75x. */
export type TextSize = 'normal' | 'large' | 'xlarge';

export const TEXT_SCALE: Record<TextSize, number> = { normal: 1, large: 1.35, xlarge: 1.75 };

export interface CopyDetail {
  /** The label text that was copied. */
  name: string;
  /** The element the label belongs to. */
  element: Element;
  /** False if the clipboard write failed or the clipboard API isn't available. */
  copied: boolean;
}

export interface ComponentDetailsProviderProps {
  children?: ReactNode;
  /**
   * Whether the overlay exists at all. Defaults to `true` in development and `false` in a
   * production build. When it is false the provider renders only its children, the toggle
   * renders nothing, and no listeners are attached. Pass `true` to turn it on in production.
   */
  enabled?: boolean;
  /** Where labels come from. Default `'attribute'`. `'displayName'` is best effort, dev only. */
  nameSource?: NameSource;
  /** Attribute read in `'attribute'` mode. Default `'data-component'`. */
  attributeName?: string;
  /** localStorage key for the on/off and hover-only settings. `null` turns saving off. */
  storageKey?: string | null;
  /** Whether the overlay starts switched on when nothing is saved. Default `false`. */
  defaultActive?: boolean;
  /** Whether hover-only mode starts on when nothing is saved. Default `false`. */
  defaultHoverOnly?: boolean;
  /**
   * Adjust badge and outline colours to meet WCAG contrast against the colour behind each
   * component: 4.5:1 for the badge text and 3:1 between the badge and the page. Default `true`.
   * Turn it off to use the `--cdo-color-*` values exactly as set.
   */
  autoContrast?: boolean;
  /**
   * Load Lato, the default font, from Google Fonts when the overlay is available. Default
   * `true`. Turn it off if your app already loads Lato, blocks third-party requests, or sets
   * `--cdo-badge-font-family` to something else.
   */
  loadFont?: boolean;
  /** Alt/Option-click a labelled component to copy its name. Default `true`. */
  copyOnAltClick?: boolean;
  /** Called after an Alt/Option-click copy attempt. Use it to show your own toast. */
  onCopy?: (detail: CopyDetail) => void;
  /** Return `false` to hide a name. In displayName mode it runs on each name in a chain. */
  filter?: (name: string) => boolean;
  /** Element the overlay layer is portalled into. Default `document.body`. */
  container?: Element | null;
}

export interface ComponentDetailsState {
  /** False when the provider is missing or `enabled` is false. */
  available: boolean;
  /** Whether the overlay is showing. */
  active: boolean;
  setActive: (active: boolean) => void;
  toggle: () => void;
  /** Outlines on everything, label only on the hovered component. */
  hoverOnly: boolean;
  setHoverOnly: (hoverOnly: boolean) => void;
  /** Badge and toggle text size. */
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  /** Solid black badges with a white edge and thicker outlines. */
  highContrast: boolean;
  setHighContrast: (on: boolean) => void;
  /** Speak a component's name to screen readers when keyboard focus enters it. */
  announce: boolean;
  setAnnounce: (on: boolean) => void;
}
