interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Custom Anchor-Heart SVG icon - unified design where anchor bottom IS the heart bottom
const AnchorHeartIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left heart lobe - stops at anchor fluke level */}
    <path
      d="M24 12C22 8 18 4 12 4C6 4 2 9 2 15C2 22 8 30 14 36"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Right heart lobe - stops at anchor fluke level */}
    <path
      d="M24 12C26 8 30 4 36 4C42 4 46 9 46 15C46 22 40 30 34 36"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Anchor ring at top */}
    <circle cx="24" cy="16" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Anchor vertical shaft */}
    <line x1="24" y1="20" x2="24" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Anchor horizontal bar */}
    <line x1="16" y1="26" x2="32" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Anchor flukes - connect to heart lobes */}
    <path
      d="M14 36C14 40 18.5 42 24 42C29.5 42 34 40 34 36"
      stroke="currentColor"
      strokeWidth="2.5"
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
