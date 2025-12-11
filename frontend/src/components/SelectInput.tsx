import { ChevronDown } from 'lucide-react';

interface SelectInputProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  required?: boolean;
  options: string[];
  helperText?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SelectInput({
  id,
  name,
  label,
  placeholder,
  value,
  required = false,
  options,
  helperText,
  onChange
}: SelectInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {helperText && (
        <p className="text-sm text-gray-600 mb-2">{helperText}</p>
      )}
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 appearance-none bg-white"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
      </div>
    </div>
  );
}
