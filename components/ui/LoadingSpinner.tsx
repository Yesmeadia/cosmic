'use client';

import React from 'react';
import Image from 'next/image';

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
      <Image
        src="/round.png"     
        alt="loading"
        className={`animate-spin ${sizes[size]}`}
        width={64}
        height={64}
      />
    </div>
  );
};
