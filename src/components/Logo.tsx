interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Custom Anchor-Heart SVG icon - exact match to brand design
const AnchorHeartIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left heart lobe flowing into left anchor fluke */}
    <path
      d="M50 22
         C45 14, 36 8, 26 8
         C14 8, 6 18, 6 28
         C6 42, 18 54, 28 66
         L20 72 L28 68 L24 80
         C32 72, 42 60, 50 48"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Right heart lobe flowing into right anchor fluke */}
    <path
      d="M50 22
         C55 14, 64 8, 74 8
         C86 8, 94 18, 94 28
         C94 42, 82 54, 72 66
         L80 72 L72 68 L76 80
         C68 72, 58 60, 50 48"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Anchor ring */}
    <circle cx="50" cy="30" r="8" stroke="currentColor" strokeWidth="5" fill="none" />
    {/* Anchor shaft */}
    <line x1="50" y1="38" x2="50" y2="92" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    {/* Anchor crossbar */}
    <line x1="34" y1="50" x2="66" y2="50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    {/* Bottom fluke curve connecting to arrow tips */}
    <path
      d="M24 80 C30 88, 40 92, 50 92 C60 92, 70 88, 76 80"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
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
