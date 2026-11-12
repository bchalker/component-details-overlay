# Auditing a live page against Figma

This is how I use the overlay as a designer to check a built page against its Figma file. The goal is to answer two questions for each screen:

1. Is each part of the page built from the component the design says it should be?
2. Is anything on the page built by hand, outside the component library?

You don't need to read code for this. A developer needs to have tagged the shared components once (see SETUP.md), ideally with the same names your Figma components use.

## Before you start

- Open the Figma frame for the screen you're checking, with the Layers panel visible.
- Open the same screen in the running app, in a development or review build where the toggle shows up.
- Have somewhere to write findings. A table with Screen, Element, Figma says, Page says and Notes columns works well.

## Steps

### 1. Switch the overlay on

Click the toggle. Every tagged component gets a dashed outline and a badge with its code name. Nested components get a different colour, so a Button inside a Card reads as a separate layer.

If the page gets busy, tick "Labels on hover only". The outlines stay and you see one badge at a time as you move the mouse.

### 2. Walk the page top to bottom against the Layers panel

For each section of the frame, find the matching outline on the page and compare names.

- **Names match.** The section uses the right component. Move on.
- **Names differ.** Note both. It might be a naming drift between code and Figma (same component, different name), or the wrong component. A developer can tell you which.
- **Figma has a component instance and the page has no badge.** This is the case to look at most closely. See the next step.

Alt/Option-click any outlined element to copy its name, then paste it into your notes so the spelling is exact.

### 3. Look for elements with no badge

An element with no outline is one of these:

- A plain element inside a tagged component, like a heading inside a Card. That's expected. Its parent's outline surrounds it.
- A component nobody has tagged yet. Ask a developer to add the tag.
- A custom element built by hand that bypasses the component library. The demo app has one on purpose: the yellow banner near the top is hand-built and untagged, while the cards around it have badges.

The last kind is what you're hunting for. Typical signs are a banner, badge, pill or button that looks close to a library component but has no outline of its own. Write each one down with where it appears and which Figma component it should be.

### 4. Check states and overlays

Open the things that only appear on interaction: modals, drawers, menus, tooltips, empty states and error states. The overlay finds components inside portals too, so a Modal and the Buttons inside it get badges like the rest of the page.

### 5. Share findings

For each finding, give the developer the screen, the copied name (or "no badge"), the Figma component it should be, and a screenshot with the overlay on. The outlines make it obvious which element you mean.

## Tips

- Agree on names early. When Figma and code use the same names, step 2 becomes reading two lists side by side.
- Audit one screen at a time and keep the list short. Ten clear findings get fixed faster than fifty mixed ones.
- If you can't find a badge for something you know is a library component, ask whether it's tagged before logging it as custom.
- displayName mode can label untagged components in development, but its names come from code and often include internal helper components. For audits, stick with tagged names (verify how useful it is on your codebase).
