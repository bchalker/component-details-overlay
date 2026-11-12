# Setting up component-details-overlay (for AI coding tools)

This file is written for an AI coding agent such as Claude Code, Cursor, Copilot, Windsurf or Codex. If a person asked you to "add component-details-overlay to this project", follow these steps in order.

The overlay is a development tool. With it switched on, every tagged component on the page gets an outline and a badge with its name. It is off in production builds by default.

## 1. Check the project

- Read `package.json`. The project must use React 17 or later. If it doesn't, stop and tell the person.
- Find the package manager from the lockfile (`package-lock.json` is npm, `pnpm-lock.yaml` is pnpm, `yarn.lock` is yarn, `bun.lockb` or `bun.lock` is bun).
- Find the framework: Vite, Next.js (App Router has an `app/` folder, Pages Router has `pages/`), Create React App, Remix or something else.

## 2. Install

```bash
npm install component-details-overlay
```

Use the project's own package manager. If the package isn't found on npm, install it from GitHub instead:

```bash
npm install github:bchalker/component-details-overlay
```

## 3. Import the stylesheet once

Add this to the app's entry file:

```ts
import 'component-details-overlay/styles.css';
```

- Vite or Create React App: `src/main.tsx` or `src/index.tsx`
- Next.js App Router: `app/layout.tsx`
- Next.js Pages Router: `pages/_app.tsx`

If TypeScript reports that it can't find the module or types for `component-details-overlay/styles.css`, add a declaration file such as `src/overlay.d.ts` containing `declare module 'component-details-overlay/styles.css';`. Most Vite and Next.js projects don't need this.

## 4. Add the provider and the toggle

Wrap the app once, high enough to cover every page.

Vite or Create React App:

```tsx
import {
  ComponentDetailsProvider,
  ComponentDetailsToggle,
} from 'component-details-overlay';

createRoot(document.getElementById('root')!).render(
  <ComponentDetailsProvider>
    <App />
    <ComponentDetailsToggle position="bottom-right" />
  </ComponentDetailsProvider>,
);
```

Next.js App Router: the provider is a client component. Make a small client file and use it in the root layout.

```tsx
// components/dev-overlay.tsx
'use client';
import type { ReactNode } from 'react';
import {
  ComponentDetailsProvider,
  ComponentDetailsToggle,
} from 'component-details-overlay';

export function DevOverlay({ children }: { children: ReactNode }) {
  return (
    <ComponentDetailsProvider>
      {children}
      <ComponentDetailsToggle position="bottom-right" />
    </ComponentDetailsProvider>
  );
}
```

Then wrap `{children}` with `<DevOverlay>` in `app/layout.tsx`.

If the app already has a place for developer controls, such as a sidebar or a debug menu, you can put `<ComponentDetailsToggle />` there without `position` instead. Otherwise use `bottom-right`.

## 5. Tag components

A component gets a badge only if its outermost DOM element carries a tag. Add `{...tag('Name')}` to that element.

```tsx
import { tag } from 'component-details-overlay';

export function Card({ title, children }) {
  return (
    <section {...tag('Card')} className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

Rules:

- Tag the shared UI components first: the design system or `components/ui` folder, such as Button, Card, Input, Modal, Table, Badge, Tabs, Avatar. Start with up to 15. If there are more, list the rest in your report instead of tagging everything.
- Put the tag on the outermost DOM element the component renders.
- The name is the component's own name, in PascalCase, matching the file or export name.
- If a component only renders another tagged component and adds no element of its own, don't tag it.
- If the root element already spreads `...rest` props, put `{...tag('Name')}` before the spread so a caller can still override it.
- Portal content (modals, popovers): tag the element inside the portal.
- Next.js: in a Server Component, import from `component-details-overlay/tag` (`import { tag } from 'component-details-overlay/tag'`). Client components can import from `component-details-overlay` as usual.
- Don't change styles, props, markup structure or behavior. Only add the tag.

## 6. Check your work

- Run the project's typecheck and build or lint commands if it has them, and fix anything you caused.
- If you can run the dev server and a browser, switch the toggle on and confirm that badges appear. Otherwise say you couldn't check it in a browser.
- The overlay and `tag()` write nothing in production builds, so no production setup is needed.

## 7. Tell the person what you did

Report these four things, briefly:

1. Which files you changed.
2. Which components you tagged, and any you left for later.
3. How to use it: switch on "Component details" in the bottom-right corner, hover a component to outline it, hold Alt (Option on Mac) and click to copy its name.
4. How to tag one more component: `{...tag('Name')}` on its outermost element.

Don't commit or push unless the person asked you to.

## Optional: make future components tagged automatically

If the person wants new components to get tags without asking, copy the rule file for their tool:

```bash
# Claude Code (project skill)
mkdir -p .claude/skills/component-details-overlay
cp node_modules/component-details-overlay/ai/claude-code/SKILL.md .claude/skills/component-details-overlay/

# Cursor (project rule)
mkdir -p .cursor/rules
cp node_modules/component-details-overlay/ai/cursor/component-details-overlay.mdc .cursor/rules/
```

For other tools, add this to `AGENTS.md`, `CLAUDE.md` or `.github/copilot-instructions.md`:

```md
This project uses component-details-overlay. When you create a React component, add `{...tag('ComponentName')}` from `component-details-overlay` to its outermost DOM element.
```
