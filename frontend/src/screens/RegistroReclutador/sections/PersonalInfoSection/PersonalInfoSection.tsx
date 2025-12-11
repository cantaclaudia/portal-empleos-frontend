import React, { type JSX } from "react";
import { TextInput } from '../../../../components/TextInput';

interface PersonalInfoSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PersonalInfoSection = ({
  firstName,
  lastName,
  email,
  onChange
}: PersonalInfoSectionProps): JSX.Element => {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <TextInput
          id="firstName"
          name="firstName"
          label="Nombre"
          placeholder="Ingresa tu/s nombre/s"
          value={firstName}
          required
          onChange={onChange}
        />
        <TextInput
          id="lastName"
          name="lastName"
          label="Apellido"
          placeholder="Ingresa tu/s apellido/s"
          value={lastName}
          required
          onChange={onChange}
        />
      </div>

      <TextInput
        id="email"
        name="email"
        type="email"
        label="Correo electrónico"
        placeholder="Ingresa tu correo electrónico"
        value={email}
        required
        onChange={onChange}
      />
    </>
  );
};
