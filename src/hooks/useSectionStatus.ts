import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfiles } from '@/contexts/ProfileContext';
import { useFormData, VorsorgeFormData } from '@/contexts/FormContext';
import { sectionStatusEvents } from './useSectionStatusRefresh';

export interface SectionStatus {
  [key: string]: boolean;
}

export interface SectionCompletion {
  [key: string]: number; // 0-100
}

export interface ProfileProgress {
  profileId: string;
  profileName: string;
  sectionStatus: SectionStatus;
  sectionCompletion: SectionCompletion;
  filledCount: number;
  totalCount: number;
  progressPercent: number;
  isComplete: boolean;
}

const SECTIONS_TO_CHECK = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'] as const;

// Required fields per section for granular progress
const REQUIRED_FIELDS: Record<string, string[]> = {
  personal: ['firstName', 'lastName', 'birthDate', 'address'],
  assets: ['bankAccounts'],
  digital: [],
  wishes: ['funeralWishes'],
  documents: [],
  contacts: ['emergencyContact'],
};

// Helper to check if a field has meaningful content
const fieldHasContent = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) {
    return value.length > 0 && value.some(item => {
      if (typeof item === 'string') return item.trim() !== '';
      if (typeof item === 'object' && item !== null) {
        return Object.entries(item).some(([k, v]) => {
          if (k === 'currency' || k.endsWith('Currency')) return false;
          return typeof v === 'string' ? v.trim() !== '' : v !== null && v !== undefined;
        });
      }
      return item !== null && item !== undefined;
    });
  }
  return !!value;
};

// Calculate completion percentage for a section (0-100)
export const getSectionCompletion = (sectionKey: string, data: any): number => {
  if (!data || typeof data !== 'object' || typeof data === 'string') return 0;

  const required = REQUIRED_FIELDS[sectionKey] || [];

  if (required.length === 0) {
    // Optional sections: any meaningful input → 100%
    const meaningfulKeys = Object.keys(data).filter(key => {
      if (key === 'currency' || key.endsWith('Currency')) return false;
      return fieldHasContent(data[key]);
    });
    return meaningfulKeys.length > 0 ? 100 : 0;
  }

  const filled = required.filter(field => fieldHasContent(data[field])).length;
  return Math.round((filled / required.length) * 100);
};

// Helper to check if section data has meaningful content (existing boolean logic)
const hasMeaningfulData = (data: any, sectionKey: string): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (typeof data === 'string') return false;

  if (sectionKey === 'personal') {
    const keysWithContent = Object.keys(data).filter(key => {
      const value = data[key];
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0 && value.some(v => v && v !== '');
      return value !== null && value !== undefined;
    });
    if (keysWithContent.length === 1 && keysWithContent[0] === 'fullName') return false;
    if (keysWithContent.length <= 2 && keysWithContent.every(k => k === 'fullName' || k === 'birthDate')) return false;
  }

  for (const key of Object.keys(data)) {
    const value = data[key];
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        const hasContent = value.some(item => {
          if (typeof item === 'string') return item.trim() !== '';
          if (typeof item === 'object' && item !== null) {
            return Object.entries(item).some(([k, v]) => {
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
    if (value !== null && value !== undefined && value !== '') return true;
  }
  return false;
};

export const useSectionStatus = () => {
  const { activeProfile, personProfiles } = useProfiles();
  const { formData } = useFormData();
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({});
  const [sectionCompletion, setSectionCompletion] = useState<SectionCompletion>({});
  const [allProfilesProgress, setAllProfilesProgress] = useState<ProfileProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const checkSections = useCallback(() => {
    if (!activeProfile) {
      setSectionStatus({});
      setSectionCompletion({});
      setLoading(false);
      return;
    }

    setLoading(true);

    const activeStatuses: SectionStatus = {};
    const activeCompletion: SectionCompletion = {};

    for (const key of SECTIONS_TO_CHECK) {
      const sectionData = formData[key as keyof VorsorgeFormData];
      activeStatuses[key] = hasMeaningfulData(sectionData, key);
      activeCompletion[key] = getSectionCompletion(key, sectionData);
    }

    setSectionStatus(activeStatuses);
    setSectionCompletion(activeCompletion);

    const completionValues = Object.values(activeCompletion);
    const overallPercent = completionValues.length > 0
      ? Math.round(completionValues.reduce((a, b) => a + b, 0) / completionValues.length)
      : 0;
    const filled = Object.values(activeStatuses).filter(Boolean).length;
    const total = SECTIONS_TO_CHECK.length;

    const activeProgress: ProfileProgress = {
      profileId: activeProfile.id,
      profileName: activeProfile.name,
      sectionStatus: activeStatuses,
      sectionCompletion: activeCompletion,
      filledCount: filled,
      totalCount: total,
      progressPercent: overallPercent,
      isComplete: overallPercent === 100,
    };

    setAllProfilesProgress(prev => {
      const otherProfiles = prev.filter(p => p.profileId !== activeProfile.id);
      return [...otherProfiles, activeProgress];
    });

    setLoading(false);
  }, [activeProfile?.id, activeProfile?.name, formDataHash, refreshTrigger]);

  useEffect(() => {
    checkSections();
  }, [checkSections]);

  useEffect(() => {
    const unsubscribe = sectionStatusEvents.subscribe(() => {
      setRefreshTrigger(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const completionValues = Object.values(sectionCompletion);
  const progressPercent = completionValues.length > 0
    ? Math.round(completionValues.reduce((a, b) => a + b, 0) / completionValues.length)
    : 0;
  const filledCount = Object.values(sectionStatus).filter(Boolean).length;
  const totalCount = SECTIONS_TO_CHECK.length;
  const isComplete = progressPercent === 100;

  return {
    sectionStatus,
    sectionCompletion,
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
