import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/browserClient';

export interface SectionStatus {
  [key: string]: boolean;
}

export const useSectionStatus = () => {
  const { user } = useAuth();
  const { activeProfile } = useProfiles();
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSections = async () => {
      if (!user || !activeProfile) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vorsorge_data')
          .select('section_key, data')
          .eq('user_id', user.id)
          .eq('person_profile_id', activeProfile.id);

        if (error) throw error;

        const sectionsToCheck = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'];
        
        const statuses: SectionStatus = {};
        
        for (const key of sectionsToCheck) {
          const sectionData = data?.find(d => d.section_key === key);
          statuses[key] = !!(sectionData && sectionData.data && Object.keys(sectionData.data).length > 0);
        }

        setSectionStatus(statuses);
      } catch (error) {
        console.error('Error checking sections:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSections();
  }, [user, activeProfile]);

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
  };
};
