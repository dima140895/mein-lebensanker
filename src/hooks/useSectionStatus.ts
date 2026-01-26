import { useState, useEffect } from 'react';
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

export const useSectionStatus = () => {
  const { user } = useAuth();
  const { activeProfile, personProfiles } = useProfiles();
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({});
  const [allProfilesProgress, setAllProfilesProgress] = useState<ProfileProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSections = async () => {
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
          activeStatuses[key] = !!(sectionData && sectionData.data && Object.keys(sectionData.data).length > 0);
        }
        setSectionStatus(activeStatuses);

        // Calculate progress for all profiles
        const progressByProfile: ProfileProgress[] = personProfiles.map(profile => {
          const profileStatuses: SectionStatus = {};
          for (const key of SECTIONS_TO_CHECK) {
            const sectionData = data?.find(
              d => d.section_key === key && d.person_profile_id === profile.id
            );
            profileStatuses[key] = !!(sectionData && sectionData.data && Object.keys(sectionData.data).length > 0);
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
    };

    checkSections();
  }, [user, activeProfile, personProfiles]);

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
  };
};
