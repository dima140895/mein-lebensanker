interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Custom Anchor-in-Heart SVG icon matching brand design
const AnchorHeartIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Heart outline */}
    <path
      d="M24 44C24 44 4 28 4 16C4 10 8.5 4 15 4C19.5 4 22.5 7 24 10C25.5 7 28.5 4 33 4C39.5 4 44 10 44 16C44 28 24 44 24 44Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Anchor */}
    <circle cx="24" cy="14" r="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <line x1="24" y1="17" x2="24" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="18" y1="22" x2="30" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path
      d="M16 30C16 32.5 19.5 34 24 34C28.5 34 32 32.5 32 30"
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
