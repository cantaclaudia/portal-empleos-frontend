import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'default' | 'outline';
  size?: 'default' | 'icon';
}

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  default: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  ghost: 'bg-transparent',
  link: 'underline text-brand',
  outline: 'bg-white border border-brand text-brand hover:bg-brand/10',
};

const SIZES: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'px-4 py-2',
  icon: 'p-2',
};

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'default',
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      VARIANTS[variant],
      SIZES[size],
      className
    )}
    {...props}
  >
    {children}
  </button>
);