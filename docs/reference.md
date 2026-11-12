# Reference

Details for [component-details-overlay](../README.md).

## Two ways to get names

The badge text has to come from somewhere. You choose with the `nameSource` prop. Most people want the first one.

| | Tags (`'attribute'`, the default) | React names (`'displayName'`) |
|---|---|---|
| What you do | Add `{...tag('Card')}` to the outermost element of each component. | Nothing. |
| What the badge says | Exactly the name you wrote. | The component's function name, like `Card` or `Card › Surface`. |
| Which elements get a badge | Only the tagged ones. An untagged element has no badge, which is how you find things built outside your component set. | Every React component, including internal helpers and third-party ones. |
| Production builds | Safe. `tag()` writes nothing there. | Not usable. Builds rename components, so the names are meaningless. |
| Best for | Design reviews, audits, handing names to developers or an AI tool. | A quick look at an app you can't edit. |

```tsx
// Tags: the default
<ComponentDetailsProvider>

// React names: no tagging needed
<ComponentDetailsProvider nameSource="displayName">
```

The demo's side panel has a switch for these two, with the same explanation next to it.

## Behavior

- The toggle switches the overlay on and off. The setting is saved in localStorage.
- Hover a component to give its outline a solid line and bring its badge forward.
- "Labels on hover only" keeps every outline but shows one badge at a time.
- Alt/Option-click a component to copy its name. Your `onCopy` callback gets the result, so you can show your own message.
- Nested components get different colours, five levels deep, then the colours repeat.

## Configuration

All props on `ComponentDetailsProvider` are optional.

