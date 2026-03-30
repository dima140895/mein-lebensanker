import { useState } from 'react';
import { Home, ClipboardList, HeartHandshake, Stethoscope, Users, Settings, Lock, Anchor, LogOut, User, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
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
  const { user, profile, signOut } = useAuth();
  const { personProfiles, activeProfile, activeProfileId, setActiveProfileId } = useProfiles();
  const queryClient = useQueryClient();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isMultiProfile = (profile?.max_profiles || 1) > 1 && personProfiles.length >= 2;

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
    <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-forest text-white sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Anchor className="h-5 w-5 text-white/80" />
          <span className="font-sans text-sm font-bold text-white leading-tight">Mein Lebensanker</span>
        </div>
      </div>

      {/* Active Profile indicator */}
      {isMultiProfile && activeProfile && (
        <div className="px-3 py-3">
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-full flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/15 transition-colors"
            >
              <User className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
              <span className="text-sm text-white font-medium truncate flex-1 text-left">{activeProfile.name}</span>
              <ChevronDown className={cn("h-3 w-3 text-white/50 transition-transform", profileDropdownOpen && "rotate-180")} />
            </button>
            {profileDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden z-10 border border-white/10">
                {personProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveProfileId(p.id); setProfileDropdownOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm transition-colors",
                      p.id === activeProfileId
                        ? "bg-white/20 text-white font-medium"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 py-4 px-3 space-y-1">
        {/* Gruppe 1: Übersicht, Meine Vorsorge, Mein Verlauf */}
        {navItems.filter(i => ['home', 'vorsorge', 'krankheit'].includes(i.key)).map((item) => {
          const Icon = item.icon;
          const label = item.key === 'krankheit'
            ? (language === 'de' ? 'Mein Verlauf' : 'My Progress')
            : (language === 'de' ? item.labelDe : item.labelEn);
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

        {/* Trennlinie + Pflege-Gruppe */}
        <div className="border-t border-white/10 my-2" />
        <span className="text-[10px] text-white/40 uppercase tracking-widest px-3 mb-1 block">
          {language === 'de' ? 'Pflege' : 'Care'}
        </span>
        {navItems.filter(i => ['pflege', 'familie'].includes(i.key)).map((item) => {
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

        {/* Trennlinie + Einstellungen */}
        <div className="border-t border-white/10 my-2" />
        {navItems.filter(i => i.key === 'settings').map((item) => {
          const Icon = item.icon;
          const label = language === 'de' ? item.labelDe : item.labelEn;
          const isActive = activeModule === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onModuleChange(item.key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left font-body',
                isActive
                  ? 'bg-white/15 text-white border-l-[3px] border-accent'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 truncate">{label}</span>
            </button>
          );
        })}

        {/* Abmelden */}
        <div className="mt-4 pt-3 border-t border-white/10 mx-0">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:bg-white/10 hover:text-white transition-all font-body"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>{language === 'de' ? 'Abmelden' : 'Sign out'}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
