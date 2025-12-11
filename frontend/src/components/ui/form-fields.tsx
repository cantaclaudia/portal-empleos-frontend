import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  className = '',
  showPasswordToggle = false,
  type,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  return (
    <div className="flex w-full max-w-[500px] flex-col items-start gap-2 px-4 py-2">
      <label className="[font-family:'Nunito',Helvetica] text-sm md:text-base leading-normal tracking-[0] font-semibold text-[#333333]">
        {label}
      </label>
      <div className="relative w-full">
        <input
          type={inputType}
          className={`h-11 md:h-[52px] w-full rounded-lg border border-[#cccccc] bg-white px-4 py-3 [font-family:'Nunito',Helvetica] text-sm md:text-base leading-normal tracking-[0] font-normal text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#f46036] focus:border-transparent transition-all ${showPasswordToggle ? 'pr-12' : ''} ${className}`}
          {...inputProps}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#333333] transition-colors"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="text-sm text-red-600 [font-family:'Nunito',Helvetica]">
          {error}
        </span>
      )}
    </div>
  );
};
