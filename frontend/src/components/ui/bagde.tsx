import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={className}
      {...props}
    >
      {children}
    </span>
  );
};
