import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTag, tag } from '../tag';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('tag', () => {
  it('writes data-component outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(tag('DemoCard')).toEqual({ 'data-component': 'DemoCard' });
  });

  it('writes nothing in a production build', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(tag('DemoCard')).toEqual({});
  });

  it('can use another attribute and be forced on', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const custom = createTag({ attributeName: 'data-ui', include: true });
    expect(custom('DemoCard')).toEqual({ 'data-ui': 'DemoCard' });
  });
});
