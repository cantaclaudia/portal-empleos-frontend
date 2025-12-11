import React, { type JSX } from "react";
import { PasswordInput } from '../../../../components/PasswordInput';

interface PasswordSectionProps {
  password: string;
  confirmPassword: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PasswordSection = ({
  password,
  confirmPassword,
  onChange
}: PasswordSectionProps): JSX.Element => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <PasswordInput
        id="password"
        name="password"
        label="Contraseña"
        placeholder="Creá una contraseña segura"
        value={password}
        required
        onChange={onChange}
      />
      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Repetir contraseña"
        placeholder="Confirmá tu contraseña"
        value={confirmPassword}
        required
        onChange={onChange}
      />
    </div>
  );
};