import { Anchor } from 'lucide-react';

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ showText = true, size = 'md', className = '' }: LogoProps) => {
  const sizes = {
    sm: { icon: 'h-4 w-4', container: 'h-7 w-7', text: 'text-base' },
    md: { icon: 'h-5 w-5', container: 'h-9 w-9', text: 'text-xl' },
    lg: { icon: 'h-6 w-6', container: 'h-11 w-11', text: 'text-2xl' },
  };

  const { icon, container, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex ${container} items-center justify-center rounded-lg bg-primary`}>
        <Anchor className={`${icon} text-primary-foreground`} />
      </div>
      {showText && (
        <span className={`font-serif ${text} font-semibold text-foreground`}>
          Mein Lebensanker
        </span>
      )}
    </div>
  );
};

export default Logo;
