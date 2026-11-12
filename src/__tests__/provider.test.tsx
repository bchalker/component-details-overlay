import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ComponentDetailsProvider,
  ComponentDetailsToggle,
  tag,
  useComponentDetails,
} from '../index';

// jsdom has no layout, so give every element a size or the overlay skips it as hidden.
beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 10, y: 10, left: 10, top: 10, right: 110, bottom: 60, width: 100, height: 50,
    toJSON: () => ({}),
  } as DOMRect);
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

async function nextFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  });
}

function DemoCard() {
  return <div {...tag('DemoCard')}>Card body</div>;
}

describe('ComponentDetailsProvider', () => {
  it('shows a badge for each tagged element when switched on', async () => {
    render(
      <ComponentDetailsProvider>
        <ComponentDetailsToggle />
        <DemoCard />
      </ComponentDetailsProvider>,
    );
    expect(document.querySelector('.cdo-layer')).toBeNull();

    fireEvent.click(screen.getByRole('switch'));
    await nextFrame();

    const badges = document.querySelectorAll('.cdo-badge');
    expect(badges).toHaveLength(1);
    expect(badges[0].textContent).toBe('DemoCard');
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('renders nothing extra when enabled is false', () => {
    render(
      <ComponentDetailsProvider enabled={false} defaultActive>
        <ComponentDetailsToggle />
        <DemoCard />
      </ComponentDetailsProvider>,
    );
    expect(screen.queryByRole('switch')).toBeNull();
    expect(document.querySelector('.cdo-layer')).toBeNull();
    expect(screen.getByText('Card body')).toBeTruthy();
  });

  it('is off by default in a production build', () => {
    vi.stubEnv('NODE_ENV', 'production');
    let available: boolean | undefined;
    function Probe() {
      available = useComponentDetails().available;
      return null;
    }
    render(
      <ComponentDetailsProvider defaultActive>
        <Probe />
        <ComponentDetailsToggle />
      </ComponentDetailsProvider>,
    );
    expect(available).toBe(false);
    expect(screen.queryByRole('switch')).toBeNull();
    expect(document.querySelector('.cdo-layer')).toBeNull();
  });

  it('saves the setting under the storage key', async () => {
    render(
      <ComponentDetailsProvider storageKey="test-key">
        <ComponentDetailsToggle />
      </ComponentDetailsProvider>,
    );
    fireEvent.click(screen.getByRole('switch'));
    await nextFrame();
    expect(JSON.parse(window.localStorage.getItem('test-key') ?? '{}')).toEqual({
      active: true,
      hoverOnly: false,
      textSize: 'normal',
      highContrast: false,
      announce: false,
    });
  });

  it('copies a name on Alt-click and reports it through onCopy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const onCopy = vi.fn();
    const onCardClick = vi.fn();

    render(
      <ComponentDetailsProvider defaultActive onCopy={onCopy}>
        <div {...tag('DemoCard')} onClick={onCardClick}>
          <span>inner</span>
        </div>
      </ComponentDetailsProvider>,
    );
    await nextFrame();

    await act(async () => {
      fireEvent.click(screen.getByText('inner'), { altKey: true });
    });

    expect(writeText).toHaveBeenCalledWith('DemoCard');
    expect(onCopy).toHaveBeenCalledWith(expect.objectContaining({ name: 'DemoCard', copied: true }));
    expect(onCardClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('inner'));
    expect(onCardClick).toHaveBeenCalledTimes(1);
  });

  it('reads component names in displayName mode', async () => {
    function DemoButton() {
      return <button type="button">Go</button>;
    }
    render(
      <ComponentDetailsProvider defaultActive nameSource="displayName">
        <DemoButton />
      </ComponentDetailsProvider>,
    );
    await nextFrame();
    const names = Array.from(document.querySelectorAll('.cdo-badge')).map((b) => b.textContent);
    expect(names.some((n) => n?.endsWith('DemoButton'))).toBe(true);
  });
});

describe('saved settings', () => {
  it('restores a saved "on" setting instead of overwriting it with the default', async () => {
    window.localStorage.setItem('component-details-overlay', JSON.stringify({ active: true, hoverOnly: true }));
    const { StrictMode } = await import('react');
    render(
      <StrictMode>
        <ComponentDetailsProvider>
          <ComponentDetailsToggle />
          <DemoCard />
        </ComponentDetailsProvider>
      </StrictMode>,
    );
    await nextFrame();
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
    expect(JSON.parse(window.localStorage.getItem('component-details-overlay') ?? '{}')).toEqual({
      active: true,
      hoverOnly: true,
    });
  });
});

describe('ComponentDetailsToggle description', () => {
  it('shows the description and links it to the switch', () => {
    render(
      <ComponentDetailsProvider>
        <ComponentDetailsToggle description="Outlines tagged components." />
      </ComponentDetailsProvider>,
    );
    const text = screen.getByText('Outlines tagged components.');
    const toggle = screen.getByRole('switch');
    expect(toggle.getAttribute('aria-describedby')).toBe(text.id);
  });

  it('renders no description element when none is given', () => {
    const { container } = render(
      <ComponentDetailsProvider>
        <ComponentDetailsToggle />
      </ComponentDetailsProvider>,
    );
    expect(container.querySelector('.cdo-toggle__desc')).toBeNull();
    expect(screen.getByRole('switch').getAttribute('aria-describedby')).toBeNull();
  });
});

describe('accessibility options', () => {
  function setup() {
    return render(
      <ComponentDetailsProvider defaultActive>
        <ComponentDetailsToggle />
        <DemoCard />
        <button {...tag('Inner')}>Inner</button>
      </ComponentDetailsProvider>,
    );
  }

  it('keeps the Accessibility section collapsed by default', () => {
    setup();
    const details = document.querySelector('details.cdo-a11y') as HTMLDetailsElement;
    expect(details).not.toBeNull();
    expect(details.open).toBe(false);
    expect(details.querySelector('summary')?.textContent).toBe('Accessibility');
  });

  it('scales the badges and saves the choice', async () => {
    setup();
    await nextFrame();
    fireEvent.click(screen.getByLabelText('Large'));
    await nextFrame();
    const layer = document.querySelector('.cdo-layer') as HTMLElement;
    expect(layer.style.getPropertyValue('--_cdo-scale')).toBe('1.35');
    expect(JSON.parse(window.localStorage.getItem('component-details-overlay') ?? '{}').textSize).toBe('large');
  });

  it('turns on high contrast', async () => {
    setup();
    await nextFrame();
    fireEvent.click(screen.getByLabelText('High contrast badges'));
    expect(document.querySelector('.cdo-layer--contrast')).not.toBeNull();
  });

  it('announces the focused component when asked to', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    setup();
    await nextFrame();
    fireEvent.click(screen.getByLabelText('Announce names to screen readers'));
    const button = document.querySelector('button[data-component="Inner"]') as HTMLElement;
    act(() => button.focus());
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(document.querySelector('[role="status"]')?.textContent).toBe('Inner component');
    vi.useRealTimers();
  });

  it('can hide the section', () => {
    render(
      <ComponentDetailsProvider defaultActive>
        <ComponentDetailsToggle showAccessibility={false} />
      </ComponentDetailsProvider>,
    );
    expect(document.querySelector('details.cdo-a11y')).toBeNull();
  });
});
