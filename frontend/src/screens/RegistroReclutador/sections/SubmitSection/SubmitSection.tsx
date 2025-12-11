import React, { type JSX } from "react";

export const SubmitSection = (): JSX.Element => {
  return (
    <div className="flex justify-center pt-6">
      <button
        type="submit"
        className="bg-[#F46036] hover:bg-[#e04f2e] text-white font-sans font-medium px-32 py-3 rounded-lg transition-colors duration-200"
      >
        Registrarse
      </button>
    </div>
  );
};