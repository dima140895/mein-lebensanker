interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Custom Anchor-Heart SVG icon - seamless design
const AnchorHeartIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left side: heart lobe curves down and becomes fluke with arrow tip - one continuous path */}
    <path
      d="M50 20
         C44 12, 34 6, 24 6
         C12 6, 4 16, 4 28
         C4 44, 16 58, 30 74
         C32 76, 32 80, 28 82
         L18 76
         L22 86
         C30 82, 40 90, 50 92"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Right side: heart lobe curves down and becomes fluke with arrow tip - one continuous path */}
    <path
      d="M50 20
         C56 12, 66 6, 76 6
         C88 6, 96 16, 96 28
         C96 44, 84 58, 70 74
         C68 76, 68 80, 72 82
         L82 76
         L78 86
         C70 82, 60 90, 50 92"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Anchor ring */}
    <circle cx="50" cy="28" r="8" stroke="currentColor" strokeWidth="5" fill="none" />
    {/* Anchor shaft */}
    <line x1="50" y1="36" x2="50" y2="92" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    {/* Anchor crossbar */}
    <line x1="34" y1="48" x2="66" y2="48" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
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
