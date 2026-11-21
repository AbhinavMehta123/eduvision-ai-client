import React from 'react';

interface EduVisionLogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
}

export const EduVisionLogo: React.FC<EduVisionLogoProps> = ({
  size = 48,
  className = '',
  withText = false
}) => (
  <div className={`inline-flex items-center gap-3 ${className}`}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="edulogo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#edulogo-grad)" />
      {/* Graduation Cap */}
      <path d="M24 13L9 20.5L24 28L39 20.5L24 13Z" fill="white" />
      <path d="M14 23.5V30.5C14 30.5 18 34.5 24 34.5C30 34.5 34 30.5 34 30.5V23.5L24 28.5L14 23.5Z" fill="white" fillOpacity="0.85" />
      <path d="M37 21V31.5C37 32.5 36 33.5 35 33.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="35" cy="35" r="1.5" fill="white" />
      {/* Central Vision node */}
      <circle cx="24" cy="20.5" r="2.5" fill="#047857" />
      <circle cx="24" cy="20.5" r="1" fill="#6ee7b7" />
    </svg>

    {withText && (
      <div className="flex flex-col text-left">
        <span className="font-extrabold text-sm tracking-tight text-neutral-900 leading-tight">
          EduVision <span className="text-emerald-600 font-bold">AI</span>
        </span>
        <span className="text-[10px] text-neutral-500">
          Visual Learning Platform
        </span>
      </div>
    )}
  </div>
);
