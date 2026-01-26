import { useRef, useCallback } from 'react';
import { useFormData, VorsorgeFormData } from '@/contexts/FormContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import { logger } from '@/lib/logger';
import { sectionStatusEvents } from './useSectionStatusRefresh';

interface UseAutoSaveOptions {
  section: keyof VorsorgeFormData;
  /** If true, syncs fullName/birthDate to person_profiles after saving 'personal' section */
  syncToProfile?: boolean;
  /** Callback to trigger after successful save (e.g., to refresh progress status) */
  onSaveComplete?: () => void;
}

export const useAutoSave = ({ section, syncToProfile = false, onSaveComplete }: UseAutoSaveOptions) => {
  const { formData, saveSection } = useFormData();
  const { activeProfileId, updateProfile, loadProfiles } = useProfiles();
  const { profile } = useAuth();
  const { isEncryptionEnabled, isUnlocked } = useEncryption();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const lastProfileIdRef = useRef<string | null>(null);

  const triggerSave = useCallback(async () => {
    if (!profile?.has_paid || !activeProfileId) return;
    
    // If encryption is enabled but not unlocked, skip save
    if (isEncryptionEnabled && !isUnlocked) {
      logger.warn('Auto-save skipped: encryption locked');
      return;
    }
    
    // If profile changed, reset the hash to allow saving for new profile
    if (lastProfileIdRef.current !== activeProfileId) {
      lastSavedRef.current = '';
      lastProfileIdRef.current = activeProfileId;
    }
    
    // Create a hash of current data to avoid duplicate saves
    const currentDataHash = JSON.stringify(formData[section]);
    if (currentDataHash === lastSavedRef.current) {
      return; // No changes, skip save
    }
    
    try {
      await saveSection(section);
      lastSavedRef.current = currentDataHash;
      
      // Sync personal data to profile if needed
      if (syncToProfile && section === 'personal') {
        const personalData = formData.personal;
        if (personalData.fullName || personalData.birthDate) {
          const profileName = personalData.fullName?.trim() || 'Unbenannt';
          await updateProfile(activeProfileId, profileName, personalData.birthDate || undefined);
          await loadProfiles();
        }
      }
      
      // Trigger global refresh of section status (updates progress bar)
      sectionStatusEvents.emit();
      
      // Trigger optional callback after successful save
      onSaveComplete?.();
      
      logger.debug(`Auto-saved section: ${section}`);
    } catch (error) {
      logger.error(`Error auto-saving section ${section}:`, error);
    }
  }, [profile?.has_paid, activeProfileId, formData, section, saveSection, syncToProfile, updateProfile, loadProfiles, isEncryptionEnabled, isUnlocked, onSaveComplete]);

  const handleBlur = useCallback(() => {
    // Clear any pending timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce the save by 300ms to avoid saving on rapid field changes
    saveTimeoutRef.current = setTimeout(() => {
      triggerSave();
    }, 300);
  }, [triggerSave]);

  // Reset the last saved hash when profile changes (to allow saving for new profile)
  const resetSaveState = useCallback(() => {
    lastSavedRef.current = '';
  }, []);

  return {
    handleBlur,
    triggerSave,
    resetSaveState,
  };
};
