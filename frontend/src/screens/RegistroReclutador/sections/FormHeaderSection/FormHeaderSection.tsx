import React, { type JSX } from "react";

export const FormHeaderSection = (): JSX.Element => {
  return (
    <h2 className="text-3xl font-semibold text-center mb-2 text-gray-900">
      Creá tu cuenta como reclutador{' '}
      <span className="font-normal">y encontrá el perfil ideal</span>
    </h2>
  );
};