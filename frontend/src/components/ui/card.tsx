import React from 'react';
import { cn } from '../../lib/utils';

type CardVariant = 'default' | 'soft';

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-white border border-[#dedede] shadow-sm rounded-xl',
  soft: 'bg-white border border-gray-100 shadow-sm rounded-[14px]',
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => (
  <div className={cn(VARIANT_CLASSES[variant], className)} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={className} {...props}>
    {children}
  </div>
);