import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'default' | 'outline';
  size?: 'default' | 'icon';
}

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'default',
  ...props
}: ButtonProps) => {
  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-[#f46036] text-white',
    secondary: 'bg-gray-200 text-gray-800',
    ghost: 'bg-transparent',
    link: 'underline text-[#f46036]',
    default: 'bg-[#f46036] text-white',
    outline: 'bg-white border-[#f46036] text-[#f46036] hover:bg-[#f46036]/10',
  };

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    default: 'px-4 py-2',
    icon: 'p-2',
  };

  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};