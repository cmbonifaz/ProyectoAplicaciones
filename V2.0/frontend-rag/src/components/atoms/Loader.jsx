import React from 'react';
export const Loader = () => (
  <div className="flex gap-1 items-center justify-center p-2">
    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
  </div>
);