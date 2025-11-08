'use client';

import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ 
  size = 'md' 
}) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`} />
    </div>
  );
};