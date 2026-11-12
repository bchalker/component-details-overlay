import { ComponentDetailsToggle, useComponentDetails } from 'component-details-overlay';

const OFF_TEXT = 'Turn on to outline each tagged component and label it with its name.';
const ON_TEXT = 'Outlining each tagged component with its name. Alt/Option-click one to copy it.';

/** The corner toggle card with a description that follows the switch. */
export function DemoToggle() {
  const { active } = useComponentDetails();
  // Both texts share one grid cell and the inactive one is hidden, so the card keeps the
  // same height in either state and the switch doesn't move when it is toggled.
  return (
    <ComponentDetailsToggle
      position="bottom-right"
      description={
        <span className="demo-desc">
          <span data-current={!active}>{OFF_TEXT}</span>
          <span data-current={active}>{ON_TEXT}</span>
        </span>
      }
    />
  );
}
