import type { ReactNode } from 'react';
import { tag } from 'component-details-overlay';

interface CardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Card({ title, children, actions }: CardProps) {
  return (
    <section {...tag('Card')} className="card">
      <header className="card__header">
        <h2>{title}</h2>
        {actions}
      </header>
      <div className="card__body">{children}</div>
    </section>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div {...tag('StatCard')} className="stat">
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value}</span>
    </div>
  );
}
