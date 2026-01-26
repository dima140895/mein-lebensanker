import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', iconOnly = false }) => {
  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Anchor */}
        <circle cx="20" cy="8" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <line x1="20" y1="12" x2="20" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M8 28 C8 32, 14 36, 20 36 C26 36, 32 32, 32 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <line x1="8" y1="28" x2="10" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="28" x2="30" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 220 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Anchor Icon */}
      <circle cx="20" cy="8" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="20" y1="12" x2="20" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M8 28 C8 32, 14 36, 20 36 C26 36, 32 32, 32 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="8" y1="28" x2="10" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="28" x2="30" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Text "Mein Lebensanker" */}
      <text
        x="46"
        y="26"
        fill="currentColor"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="16"
        fontWeight="600"
      >
        Mein Lebensanker
      </text>
    </svg>
  );
};

export default Logo;
