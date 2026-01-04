import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`w-full [font-family:'Nunito',Helvetica] font-normal text-base leading-normal tracking-[0] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#f46036] focus:border-transparent transition-all ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';