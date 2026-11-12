import { describe, expect, it } from 'vitest';
import {
  accessibleBadgeColors,
  blend,
  contrast,
  parseColor,
  toHex,
  type RGB,
} from '../contrast';

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };
const DEFAULTS = ['#2563eb', '#db2777', '#d97706', '#16a34a', '#7c3aed'].map((c) => parseColor(c) as RGB);
const PAGES: Record<string, RGB> = {
  white: WHITE,
  'light grey': { r: 238, g: 238, b: 238 },
  'mid grey': { r: 128, g: 128, b: 128 },
  'dark grey': { r: 31, g: 41, b: 55 },
  black: BLACK,
  'brand green': { r: 47, g: 107, b: 79 },
};

describe('parseColor', () => {
  it('reads hex, rgb and rgba', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('#2563eb')).toEqual({ r: 37, g: 99, b: 235, a: 1 });
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    expect(parseColor('rgba(10 20 30 / 50%)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    expect(parseColor('transparent')?.a).toBe(0);
  });

  it('returns null for empty or broken values', () => {
    expect(parseColor('')).toBeNull();
    expect(parseColor('#12')).toBeNull();
    expect(parseColor('rgb(1, 2)')).toBeNull();
  });
});

describe('contrast', () => {
  it('matches the WCAG reference values', () => {
    expect(contrast(BLACK, WHITE)).toBeCloseTo(21, 5);
    expect(contrast(WHITE, WHITE)).toBeCloseTo(1, 5);
    // #767676 on white is the classic "just passes AA" grey.
    expect(contrast({ r: 118, g: 118, b: 118 }, WHITE)).toBeGreaterThan(4.5);
    expect(contrast({ r: 119, g: 119, b: 119 }, WHITE)).toBeLessThan(4.55);
  });
});

describe('accessibleBadgeColors', () => {
  it('keeps a colour that already passes', () => {
    const result = accessibleBadgeColors(DEFAULTS[0], WHITE);
    expect(result.adjusted).toBe(false);
    expect(toHex(result.background)).toBe('#2563eb');
    expect(toHex(result.text)).toBe('#ffffff');
  });

  it('uses dark text when white fails but dark passes', () => {
    const result = accessibleBadgeColors(DEFAULTS[2], WHITE);
    expect(result.adjusted).toBe(false);
    expect(toHex(result.text)).toBe('#111827');
    expect(contrast(result.text, result.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('moves the lightness, not the hue, when neither text colour passes', () => {
    // A mid-tone blue: white text is too weak and so is dark text.
    const base = parseColor('#4a78d9') as RGB;
    const result = accessibleBadgeColors(base, WHITE);
    expect(result.adjusted).toBe(true);
    expect(contrast(result.text, result.background)).toBeGreaterThanOrEqual(4.5);
    expect(result.background.b).toBeGreaterThan(result.background.r);
  });

  it('switches to dark text on a dark page instead of changing the colour', () => {
    const result = accessibleBadgeColors(DEFAULTS[2], PAGES['dark grey']);
    expect(result.adjusted).toBe(false);
    expect(contrast(result.text, result.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('meets 4.5:1 text and 3:1 boundary contrast for every default on every test page', () => {
    for (const [pageName, page] of Object.entries(PAGES)) {
      for (const [i, base] of DEFAULTS.entries()) {
        for (const opacity of [1, 0.85]) {
          const { background, text } = accessibleBadgeColors(base, page, { opacity });
          const shown = blend(background, page, opacity);
          const shownText = blend(text, page, opacity);
          const label = `color ${i + 1} on ${pageName} at ${opacity}`;
          expect(contrast(shownText, shown), `${label}: text`).toBeGreaterThanOrEqual(4.5);
          expect(contrast(shown, page), `${label}: boundary`).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it('prefers the configured text colour when it passes', () => {
    const result = accessibleBadgeColors(DEFAULTS[0], WHITE, { preferredText: BLACK });
    // Black on #2563eb is only about 4.1:1, so the preferred colour is skipped for white.
    expect(toHex(result.text)).toBe('#ffffff');
    const onLight = accessibleBadgeColors({ r: 250, g: 204, b: 21 }, PAGES['dark grey'], { preferredText: BLACK });
    expect(toHex(onLight.text)).toBe('#000000');
  });
});
