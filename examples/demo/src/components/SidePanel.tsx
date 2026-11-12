import { useState } from 'react';
import { tag, type NameSource } from 'component-details-overlay';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  onOpenModal: () => void;
  source: NameSource;
  onSourceChange: (source: NameSource) => void;
}

const MODES = {
  attribute: {
    title: 'Tags (recommended)',
    body: [
      'You add one small tag to the outermost element of a component. The badge shows exactly the name you wrote.',
      'An element with no tag gets no badge, which is how you spot things built outside your component set. Safe for production builds: tag() writes nothing there.',
    ],
    code: '<section {...tag(\'Card\')} className="card">',
  },
  displayName: {
    title: 'React names',
    body: [
      'Nothing to add. The overlay reads each component\u2019s name from React, so every component gets a badge. When two components share one element you see both, like Card \u203a Surface.',
      'Development only. It relies on React internals, and production builds rename components.',
    ],
    code: '<ComponentDetailsProvider nameSource="displayName">',
  },
} as const;

const AI_PROMPT =
  "Add component-details-overlay to this project. Install it with npm (if npm can't find it, use github:bchalker/component-details-overlay), then read node_modules/component-details-overlay/AI-SETUP.md and follow it.";

/**
 * Demo only. A fixed panel at z-index 50 that slides in from the left, so there is
 * something on a different layer for the overlay to label.
 */
export function SidePanel({ open, onClose, onOpenModal, source, onSourceChange }: SidePanelProps) {
  const mode = MODES[source];
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked. The prompt is on screen to select by hand.
    }
  };
  return (
    <aside {...tag('SidePanel')} id="demo-panel" className="side-panel" data-open={open} aria-label="Try it">
      <div className="side-panel__head">
        <h2>Try it</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close panel">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      </div>

      <div className="demo-note">
        <strong>Demo only</strong>
        <p>
          This panel, and the modal the button below opens, are here to show the overlay working on
          elements at different z-index levels. The panel is fixed at z-index 50 and the modal is
          portalled to the body at z-index 100. The toggle sits above both.
        </p>
      </div>

      <ol className="panel-steps">
        <li>Switch on Component details with the toggle in the bottom-right corner.</li>
        <li>Hover a component to outline it.</li>
        <li>
          <span>
            Hold <kbd>Alt</kbd> (<kbd>Option</kbd> on Mac) and click a component to copy its name.
          </span>
        </li>
        <li>Tick &ldquo;Labels on hover only&rdquo; to show one badge at a time.</li>
        <li>Open the modal to see badges on an element that sits on top of everything else.</li>
      </ol>

      <Button onClick={onOpenModal}>Open a modal</Button>

      <section className="panel-section" aria-labelledby="names-heading">
        <h3 id="names-heading">Where badge names come from</h3>
        <p className="panel-lead">
          Every badge shows a component&rsquo;s name. Choose how the overlay finds it, then watch the badges on the page.
        </p>
        <SegmentedControl
          label="How badge names are found"
          hideLabel
          describedBy="names-desc"
          value={source}
          onChange={onSourceChange}
          options={[
            { value: 'attribute', label: 'Tags' },
            { value: 'displayName', label: 'React names' },
          ]}
        />
        <div id="names-desc" className="mode-card" aria-live="polite">
          <strong>{mode.title}</strong>
          {mode.body.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <pre><code>{mode.code}</code></pre>
        </div>
      </section>

      <section className="panel-section" aria-labelledby="add-heading">
        <h3 id="add-heading">Add it to your project</h3>
        <p className="panel-lead">
          Paste this into Claude Code, Cursor, Copilot or any AI coding tool, from inside your project. It installs the
          package, sets it up and tags your shared components.
        </p>
        <div className="prompt-box">
          <pre><code>{AI_PROMPT}</code></pre>
        </div>
        <Button onClick={copyPrompt}>{copied ? 'Copied' : 'Copy prompt'}</Button>
        <span className="sr-only" role="status">{copied ? 'Prompt copied to the clipboard' : ''}</span>
      </section>

      <details className="panel-section panel-details">
        <summary>Or (if ur cool) set it up by hand</summary>
        <ol className="panel-steps panel-steps--code">
          <li>
            <div>
              <p>Install it. Until it is published, install from a local clone.</p>
              <pre><code>npm install component-details-overlay</code></pre>
            </div>
          </li>
          <li>
            <div>
              <p>Wrap your app and add the toggle.</p>
              <pre><code>{`import {
  ComponentDetailsProvider,
  ComponentDetailsToggle,
} from 'component-details-overlay';
import 'component-details-overlay/styles.css';

<ComponentDetailsProvider>
  <App />
  <ComponentDetailsToggle position="bottom-right" />
</ComponentDetailsProvider>`}</code></pre>
            </div>
          </li>
          <li>
            <div>
              <p>Tag each component on its outermost element.</p>
              <pre><code>{`import { tag } from 'component-details-overlay';

<section {...tag('Card')}>`}</code></pre>
            </div>
          </li>
        </ol>
      </details>
    </aside>
  );
}
