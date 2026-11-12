import { useState } from 'react';
import { ComponentDetailsToggle, useComponentDetails } from 'component-details-overlay';
import { Button } from './Button';

const OFF_TEXT = 'Turn on to outline each tagged component and label it with its name.';
const ON_TEXT = 'Outlining each tagged component with its name. Alt/Option-click one to copy it.';

export function Dock({ onOpenModal }: { onOpenModal: () => void }) {
  const { active } = useComponentDetails();
  const [open, setOpen] = useState(false);
  // Both texts sit in the same grid cell and the inactive one is hidden, so the card keeps
  // the same height in either state and the switch doesn't move when it is toggled.
  const description = (
    <span className="dock__desc">
      <span data-current={!active}>{OFF_TEXT}</span>
      <span data-current={active}>{ON_TEXT}</span>
    </span>
  );

  return (
    <section className="dock" aria-labelledby="dock-title" data-open={open}>
      <div className="dock__inner">
        <div className="dock__main">
          <div className="dock__head">
            <h2 id="dock-title">Try it</h2>
            <div className="dock__actions">
              <Button variant="secondary" onClick={onOpenModal}>
                Open a modal
              </Button>
              <button
                type="button"
                className="dock__collapse"
                aria-expanded={open}
                aria-controls="dock-steps"
                onClick={() => setOpen((value) => !value)}
              >
                <span className="visually-hidden">{open ? 'Hide steps' : 'Show steps'}</span>
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="m5 12 5-5 5 5" />
                </svg>
              </button>
            </div>
          </div>

          <ol id="dock-steps" className="dock__steps">
            <li>Switch on the toggle.</li>
            <li>Hover a component to outline it.</li>
            <li>
              <span>
                Hold <kbd>Alt</kbd> (<kbd>Option</kbd> on Mac) and click a component to copy its name.
              </span>
            </li>
            <li>Tick "Labels on hover only", or change the name source at the top.</li>
          </ol>
        </div>

        <div className="dock__toggle">
          <ComponentDetailsToggle description={description} />
        </div>
      </div>
    </section>
  );
}
