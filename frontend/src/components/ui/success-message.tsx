import React from 'react';

export const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="w-full max-w-[500px] px-4">
    <div
      role="status"
      className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
    >
      {message}
    </div>
  </div>
);