| Prop | Default | What it does |
|---|---|---|
| `enabled` | `true` in development, `false` in production | The production switch. When `false` the provider renders only its children, the toggle renders nothing and no listeners are attached. Pass `enabled` to use it in a production build. |
| `nameSource` | `'attribute'` | `'attribute'` reads the attribute below. `'displayName'` reads React component names (see below). |
| `attributeName` | `'data-component'` | The attribute read in attribute mode. |
| `storageKey` | `'component-details-overlay'` | localStorage key for the saved settings. `null` turns saving off. |
| `defaultActive` | `false` | Start switched on when nothing is saved. |
| `defaultHoverOnly` | `false` | Start in hover-only mode when nothing is saved. |
| `autoContrast` | `true` | Adjusts badge and outline colours so they meet WCAG contrast on the page they sit on. See [Accessibility](#accessibility). |
| `loadFont` | `true` | Loads Lato from Google Fonts when the overlay is available. See [Font](#font). |
| `copyOnAltClick` | `true` | Turn Alt/Option-click copying on or off. |
| `onCopy` | none | `({ name, element, copied }) => void`, called after each copy attempt. |
| `filter` | none | `(name) => boolean`. Return `false` to hide a name. |
| `container` | `document.body` | Where the overlay layer is mounted. |

`ComponentDetailsToggle` takes `label`, `hoverOnlyLabel`, `showHoverOnly`, `description` (a short line under the switch that explains what it does, text or any React node), `position` (`'top-left'`, `'top-right'`, `'bottom-left'` or `'bottom-right'`), `className` and `style`. Leave out `position` to place it inline, for example in a sidebar.

To build your own control, use the hook:

```tsx
const { available, active, toggle, hoverOnly, setHoverOnly } = useComponentDetails();
```

`available` is `false` outside a provider and whenever `enabled` is false.

### Turning it on in production

How production is detected: the package reads `process.env.NODE_ENV`, which Vite, webpack, Next.js and Parcel replace at build time. If nothing replaces it, the package assumes production and stays off.

To include the overlay in a production build, for a review or staging deploy, pass `enabled` and tag with `include: true`:

```tsx
const showDetails = import.meta.env.VITE_SHOW_COMPONENT_DETAILS === 'true';
export const tag = createTag({ include: showDetails });

<ComponentDetailsProvider enabled={showDetails}>
```

`tag()` checks the build, not the provider, so the default `tag` writes nothing in production even with `enabled` set. That's why the snippet makes its own with `createTag`.

### A different attribute

```tsx
const tag = createTag({ attributeName: 'data-ui' });
<ComponentDetailsProvider attributeName="data-ui">
```

### displayName mode

`nameSource="displayName"` labels components without tagging. It reads React's internal fiber data from DOM nodes and walks up to the components that rendered each element. When several components share one root element the badge shows the chain, outermost first, like `Card › Surface`.

Treat it as best effort and development only (verify):

- It relies on React internals that aren't a public API and can change in any release. I've tested it on React 19 only.
- Production builds minify component names, so the labels there are meaningless.
- It scans every element on the page after each DOM change, which is slower than attribute mode on big pages.
- Third-party library components show up too. Use `filter` to hide them.

### Theming

Every colour, size and position is a CSS custom property with a default. Set any of them on `:root` or on a wrapper.

```css
:root {
  --cdo-color-1: #0f766e;
  --cdo-badge-font-size: 12px;
  --cdo-badge-height: 20px;
  --cdo-z-index: 9000;
  --cdo-toggle-bg: #111;
  --cdo-toggle-accent: #5eead4;
}
```

| Group | Properties |
|---|---|
| Outline colours by depth | `--cdo-color-1` to `--cdo-color-5` |
| Outlines | `--cdo-outline-width`, `--cdo-outline-style`, `--cdo-outline-hover-width` |
| Badge | `--cdo-badge-text-color`, `--cdo-badge-font-family`, `--cdo-badge-font-size`, `--cdo-badge-font-weight`, `--cdo-badge-height`, `--cdo-badge-padding-x`, `--cdo-badge-radius`, `--cdo-badge-opacity`, `--cdo-badge-offset-x`, `--cdo-badge-offset-y`, `--cdo-badge-shadow` |
| Layer | `--cdo-z-index` |
| Toggle | `--cdo-toggle-bg`, `--cdo-toggle-bg-hover`, `--cdo-toggle-text`, `--cdo-toggle-accent`, `--cdo-toggle-track-off`, `--cdo-toggle-thumb-off`, `--cdo-toggle-thumb-on`, `--cdo-toggle-font-family`, `--cdo-toggle-font-size`, `--cdo-toggle-radius`, `--cdo-toggle-padding`, `--cdo-toggle-offset`, `--cdo-toggle-z-index` |

### Accessibility

The toggle card has a collapsed **Accessibility** section. Every choice is saved in localStorage with the other settings.

- **Text size.** Default, Large (1.35x) or Extra large (1.75x). It scales the badges and the toggle card together, and badge positions are measured at the larger size so labels don't overlap.
- **High contrast badges.** Solid black badges with a white edge and thicker solid outlines, for pages where the colour badges are hard to pick out.
- **Announce names to screen readers.** When keyboard focus enters a tagged component, a polite live region says its name and the component it sits inside, for example "Button component, inside Card". Badges follow keyboard focus too, so the overlay works without a mouse. Alt+Shift+C copies the focused component's name, and the result is announced.

Also built in:

- The switch is a real `role="switch"` button. The section uses native `details`, radio buttons and checkboxes, with visible focus rings and controls at least 24px tall.
- The overlay layer is `aria-hidden`, so the badges don't clutter a screen reader's view of the page. Only the live region is read.
- In Windows High Contrast and other forced-colour modes, badges and the toggle get system-colour borders so they stay visible.
- Animations stop when `prefers-reduced-motion` is set.

Hide the section with `showAccessibility={false}` on the toggle, or rename it with `accessibilityLabel`. Read or set the options from code with `useComponentDetails()`: `textSize`, `highContrast` and `announce`, plus their setters.

### Contrast

With `autoContrast` on (the default), the overlay checks the real colour behind each tagged component and adjusts the badge to meet WCAG 2.x:

- Badge text against the badge colour: at least 4.5:1 (AA for normal text).
- Badge against the page behind it: at least 3:1 (1.4.11, non-text contrast). The outline uses the same colour.

It tries your configured text colour first, then white, then a near-black. If none of them reaches 4.5:1 it keeps the hue of your `--cdo-color-N` and moves the lightness the shortest distance that passes. A colour that already passes is left alone, so on a plain white page the defaults barely change. On a dark page the same components get lighter badges with dark text.

How it reads the page:

- It walks up from each element to the first opaque background and blends any translucent layers on the way. If nothing is opaque it assumes the browser's default page colour for the current colour scheme.
- It re-reads backgrounds when the DOM changes, when the `class`, `style`, `data-theme`, `data-color-scheme` or `data-mode` attribute changes on `<html>`, and when `prefers-color-scheme` changes.
- It doesn't read background images or gradients. A badge over a photo is judged against the colour behind the photo.
- With `autoContrast` on, `--cdo-badge-text-color` is a preference. It's used only when it passes. Set `autoContrast={false}` to use your colours exactly.

The toggle uses its own `--cdo-toggle-*` colours. The defaults pass AA, but if you restyle it to match your app, check the contrast yourself.

### Font

The overlay and its toggle use [Lato](https://fonts.google.com/specimen/Lato). When the overlay is available, the provider adds one `<link>` to Google Fonts for Lato 400 and 700. It's added once, and skipped if your page already links Lato from Google Fonts. In a production build the overlay isn't available, so nothing is requested.

- Self-host or already load Lato: pass `loadFont={false}`.
- A different font: set `--cdo-badge-font-family` and `--cdo-toggle-font-family`, and pass `loadFont={false}`.
- A strict content security policy blocks the request. The text then falls back to `system-ui`. Allow `fonts.googleapis.com` and `fonts.gstatic.com`, or self-host.

The source is SCSS in `src/styles.scss`. The package ships the compiled `dist/styles.css`, so you don't need Sass.

## How it works

The overlay finds tagged elements, measures each one with `getBoundingClientRect`, and draws a box and badge for each on one fixed layer above the page. That layer has `pointer-events: none`. Your elements are never restyled.

It redraws on scroll (including scrolling inside containers), on window resize, when a tagged element changes size (`ResizeObserver`) and when the DOM changes (`MutationObserver`). All of those are batched into at most one update per animation frame. Boxes inside a scrolling container are clipped to that container, and boxes off screen aren't drawn.

## Limitations

- CSS transitions are followed while they run (the overlay re-measures every frame until they end, up to five seconds). CSS animations that move an element without changing its size or the DOM aren't tracked. The boxes catch up on the next scroll, resize or DOM change.
- The layer sits above everything, including modals. Outlines for components behind a modal backdrop still show through it.
- Badge collisions are handled between parents and children only. Siblings that start at the same point can still overlap.
- Elements inside iframes and shadow roots aren't found (verify).
- SSR frameworks: the provider reads storage after mount, so the first render matches the server. I haven't tested it in Next.js or Remix (verify). The build adds a `'use client'` banner for the Next.js App Router (verify).
- The CommonJS build is only tested with a plain `require` in Node (verify).
- Tested in Chrome only. Firefox and Safari (verify).

## Development

```bash
npm install
npm run demo        # demo app at http://localhost:5180
npm test            # unit tests (Vitest + jsdom)
npm run typecheck
npm run lint
npm run build       # dist/ with ES and CommonJS builds, types and styles.css
```

`npm run demo:build` followed by `npm run demo:preview` serves a production build of the demo at http://localhost:5181, where the overlay should render nothing.
