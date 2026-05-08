import React from 'react';
export const Icon = ({ icon: IconComponent, size = 20, className = "" }) => (
  <IconComponent size={size} className={`${className}`} />
);