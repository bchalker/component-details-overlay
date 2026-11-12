import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentDetailsProvider, tag } from '../index';
import { contrast, parseColor, type RGB } from '../contrast';

let rect = { left: 10, top: 10 };

beforeEach(() => {
  rect = { left: 10, top: 10 };
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        x: rect.left, y: rect.top, left: rect.left, top: rect.top,
        right: rect.left + 100, bottom: rect.top + 50, width: 100, height: 50,
        toJSON: () => ({}),
      }) as DOMRect,
  );
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.head.querySelectorAll('link[data-cdo-font]').forEach((link) => link.remove());
});

async function frames(count = 2) {
  for (let i = 0; i < count; i++) {
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    });
  }
}

function Panel({ background }: { background?: string }) {
  return (
    <div {...tag('Panel')} style={{ background }}>
      body
    </div>
  );
}

const colorOf = (el: HTMLElement, prop: string) => parseColor(el.style.getPropertyValue(prop)) as RGB;

describe('auto contrast', () => {
  it.each([
    ['a white page', '#ffffff'],
    ['a near-black page', '#0b0f14'],
    ['a brand green page', '#2f6b4f'],
  ])('badge and text pass WCAG on %s', async (_name, background) => {
    render(
      <ComponentDetailsProvider defaultActive>
        <Panel background={background} />
      </ComponentDetailsProvider>,
    );
    await frames();
    const box = document.querySelector('.cdo-box') as HTMLElement;
    const fill = colorOf(box, '--_cdo-color');
    const text = colorOf(box, '--_cdo-text');
    const page = parseColor(background) as RGB;
    expect(contrast(text, fill)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(fill, page)).toBeGreaterThanOrEqual(3);
  });

  it('reads the background from an ancestor when the element has none', async () => {
    render(
      <ComponentDetailsProvider defaultActive>
        <div style={{ background: '#0b0f14' }}>
          <Panel />
        </div>
      </ComponentDetailsProvider>,
    );
    await frames();
    const box = document.querySelector('.cdo-box') as HTMLElement;
    expect(contrast(colorOf(box, '--_cdo-color'), parseColor('#0b0f14') as RGB)).toBeGreaterThanOrEqual(3);
  });

  it('leaves the colours alone when autoContrast is false', async () => {
    render(
      <ComponentDetailsProvider defaultActive autoContrast={false}>
        <Panel background="#ffffff" />
      </ComponentDetailsProvider>,
    );
    await frames();
    const box = document.querySelector('.cdo-box') as HTMLElement;
    expect(box.style.getPropertyValue('--_cdo-color')).toBe('');
    expect(box.style.getPropertyValue('--_cdo-text')).toBe('');
  });
});

describe('transitions', () => {
  const transform = () => (document.querySelector('.cdo-box') as HTMLElement).style.transform;

  it('follows an element while a transition runs, then stops', async () => {
    render(
      <ComponentDetailsProvider defaultActive>
        <Panel />
      </ComponentDetailsProvider>,
    );
    await frames();
    expect(transform()).toBe('translate(10px, 10px)');

    const el = document.querySelector('[data-component="Panel"]') as HTMLElement;
    rect = { left: 60, top: 10 };
    fireEvent(el, new Event('transitionrun', { bubbles: true }));
    await frames();
    expect(transform()).toBe('translate(60px, 10px)');

    // Still running, so a later move is picked up with no other event.
    rect = { left: 120, top: 10 };
    await frames();
    expect(transform()).toBe('translate(120px, 10px)');

    fireEvent(el, new Event('transitionend', { bubbles: true }));
    await frames();
    rect = { left: 200, top: 10 };
    await frames(3);
    expect(transform()).toBe('translate(120px, 10px)');
  });
});

describe('font', () => {
  const link = () => document.head.querySelector('link[data-cdo-font]') as HTMLLinkElement | null;

  it('loads Lato once', () => {
    const { rerender } = render(
      <ComponentDetailsProvider>
        <Panel />
      </ComponentDetailsProvider>,
    );
    expect(link()?.href).toContain('family=Lato');
    rerender(
      <ComponentDetailsProvider>
        <Panel />
      </ComponentDetailsProvider>,
    );
    expect(document.head.querySelectorAll('link[data-cdo-font]')).toHaveLength(1);
  });

  it('skips the request when loadFont is false, the overlay is disabled, or Lato is already linked', () => {
    render(
      <ComponentDetailsProvider loadFont={false}>
        <Panel />
      </ComponentDetailsProvider>,
    );
    expect(link()).toBeNull();
    cleanup();

    render(
      <ComponentDetailsProvider enabled={false}>
        <Panel />
      </ComponentDetailsProvider>,
    );
    expect(link()).toBeNull();
    cleanup();

    const existing = document.createElement('link');
    existing.rel = 'stylesheet';
    existing.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@900&display=swap';
    document.head.appendChild(existing);
    render(
      <ComponentDetailsProvider>
        <Panel />
      </ComponentDetailsProvider>,
    );
    expect(link()).toBeNull();
    existing.remove();
  });
});
