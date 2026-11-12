import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isProductionBuild } from './env';
import { ensureLatoFont } from './font';
import { Overlay } from './Overlay';
import { DEFAULT_ATTRIBUTE } from './tag';
import { TEXT_SCALE } from './types';
import type { ComponentDetailsProviderProps, ComponentDetailsState, TextSize } from './types';

export const DEFAULT_STORAGE_KEY = 'component-details-overlay';

const noop = () => undefined;

const ComponentDetailsContext = createContext<ComponentDetailsState>({
  available: false,
  active: false,
  setActive: noop,
  toggle: noop,
  hoverOnly: false,
  setHoverOnly: noop,
  textSize: 'normal',
  setTextSize: noop,
  highContrast: false,
  setHighContrast: noop,
  announce: false,
  setAnnounce: noop,
});

interface Saved {
  active: boolean;
  hoverOnly: boolean;
  textSize: TextSize;
  highContrast: boolean;
  announce: boolean;
}

function readSaved(key: string | null): Partial<Saved> {
  if (!key) return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Saved>;
    return {
      active: typeof parsed.active === 'boolean' ? parsed.active : undefined,
      hoverOnly: typeof parsed.hoverOnly === 'boolean' ? parsed.hoverOnly : undefined,
      textSize:
        typeof parsed.textSize === 'string' && parsed.textSize in TEXT_SCALE
          ? parsed.textSize
          : undefined,
      highContrast: typeof parsed.highContrast === 'boolean' ? parsed.highContrast : undefined,
      announce: typeof parsed.announce === 'boolean' ? parsed.announce : undefined,
    };
  } catch {
    return {};
  }
}

function writeSaved(key: string | null, value: Saved) {
  if (!key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked or full. The setting just won't survive a reload.
  }
}

export function ComponentDetailsProvider({
  children,
  enabled,
  nameSource = 'attribute',
  attributeName = DEFAULT_ATTRIBUTE,
  storageKey = DEFAULT_STORAGE_KEY,
  defaultActive = false,
  defaultHoverOnly = false,
  autoContrast = true,
  loadFont = true,
  copyOnAltClick = true,
  onCopy,
  filter,
  container,
}: ComponentDetailsProviderProps) {
  const available = enabled ?? !isProductionBuild();

  const [state, setState] = useState<Saved>({
    active: defaultActive,
    hoverOnly: defaultHoverOnly,
    textSize: 'normal',
    highContrast: false,
    announce: false,
  });

  // The overlay and its toggle both use Lato by default.
  useEffect(() => {
    if (available && loadFont) ensureLatoFont();
  }, [available, loadFont]);

  // Read saved settings after mount, so server and client render the same first frame.
  useEffect(() => {
    if (!available) return;
    const saved = readSaved(storageKey);
    setState((prev) => ({
      active: saved.active ?? prev.active,
      hoverOnly: saved.hoverOnly ?? prev.hoverOnly,
      textSize: saved.textSize ?? prev.textSize,
      highContrast: saved.highContrast ?? prev.highContrast,
      announce: saved.announce ?? prev.announce,
    }));
  }, [available, storageKey]);

  // Save only when the user changes a setting, so the defaults never overwrite what was saved.
  const update = useCallback(
    (patch: (prev: Saved) => Partial<Saved>) => {
      setState((prev) => {
        const next = { ...prev, ...patch(prev) };
        writeSaved(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const setActive = useCallback((active: boolean) => update(() => ({ active })), [update]);
  const toggle = useCallback(() => update((prev) => ({ active: !prev.active })), [update]);
  const setHoverOnly = useCallback((hoverOnly: boolean) => update(() => ({ hoverOnly })), [update]);
  const setTextSize = useCallback((textSize: TextSize) => update(() => ({ textSize })), [update]);
  const setHighContrast = useCallback(
    (highContrast: boolean) => update(() => ({ highContrast })),
    [update],
  );
  const setAnnounce = useCallback((announce: boolean) => update(() => ({ announce })), [update]);

  const value = useMemo<ComponentDetailsState>(
    () => ({
      available,
      active: available && state.active,
      setActive: available ? setActive : noop,
      toggle: available ? toggle : noop,
      hoverOnly: state.hoverOnly,
      setHoverOnly: available ? setHoverOnly : noop,
      textSize: state.textSize,
      setTextSize: available ? setTextSize : noop,
      highContrast: state.highContrast,
      setHighContrast: available ? setHighContrast : noop,
      announce: state.announce,
      setAnnounce: available ? setAnnounce : noop,
    }),
    [available, state, setActive, toggle, setHoverOnly, setTextSize, setHighContrast, setAnnounce],
  );

  return (
    <ComponentDetailsContext.Provider value={value}>
      {children}
      {available && state.active && (
        <Overlay
          nameSource={nameSource}
          attributeName={attributeName}
          hoverOnly={state.hoverOnly}
          textScale={TEXT_SCALE[state.textSize]}
          highContrast={state.highContrast}
          announce={state.announce}
          copyOnAltClick={copyOnAltClick}
          autoContrast={autoContrast}
          onCopy={onCopy}
          filter={filter}
          container={container}
        />
      )}
    </ComponentDetailsContext.Provider>
  );
}

/** Reads and controls the overlay. Safe to call outside a provider: `available` is false. */
export function useComponentDetails(): ComponentDetailsState {
  return useContext(ComponentDetailsContext);
}
