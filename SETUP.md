# Adding the overlay to an existing React app

These steps assume a React 17+ app built with Vite, webpack or Next.js. Only the Vite path has been run end to end. The others are marked (verify).

## 1. Install

From npm, once it's published:

```bash
npm install component-details-overlay
```

From GitHub, which builds on install:

```bash
npm install github:bchalker/component-details-overlay
```

Or from a local clone:

```bash
cd path/to/component-details-overlay
npm install
npm run build
cd path/to/your-app
npm install ../path/to/component-details-overlay
```

If you install from a clone, run `npm run build` in the clone again after pulling changes. Your app uses `dist/`.

## 2. Import the stylesheet once

Put this in your entry file (`main.tsx`, `index.tsx`, or `app/layout.tsx` in Next.js):

```ts
import 'component-details-overlay/styles.css';
```

## 3. Wrap the app in the provider

Put the provider high enough to cover every page, usually around your router or root layout.

```tsx
import { ComponentDetailsProvider } from 'component-details-overlay';

createRoot(document.getElementById('root')!).render(
  <ComponentDetailsProvider>
    <App />
  </ComponentDetailsProvider>,
);
```

In development it's on by default. In a production build it renders only its children.

For Next.js App Router, the provider is a client component. Import it from a file marked `'use client'` and wrap `{children}` in your root layout with it. In a Server Component, import `tag` from `component-details-overlay/tag` instead of the main entry (verify).

## 4. Place the toggle

Inline, wherever you keep developer controls:

```tsx
import { ComponentDetailsToggle } from 'component-details-overlay';

<nav className="sidebar">
  {/* ...your links... */}
  <ComponentDetailsToggle />
</nav>
```

Or pinned to a corner of the viewport:

```tsx
<ComponentDetailsToggle position="bottom-right" />
```

The toggle renders nothing when the overlay isn't available, so it's safe to leave in production code.

## 5. Tag your components

Start with the shared components in your design system folder, since those are the ones you'll compare against the design file.

```tsx
import { tag } from 'component-details-overlay';

export function Button(props) {
  return <button {...tag('Button')} className="btn" {...props} />;
}
```

Rules of thumb:

- Spread `tag()` on the outermost DOM element the component renders.
- Use the same name the design file uses for the component, so an audit can match them one to one.
- If a component already spreads `...rest` props onto its root, put `tag()` before `...rest` so a caller can still override it, or after it if you want the tag to win.
- For components that render through a portal (modals, popovers), tag the element inside the portal. The overlay finds it anywhere in the document.
- Components from a third-party library can't be tagged directly. Wrap them in your own component and tag the wrapper's root, or try displayName mode.

Run the app, switch the toggle on, and check the badges show up.

## 6. Optional: show a message when a name is copied

Alt/Option-click copies a component's name. Hook it to whatever notification you already use:

```tsx
<ComponentDetailsProvider
  onCopy={({ name, copied }) =>
    copied ? notify(`Copied "${name}"`) : notify(`Couldn't copy "${name}"`)
  }
>
```

## 7. Optional: match your app's look

Set the custom properties on `:root`. See the Theming table in the README.

```css
:root {
  --cdo-toggle-bg: var(--your-sidebar-bg);
  --cdo-toggle-text: var(--your-sidebar-text);
  --cdo-toggle-accent: var(--your-accent);
}
```

If something in your app has a higher z-index than the overlay, raise `--cdo-z-index`.

## 8. Optional: include it in a review or staging build

Production builds leave the overlay out. To include it on a staging deploy, drive both the provider and the tag helper from one flag. In Vite:

```ts
// src/componentDetails.ts
import { createTag } from 'component-details-overlay';

export const SHOW_COMPONENT_DETAILS =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_COMPONENT_DETAILS === 'true';

export const tag = createTag({ include: SHOW_COMPONENT_DETAILS });
```

```tsx
<ComponentDetailsProvider enabled={SHOW_COMPONENT_DETAILS}>
```

Import `tag` from your own `componentDetails.ts` instead of from the package, then set `VITE_SHOW_COMPONENT_DETAILS=true` in the staging environment only. With webpack or Next.js, use `process.env` and that tool's way of exposing env vars to the browser (verify).

## Troubleshooting

**No toggle appears.** Check that the toggle is inside the provider, and that the build isn't a production build. In production you need `enabled`.

**The toggle works but no badges appear.** Check the elements in your browser's inspector for `data-component`. If the attribute is missing, the component isn't tagged, or `tag()` is running in a production build. If you set `attributeName`, the tags need to use the same name through `createTag`.

**Badges sit in the wrong place after an animation.** Boxes are updated on scroll, resize and DOM changes. Movement that triggers none of those is picked up on the next one.

**A modal looks cut away behind its backdrop.** Outlines of elements an opaque modal covers are hidden, so the modal stays clean. A translucent backdrop still shows the labels behind it, which is intended.
