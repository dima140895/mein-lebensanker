import { Home, ClipboardList, HeartHandshake, Stethoscope, Users, Settings, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { navItems, isModuleLocked, type DashboardModule } from './DashboardSidebar';

interface BottomNavigationProps {
  activeModule: DashboardModule;
  onModuleChange: (module: DashboardModule) => void;
  userPlan: string | null;
  onLockedClick: (module: DashboardModule) => void;
}

const BottomNavigation = ({ activeModule, onModuleChange, userPlan, onLockedClick }: BottomNavigationProps) => {
  const { language } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around px-1 py-1.5 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const label = language === 'de' ? item.labelDe : item.labelEn;
          const locked = isModuleLocked(item, userPlan);
          const isActive = activeModule === item.key;

          return (
            <button
              key={item.key}
              onClick={() => locked ? onLockedClick(item.key) : onModuleChange(item.key)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg min-w-0 flex-1 transition-colors min-h-[44px] font-body',
                isActive && !locked
                  ? 'text-primary'
                  : locked
                    ? 'text-charcoal-light/40'
                    : 'text-charcoal-light'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', locked && 'opacity-40')} />
                {locked && (
                  <Lock className="absolute -top-1 -right-1.5 h-2.5 w-2.5 text-charcoal-light/60" />
                )}
              </div>
              <span className={cn(
                'text-[9px] leading-tight font-medium truncate max-w-full',
                locked && 'opacity-40'
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
