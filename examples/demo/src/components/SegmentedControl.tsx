import { tag } from 'component-details-overlay';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  /** Hide the label visually. It still names the group for screen readers. */
  hideLabel?: boolean;
  /** id of text that describes the group. */
  describedBy?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  label,
  hideLabel,
  describedBy,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented-field">
      <span className={hideLabel ? 'sr-only' : 'segmented-field__label'}>{label}</span>
      <div {...tag('SegmentedControl')} className="segmented" role="group" aria-label={label} aria-describedby={describedBy}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="segmented__btn"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
