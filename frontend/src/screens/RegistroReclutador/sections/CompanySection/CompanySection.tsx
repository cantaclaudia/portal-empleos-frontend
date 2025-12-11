import React, { type JSX } from "react";
import { SelectInput } from "../../../../components/SelectInput";

interface CompanySectionProps {
  company: string;
  companies: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const CompanySection = ({
  company,
  companies,
  onChange
}: CompanySectionProps): JSX.Element => {
  return (
    <SelectInput
      id="company"
      name="company"
      label="Empresa"
      placeholder="Seleccionar empresa"
      value={company}
      required
      options={companies}
      helperText="Buscá y seleccioná tu empresa registrada en la lista."
      onChange={onChange}
    />
  );
};