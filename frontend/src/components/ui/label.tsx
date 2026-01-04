import React from 'react';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-[#333333] ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';
