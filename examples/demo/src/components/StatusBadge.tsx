import { tag } from 'component-details-overlay';

export type Status = 'Tagged' | 'Untagged';

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span {...tag('StatusBadge')} className={`status status--${status.toLowerCase()}`}>
      {status}
    </span>
  );
}
