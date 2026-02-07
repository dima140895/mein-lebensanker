import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfiles } from '@/contexts/ProfileContext';
import { useFormData, VorsorgeFormData } from '@/contexts/FormContext';
import { sectionStatusEvents } from './useSectionStatusRefresh';

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

const SECTIONS_TO_CHECK = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'] as const;

// Helper to check if section data has meaningful content
// For 'personal' section, we need MORE than just fullName (which comes from profile setup)
const hasMeaningfulData = (data: any, sectionKey: string): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // If data is a string (encrypted), it cannot be analyzed - return false
  if (typeof data === 'string') return false;
  
  // For personal section: ignore fullName alone since it comes from profile setup wizard
  // Only count as filled if there's OTHER data besides fullName
  if (sectionKey === 'personal') {
    const keysWithContent = Object.keys(data).filter(key => {
      const value = data[key];
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0 && value.some(v => v && v !== '');
      return value !== null && value !== undefined;
    });
    
    // If only fullName has content, don't count it
    if (keysWithContent.length === 1 && keysWithContent[0] === 'fullName') {
      return false;
    }
    // If fullName + birthDate only (both from profile setup), don't count it
    if (keysWithContent.length <= 2 && 
        keysWithContent.every(k => k === 'fullName' || k === 'birthDate')) {
      return false;
    }
  }
  
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
            // Ignore default-only fields like currency selectors when checking for real user input
            return Object.entries(item).some(([k, v]) => {
              // Skip currency fields - they are pre-filled defaults, not user data
              if (k === 'currency' || k.endsWith('Currency')) return false;
              return typeof v === 'string' ? v.trim() !== '' : v !== null && v !== undefined;
            });
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
  const { activeProfile, personProfiles } = useProfiles();
  const { formData } = useFormData();
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({});
  const [allProfilesProgress, setAllProfilesProgress] = useState<ProfileProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Create a stable hash of form data to detect changes
  const formDataHash = useMemo(() => {
    return JSON.stringify({
      personal: formData.personal,
      assets: formData.assets,
      digital: formData.digital,
      wishes: formData.wishes,
      documents: formData.documents,
      contacts: formData.contacts,
    });
  }, [formData.personal, formData.assets, formData.digital, formData.wishes, formData.documents, formData.contacts]);

  // Calculate status from decrypted formData
  const checkSections = useCallback(() => {
    if (!activeProfile) {
      setSectionStatus({});
      setLoading(false);
      return;
    }

    setLoading(true);

    const activeStatuses: SectionStatus = {};
    for (const key of SECTIONS_TO_CHECK) {
      const sectionData = formData[key as keyof VorsorgeFormData];
      activeStatuses[key] = hasMeaningfulData(sectionData, key);
    }
    setSectionStatus(activeStatuses);

    // For current profile, calculate progress based on formData
    const filled = Object.values(activeStatuses).filter(Boolean).length;
    const total = SECTIONS_TO_CHECK.length;
    
    // Update progress for active profile only
    const activeProgress: ProfileProgress = {
      profileId: activeProfile.id,
      profileName: activeProfile.name,
      sectionStatus: activeStatuses,
      filledCount: filled,
      totalCount: total,
      progressPercent: total > 0 ? (filled / total) * 100 : 0,
      isComplete: filled === total && total > 0,
    };

    // Keep other profiles' progress, update only active profile
    setAllProfilesProgress(prev => {
      const otherProfiles = prev.filter(p => p.profileId !== activeProfile.id);
      return [...otherProfiles, activeProgress];
    });

    setLoading(false);
  }, [activeProfile?.id, activeProfile?.name, formDataHash, refreshTrigger]);

  // Recalculate when formData changes or profile changes
  useEffect(() => {
    checkSections();
  }, [checkSections]);

  // Subscribe to global refresh events (triggered after auto-save)
  useEffect(() => {
    const unsubscribe = sectionStatusEvents.subscribe(() => {
      // Trigger a recalculation
      setRefreshTrigger(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const filledCount = Object.values(sectionStatus).filter(Boolean).length;
  const totalCount = SECTIONS_TO_CHECK.length;
  const progressPercent = (filledCount / totalCount) * 100;
  const isComplete = filledCount === totalCount;

  return {
    sectionStatus,
    filledCount,
    totalCount,
    progressPercent,
    isComplete,
    loading,
    allProfilesProgress,
    hasMultipleProfiles: personProfiles.length > 1,
    refetch: () => setRefreshTrigger(prev => prev + 1),
  };
};
