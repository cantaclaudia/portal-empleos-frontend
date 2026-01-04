import React from 'react';

export type InputHomeCandidateProps =
  React.InputHTMLAttributes<HTMLInputElement>;

export const InputHomeCandidate = React.forwardRef<
  HTMLInputElement,
  InputHomeCandidateProps
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

InputHomeCandidate.displayName = 'InputHomeCandidate';