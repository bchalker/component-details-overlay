import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useComponentDetails } from './ComponentDetailsProvider';
import { IGNORE_ATTRIBUTE } from './Overlay';
import { TEXT_SCALE } from './types';
import type { TextSize } from './types';

export type ToggleCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ComponentDetailsToggleProps {
  /** Switch label. Default "Component details". */
  label?: string;
  /** Checkbox label. Default "Labels on hover only". */
  hoverOnlyLabel?: string;
  /** Show the hover-only checkbox while the overlay is on. Default `true`. */
  showHoverOnly?: boolean;
  /** Show the collapsed "Accessibility" section. Default `true`. */
  showAccessibility?: boolean;
  /** Label for the accessibility section. Default "Accessibility". */
  accessibilityLabel?: string;
  /**
   * A short line under the switch that explains what it does. Plain text or any React node.
   * Leave it out for the compact toggle.
   */
  description?: ReactNode;
  /** Pin the toggle to a corner of the viewport. Leave it out to place it inline. */
  position?: ToggleCorner;
  className?: string;
  style?: CSSProperties;
}

// React 18 has useId. React 17 doesn't, so fall back to a counter there.
let idCounter = 0;
function useFallbackId() {
  const [id] = React.useState(() => `:cdo${++idCounter}:`);
  return id;
}
const useStableId: () => string =
  (React as unknown as { useId?: () => string }).useId ?? useFallbackId;

/**
 * A switch that turns the overlay on and off. Renders nothing when the overlay isn't
 * available (production without `enabled`, or no provider above it).
 */
export function ComponentDetailsToggle({
  label = 'Component details',
  hoverOnlyLabel = 'Labels on hover only',
  showHoverOnly = true,
  showAccessibility = true,
  accessibilityLabel = 'Accessibility',
  description,
  position,
  className,
  style,
}: ComponentDetailsToggleProps) {
  const {
    available, active, toggle, hoverOnly, setHoverOnly,
    textSize, setTextSize, highContrast, setHighContrast, announce, setAnnounce,
  } = useComponentDetails();
  const baseId = useStableId();
  const descriptionId = `${baseId}-desc`;
  const announceHintId = `${baseId}-announce`;
  if (!available) return null;
  const hasDescription = description !== undefined && description !== null && description !== false;

  const classes = ['cdo-toggle'];
  if (position) classes.push(`cdo-toggle--fixed`, `cdo-toggle--${position}`);
  if (active) classes.push('cdo-toggle--on');
  if (highContrast) classes.push('cdo-toggle--contrast');
  if (className) classes.push(className);

  return (
    <div className={classes.join(' ')} style={{ ...style, '--_cdo-scale': TEXT_SCALE[textSize] } as CSSProperties}
      {...{ [IGNORE_ATTRIBUTE]: '' }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-describedby={hasDescription ? descriptionId : undefined}
        className="cdo-toggle__switch"
        onClick={toggle}
        title="Show each tagged component's name. Alt/Option-click a component to copy its name."
      >
        <span className="cdo-toggle__label">{label}</span>
        <span className="cdo-toggle__track" aria-hidden="true">
          <span className="cdo-toggle__thumb" />
        </span>
      </button>
      {hasDescription && (
        <p id={descriptionId} className="cdo-toggle__desc">
          {description}
        </p>
      )}
      {active && showHoverOnly && (
        <label className="cdo-toggle__option">
          <input
            type="checkbox"
            checked={hoverOnly}
            onChange={(event) => setHoverOnly(event.target.checked)}
          />
          {hoverOnlyLabel}
        </label>
      )}
      {showAccessibility && (
        <details className="cdo-a11y">
          <summary className="cdo-a11y__summary">{accessibilityLabel}</summary>
          <div className="cdo-a11y__body">
            <fieldset className="cdo-a11y__group">
              <legend>Text size</legend>
              {(
                [
                  ['normal', 'Default'],
                  ['large', 'Large'],
                  ['xlarge', 'Extra large'],
                ] as Array<[TextSize, string]>
              ).map(([value, text]) => (
                <label key={value} className="cdo-a11y__choice">
                  <input
                    type="radio"
                    name={`${baseId}-size`}
                    checked={textSize === value}
                    onChange={() => setTextSize(value)}
                  />
                  {text}
                </label>
              ))}
            </fieldset>
            <label className="cdo-a11y__row">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(event) => setHighContrast(event.target.checked)}
              />
              High contrast badges
            </label>
            <label className="cdo-a11y__row">
              <input
                type="checkbox"
                checked={announce}
                aria-describedby={announceHintId}
                onChange={(event) => setAnnounce(event.target.checked)}
              />
              Announce names to screen readers
            </label>
            <p id={announceHintId} className="cdo-a11y__hint">
              Speaks a component's name when keyboard focus enters it. Badges follow focus, and
              Alt+Shift+C copies the focused component's name.
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
