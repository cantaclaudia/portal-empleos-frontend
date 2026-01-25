import { SelectValue } from "./select"; 
import React from "react";

interface SelectValueLabelProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const SelectValueLabel = ({ value, options, placeholder }: SelectValueLabelProps) => {
  const label = options.find(option => option.value === value)?.label;
  return <SelectValue placeholder={label || placeholder} />;
};
