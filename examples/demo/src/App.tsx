import { useCallback, useEffect, useState } from 'react';
import { ComponentDetailsProvider, type CopyDetail } from 'component-details-overlay';
import { Button } from './components/Button';
import { Card, StatCard } from './components/Card';
import { DemoToggle } from './components/DemoToggle';
import { Modal } from './components/Modal';
import { SidePanel } from './components/SidePanel';
import { StatusBadge, type Status } from './components/StatusBadge';
import { Table, type Column } from './components/Table';
import { Usage } from './components/Usage';
import type { NameSource } from 'component-details-overlay';

interface Row {
  id: string;
  name: string;
  what: string;
  status: Status;
  /** The line shown in the modal. */
  code: string;
}

// Every component below is used on this page. Clicking a row shows how it is tagged.
const ROWS: Row[] = [
  { id: 'Button', name: 'Button', what: 'Actions, including the one in this card', status: 'Tagged', code: "<button {...tag('Button')} className=\"btn\">" },
  { id: 'StatCard', name: 'StatCard', what: 'A number with a label, at the top of the page', status: 'Tagged', code: "<div {...tag('StatCard')} className=\"stat\">" },
  { id: 'Card', name: 'Card', what: 'A titled section, like this one', status: 'Tagged', code: "<section {...tag('Card')} className=\"card\">" },
  { id: 'Table', name: 'Table', what: 'This table, which scrolls on its own', status: 'Tagged', code: "<div {...tag('Table')} className=\"table-wrap\">" },
  { id: 'StatusBadge', name: 'StatusBadge', what: 'The pill in the last column', status: 'Tagged', code: "<span {...tag('StatusBadge')} className=\"status\">" },
  { id: 'SidePanel', name: 'SidePanel', what: 'The panel on the left, fixed at z-index 50', status: 'Tagged', code: "<aside {...tag('SidePanel')} className=\"side-panel\">" },
  { id: 'SegmentedControl', name: 'SegmentedControl', what: 'The Tags and React names switch in the panel', status: 'Tagged', code: "<div {...tag('SegmentedControl')} role=\"group\">" },
  { id: 'Modal', name: 'Modal', what: 'The dialog you are looking at, at z-index 100', status: 'Tagged', code: "<div {...tag('Modal')} role=\"dialog\">" },
  { id: 'Banner', name: 'Banner', what: 'The yellow notice near the top', status: 'Untagged', code: '<div className="promo">  (no tag, so the overlay skips it)' },
];

const COLUMNS: Column<Row>[] = [
  { key: 'name', label: 'Component' },
  { key: 'what', label: 'Where it is' },
  { key: 'status', label: 'Tag', render: (row) => <StatusBadge status={row.status} /> },
];

const REPO_URL = 'https://github.com/bchalker/component-details-overlay';
const ANGULAR_URL = 'https://github.com/bchalker/ngx-component-details-overlay';

export function App() {
  const [source, setSource] = useState<NameSource>('attribute');
  const [selected, setSelected] = useState<Row | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // The panel slides in once the page has loaded.
  useEffect(() => {
    const timer = window.setTimeout(() => setPanelOpen(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  const onCopy = useCallback(({ name, copied }: CopyDetail) => {
    setToast(copied ? `Copied "${name}"` : `Couldn't copy "${name}"`);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  return (
    <ComponentDetailsProvider nameSource={source} onCopy={onCopy}>
      <div className="page-wrap" data-panel={panelOpen}>
        <div className="page">
          <header className="page__header">
            <div>
              <p className="eyebrow">Open source &middot; React &middot; Dev tool</p>
              <h1>Component Details Overlay</h1>
              <p className="lede">
                Switch it on and every tagged component on the page shows its name as it is written in code.
                Use it to check a live page against a design file, and to find elements built outside your
                component library.
              </p>
              <p className="lede lede--small">
                <a href={ANGULAR_URL} target="_blank" rel="noreferrer">Want the Angular version?</a>
              </p>
            </div>
            <div className="page__controls">
              <a className="btn btn--secondary btn--link" href="#usage">
                Usage guide
              </a>
              <a className="btn btn--secondary btn--link" href={REPO_URL} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
              <Button
                variant="secondary"
                aria-expanded={panelOpen}
                aria-controls="demo-panel"
                onClick={() => setPanelOpen((value) => !value)}
              >
                {panelOpen ? 'Hide demo panel' : 'Show demo panel'}
              </Button>
            </div>
          </header>

          <div className="stats">
            <StatCard label="Works with" value="React 17+" />
            <StatCard label="Badge text contrast" value="4.5:1" />
            <StatCard label="In production builds" value="Off" />
          </div>

          {/* Hand-built banner with no tag. With the overlay on it has no badge, which is
              how an audit spots elements built outside the component set. */}
          <div className="promo">
            This banner is hand-built and untagged, so it gets no badge. That is how an audit finds elements
            built outside your component set.
          </div>

          <Card title="What the overlay shows" actions={<Button variant="secondary" onClick={() => setPanelOpen(true)}>Try it</Button>}>
            <p className="prose">
              Each tagged component gets a dashed outline and a badge with its name. Nested components get
              different colours, so you can see what sits inside what. The overlay draws on its own layer and
              ignores the mouse, so clicks, scrolling and layout behave as they did before.
            </p>
            <p className="prose">
              Hold <kbd>Alt</kbd> (<kbd>Option</kbd> on Mac) and click any component to copy its name for a
              bug report, a ticket or an AI prompt. Badge colours adjust to the page behind them so they stay
              readable.
            </p>
          </Card>

          <Card title="Components on this page">
            <p className="hint">Every row is a component used on this page. Click a row to see how it is tagged.</p>
            <Table columns={COLUMNS} rows={ROWS} onRowClick={setSelected} />
          </Card>

          <Usage />
        </div>
      </div>

      <SidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onOpenModal={() => setSelected(ROWS.find((row) => row.id === 'Modal') ?? ROWS[0])}
        source={source}
        onSourceChange={setSource}
      />

      <Modal title={selected?.name ?? ''} open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <p>{selected.what}.</p>
            <pre className="modal__code"><code>{selected.code}</code></pre>
          </>
        )}
        <p className="demo-note demo-note--inline">
          <strong>Demo only</strong>
          This modal is portalled to the body at z-index 100, above the side panel. It is here to show
          the overlay labelling elements on any layer.
        </p>
      </Modal>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <DemoToggle />
    </ComponentDetailsProvider>
  );
}
