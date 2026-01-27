interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Custom Anchor-Heart SVG icon - heart with inward arrows + anchor with outward arrows
const AnchorHeartIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Heart shape - curves down and ends with inward-pointing arrow tips */}
    {/* Left heart lobe with inward arrow */}
    <path
      d="M50 18
         C44 10, 34 4, 22 4
         C10 4, 2 14, 2 26
         C2 40, 12 54, 26 68
         L18 62
         L22 72
         L32 64"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Right heart lobe with inward arrow */}
    <path
      d="M50 18
         C56 10, 66 4, 78 4
         C90 4, 98 14, 98 26
         C98 40, 88 54, 74 68
         L82 62
         L78 72
         L68 64"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* Anchor - separate element */}
    {/* Anchor ring */}
    <circle cx="50" cy="32" r="8" stroke="currentColor" strokeWidth="5" fill="none" />
    {/* Anchor shaft */}
    <line x1="50" y1="40" x2="50" y2="84" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    {/* Anchor crossbar */}
    <line x1="36" y1="52" x2="64" y2="52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    {/* Left fluke with outward arrow */}
    <path
      d="M50 84
         C42 84, 34 80, 30 74
         L24 80
         L26 70
         L36 74"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Right fluke with outward arrow */}
    <path
      d="M50 84
         C58 84, 66 80, 70 74
         L76 80
         L74 70
         L64 74"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const Logo = ({ showText = true, size = 'md', className = '' }: LogoProps) => {
  const sizes = {
    sm: { icon: 'h-7 w-7', text: 'text-base' },
    md: { icon: 'h-9 w-9', text: 'text-xl' },
    lg: { icon: 'h-11 w-11', text: 'text-2xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AnchorHeartIcon className={`${icon} text-primary`} />
      {showText && (
        <span className={`font-serif ${text} font-semibold text-foreground`}>
          Mein Lebensanker
        </span>
      )}
    </div>
  );
};

export default Logo;
