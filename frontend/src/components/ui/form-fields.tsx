import React, { useState, type JSX } from "react";
import { Label } from "./label";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps {
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormField = ({
  label,
  type,
  placeholder,
  required = false,
  value,
  onChange,
}: FormFieldProps): JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className="flex w-full max-w-[500px] flex-col items-start gap-1.5 px-4 py-2">
      <Label className="inline-flex items-center gap-1">
        <span className="[font-family:'Nunito',Helvetica] text-sm md:text-base tracking-[0] font-normal">
          <span className="text-[#333333]">{label}</span>
          {required && (
            <>
              <span className="text-[#1e1e1e]">&nbsp;</span>
              <span className="text-[#cc2222]">*</span>
            </>
          )}
        </span>
      </Label>

      <div className="relative w-full">
        <Input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="h-11 md:h-12 w-full rounded-lg border border-solid border-[#d9d9d9] bg-white px-3 py-2 [font-family:'Nunito',Helvetica] text-sm md:text-base text-[#333333] placeholder:text-[#b3b3b3]"
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a5a] hover:text-[#333333]"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
