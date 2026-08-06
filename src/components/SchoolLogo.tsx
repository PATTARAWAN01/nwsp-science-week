import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      <img
        src="/logo.png"
        alt="ตราโรงเรียนหนองวัวซอพิทยาคม"
        className="w-full h-full object-contain drop-shadow-md"
      />
    </div>
  );
};
