import { Home, ClipboardList, HeartHandshake, Stethoscope, Users, Settings, Lock, Anchor, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { prefetchPflegeEintraege, prefetchMedikamente, prefetchSymptomCheckins } from '@/lib/prefetchQueries';

export type DashboardModule = 'home' | 'vorsorge' | 'pflege' | 'krankheit' | 'familie' | 'settings';

interface NavItem {
  key: DashboardModule;
  icon: typeof Home;
  labelDe: string;
  labelEn: string;
  requiresPlan?: ('plus' | 'familie')[];
}

export const navItems: NavItem[] = [
  { key: 'home', icon: Home, labelDe: 'Übersicht', labelEn: 'Overview' },
  { key: 'vorsorge', icon: ClipboardList, labelDe: 'Meine Vorsorge', labelEn: 'My Planning' },
  { key: 'pflege', icon: HeartHandshake, labelDe: 'Pflege-Begleiter', labelEn: 'Care Companion', requiresPlan: ['plus', 'familie'] },
  { key: 'krankheit', icon: Stethoscope, labelDe: 'Krankheits-Begleiter', labelEn: 'Health Companion', requiresPlan: ['plus', 'familie'] },
  { key: 'familie', icon: Users, labelDe: 'Familie', labelEn: 'Family', requiresPlan: ['familie'] },
  { key: 'settings', icon: Settings, labelDe: 'Einstellungen', labelEn: 'Settings' },
];

export const isModuleLocked = (item: NavItem, userPlan: string | null): boolean => {
  if (!item.requiresPlan) return false;
  if (!userPlan) return true;
  return !item.requiresPlan.includes(userPlan as 'plus' | 'familie');
};

interface DashboardSidebarProps {
  activeModule: DashboardModule;
  onModuleChange: (module: DashboardModule) => void;
  userPlan: string | null;
  onLockedClick: (module: DashboardModule) => void;
}

const DashboardSidebar = ({ activeModule, onModuleChange, userPlan, onLockedClick }: DashboardSidebarProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handlePrefetch = (moduleKey: DashboardModule) => {
    if (!user) return;
    if (moduleKey === 'pflege') {
      prefetchPflegeEintraege(queryClient, user.id);
      prefetchMedikamente(queryClient, user.id);
    } else if (moduleKey === 'krankheit') {
      prefetchSymptomCheckins(queryClient, user.id);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-forest text-white min-h-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Anchor className="h-5 w-5 text-white/80" />
          <span className="font-sans text-sm font-bold text-white leading-tight">Mein Lebensanker</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const label = language === 'de' ? item.labelDe : item.labelEn;
          const locked = isModuleLocked(item, userPlan);
          const isActive = activeModule === item.key;

          return (
            <button
              key={item.key}
              onClick={() => locked ? onLockedClick(item.key) : onModuleChange(item.key)}
              onMouseEnter={() => !locked && handlePrefetch(item.key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left font-body',
                isActive && !locked
                  ? 'bg-white/15 text-white border-l-[3px] border-accent'
                  : locked
                    ? 'text-white/30 cursor-not-allowed hover:bg-white/5'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', locked && 'opacity-40')} />
              <span className={cn('flex-1 truncate', locked && 'opacity-40')}>{label}</span>
              {locked && <Lock className="h-3.5 w-3.5 opacity-40" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
