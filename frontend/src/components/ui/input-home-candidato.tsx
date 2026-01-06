import React from 'react';

export type InputHomeCandidatoProps =
  React.InputHTMLAttributes<HTMLInputElement>;

export const InputHomeCandidato = React.forwardRef<
  HTMLInputElement,
  InputHomeCandidatoProps
>(({ className = '', type = 'text', ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={`flex-1 bg-transparent border-none outline-none ${className}`}
      {...props}
    />
  );
});

InputHomeCandidato.displayName = 'InputHomeCandidato';