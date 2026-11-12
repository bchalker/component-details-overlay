import type { ButtonHTMLAttributes } from 'react';
import { tag } from 'component-details-overlay';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return <button {...tag('Button')} className={`btn btn--${variant} ${className}`} {...rest} />;
}
