import { isProductionBuild } from './env';

export const DEFAULT_ATTRIBUTE = 'data-component';

export type TagAttrs = Record<string, string>;

export interface CreateTagOptions {
  /** Attribute to write. Must match the provider's `attributeName`. Default `data-component`. */
  attributeName?: string;
  /**
   * Whether to write the attribute at all. Defaults to true outside production builds.
   * Set it to true if you also pass `enabled` to the provider in production.
   */
  include?: boolean | (() => boolean);
}

/**
 * Returns a `tag(name)` function. Spread its result onto a component's root element:
 *
 *   const tag = createTag({ attributeName: 'data-ui' });
 *   <div {...tag('Card')}>
 */
export function createTag(options: CreateTagOptions = {}) {
  const attributeName = options.attributeName ?? DEFAULT_ATTRIBUTE;
  const include = options.include ?? (() => !isProductionBuild());
  return function tagWith(name: string): TagAttrs {
    const on = typeof include === 'function' ? include() : include;
    return on ? { [attributeName]: name } : {};
  };
}

/**
 * Marks an element as the root of a named component.
 *
 *   <button {...tag('Button')} className="btn">
 *
 * Writes `data-component="Button"` in development and nothing in a production build.
 */
export const tag = createTag();
