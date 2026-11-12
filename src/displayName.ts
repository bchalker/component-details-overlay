/**
 * displayName mode. Best effort and development only.
 *
 * React doesn't put component names in the DOM. It does attach its internal "fiber" object
 * to each DOM node under a key that starts with `__reactFiber$`. We walk up from a DOM
 * node's fiber to the components that rendered it. These internals are undocumented and
 * can change in any React release. Production builds also minify function names, so the
 * names you get there are meaningless.
 */

interface Fiber {
  tag: number;
  type: unknown;
  return: Fiber | null;
  alternate: Fiber | null;
}

// React's work tags. Stable from React 17 through 19 as far as we know.
const FUNCTION_COMPONENT = 0;
const CLASS_COMPONENT = 1;
const FORWARD_REF = 11;
const MEMO = 14;
const SIMPLE_MEMO = 15;
const COMPOSITE_TAGS = new Set([FUNCTION_COMPONENT, CLASS_COMPONENT, FORWARD_REF, MEMO, SIMPLE_MEMO]);

// Host root, host portal, host element, hoistable, singleton, text.
const HOST_TAGS = new Set([3, 4, 5, 6, 26, 27]);

function getFiber(node: Element): Fiber | null {
  for (const key in node) {
    if (key.startsWith('__reactFiber$')) {
      return (node as unknown as Record<string, Fiber>)[key] ?? null;
    }
  }
  return null;
}

function nameOfType(type: unknown, tag: number): string | null {
  if (!type) return null;
  const t = type as {
    displayName?: string;
    name?: string;
    render?: { displayName?: string; name?: string };
    type?: unknown;
  };
  if (t.displayName) return t.displayName;
  if (tag === FORWARD_REF && t.render) return t.render.displayName || t.render.name || null;
  if (tag === MEMO && t.type) return nameOfType(t.type, FUNCTION_COMPONENT);
  return t.name || null;
}

// The overlay's own components never get a label.
const OWN_COMPONENTS = new Set(['ComponentDetailsProvider', 'ComponentDetailsToggle']);

/** Joins the component names that share one root element, outermost first. */
export const CHAIN_SEPARATOR = ' › ';

/**
 * If `node` is the outermost DOM element one or more components rendered, returns their
 * names. Several components can share a root element (a Card that renders a Surface that
 * renders a <div>), so the label is the chain, outermost first: "Card › Surface".
 */
export function componentForRootElement(
  node: Element,
  seen: WeakSet<object>,
  filter: (name: string) => boolean,
): { name: string; owner: object } | null {
  const fiber = getFiber(node);
  if (!fiber) return null;

  const names: string[] = [];
  let innermost: Fiber | null = null;
  let current = fiber.return;
  while (current && !HOST_TAGS.has(current.tag)) {
    if (COMPOSITE_TAGS.has(current.tag)) {
      const name = nameOfType(current.type, current.tag);
      if (name && !OWN_COMPONENTS.has(name) && filter(name)) {
        names.unshift(name);
        innermost ??= current;
      }
    }
    current = current.return;
  }
  if (!innermost) return null;

  // A component that returns a fragment has several root elements. Label only the first.
  if (seen.has(innermost) || (innermost.alternate && seen.has(innermost.alternate))) return null;
  seen.add(innermost);
  if (innermost.alternate) seen.add(innermost.alternate);
  return { name: names.join(CHAIN_SEPARATOR), owner: innermost };
}
