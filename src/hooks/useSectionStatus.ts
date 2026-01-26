import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles, PersonProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/browserClient';

export interface SectionStatus {
  [key: string]: boolean;
}

export interface ProfileProgress {
  profileId: string;
  profileName: string;
  sectionStatus: SectionStatus;
  filledCount: number;
  totalCount: number;
  progressPercent: number;
  isComplete: boolean;
}

const SECTIONS_TO_CHECK = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'];

// Helper to check if section data has meaningful content
const hasMeaningfulData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Check each field in the data object
  for (const key of Object.keys(data)) {
    const value = data[key];
    
    // Skip empty strings
    if (typeof value === 'string' && value.trim() === '') continue;
    
    // Check arrays - must have at least one item with non-empty content
    if (Array.isArray(value)) {
      if (value.length > 0) {
        // Check if array items have meaningful content
        const hasContent = value.some(item => {
          if (typeof item === 'string') return item.trim() !== '';
          if (typeof item === 'object' && item !== null) {
            return Object.values(item).some(v => 
              typeof v === 'string' ? v.trim() !== '' : v !== null && v !== undefined
            );
          }
          return item !== null && item !== undefined;
        });
        if (hasContent) return true;
      }
      continue;
    }
    
    // Non-empty primitive values
    if (value !== null && value !== undefined && value !== '') {
      return true;
    }
  }
  
  return false;
};

export const useSectionStatus = () => {
  const { user } = useAuth();
  const { activeProfile, personProfiles } = useProfiles();
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({});
  const [allProfilesProgress, setAllProfilesProgress] = useState<ProfileProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const checkSections = useCallback(async () => {
    if (!user || !activeProfile) {
      setLoading(false);
      return;
    }

    try {
      // Fetch data for all profiles at once
      const { data, error } = await supabase
        .from('vorsorge_data')
        .select('section_key, data, person_profile_id')
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate status for active profile
      const activeStatuses: SectionStatus = {};
      for (const key of SECTIONS_TO_CHECK) {
        const sectionData = data?.find(
          d => d.section_key === key && d.person_profile_id === activeProfile.id
        );
        activeStatuses[key] = !!(sectionData && hasMeaningfulData(sectionData.data));
      }
      setSectionStatus(activeStatuses);

      // Calculate progress for all profiles
      const progressByProfile: ProfileProgress[] = personProfiles.map(profile => {
        const profileStatuses: SectionStatus = {};
        for (const key of SECTIONS_TO_CHECK) {
          const sectionData = data?.find(
            d => d.section_key === key && d.person_profile_id === profile.id
          );
          profileStatuses[key] = !!(sectionData && hasMeaningfulData(sectionData.data));
        }
        
        const filled = Object.values(profileStatuses).filter(Boolean).length;
        const total = SECTIONS_TO_CHECK.length;
        
        return {
          profileId: profile.id,
          profileName: profile.name,
          sectionStatus: profileStatuses,
          filledCount: filled,
          totalCount: total,
          progressPercent: total > 0 ? (filled / total) * 100 : 0,
          isComplete: filled === total && total > 0,
        };
      });
      
      setAllProfilesProgress(progressByProfile);
    } catch (error) {
      console.error('Error checking sections:', error);
    } finally {
      setLoading(false);
    }
  }, [user, activeProfile, personProfiles]);

  useEffect(() => {
    checkSections();
  }, [checkSections]);

  const filledCount = Object.values(sectionStatus).filter(Boolean).length;
  const totalCount = Object.keys(sectionStatus).length;
  const progressPercent = totalCount > 0 ? (filledCount / totalCount) * 100 : 0;
  const isComplete = filledCount === totalCount && totalCount > 0;

  return {
    sectionStatus,
    filledCount,
    totalCount,
    progressPercent,
    isComplete,
    loading,
    allProfilesProgress,
    hasMultipleProfiles: personProfiles.length > 1,
    refetch: checkSections, // Expose refetch function
  };
};
