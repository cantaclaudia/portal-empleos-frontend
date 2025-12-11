import React, { type JSX } from "react";

export const FooterLinksSection = (): JSX.Element => {
  return (
    <div className="flex justify-between items-center mt-8 text-sm">
      <p className="text-gray-700">
        ¿Ya tenés cuenta?{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Iniciar sesión
        </a>
      </p>
      <p className="text-gray-700">
        ¿Sos candidato?{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Crear cuenta
        </a>
      </p>
    </div>
  );
};