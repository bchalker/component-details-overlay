---
name: component-details-overlay
description: Use when the user wants component names shown on the live page, asks to add or set up component-details-overlay, or when creating React components in a project that already uses it.
---

# component-details-overlay

This project can show a badge with each component's name on the live page, using the `component-details-overlay` package.

## Setting it up

If the package isn't installed yet, install it (`npm install component-details-overlay`, or `npm install github:bchalker/component-details-overlay` if npm can't find it). Then read `node_modules/component-details-overlay/AI-SETUP.md` and follow it.

## Creating or editing components

If the project already uses the overlay, add `{...tag('ComponentName')}` to the outermost DOM element of every new React component:

```tsx
import { tag } from 'component-details-overlay';

export function Card({ children }) {
  return <section {...tag('Card')} className="card">{children}</section>;
}
```

- The name matches the component's own name, in PascalCase.
- In a Next.js Server Component, import `tag` from `component-details-overlay/tag`.
- A component that only renders another tagged component and adds no element of its own doesn't need a tag.
