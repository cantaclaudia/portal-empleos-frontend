import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select component');
  }
  return context;
};

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ value = '', onValueChange, children, disabled = false }) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative w-full">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { disabled })
            : child
        )}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ className = '', children, disabled = false }) => {
  const { open, setOpen } = useSelectContext();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      className={`w-full flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#f46036] focus:border-transparent transition-all ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
      <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder = 'Seleccionar...' }) => {
  const { value } = useSelectContext();
  return <span>{value || placeholder}</span>;
};

interface SelectContentProps {
  children: React.ReactNode;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const { open, setOpen } = useSelectContext();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        const trigger = contentRef.current.previousElementSibling;
        if (trigger && !trigger.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className="absolute z-50 w-full mt-1 bg-white border border-[#d9d9d9] rounded-lg shadow-lg max-h-60 overflow-auto"
    >
      {children}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className = '' }) => {
  const { onValueChange } = useSelectContext();

  return (
    <div
      onClick={() => onValueChange(value)}
      className={`px-3 py-2 cursor-pointer hover:bg-[#f2f2f2] [font-family:'Nunito',Helvetica] font-normal text-base text-[#333333] transition-colors ${className}`}
    >
      {children}
    </div>
  );
};