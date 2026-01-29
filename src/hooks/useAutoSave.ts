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

  // Store activeProfileId in a ref to capture it at the time of blur
  const capturedProfileIdRef = useRef<string | null>(null);

  const triggerSave = useCallback(async () => {
    // Use captured profile ID to ensure we save for the profile that was active when blur occurred
    const profileIdToSave = capturedProfileIdRef.current || activeProfileId;
    
    if (!profile?.has_paid || !profileIdToSave) return;
    
    // If encryption is enabled but not unlocked, skip save
    if (isEncryptionEnabled && !isUnlocked) {
      logger.warn('Auto-save skipped: encryption locked');
      return;
    }
    
    // If profile changed between blur and save, abort to prevent cross-contamination
    if (profileIdToSave !== activeProfileId) {
      logger.warn('Auto-save aborted: profile changed during debounce');
      capturedProfileIdRef.current = null;
      return;
    }
    
    // If profile changed, reset the hash to allow saving for new profile
    if (lastProfileIdRef.current !== profileIdToSave) {
      lastSavedRef.current = '';
      lastProfileIdRef.current = profileIdToSave;
    }
    
    // Create a hash of current data to avoid duplicate saves
    const currentDataHash = JSON.stringify(formData[section]);
    if (currentDataHash === lastSavedRef.current) {
      capturedProfileIdRef.current = null;
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
          await updateProfile(profileIdToSave, profileName, personalData.birthDate || undefined);
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
    } finally {
      capturedProfileIdRef.current = null;
    }
  }, [profile?.has_paid, activeProfileId, formData, section, saveSection, syncToProfile, updateProfile, loadProfiles, isEncryptionEnabled, isUnlocked, onSaveComplete]);

  const handleBlur = useCallback(() => {
    // Capture the current profile ID at the moment of blur
    capturedProfileIdRef.current = activeProfileId;
    
    // Clear any pending timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce the save by 300ms to avoid saving on rapid field changes
    saveTimeoutRef.current = setTimeout(() => {
      triggerSave();
    }, 300);
  }, [triggerSave, activeProfileId]);

  // Reset the last saved hash when profile changes (to allow saving for new profile)
  const resetSaveState = useCallback(() => {
    lastSavedRef.current = '';
    capturedProfileIdRef.current = null;
    // Cancel any pending save when profile changes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  return {
    handleBlur,
    triggerSave,
    resetSaveState,
  };
};
